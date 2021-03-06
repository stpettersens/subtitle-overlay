/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

class Subtitle {

    /**
     * Subtitle class which represents a single subtitle.
     * @constructor
     * @param seq {Number} Index in sequence for subtitle.
     * @param start {Number} Start time in milliseconds.
     * @param end {Number} End time in milliseconds.
     * @param text {String} Subtitle text.
    */
    constructor(seq, start, end, text) {
        this.seq = seq;
        this.start = start;
        this.end = end;
        this.text = text;
    }

    /**
     * Get sequence index for subtitle.
     * @returns {Number} Sequence index.
    */
    getSeq() {
        return this.seq;
    }

    /**
     * Get start time for subtitle.
     * @returns {Number} Start time in milliseconds.
    */
    getStart() {
        return this.start;
    }

    /**
     * Get end time for subtitle.
     * @returns {Number} End time in milliseconds.
    */
    getEnd() {
        return this.end;
    }

    /**
     * Get text for subtitle.
     * @returns {String} Subtitle text.
    */
    getText() {
        return this.text;
    }

    /**
     * Serialize subtitle as string for storing.
     * @returns {String} Serialized subtitle string.
    */
    serialize() {
        return `${this.seq}::${this.start}::${this.end}::${this.text}`;
    }

    /** 
     * Deserialize into (i.e. create) a new Subtitle from subtitle string.
     * @static
     * @param {String} Subtitle string to deserialize.
     * @returns {Subtitle} New Subtitle.
    */ 
    static deserialize(serialized) {
        let s = serialized.split("::");
        return new Subtitle(parseInt(s[0]), parseInt(s[1]), parseInt(s[2]), s[3]);
    };
}

// #if FIREFOX
exports.Subtitle = Subtitle;
// #fi
