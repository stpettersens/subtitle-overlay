/*
    Subtitle Overlay.
    Browser extension to overlay subtitles on a streaming video.

    Copyright 2016 Sam Saint-Pettersen.
    Released under the MIT/X11 License.
*/

document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('input');
    input.addEventListener('change', handleFileSelect, false);

    function handleFileSelect(e) {
        var files = e.target.files;
        var reader = new FileReader();
        reader.onload = function(data) {
            var lines = data.target.result.split('\n');
            sendFileMessage({
                action: 'load',
                lines: lines, 
                filename: files[0].name
            });
        };
        reader.readAsText(files[0]);
    }
});
