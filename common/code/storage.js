// #if FIREFOX
let ss = require('sdk/simple-storage');
// #fi

class Storage {

    /** 
     * Storage class which abstracts storing data for the extension
     * via either sessionStorage API (Chrome) or simple-storage API (Firefox).
     * (No need to invoke this as all Storage methods are used statically).
     * @constructor
    */
    constructor() {} 

    /**
     * Set key, value pair in underlying storage.
     * @static
     * @param key {String} Key for value.
     * @param value {Any} Value to store.
    */
    static set(key, value) {
        // #if CHROME
        sessionStorage.setItem(key, value);
        // #elseif FIREFOX
        ss.storage[key] = value;
        // #fi
    }

    /**
     * Set collection (an array of values) in sessionStorage
     * or a single value in simple-storage.
     * @static
     * @param key {String} Key for single value.
     * @param collection {String} Collection name to store value in.
     * @param value {Any} Value to store for key or as part of collection.
    */
    static setCollection(key, collection, value) {
        // #if CHROME
        Storage.set(key, value);
        // #elseif FIREFOX
        if(!ss.storage[collection]) {
            ss.storage[collection] = [];
        }
        ss.storage[collection].push(value);
        // #fi
    }

    /**
     * Get a value for corresponding key from underlying storage.
     * @static
     * @param key {String} Key for value to retrieve.
     * @returns {Any} Value from key.
    */
    static get(key) {
        // #if CHROME
        return sessionStorage.getItem(key);
        // #elseif FIREFOX
        return ss.storage[key];
        // #fi
    }

    /** 
     * Remove a value for corresponding key from underlying storage.
     * @static
     * @param key {String} Key for value to remove.
    */
    static remove(key) {
        // #if CHROME
        sessionStorage.removeItem(key);
        // #elseif FIREFOX
        delete ss.storage[key];
        // #fi
    }

    /**
     * Get matching values for a key pattern or collection.
     * @static
     * @param pattern {RegExp} Pattern to get matching key values for.
     * @param collection {String} Collection to get values for.
     * @returns {Array} Array of matching values.
    */
    static getMatchingValues(pattern, collection) {
        let values = [];
        // #if CHROME
        for(let key in sessionStorage) {
            if(pattern.test(key)) {
                values.push(sessionStorage.getItem(key));
            }
        }
        // #elseif FIREFOX
        values = ss.storage[collection].map(function(v) {
            return v;
        })
        // #fi
        return values;
    }

    /**
     * Get matching keys for a key pattern or collection.
     * @static
     * @param pattern {RegExp} Pattern to get matching keys for.
     * @returns {Array} Array of matching keys.
    */
    static getMatchingKeys(pattern, collection) {
        let keys = [];
        // #if CHROME
        for(let key in sessionStorage) {
            if(pattern.test(key)) {
                keys.push(key);
            }
        }
        // #elseif FIREFOX
        keys.push(collection);
        // #fi
        return keys;
    }
}

// #if FIREFOX
// Make available to index.js.
exports.Storage = Storage;
// #fi
