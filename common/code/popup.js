/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

/**
 * Handle loading subtiles from popup.html into the extension core.
*/
document.addEventListener('DOMContentLoaded', function() {
    let input = document.getElementById('input');
    input.addEventListener('change', handleFileSelect, false);

    function handleFileSelect(e) {
        let files = e.target.files;
        let reader = new FileReader();
        reader.onload = function(data) {
            let lines = data.target.result.split('\n');
            sendFileMessage({
                action: 'load',
                lines: lines, 
                filename: files[0].name
            });
        };
        reader.readAsText(files[0]);
    }
});
