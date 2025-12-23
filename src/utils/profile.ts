import { parse as parseTime } from 'date-fns'
import { InsulinType, SMOOTHING_MIN_BASAL_ELEMENTS } from './constants'

import type { BarSeriesType, LineSeriesType } from '@mui/x-charts'
import type { NightscoutProfileDef, NormalizedTimedValue, OAPSProfile, ScheduleSlot, TimedValue } from './constants'
import type { Snapshot } from './localStore.js'

function toNumber(value: string | number): number {
    if (typeof value === 'number') {
        return value
    }

    // assume string
    return Number(value)
}

function normalizeNightscoutTimedElement(element: TimedValue): NormalizedTimedValue {
    let time = {...element}
    if(time.timeAsSeconds === undefined) {
        const tm = parseTime(time.time, 'HH:mm', Date.now())

        if (tm) {
            time.timeAsSeconds = tm.getHours() * 3600 + tm.getMinutes() * 60
        }
    }
    if(time.time === undefined) {
        let hours = time.timeAsSeconds / 3600
        let minutes = time.timeAsSeconds % 60
        time.time = String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0')
    }

    return {
        timeAsSeconds: time.timeAsSeconds,
        minutes: time.timeAsSeconds / 60,
        time: time.time,
        start: time.time + ":00",
        value: toNumber(time.value),
    }
}

/**
 * Calculates the weighted average of CR and ISF elements from a NS profile.
 * This function assigns every hour-of-day a weight of 1.
 * 
 * @param {TimedValue[]} elements The elements to calculate the weighted average of.
 * @returns {number} The weighted average.
 */
function calculateWeightedAverage(elements: TimedValue[]): number {
    let maxTimeAsSeconds = 86400;
    let sum = 0;
    for (const [idx, element] of elements.entries()) {
        let nextTimeAsSeconds = elements.length === idx + 1 ? maxTimeAsSeconds : elements[idx + 1].timeAsSeconds;
        let elementHours = (nextTimeAsSeconds - element.timeAsSeconds!) / 3600;
        sum += (element.value * elementHours);
    }

    return parseFloat((sum / 24).toFixed(1));
}

/**
 * Converts the given `ns_profile` to an OAPS profile, analog to the OAPS python implementation.
 * 
 * @see https://github.com/openaps/oref0/blob/v0.7.1/bin/get_profile.py
 */
export function convertNightscoutProfile(
    ns_profile: NightscoutProfileDef, 
    min_5m_carbimpact = 8.0, 
    autosens_min = 0.7, 
    autosens_max = 1.2, 
    curve = InsulinType.RapidActing): OAPSProfile {

    let oaps_profile: OAPSProfile = {
        min_5m_carbimpact: min_5m_carbimpact,
        dia: ns_profile.dia,
        autosens_max: autosens_max,
        autosens_min: autosens_min,
        out_units: ns_profile.units,
        timezone: ns_profile.timezone,
        curve: curve,
        carb_ratio: -1,
        basalprofile: [],
        bg_targets: {
            units: ns_profile.units,
            user_preferred_units: ns_profile.units,
            targets: [],
        },
        carb_ratios: {
            first: 1,
            units: 'grams',
            schedule: [],
        },
        isfProfile: {
            first: 1,
            sensitivities: [],
        }
    };

    // Basal profile
    for(const [_, basal_item] of Object.entries(ns_profile.basal)) {
        oaps_profile.basalprofile.push({
            i: oaps_profile.basalprofile.length,
            ...normalizeNightscoutTimedElement(basal_item),
            rate: toNumber(basal_item.value)
        });
    }

    // BG targets
    let targets: {[key: string]: {
        low: ScheduleSlot & {low: number},
        high: { high: number }
    } } = {};

    // Extract low targets
    for(const [_, low] of Object.entries(ns_profile.target_low)) {
        let normalized = normalizeNightscoutTimedElement(low);
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
        let normalized = normalizeNightscoutTimedElement(high);
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

    // Insulin sensitivity profile.
    // Autotune only uses the first ISF value from the OpenAPS profile.
    // So we calculate the weighted average of the NS profile sensitivities
    // and add just one element here, instead of parsing all ISF elements 
    // from the NS profile.
    // A snippet that uses all ISF elements, if autotune ever is going to do that,
    // can be found in the git history.
    oaps_profile.isfProfile.sensitivities.push({
        i: 0,
        start: "00:00:00",
        offset: 0,
        sensitivity: calculateWeightedAverage(ns_profile.sens),
    });

    // Carb ratio(s).
    // Autotune only uses the first ISF value from the OpenAPS profile.
    // So we calculate the weighted average of the NS profile ratios
    // and add just one element here, instead of parsing all CR elements 
    // from the NS profile.
    // A snippet that uses all CR elements, if autotune ever is going to do that,
    // can be found in the git history.
    oaps_profile.carb_ratio = calculateWeightedAverage(ns_profile.carbratio);
    oaps_profile.carb_ratios.schedule.push({
        i: 0,
        offset: 0,
        ratio: oaps_profile.carb_ratio,
        start: "00:00:00",
    });

    // Sort profile by keys
    let sorted_profile: any = {}
    for(const key of Object.keys(oaps_profile).sort()) {
        sorted_profile[key] = (oaps_profile as any)[key];
    }

    return sorted_profile as OAPSProfile;
}

/**
 * Creates a series object that is accepted by a `ChartContainer` consisting of 
 * the Carb Ratio settings from Nightscout profile plotted against the weighted average.
 * 
 * @param {Snapshot} snapshot - The store snapshot containing the CR data.
 * @param {function(float): void} setMaxYValue - A setter function for the maximum y-axis value of the containing graph.
 */
export function createCrChartSeries(snapshot: Snapshot, setMaxYValue: (value: number) => void) {
    
    function* mapSeriesToDiscreteHours(elements: TimedValue[]) {
        let maxTimeAsSeconds = 86400;
        for (const [idx, element] of elements.entries()) {
            let nextTimeAsSeconds = elements.length === idx + 1 ? maxTimeAsSeconds : elements[idx + 1].timeAsSeconds;
            let elementHours = (nextTimeAsSeconds - element.timeAsSeconds) / 3600;
            
            for(let i=0; i < elementHours; i++) {
                yield element.value;
            }
        }
    }

    let series: Array<BarSeriesType | LineSeriesType> = [];
    if (snapshot.conversion_settings.oaps_profile_data?.carb_ratio) {

        /**
         * settings.profile_data.carbratio[].time/value
         */
        let data = [...mapSeriesToDiscreteHours(snapshot.conversion_settings.profile_data!.carbratio)];

        // Set the maximum y-axis value to 110%
        setMaxYValue(Math.max(...data) * 1.10);
        series.push({
            id: 'cr',
            type: 'bar',
            yAxisId: 'carb_ratio',
            label: 'Carb Ratio',
            color: 'green',
            data: data,
            highlightScope: { highlight: 'item' }
        });
        series.push({
            id: 'cr_weighted',
            type: 'line',
            yAxisId: 'carb_weighted_avg',
            label: 'Carb Weighted avg',
            color: 'red',
            data: data.map(() => snapshot.conversion_settings.oaps_profile_data!.carb_ratio),
            highlightScope: { highlight: 'item' }
        });
    }

    return series;
}

/**
 * Creates a series object that is accepted by a `ChartContainer` consisting of 
 * the Insulin Sensitivity Factor settings from Nightscout profile plotted against the weighted average.
 * 
 * @param {Snapshot} snapshot - The store snapshot containing the ISF data.
 * @param {function(float): void} setMaxYValue - A setter function for the maximum y-axis value of the containing graph.
 */
export function createISFChartSeries(snapshot: Snapshot, setMaxYValue: (value: number) => void) {
    
    function* mapSeriesToDiscreteHours(elements: TimedValue[]) {
        let maxTimeAsSeconds = 86400;
        for (const [idx, element] of elements.entries()) {
            let nextTimeAsSeconds = elements.length === idx + 1 ? maxTimeAsSeconds : elements[idx + 1].timeAsSeconds;
            let elementHours = (nextTimeAsSeconds - element.timeAsSeconds) / 3600;
            
            for(let i=0; i < elementHours; i++) {
                yield element.value;
            }
        }
    }

    
    let series: Array<BarSeriesType | LineSeriesType> = [];
    if (snapshot.conversion_settings.oaps_profile_data?.isfProfile) {

        /**
         * settings.profile_data.sens[].time/value
         */
        let data = [...mapSeriesToDiscreteHours(snapshot.conversion_settings.profile_data!.sens)];

        // Set the maximum y-axis value to 110%
        setMaxYValue(Math.max(...data) * 1.10);
        series.push({
            id: 'isf',
            type: 'bar',
            yAxisId: 'isf',
            label: 'Insulin Sensitivity Factor',
            color: 'blue',
            data: data,
            highlightScope: { highlight: 'item' }
        });
        series.push({
            id: 'isf_weighted',
            type: 'line',
            yAxisId: 'isf_weighted_avg',
            label: 'ISF Weighted avg',
            color: 'darkorange',
            data: data.map(() => snapshot.conversion_settings.oaps_profile_data!.isfProfile.sensitivities[0].sensitivity),
            highlightScope: { highlight: 'item' }
        });
    }

    return series;
}

export function isSmoothingAvailable(snapshot: Snapshot): boolean {
    return (snapshot.conversion_settings.oaps_profile_data?.basalprofile.length || 0) >= SMOOTHING_MIN_BASAL_ELEMENTS
}