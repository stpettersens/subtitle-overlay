/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

class Clock {
    
    /**
     * Clock class which represents an HH:MM:SS digital clock.
     * @constructor
    */
    constructor() {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
    }

    /**
     * Set time for clock.
     * @param ms {Number} Time to set clock for in milliseconds.
    */
    setTimeMs(ms) {
        this.seconds = Math.floor((ms / 1000) % 60);
        this.minutes = Math.floor((ms / (1000 * 60)) % 60);
        this.hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    }

    /**
     * Get HH:MM:SS time for clock.
     * @returns {String} HH:MM:SS formatted time.
    */
    getTime() {
        let h = `${this.hours}`;
        let m = `${this.minutes}`;
        let s = `${this.seconds}`;

        if(h.length < 2) h = `0${h}`;
        if(m.length < 2) m = `0${m}`;
        if(s.length < 2) s = `0${s}`;

        return `${h}:${m}:${s}`;
    }
}
