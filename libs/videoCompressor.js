const { spawn } = require('child_process');
var logger = require("../logger");

function VideoCompressor(idealFps, resolution, debug) {
    const ffmpeg = spawn('ffmpeg', [
        '-r', ''+idealFps,
        '-f', 'image2pipe', '-s', resolution, '-i', 'pipe:0',
        // '-f', 's16le', '-ar', '44100', '-ac', '2', '-i', 'pipe:1', '-filter:a', 'volume='+volume,
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-s', resolution,
        '-bf', '0', '-q', '6',
        '-codec:a', 'mp2', '-b:a', '128k',
        '-',
    ]);

    var funcMap = {};
    this.on = function(name, func) {
        funcMap[name] = func;
    }

    this.pushVideo = function(video) {
        ffmpeg.stdin.write(video);
    }

    this.pushAudio = function(audio) {
        // ffmpeg.stdout.write(audio);
    }

    this.push = function(video, audio) {
        if(video) {
            ffmpeg.stdin.write(video);
        }
        if(audio) {
            // ffmpeg.stdout.write(audio);
        }
    }

    ffmpeg.stdout.on('data', (data) => {
        funcMap['data'](data);
    });
    
    // debug only
    if(debug) {
        ffmpeg.stderr.on('data', function (data) {
            logger.info(data.toString());
        });

        ffmpeg.on('close', function (code) {
            logger.info('child process exited with code ' + code);
        });
    }
}

//ffmpeg -r 60 -f image2 -s 1280x720 -i pic%05d.png -i MP3FILE.mp3 -vcodec libx264 -b 4M -vpre normal -acodec copy OUTPUT.mp4 

// -f mpegts \
// 		-codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 \
// 		-codec:a mp2 -b:a 128k \
// 		-muxdelay 0.001 \
module.exports = VideoCompressor;