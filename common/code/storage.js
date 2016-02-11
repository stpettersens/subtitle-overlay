// #if FIREFOX
var ss = require('sdk/simple-storage');
// #fi

var Storage = (function() {

    /** 
     * Storage class which abstracts storing data for the extension
     * via either sessionStorage API (Chrome) or simple-storage API (Firefox).
     * (No need to invoke this as all Storage methods are used statically).
     * @constructor
    */
    function Storage() {} 

    /**
     * Set key, value pair in underlying storage.
     * @static
     * @param key {String} Key for value.
     * @param value {Any} Value to store.
    */
    Storage.set = function(key, value) {
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
    Storage.setCollection = function(key, collection, value) {
        // #if CHROME
        Storage.set(key, value);
        // #elseif FIREFOX
        if(!ss.storage[collection]) {
            ss.storage[collection] = [];
        }
        ss.storage[collection].push(value);
        // #fi
    };

    /**
     * Get a value for corresponding key from underlying storage.
     * @static
     * @param key {String} Key for value to retrieve.
     * @returns {Any} Value from key.
    */
    Storage.get = function(key) {
        // #if CHROME
        return sessionStorage.getItem(key);
        // #elseif FIREFOX
        return ss.storage[key];
        // #fi
    };

    /** 
     * Remove a value for corresponding key from underlying storage.
     * @static
     * @param key {String} Key for value to remove.
    */
    Storage.remove = function(key) {
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
    Storage.getMatchingValues = function(pattern, collection) {
        var values = [];
        // #if CHROME
        for(key in sessionStorage) {
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
    };

    /**
     * Get matching keys for a key pattern or collection.
     * @static
     * @param pattern {RegExp} Pattern to get matching keys for.
     * @returns {Array} Array of matching keys.
    */
    Storage.getMatchingKeys = function(pattern, collection) {
        var keys = [];
        // #if CHROME
        for(key in sessionStorage) {
            if(pattern.test(key)) {
                keys.push(key);
            }
        }
        // #elseif FIREFOX
        keys.push(collection);
        // #fi
        return keys;
    };

    return Storage;

})();

// #if FIREFOX
// Make available to index.js.
exports.Storage = Storage;
// #fi
