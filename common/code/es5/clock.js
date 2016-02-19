/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

var Clock = (function() {

    /**
     * Clock class which represents an HH:MM:SS digital clock.
     * @constructor
    */
    function Clock() {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
    }

    /**
     * Set time for clock.
     * @param ms {Number} Time to set clock for in milliseconds.
    */
    Clock.prototype.setTimeMs = function(ms) {
        this.seconds = Math.floor((ms / 1000) % 60);
        this.minutes = Math.floor((ms / (1000 * 60)) % 60);
        this.hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    }

    /**
     * Get HH:MM:SS time for clock.
     * @returns {String} HH:MM:SS formatted time.
    */
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
