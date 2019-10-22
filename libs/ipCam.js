var VideoCompressor = require("./videoCompressor");
var AudioCompressor = require("./audioCompressor").AudioCompressor;
var receiver = require("./receiver");
var StreamReceiver = receiver.StreamReceiver;
var ControlReceiver = receiver.ControlReceiver;
var logger = require("../logger");

function IpCam(name, param) {
    var funcMap = {};
    this.on = function (_name, func) {
        funcMap[_name] = func;
    }

    function trigger(_name, ...para) {
        if (funcMap[_name]) {
            funcMap[_name](...para);
        }
    }

    var videoSocket = null;
    var audio1Socket = null;
    var audio2Socket = null;
    var controlSocket = null;

    var videoReceiver = new StreamReceiver();
    var audio1Receiver = new StreamReceiver();
    var audio2Receiver = new StreamReceiver();
    var controlReceiver = new ControlReceiver();

    var videoCompressor = new VideoCompressor(param.fps, param.resolution, param.debug);
    var audioCompressor1 = new AudioCompressor(param.frequency, param.channel, param.volume, param.debug);
    var audioCompressor2 = new AudioCompressor(param.frequency, param.channel, param.volume, param.debug);

    var vAngle = 0;
    var hAngle = 0;

    function handleSocket() {
        videoSocket.on('data', function (data) {
            videoReceiver.input(videoSocket, data);
        });
        audio1Socket.on('data', function (data) {
            audio1Receiver.input(audio1Socket, data);
        });
        audio2Socket.on('data', function (data) {
            audio2Receiver.input(audio2Socket, data);
        });
        controlSocket.on('data', function (data) {
            controlReceiver.input(data);
        });
    }

    function checkSocket() {
        if (videoSocket != null && audio1Socket != null && audio2Socket != null && controlSocket != null) {
            logger.info("Camera \"%s\" is ready", name);
            handleSocket();
            trigger('ready', name);
        }
    }

    var controlVStr = "V_ANG:";
    var controlHStr = "H_ANG:";
    var controlLock = false;

    function sendVAngle() {
        if (controlSocket != null) {
            var id = setInterval(function () {
                if (controlLock) {
                    return;
                }
                controlLock = true;
                clearInterval(id);
                try {
                    controlSocket.write(controlVStr + vAngle, function () {
                        controlLock = false;
                    });
                } catch(e) {
                    logger.error(e);
                }
            }, 1);
        }
    }

    function sendHAngle() {
        if (controlSocket != null) {
            var id = setInterval(function () {
                if (controlLock) {
                    return;
                }
                controlLock = true;
                clearInterval(id);
                controlSocket.write(controlHStr + hAngle, function () {
                    controlLock = false;
                });
            }, 1);
        }
    }

    this.setVideoSocket = function (socket) {
        videoSocket = socket;
        checkSocket();
    }

    this.setAudio1Socket = function (socket) {
        audio1Socket = socket;
        checkSocket();
    }

    this.setAudio2Socket = function (socket) {
        audio2Socket = socket;
        checkSocket();
    }

    this.setControlSocket = function (socket) {
        controlSocket = socket;
        checkSocket();
    }

    this.getName = function () {
        return name;
    }

    this.getVAngle = function () {
        return vAngle;
    }

    this.getHAngle = function () {
        return hAngle;
    }

    this.setVAngle = function (angle) {
        if(angle == null || angle == undefined) return;
        vAngle = angle;
        sendVAngle();
    }

    this.setHAngle = function (angle) {
        if(angle == null || angle == undefined) return;
        hAngle = angle;
        sendHAngle();
    }

    this.isLeftAudioEnabled = function() {
        return (hAngle <= 0);
    }

    videoReceiver.on('data', function (socket, obj) {
        videoCompressor.push(obj.data);
    });

    audio1Receiver.on('data', function (socket, obj) {
        audioCompressor1.push(obj.data);
    });

    audio2Receiver.on('data', function (socket, obj) {
        audioCompressor2.push(obj.data);
    });

    controlReceiver.on('data', function (data) {
        if (data.indexOf(controlVStr) >= 0) {
            // logger.info("VServo angle changed. %s", data);
            var temp = parseFloat((data+"").replace(controlVStr, ""));
            if(temp != null && temp != undefined && !isNaN(temp)) {
                vAngle = temp;
            }
        } else if (data.indexOf(controlHStr) >= 0) {
            // logger.info("HServo angle changed. %s", data);
            var temp = parseFloat((data+"").replace(controlHStr, ""));
            if(temp != null && temp != undefined && !isNaN(temp)) {
                hAngle = temp;
            }
        }
        trigger('angleChanged', vAngle, hAngle);
    });

    videoCompressor.on('data', function (data) {
        trigger('videoData', name, data);
    });

    var AUDIO_LEFT = 0, AUDIO_RIGHT = 1;
    function sendAudio(side, data) {
        if(hAngle <= 0 && side == AUDIO_LEFT) {
            trigger('audioData', name, data);
        } else if(hAngle > 0 && side == AUDIO_RIGHT) {
            trigger('audioData', name, data);
        }
    }

    audioCompressor1.on('data', function (data) {
        trigger('audio1Data', name, data);
        sendAudio(AUDIO_RIGHT, data);
    });

    audioCompressor2.on('data', function (data) {
        trigger('audio2Data', name, data);
        sendAudio(AUDIO_LEFT, data);
    });
}

module.exports = IpCam;