/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

var Subtitle = (function() {

    /**
     * Subtitle class which represents a single subtitle.
     * @constructor
     * @param seq {Number} Index in sequence for subtitle.
     * @param start {Number} Start time in milliseconds.
     * @param end {Number} End time in milliseconds.
     * @param text {String} Subtitle text.
    */
    function Subtitle(seq, start, end, text) {
        this.seq = seq;
        this.start = start;
        this.end = end;
        this.text = text;
    }

    /**
     * Get sequence index for subtitle.
     * @returns {Number} Sequence index.
    */
    Subtitle.prototype.getSeq = function() {
        return this.seq;
    };

    /**
     * Get start time for subtitle.
     * @returns {Number} Start time in milliseconds.
    */
    Subtitle.prototype.getStart = function() {
        return this.start;
    };

    /**
     * Get end time for subtitle.
     * @returns {Number} End time in milliseconds.
    */
    Subtitle.prototype.getEnd = function() {
        return this.end;
    };

    /**
     * Get text for subtitle.
     * @returns {String} Subtitle text.
    */
    Subtitle.prototype.getText = function() {
        return this.text;
    };

    /**
     * Serialize subtitle as string for storing.
     * @returns {String} Serialized subtitle string.
    */
    Subtitle.prototype.serialize = function() {
        return this.seq + '::' + this.start + '::' +  this.end + '::' + this.text;
    };

    /** 
     * Deserialize into (i.e. create) a new Subtitle from subtitle string.
     * @static
     * @param {String} Subtitle string to serialize.
     * @returns {Subtitle} New Subtitle.
    */ 
    Subtitle.deserialize = function(serialized) {
        s = serialized.split("::");
        return new Subtitle(parseInt(s[0]), parseInt(s[1]), parseInt(s[2]), s[3]);
    };

    return Subtitle; 

})();

// #if FIREFOX
exports.Subtitle = Subtitle;
// #fi
