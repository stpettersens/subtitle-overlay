/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var pageMod = require('sdk/page-mod');
var { setInterval, clearInterval } = require('sdk/timers');
var data = require('sdk/self').data;
var core = require('./data/main.js');
var storage = require('./data/storage.js');

var g_playing = null;

const MS = 1000;
const OFFSET_X = 40;
const OFFSET_Y = 20;

/**
 * Set up the load subtitles button.
*/
var button = ToggleButton({
    id: 'subtitle-overlay-btn',
    label: 'Subtitle Overlay',
    icon: {
        '16': './icon-16.png',
        '32': './icon-32.png',
        '64': './icon-64.png'
    },
    onClick: openPopup
});

/**
 * Set up the load subtitles panel ("popup").
 * Attach necessary content scripts.
*/
var panel = panels.Panel({
    contentURL: data.url('popup.html'),
    contentScriptFile: ['./messaging.js', './content.js'],
    onHide: hidePopup
});

/**
 * Load subtitles via the popup.
 * Listen for and respond to 'load' action.
*/
panel.port.on('message', function(message) {
    if(message.action === 'load') {
        core.parseSubtitles(message.lines, message.filename);
    }
});

/**
 * Display the popup.
 * @param state {Object} State of popup.
*/
function openPopup(state) {
    if(state.checked) {
        panel.show({
            position: button
        });
    }
}

/**
 * Hide the popup.
*/
function hidePopup() {
    button.state('window', {checked: false});
}

/**
 * Playback subtitles over video.
 * @param worker {Object} Worker to emit messages.
 * @param video {Object} Video information (width and height).
*/
function playbackSubtitles(worker, video) {

    var input = storage.Storage.get('so_subtitles');
    var subtitles = core.loadSubtitles();
    var runtime = subtitles[subtitles.length - 1].getEnd();

    var resume = parseInt(storage.Storage.get('so_time'));
    if(isNaN(resume)) resume = 0;

    var i = parseInt(storage.Storage.get('so_at'));
    if(isNaN(i)) i = 0;

    var start = new Date().getTime() - resume;
    g_playing = setInterval(function() {

        var time = Math.floor((new Date().getTime() - start) / MS);
        var s = Math.floor(subtitles[i].getStart() / MS);
        var f = Math.floor(subtitles[i].getEnd() / MS);

        core.setTimeAndSeq(time * MS, i);

        if(time == s) {
            var s = {
                text: subtitles[i].getText(),
                x: (video.width / 2) - OFFSET_X,
                y: video.height - OFFSET_Y
            };
            worker.postMessage({type: 'subtitle', subtitle: s});
        }
        if(time == f) {
            worker.postMessage({type: 'refresh'});
            i++;
        }
        if(i == subtitles.length) {
            clearInterval(g_playing);
        }
    }, 1);
}

/**
 * Pause subtitles playback.
*/
function pauseSubtitles() {
    clearInterval(g_playing);
}

/**
 * Seek (i.e. retrieve) subtitles for playback position (i.e. current time).
 * @param worker {Object} Worker to emit messages.
 * @param currentTime {Number} Current time as floating point number (milliseconds).
*/
function seekSubtitles(worker, currentTime) {
    pauseSubtitles();
    worker.postMessage({type: 'refresh'});
    var subtitles = core.loadSubtitles();
    subtitles = subtitles.filter(function(s) {
        if(Math.floor(currentTime * MS) <= s.getStart()) {
            return true;
        }
        return false;
    });
    core.setTimeAndSeq(
        Math.floor(currentTime * MS),
        subtitles[0].getSeq()
    );
}

/**
 * Clear the time and current subtitle values from storage.
*/
function clearPlayback() {
    pauseSubtitles();
    storage.Storage.remove('so_time');
    storage.Storage.remove('so_at');
}

/**
 * Display information for loaded subtitles over video.
 * @param worker {Object} Worker to emit messages.
 * @param video {Object} Video information (width and height).
 * @param info {String} Information message to display.
 * @param params {String} Parameters to use for $ placeholders.
*/
function showInfo(worker, video, info, params) {
    info = info.toString();
    params.map(function(param) {
        info = info.replace('$', param);
    });
    var i = {
        text: info,
        x: (video.width / 2) - OFFSET_X,
        y: video.height - OFFSET_Y
    };
    worker.postMessage({type: 'info', info: i});
}

/**
 * Display error message over video.
 * @param worker {Object} Worker to emit messages.
 * @param error {String} Error message to display.
*/
function showError(worker, error) {
    worker.postMessage({type: 'error', error: error});
}

/**
 * Set up the content scripts and CSS for a loaded page with <video>
 * and respond to messages from main content script's event listeners
 * with appropriate action (e.g. 'play'-> playbackSubtitles(...)).
*/
pageMod.PageMod({
    include: ['*'],
    contentScriptFile: ['./messaging.js', './content.js'],
    contentStyleFile: data.url('so.css'),
    onAttach: function(worker) {
        worker.on('message', function(message) {
            if(message.action === 'clear') {
                clearPlayback();
            }
            if(message.action === 'load') {
                core.parseSubtitles(message.lines, message.filename);
            }
            if(message.action === 'play') {
                playbackSubtitles(worker, message.info);
            }
            if(message.action === 'pause') {
                pauseSubtitles();
            }
            if(message.action === 'seeking') {
                seekSubtitles(worker, message.time);
            }
            if(message.action === 'info') {
                showInfo(worker, request.info);
            }
        });
    }
});
