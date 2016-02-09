/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

//...

function sendMessage(request) {
    console.log('message -> ' + JSON.stringify(request));
}

function sendMessageTab(request) {
    sendMessage(request);
}

exports.sendMessage = sendMessage;
exports.sendMessageTab = sendMessageTab;
