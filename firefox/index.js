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
var subtitle = require('./data/subtitle.js');

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

	var s = {
		text: subtitles[10].getText(),
		x: (video.width / 2) - 40,
		y: video.height - 45
	};

	worker.postMessage({type: 'subtitle', subtitle: s});
}

pageMod.PageMod({
	include: ['*'],
	contentScriptFile: ['./messaging.js', './content.js'],
	contentStyleFile: data.url('so.css'),
	onAttach: function(worker) {
		worker.on('message', function(message) {
			if(message.action === 'clear') {
				core.clearPlayback();
			}
			if(message.action === 'load') {
				core.parseSubtitles(message.lines, message.filename);
			}
			if(message.action === 'play') {
				playbackSubtitles(worker, message.info);
			}
			if(message.action === 'pause') {
			}
			if(message.action === 'seeking') {
			}
			if(message.action === 'info') {
			}
		});
	}
});
