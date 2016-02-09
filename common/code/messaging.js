/*
	Subtitle Overlay.
	Browser extension to overlay subtitles on a streaming video.

	Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

function sendMessage(request) {
	// #if CHROME
	chrome.runtime.sendMessage(request);
	// #elseif FIREFOX
	self.postMessage(request, '*');
	// #fi
}

function sendMessageTab(request) {
	// #if CHROME
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, request);
	});
	// #elseif FIREFOX
	sendMessage(request);
	// #fi
}

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

function addMessageListener(request) {
	// #if CHROME
	chrome.runtime.onMessage.addListener(request);
	// #elseif FIREFOX
	self.on('message', request, false);
	// #fi
}
