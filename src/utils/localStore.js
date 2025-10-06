
// Storage key for Nightscout instance data.
const NS_STORAGE_KEY = 'ns-instance';

let listeners = [];

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
let intermediate_store = {
    profiles: {},
    conversion_settings: {}
};

function emitChange() {
    for (let listener of listeners) {
        listener();
    }
}

export default {

    /**
     * Set the URL of the Nightscout instance.
     * @param {string} url The Nightscout instance URL.
     */
    setUrl(url) {
        let snapshot = this.getSnapshot();
        snapshot.url = url;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange();
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
        emitChange();
    },

    /**
     * The (additional) settings for converting between a Nightscout profile and an OpenAPS profile.
     * @param {ConversionSettings} conversion_settings The user-provided conversion settings.
     */
    setConversionSettings(conversion_settings) {
        let snapshot = this.getSnapshot();
        snapshot.conversion_settings = conversion_settings;

        localStorage.setItem(NS_STORAGE_KEY, JSON.stringify({...snapshot}));
        emitChange();
    },

    init() {
        if (JSON.stringify(intermediate_store) === '{}') {
            const data = JSON.parse(localStorage.getItem(NS_STORAGE_KEY) || '{}');
            intermediate_store = {...data};
        }
    },

    clear() {
        localStorage.removeItem(NS_STORAGE_KEY);
        intermediate_store = {
            profiles: {},
            conversion_settings: {},
        }
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
        listeners = [...listeners, listener];
        return () => {
            listeners = listeners.filter(l => l !== listener);
        }
    },

    /**
     * @returns {Snapshot} A snapshot of this store.
     */
    getSnapshot() {
        return intermediate_store;
    }
};

