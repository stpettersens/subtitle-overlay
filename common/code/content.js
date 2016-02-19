/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

/**
 * Create overlay for target video.
 * @param video {Object} Target video.
*/
function createOverlay(video) {
    var canvas = document.createElement('canvas');
    canvas.id = 'so_subtitles';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight - 35;
    setYouTube();
    if(!isYouTube()) {
        wrap('video', 'div', 'so_extension');
        var w = document.getElementsByClassName('so_extension')[0];
        w.appendChild(canvas);
    }

    /**
     * Check if on YouTube.
     *
    */
    function isYouTube() {
        var oyt = false;
        if(/youtube\.com/.test(document.location.href)) {
            oyt = true;
        }
        return oyt;
    }

    /**
     * Set dimensions for overlay on YouTube videos.
    */
    function setYouTube() {
        if(/youtube\.com\/watch/.test(document.location.href)) {
            canvas.width = 640;
            canvas.height = 360 - 20;
        }
    }

    /**
     * Wrap target element with a classed element.
     * @private
     * @param target {String} Target element name.
     * @param el {String} Wrapping element name.
     * @param className {String} Wrapping element class. 
    */
    function wrap(target, el, className) {
        var src = document.getElementsByTagName(target)[0];
        var wrapped = '<' + el + ' class="' + className + '">';
        wrapped += src.outerHTML + '</' + el + '>';
        src.outerHTML = wrapped;
    }

    // Set video width and height from canvas width and height.
    var videoInfo = {
        width: canvas.width,
        height: canvas.height
    }
    return videoInfo;
}

/**
 * Refresh (i.e. clear) the overlay canvas.
 * @param ctx {Object} Context for canvas.
 * @param canvas {Object} Canvas object.
*/
function refreshOverlay(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Display a subtitle in the overlay canvas.
 * @param ctx {Object} Context for canvas.
 * @param subtitle {Object} Subtitle to display.
*/
function displaySubtitle(ctx, subtitle) {
    ctx.font = '14pt Verdana';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeText(subtitle.text, subtitle.x, subtitle.y);
    ctx.fillText(subtitle.text, subtitle.x, subtitle.y);
}

/**
 * Initialize the main content script.
*/
function init() {
    /*
        Get target video (first video on page), create the subtitle overlay
        and add event listeners to track playing, pausing and seeking.
    */ 
    var video = document.getElementsByTagName('video')[0];
    var videoInfo = null;
    if(video !== undefined) {
        videoInfo = createOverlay(video);
        video = document.getElementsByTagName('video')[0];
        video.addEventListener('play', handlePlayEvent, false);
        video.addEventListener('pause', handlePauseEvent, false);
        video.addEventListener('seeking', handleSeekingEvent, false);
    }

    // Clear stored subtitles from extension storage.
    sendMessage({action: 'clear'}); 

    /**
     * Handle play event:
     * Send message to extension core to playback subtitles.
    */
    function handlePlayEvent(e) {
        sendMessage({action: 'play', info: videoInfo});
    }

    /**
     * Handle pause event:
     * Send message to extension core to playback subtitles.
    */
    function handlePauseEvent(e) {  
        sendMessage({action: 'pause'});
    }

    /**
     * Handle seeking event:
     * Send message to extension core to seek to relevant subtitles.
    */
    function handleSeekingEvent(e) {
        sendMessage({action: 'seeking', time: video.currentTime});
    }

    /**
     * Listen to messages from extension core to display 
     * and clear subtitles (and show any information + errors) over target video.
    */
    addMessageListener(function(request) {
        var canvas = document.getElementById('so_subtitles');
        var ctx = canvas.getContext('2d');

        if(request.type == 'subtitle') {
            displaySubtitle(ctx, request.subtitle);
        }
        if(request.type == 'info') {
            displaySubtitle(ctx, request.info)
        }
        if(request.type == 'refresh') {
            refreshOverlay(ctx, canvas);
        }
        if(request.type == 'error') {
            window.alert(request.error);
        }
    });

    // #if FIREFOX
    /** 
     * Event listener for 'file-message' event fired from
     * popup.html which messages listener over port API
     * to parse + load subtitles.
    */
    window.addEventListener('file-message', function(request) {
        sendMessagePort({
            action: 'load', 
            lines: unsafeWindow.lines, 
            filename: unsafeWindow.filename
        });
    }, false);
    // #fi
}
init();
