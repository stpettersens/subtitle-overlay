// #if FIREFOX
var ss = require('sdk/simple-storage');
// #fi

var Storage = (function() {

	function Storage() {}

	Storage.set = function(key, value) {
		// #if CHROME
		sessionStorage.setItem(key, value);
		// #elseif FIREFOX
		ss.storage[key] = value;
		// #fi
	}

	Storage.setCollection = function(key, collection, value) {
		// #if CHROME
		Storage.set(key, value);
		Storage.records++;
		// #elseif FIREFOX
		if(!ss.storage[collection]) {
			ss.storage[collection] = [];
		}
		ss.storage[collection].push(value);
		// #fi
	};

	Storage.get = function(key) {
		// #if CHROME
		return sessionStorage.getItem(key);
		// #elseif FIREFOX
		return ss.storage[key];
		// #fi
	};

	Storage.remove = function(key) {
		// #if CHROME
		sessionStorage.removeItem(key);
		// #elseif FIREFOX
		delete ss.storage[key];
		// #fi
	}

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

	Storage.records = function(collection) {
		// #if CHROME
		return sessionStorage.length;
		// #elseif FIREFOX
		return ss.storage[collection].length;
		// #fi
	}

	return Storage;

})();

// #if FIREFOX
exports.Storage = Storage;
// #fi
