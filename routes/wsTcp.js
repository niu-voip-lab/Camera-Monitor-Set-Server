var ws = require('./ws');
var logger = require('../logger')

var TcpServer = require("../libs/tcp").TcpServer;
var StreamReceiver = require("../libs/receiver").StreamReceiver;
var IpCam = require("../libs/ipCam");

var ipCams = {};
var videoServer = new TcpServer('', 8877);
var audio1Server = new TcpServer('', 8888);
var audio2Server = new TcpServer('', 8899);

function addCamera(socket) {
    var id = socket.remoteAddress.replace("::ffff:", "");
    if(ipCams[id]) return;
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

    ipcam.on('audio1Data', function(name, data) {
        ws.sendAudio(name, data);
    });

    ipcam.on('audio2Data', function(name, data) {
        // ws.sendAudio(name, data);
    });

    ipCams[socket.remoteAddress] = ipcam;
}

videoServer.on('connection', function(socket) {
    addCamera(socket);
});

audio1Server.on('connection', function(socket) {
    addCamera(socket);
});

audio2Server.on('connection', function(socket) {
    addCamera(socket);
});

var videoReceiver = new StreamReceiver();
var audio1Receiver = new StreamReceiver();
var audio2Receiver = new StreamReceiver();

videoServer.on('data', function (socket, data) {
    videoReceiver.input(socket, data);
});

audio1Server.on('data', function (socket, data) {
    audio1Receiver.input(socket, data);
});

audio2Server.on('data', function (socket, data) {
    audio2Receiver.input(socket, data);
});

var fps = 0;
var lastTime = 0;

videoReceiver.on('data', function(socket, obj) {
    fps++;
    ipCams[socket.remoteAddress].pushVideo(obj.data);
});

audio1Receiver.on('data', function(socket, obj) {
    ipCams[socket.remoteAddress].pushAudio1(obj.data);
});

audio2Receiver.on('data', function(socket, obj) {
    ipCams[socket.remoteAddress].pushAudio2(obj.data);
});

setInterval(function(){
    var now = new Date().getTime();
    if(now - lastTime >= 1000) {
        logger.info("receive fps=%d", fps);
        fps = 0;
        lastTime = now;
    }
}, 1);


module.exports = ws;