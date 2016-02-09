/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

function createOverlay(video) {
    var canvas = document.createElement('canvas');
    canvas.id = 'so_subtitles';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight - 35;
    setYouTube();
    wrap('video', 'div', 'so_extension');
    var w = document.getElementsByClassName('so_extension')[0];
    w.appendChild(canvas);

    function setYouTube() {
        if(/youtube\.com\/watch/.test(document.location.href)) {
            canvas.width = 640;
            canvas.height = 360 - 20;
        }
    }

    function wrap(target, el, _class) {
        var src = document.getElementsByTagName(target)[0];
        var wrapped = '<' + el + ' class="' + _class + '">';
        wrapped += src.outerHTML + '</' + el + '>';
        src.outerHTML = wrapped;
    }

    var videoInfo = {
        width: canvas.width,
        height: canvas.height
    }
    return videoInfo;
}

function refreshOverlay(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function displaySubtitle(ctx, subtitle) {
    ctx.font = '14pt Verdana';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeText(subtitle.text, subtitle.x, subtitle.y);
    ctx.fillText(subtitle.text, subtitle.x, subtitle.y);
}

function init() {
    var video = document.getElementsByTagName('video')[0];
    var videoInfo = null;
    if(video !== undefined) {
        videoInfo = createOverlay(video);
        video = document.getElementsByTagName('video')[0];
        video.addEventListener('play', handlePlayEvent, false);
        video.addEventListener('pause', handlePauseEvent, false);
        video.addEventListener('seeking', handleSeekEvent, false);
    }

    sendMessage({action: 'clear'});

    function handlePlayEvent(e) {
        sendMessage({action: 'play', info: videoInfo});
    }

    function handlePauseEvent(e) {  
        sendMessage({action: 'pause'});
    }

    function handleSeekEvent(e) {
        sendMessage({action: 'seeking', time: video.currentTime});
    }

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
    window.addEventListener('file-message', function(request) {
        sendMessage({
            action: 'load', 
            lines: unsafeWindow.lines, 
            filename: unsafeWindow.filename
        });
    }, false);
    // #fi
}
init();
