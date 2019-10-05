const VideoCompressor = require("./videoCompressor");
const AudioCompressor = require("./audioCompressor").AudioCompressor;

function IpCam(name, param) {
    var videoCompressor = new VideoCompressor(param.fps, param.resolution, param.debug);
    var audioCompressor1 = new AudioCompressor(param.frequency, param.channel, param.volume, param.debug);
    var audioCompressor2 = new AudioCompressor(param.frequency, param.channel, param.volume, param.debug);

    this.pushVideo = function(data) {
        videoCompressor.push(data);
    }

    this.pushAudio1 = function(data) {
        audioCompressor1.push(data);
    }

    this.pushAudio2 = function(data) {
        audioCompressor2.push(data);
    }

    var funcMap = {};
    this.on = function(name, func) {
        funcMap[name] = func;
    }

    videoCompressor.on('data', function(data) {
        if(funcMap['videoData']) {
            funcMap['videoData'](name, data);
        }
    });

    audioCompressor1.on('data', function(data) {
        if(funcMap['audio1Data']) {
            funcMap['audio1Data'](name, data);
        }
    });

    audioCompressor2.on('data', function(data) {
        if(funcMap['audio2Data']) {
            funcMap['audio2Data'](name, data);
        }
    });
}

module.exports = IpCam;