const { spawn } = require('child_process');
var logger = require("../logger");

function AudioCompressor(frequency, channel, volume, debug) {
    frequency = frequency || 44100;
    channel = channel || 2;
    volume = volume || 20;

    var ffmpeg = spawn('ffmpeg', ['-f', 's16le', '-ar', frequency, '-ac', channel, '-i', '-', '-filter:a', 'volume='+volume, '-f', 'mp3', '-']);
    
    var funcMap = {};
    this.on = function(name, func) {
        funcMap[name] = func;
    }

    this.push = function(audio) {
        ffmpeg.stdin.write(audio);
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

module.exports.AudioCompressor = AudioCompressor;