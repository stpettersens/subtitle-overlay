/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

/**
 * Send a message to extension core from content script (Chrome).
 * Send a message between extension core and content script (Firefox).
 * @param request {Object} Request message object.
*/
function sendMessage(request) {
    // #if CHROME
    chrome.runtime.sendMessage(request);
    // #elseif FIREFOX
    self.postMessage(request, '*');
    // #fi
}

// #if FIREFOX
/**
 * Send a message to extension core from content script (via Port API).
 * @param request {Object} Request message object.
*/
function sendMessagePort(request) {
    self.port.emit('message', request);
}
// #fi

/**
 * Send a message to content script (running in a tab) from extension core.
 * @param request {Object} Request message object.
*/
function sendMessageTab(request) {
    // #if CHROME
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
    // #elseif FIREFOX
    sendMessage(request);
    // #fi
}

/**
 * Send a file message to content script (running in a tab) from extension core.
 * @param request {Object} Request file-message object.
*/
function sendFileMessage(request) {
    // #if CHROME
    sendMessage(request);
    // #elseif FIREFOX
    window.lines = request.lines;
    window.filename = request.filename;
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('file-message', true, true, request);
    document.documentElement.dispatchEvent(event);
    // #fi
}

/** 
 * Add a message listener to content script.
 * @param request {Function} Function with request parameter.
*/
function addMessageListener(request) {
    // #if CHROME
    chrome.runtime.onMessage.addListener(request);
    // #elseif FIREFOX
    self.on('message', request, false);
    // #fi
}
