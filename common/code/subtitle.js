/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

var Subtitle = (function() {

    function Subtitle(seq, start, end, text) {
        this.seq = parseInt(seq);
        this.start = parseInt(start);
        this.end = parseInt(end);
        this.text = text;
    }

    Subtitle.prototype.getSeq = function() {
        return this.seq;
    };

    Subtitle.prototype.getStart = function() {
        return this.start;
    };

    Subtitle.prototype.getEnd = function() {
        return this.end;
    };

    Subtitle.prototype.getText = function() {
        return this.text;
    };

    Subtitle.prototype.serialize = function() {
        return this.seq + '::' + this.start + '::' +  this.end + '::' + this.text;
    };

    Subtitle.deserialize = function(serialized) {
        s = serialized.split("::");
        return new Subtitle(s[0], s[1], s[2], s[3]);
    };

    return Subtitle; 

})();

// #if FIREFOX
exports.Subtitle = Subtitle;
// #fi
