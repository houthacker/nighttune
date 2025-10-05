
// Storage key for Nightscout instance data.
const NS_STORAGE_KEY = 'ns-instance';

let listeners = [];

/**
 * @typedef Snapshot
 * @property {string} url - The Nightscout URL
 * @property {string} access_token - The Nightscout access token 
 */
let intermediate_store = {};

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

