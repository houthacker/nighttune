
// Storage key for Nightscout instance data.
const NS_STORAGE_KEY = 'ns-instance';

let listeners = new Set();

export const STORE_EVENT_TYPES = {
    SET_URL: 'set_url',
    SET_TOKEN: 'set_token',
    SET_CONVERSION_SETTINGS: 'set_conversion_settings',
    CLEAR: 'clear',
};

const INITIAL_STORE = {
    profiles: {
        store: {}
    },
    conversion_settings: {},
}

/**
 * @typedef {function(): void} VoidFn0
 */

/**
 * @typedef {object} ConversionSettings
 * @property {string} profile_name - The Nightscout profile name.
 * @property {number} min_5m_carb_impact - The minimum carb decay per 5 minutes.
 * @property {number} basal_increment - The basal increments supported by the used pump.
 * @property {string} insulin_type - The type of insulin. Must be `rapid-acting` or `ultra-rapid`.
 * @property {number} autotune_days - The amount of days for autotune to use. Max 30.
 * @property {string} email_address - The optional e-mailadress to send the results to.
 * @property {object} profile_data - The Nightscout profile data.
 */

/**
 * @typedef Snapshot
 * @property {string} url - The Nightscout URL
 * @property {string} access_token - The Nightscout access token 
 * @property {object} profiles - The Nightscout profiles
 * @property {ConversionSettings} conversion_settings - The conversion settings by profile name.
 */
let intermediate_store = {...INITIAL_STORE};

function emitChange(event_type) {
    for (let listener of listeners) {
        listener(event_type);
    }
}


/**
 * @typedef {object} Store
 * @property {function(string): void} setUrl - Set the Nightscout URL.
 * @property {function(string): void} setToken - Set the optional Nightscout access token.
 * @property {function(ConversionSettings): void} setConversionSettings - Set the profile conversion settings.
 * @property {function(): void} init - Initialize the store by loading data from localStorage 
 *  or filling it with defaults if there is no prior data.
 * @property {function(): void} clear - Clear all store contents.
 * @property {function(VoidFn0): void} subscribe - Subscribe the listener which will be called when the store changes.
 * @property {function(): Snapshot} getSnapshot - Get a store snapshot.
 */
export default {

    /**
     * Set the URL of the Nightscout instance.
     * @param {string} url The Nightscout instance URL.
     */
    setUrl(url) {
        let snapshot = this.getSnapshot();
        snapshot.url = url;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange(STORE_EVENT_TYPES.SET_URL);
    },

    /**
     * If the Nightscout instance is locked down, an access token can be set here.
     * 
     * @param {string} token The Nightscout access token.
     */
    setToken(token) {
        let snapshot = this.getSnapshot();
        snapshot.access_token = token;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange(STORE_EVENT_TYPES.SET_TOKEN);
    },

    /**
     * The (additional) settings for converting between a Nightscout profile and an OpenAPS profile.
     * @param {ConversionSettings} conversion_settings The user-provided conversion settings.
     */
    setConversionSettings(conversion_settings) {
        let snapshot = this.getSnapshot();
        snapshot.conversion_settings = conversion_settings;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange(STORE_EVENT_TYPES.SET_CONVERSION_SETTINGS);
    },

    init() {
        if (JSON.stringify(intermediate_store) === JSON.stringify(INITIAL_STORE)) {
            const data = JSON.parse(localStorage.getItem(NS_STORAGE_KEY)) || {...INITIAL_STORE};
            intermediate_store = {...data};
        }
    },

    clear() {
        localStorage.removeItem(NS_STORAGE_KEY);
        intermediate_store = {
            profiles: {},
            conversion_settings: {},
        }

        emitChange(STORE_EVENT_TYPES.CLEAR);
    },

    /**
     * A listener callback gets notified of changes in this store.
     * 
     * @callback Listener
     */

    /**
     * A callback that unsubscribes a previously subscribed listener.
     * This function is idempotent.
     * @callback UnsubscribeFn
     */

    /**
     * Subscribes the given listener to changes in the store.
     * @param {Listener} listener 
     * @returns {UnsubscribeFn} A callback to unsibscribe `listener`.
     */
    subscribe(listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        }
    },

    /**
     * @returns {Snapshot} A snapshot of this store.
     */
    getSnapshot() {
        return intermediate_store;
    }
};

