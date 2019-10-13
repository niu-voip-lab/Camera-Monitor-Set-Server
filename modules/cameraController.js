var logger = require('../logger')

var TcpServer = require("../libs/tcp").TcpServer;
var IpCam = require("../libs/ipCam");

var ipCams = {};
var ws = null;

var funcMap = {};
function trigger(name, ...param) {
    if(funcMap[name]) {
        funcMap[name](...param);
    }
}

var videoServer = new TcpServer('', 8877);
var audio1Server = new TcpServer('', 8888);
var audio2Server = new TcpServer('', 8899);
var controlServer = new TcpServer('', 8800);

function getIdFromSocket(socket) {
    return socket.remoteAddress.replace("::ffff:", "");
}

function addCamera(socket) {
    var id = getIdFromSocket(socket);
    if(ws == null) {
        logger.error("ws is not ready.");
        return null;
    }
    if(ipCams[id] != null || ipCams[id] != undefined) {
        return id;
    }

    logger.info('Camera "%s" created', id);
    var ipcam = new IpCam(id, {
        fps: 30,
        resolution: '1920x1080',
        frequency: 44100,
        channel: 2,
        volume: 20,
        debug: false,
    });
    
    ipcam.on('videoData', function(name, data) {
        ws.sendVideo(name, data);
    });

    ipcam.on('audioData', function(name, data) {
        ws.sendAudio(name, data);
    });

    // ipcam.on('audio1Data', function(name, data) {
    //     ws.sendAudio(name, data);
    // });

    // ipcam.on('audio2Data', function(name, data) {
    //     // ws.sendAudio(name, data);
    // });   

    ipcam.on('ready', function(name) {
        trigger('cameraReady', name, ipcam);
    });

    ipCams[id] = ipcam;
    return id;
}

videoServer.on('connection', function(socket) {
    var id = addCamera(socket);
    ipCams[id].setVideoSocket(socket);
});

audio1Server.on('connection', function(socket) {
    var id = addCamera(socket);
    ipCams[id].setAudio1Socket(socket);
});

audio2Server.on('connection', function(socket) {
    var id = addCamera(socket);
    ipCams[id].setAudio2Socket(socket);
});

controlServer.on('connection', function(socket) {
    var id = addCamera(socket);
    ipCams[id].setControlSocket(socket);    
});

function ExternelInterface() {
    this.getIpCam = function(name) {
        return ipCams[name];
    }

    this.on = function(name, func) {
        funcMap[name] = func;
    }
}

module.exports = function(_ws) {
    ws = _ws;
    videoServer.start();
    audio1Server.start();
    audio2Server.start();
    controlServer.start();
    return new ExternelInterface();
}