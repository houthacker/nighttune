
import type { InsulinType, OAPSProfile, NightscoutProfileDef } from './constants';

// Storage key for Nightscout instance data.
const NS_STORAGE_KEY = 'ns-instance';

export type StoreListener = (event_type: string) => void;
export type UnsubscribeFn = () => void;
let listeners = new Set<StoreListener>();

export const STORE_EVENT_TYPES = {
    SET_URL: 'set_url',
    SET_TOKEN: 'set_token',
    SET_CONVERSION_SETTINGS: 'set_conversion_settings',
    SET_OAPS_PROFILE: 'set_oaps_profile',
    CLEAR: 'clear',
};

const INITIAL_STORE: Snapshot = {
    profiles: {
        store: {}
    },
    conversion_settings: {},
}

export interface Profiles {
    store: object;
}


export interface ConversionSettings {
    profile_name?: string;
    min_5m_carbimpact?: number;
    pump_basal_increment?: number;
    uam_as_basal?: boolean;
    insulin_type?: InsulinType;
    autotune_days?: number;
    email_address?: string;
    autosens_min?: number;
    autosens_max?: number;
    profile_data?: NightscoutProfileDef;
    oaps_profile_data?: OAPSProfile;
}

export interface Snapshot {
    url?: string;
    access_token?: string;
    profiles: Profiles;
    conversion_settings: ConversionSettings;
}

let intermediate_store: Snapshot = {...INITIAL_STORE};

function emitChange(event_type: string) {
    for (let listener of listeners) {
        listener(event_type);
    }
}


export class Store {

    init() {
        if (JSON.stringify(intermediate_store) === JSON.stringify(INITIAL_STORE)) {
            const item = localStorage.getItem(NS_STORAGE_KEY);
            const data = item ? JSON.parse(item) as Snapshot : {...INITIAL_STORE};
            intermediate_store = {...data};
        }
    }

    clear() {
        localStorage.removeItem(NS_STORAGE_KEY);
        intermediate_store = {...INITIAL_STORE}

        emitChange(STORE_EVENT_TYPES.CLEAR);
    }

    /**
     * Set the URL of the Nightscout instance.
     * @param {string} url The Nightscout instance URL.
     */
    setUrl(url: string): void {
        let snapshot = this.getSnapshot();
        snapshot.url = url;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange(STORE_EVENT_TYPES.SET_URL);
    }

    /**
     * If the Nightscout instance is locked down, an access token can be set here.
     * 
     * @param {string} token The Nightscout access token.
     */
    setToken(token: string) {
        let snapshot = this.getSnapshot();
        snapshot.access_token = token;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange(STORE_EVENT_TYPES.SET_TOKEN);
    }

    /**
     * The (additional) settings for converting between a Nightscout profile and an OpenAPS profile.
     * @param {ConversionSettings} conversion_settings The user-provided conversion settings.
     */
    setConversionSettings(conversion_settings: ConversionSettings) {
        let snapshot = this.getSnapshot();
        snapshot.conversion_settings = conversion_settings;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange(STORE_EVENT_TYPES.SET_CONVERSION_SETTINGS);
    }

    /**
     * Set the OpenAPS profile that resulted from converting the Nightscout profile.
     * @param {OAPSProfile} oaps_profile The OpenAPS profile
     */
    setOpenAPSProfile(oaps_profile: OAPSProfile) {
        let snapshot = this.getSnapshot();
        this.setConversionSettings({...snapshot.conversion_settings, oaps_profile_data: oaps_profile});
    }

    /**
     * @returns {Snapshot} A snapshot of this store.
     */
    getSnapshot(): Snapshot {
        return intermediate_store as Snapshot;
    }

    /**
     * Subscribes the given listener to changes in the store.
     * @param {StoreListener} listener 
     * @returns {UnsubscribeFn} A callback to unsibscribe `listener`.
     */
    subscribe(listener: StoreListener): UnsubscribeFn {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        }
    }
}

export default new Store();
