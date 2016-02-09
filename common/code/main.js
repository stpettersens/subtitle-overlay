/*
	Subtitle Overlay.
	Browser extension to overlay subtitles on a streaming video.

	Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

// #if FIREFOX
var subtitle = require('./subtitle.js');
var storage = require('./storage.js');
// #prefix Subtitle. with subtitle.
// #prefix Subtitle( with subtitle.
// #prefix Storage. with storage.
// #fi

// #if CHROME
var g_playing;
const MS = 1000;
// #fi

/**
 * Parse the subtitles (*.srt) file.
 * @param lines string[] Lines of subtitles file.
 * @param filename string Filename of subtitles file.
*/
function parseSubtitles(lines, filename) {

	if(!isValid(lines[0])) {
		showError('Input file is not valid subtitles.');
	}
	else {
		clearSubtitles();

		var seqs = [];
		var starts = [];
		var ends = [];
		var text = [];
		var i = 0;

		lines.map(function(l) {
			p = /(\d{2}:\d{2}:\d{2},\d{3})\s-->\s(\d{2}:\d{2}:\d{2},\d{3})/;
			var matches = l.match(p);
			if(matches != null) {
				starts.push(convertTimeToMs(matches[1]));
				ends.push(convertTimeToMs(matches[2]));
				seqs.push(++i);
				return;
			}
			p = /^[\d\-a-z'\s]+/i;
			if(p.test(l)) {
				text.push(l);
			}
			if(l.length == 1) {
				text.push('|');
			}
		});

		text = text.join("\n").split("|")
		.map(removeNewline).map(removeSequence).map(trim);

		var subtitles = [];
		for(var i = 0; i < seqs.length; i++) {
			subtitles.push(new Subtitle(seqs[i], starts[i], ends[i], text[i]));
		}

		for(var i = 0; i < subtitles.length; i++) {
			Storage.setCollection('so_sub_' + (i + 1), 'subt_serialized', subtitles[i].serialize());
		}
		Storage.set('so_subtitles', filename);
	}

	function convertTimeToMs(timestamp) {
		var p = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/;
		var matches = timestamp.match(p);
		var hours = parseInt(matches[1]);
		var minutes = parseInt(matches[2]);
		var seconds = parseInt(matches[3]);
		var ms = parseInt(matches[4]);

		var time = (hours * 3600) + (minutes * 60) + seconds;
		time = (time * 1000) + ms;
		return time;
	}

	function removeNewline(value) {
		return value.replace(/^\n/, '');
	}

	function removeSequence(value) {
		return value.replace(/^\d+/, '');
	}

	function trim(value) {
		return value.trim();
	}

	function clearSubtitles() {
		Storage.getMatchingKeys(/^so_sub_/, 'subt_serialized').map(function(k) {
			Storage.remove(k);
		});
	}

	function isValid(data) {
		if(/^\d+/.test(data)) return true;
		return false;
	}
}

// #if CHROME
function playbackSubtitles(video) {

	var input = Storage.get('so_subtitles');
	var subtitles = loadSubtitles();
	var runtime = subtitles[subtitles.length - 1].getEnd();

	/*var clock = new Clock();
	clock.setTimeMs(runtime);

	showInfo(video, "Playing back: '$' (Runtime: $s [$ms])...", 
	[input, clock.getTime(), runtime]);*/

	var resume = parseInt(Storage.get('so_time'));
	if(isNaN(resume)) resume = 0;

	var i = parseInt(Storage.get('so_at'));
	if(isNaN(i)) i = 0;

	var start = new Date().getTime() - resume;
	g_playing = window.setInterval(function() {

		var time = Math.floor((new Date().getTime() - start) / MS);	
		var s = Math.floor(subtitles[i].getStart() / MS);
		var f = Math.floor(subtitles[i].getEnd() / MS);

		setTimeAndSeq(time * MS, i);

		if(time == s) {
			var s = {
				text: subtitles[i].getText(),
				x: (video.width / 2) - 40,
				y: video.height - 45
			};
			sendMessageTab( {type: 'subtitle', subtitle: s});
		}
		if(time == f) {
			sendMessageTab( {type: 'refresh'});
			i++;
		}
		if(i == subtitles.length) {
			window.clearInterval(g_playing);
		}

	}, 1);
}
// #fi

function loadSubtitles() {
	var subtitles = [];
	Storage.getMatchingValues(/^so_sub_/, 'subt_serialized').map(function(s) {
		subtitles.push(Subtitle.deserialize(s));
	});
	subtitles.sort(function(a, b) {
		return a.getSeq() - b.getSeq();
	});
	return subtitles;
}

function pauseSubtitles() {
	// #if CHROME
	window.clearInterval(g_playing);
	// #fi
}

// #if CHROME
function seekSubtitles( currentTime) {
	pauseSubtitles();
	sendMessageTab( {type: 'refresh'});
	var subtitles = loadSubtitles();
	subtitles = subtitles.filter(function(s) {
		if(Math.floor(currentTime * MS) <= s.getStart()) return true;
		return false;
	});
	setTimeAndSeq(
		Math.floor(currentTime * MS), 
		subtitles[0].getSeq()
	);
}
// #fi

function setTimeAndSeq(time, seq) {
	Storage.set('so_time', time);
	Storage.set('so_at', seq);
}

function clearPlayback() {
	pauseSubtitles();
	Storage.remove('so_time');
	Storage.remove('so_at');
}

// #if CHROME
function showInfo(video, info, params) {
	info = info.toString();
	params.map(function(param) {
		info = info.replace('$', param);
	});
	var i = {
		text: info,
		x: (video.width / 2) - 40,
		y: video.height - 45
	}
	sendMessageTab( {type: 'info', info: i});
}

function showError(error) {
	sendMessageTab( {type: 'error', error: error});
}

chrome.runtime.onMessage.addListener(function(request) {
	if(request.action === 'clear') {
		clearPlayback();
	}
	if(request.action === 'load') {
		parseSubtitles(request.lines, request.filename);
	}
	if(request.action === 'play') {
		playbackSubtitles(request.info);
	}
	if(request.action === 'pause') {
		pauseSubtitles();
	}
	if(request.action === 'seeking') {
		seekSubtitles(request.time);
	}
	if(request.action === 'info') {
		showInfo(request.info);
	}
});
// #elseif FIREFOX
exports.parseSubtitles = parseSubtitles;
exports.loadSubtitles = loadSubtitles;
exports.clearPlayback = clearPlayback;
// #fi
