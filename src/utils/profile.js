import { timeParse } from 'd3-time-format';
import { InsulinType } from './constants';

/** @import { Store } from '../utils/localStore' */
/** @import {ErrorInfo} from '../App' */


function normalize_ns_timed_element(element) {
    let time = {...element}
    if(time.timeAsSeconds === undefined) {
        let tm = timeParse('%H:%M')(time.time);
        time.timeAsSeconds = tm.getHours() * 3600 + tm.getMinutes() * 60
    }
    if(time.time === undefined) {
        let hours = time.timeAsSeconds / 3600;
        let minutes = time.timeAsSeconds % 60;
        time.time = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0');
    }

    return {
        ...time,
        start: time.time + ":00",
        minutes: time.timeAsSeconds / 60
    }
}

/**
 * Converts the given `ns_profile` to an OAPS profile, analog to the OAPS python implementation.
 * 
 * @see https://github.com/openaps/oref0/blob/v0.7.1/bin/get_profile.py
 * @param {object} ns_profile The Nightscout profile.
 * @param {number} min_5m_carbimpact The minimal carbs absorption per 5 minutes.
 * @param {number} autosens_min The multiplier for adjustments during insulin sensitivity.
 * @param {number} autosens_max The multiplier for adjustments during insulin resistance.
 * @param {InsulinType} curve The insulin type to infer how quickly it acts and decays.
 * @returns {object} The OAPS profile.
 */
export function convert_ns_profile(ns_profile, min_5m_carbimpact = 8.0, autosens_min = 0.7, autosens_max = 1.2, curve = InsulinType.RAPID) {
    let oaps_profile = {
        min_5m_carbimpact: min_5m_carbimpact,
        dia: ns_profile.dia,
        autosens_max: autosens_max,
        autosens_min: autosens_min,
        out_units: ns_profile.units,
        timezone: ns_profile.timezone,
        curve: curve
    };

    // Basal profile
    oaps_profile.basalprofile = [];
    for(const [_, basal_item] of Object.entries(ns_profile.basal)) {
        oaps_profile.basalprofile.push({
            i: oaps_profile.basalprofile.length,
            ...normalize_ns_timed_element(basal_item),
            rate: basal_item.value
        });
    }

    // BG targets
    oaps_profile.bg_targets = {
        units: ns_profile.units,
        user_preferred_units: ns_profile.units,
        targets: []
    }
    let targets = {};

    // Extract low targets
    for(const [_, low] of Object.entries(ns_profile.target_low)) {
        let normalized = normalize_ns_timed_element(low);
        targets[normalized.time] = targets[normalized.time] || {};
        targets[normalized.time].low = {
            i: Object.keys(targets).length,
            start: normalized.start,
            offset: normalized.timeAsSeconds,
            low: normalized.value
        };
    }

    // Extract high targets
    for(const [_, high] of Object.entries(ns_profile.target_high)) {
        let normalized = normalize_ns_timed_element(high);
        targets[normalized.time] = targets[normalized.time] || {};
        targets[normalized.time].high = {
            high: normalized.value
        };
    }

    // Append targets to profile
    for(const time of Object.keys(targets).sort()) {
        let ttime = targets[time];
        oaps_profile.bg_targets.targets.push({
            i: oaps_profile.bg_targets.targets.length,
            start: ttime.low.start,
            offset: ttime.low.offset,
            low: ttime.low.low,
            min_bg: ttime.low.low,
            high: ttime.high.high,
            max_bg: ttime.high.high
        });
    }

    // Insulin sensitivity profile
    oaps_profile.isfProfile = {
        first: 1,
        sensitivities: []
    };
    let isf_p = {};
    for(const sens of ns_profile.sens) {
        let normalized = normalize_ns_timed_element(sens);
        isf_p[normalized.time] = isf_p[normalized.time] || {};
        isf_p[normalized.time] = {
            sensitivity: normalized.value,
            start: normalized.start,
            offset: normalized.minutes
        };
    }
    for(const time of Object.keys(isf_p).sort()) {
        let ttime = isf_p[time];
        oaps_profile.isfProfile.sensitivities.push({
            i: oaps_profile.isfProfile.sensitivities.length,
            sensitivity: ttime.sensitivity,
            offset: ttime.offset,
            start: ttime.start
        });
    }

    // Carb ratio(s)
    oaps_profile.carb_ratios = {
        first: 1,
        units: "grams",
        schedule: []
    };
    let cr_p = {};
    for(const cr of ns_profile.carbratio) {
        let normalized = normalize_ns_timed_element(cr);
        cr_p[normalized.time] = cr_p[normalized.time] || {};
        cr_p[normalized.time] = {
            start: normalized.start,
            offset: normalized.minutes,
            ratio: normalized.value
        };
    }
    for(const time of Object.keys(cr_p).sort()) {
        let ttime = cr_p[time];
        oaps_profile.carb_ratios.schedule.push({
            i: oaps_profile.carb_ratios.schedule.length,
            ...ttime
        });
    }

    // TODO calculate weighted average?
    oaps_profile.carb_ratio = oaps_profile.carb_ratios.schedule[0].ratio

    // Sort profile by keys
    let sorted_profile = {}
    for(const key of Object.keys(oaps_profile).sort()) {
        sorted_profile[key] = oaps_profile[key];
    }

    return sorted_profile;
}

/**
 * 
 * @param {Store} store - Persistent storage for the current client.
 * @param {function(ErrorInfo): void} setErrorInfo - A function to update error information.
 * @returns 
 */
export async function fetchNightscoutProfiles(store, setErrorInfo) {
    const encoder = new TextEncoder();

    let snapshot = store.getSnapshot();
    if (snapshot.url) {
        let url = new URL("api/v1/profile.json", snapshot.url);

        if (snapshot.access_token) {
            const data = encoder.encode(snapshot.access_token);
            const hash_buffer = await crypto.subtle.digest('SHA-1', data);
            const hash_array = Array.from(new Uint8Array(hash_buffer));
            url.searchParams.append('token', hash_array
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
            );
        }

        // Retrieve the profile
        try {
            let response = await fetch(url);

            if (response.ok) {
                let data = await response.json();
                setErrorInfo({
                    isError: false,
                    errorStep: -1,
                    errorText: undefined,
                });
                return data[0];
            } else {
                console.error("Error response: ", response);
                setErrorInfo({
                    isError: true,
                    errorStep: 0,
                    errorText: `HTTP error ${response.status}: ${response.statusText}`,
                });
                return undefined;
            }
        } catch (error) {
            console.error("Network request failed: ", error);
            setErrorInfo({
                isError: true,
                errorStep: 0,
                errorText: 'Network error',
            });
        }
    }

    console.warn('Cannot load profiles: Nightscout URL has not been set.');
    return undefined;
}