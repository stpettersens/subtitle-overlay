/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var pageMod = require('sdk/page-mod');
var { setInterval, clearInterval } = require('sdk/timers');
var data = require('sdk/self').data;
var core = require('./data/main.js');
var storage = require('./data/storage.js');

var g_playing;
const MS = 1000;
const OFFSET_X = 40;
const OFFSET_Y = 20;

var button = buttons.ActionButton({
    id: 'subtitle-overlay-btn',
    label: 'Subtitle Overlay',
    icon: {
        '16': './icon-16.png',
        '32': './icon-32.png',
        '64': './icon-64.png'
    },
    onClick: openPopup
});

function openPopup(state) {
    tabs.open({
        url: data.url('popup.html'),
        onReady: attachScript
    });
}

function attachScript(tab) {
    var worker = tab.attach({
        contentScriptFile: ['./messaging.js', './content.js']
    });
    worker.on('message', function(message) {
        if(message.action === 'load') {
            core.parseSubtitles(message.lines, message.filename);
        }
    });
}

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

function pauseSubtitles() {
    clearInterval(g_playing);
}

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

function clearPlayback() {
    pauseSubtitles();
    storage.Storage.remove('so_time');
    storage.Storage.remove('so_at');
}

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

function showError(worker, error) {
    worker.postMessage({type: 'error', error: error});
}

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
