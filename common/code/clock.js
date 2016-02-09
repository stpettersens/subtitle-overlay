/*
	Subtitle Overlay.
	Browser extension to overlay subtitles on a streaming video.

	Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

var Clock = (function() {

	function Clock() {
		this.hours = 0;
		this.minutes = 0;
		this.seconds = 0;
	}

	Clock.prototype.setTimeMs = function(ms) {
		this.seconds = Math.floor((ms / 1000) % 60);
		this.minutes = Math.floor((ms / (1000 * 60)) % 60);
		this.hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	}

	Clock.prototype.getTime = function() {
		var h = this.hours.toString();
		var m = this.minutes.toString();
		var s = this.seconds.toString();

		if(h.length < 2) h = '0' + h;
		if(m.length < 2) m = '0' + m;
		if(s.length < 2) s = '0' + s;

		return h + ':' + m + ':' + s;
	}

	return Clock; 

})();
