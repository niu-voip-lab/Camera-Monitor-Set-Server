var ws = require('./ws');
var logger = require('../logger')

var TcpServer = require("../libs/tcp").TcpServer;
var StreamReceiver = require("../libs/receiver").StreamReceiver;
var IpCam = require("../libs/ipCam");

// Waiting for broadcast.
var udpServer = require('../modules/udpServer');
udpServer.start();

require('../modules/cameraController')(ws);


// var ipCams = {};
// var videoServer = new TcpServer('', 8877);
// var audio1Server = new TcpServer('', 8888);
// var audio2Server = new TcpServer('', 8899);
// var controlServer = new TcpServer('', 8800);

// function addCamera(socket) {
//     var id = socket.remoteAddress.replace("::ffff:", "");
//     if(ipCams[id]) return;
//     logger.info('Camera "%s" created', id);
//     var ipcam = new IpCam(id, {
//         fps: 30,
//         resolution: '1920x1080',
//         frequency: 44100,
//         channel: 2,
//         volume: 20,
//         debug: false,
//     });
    
//     ipcam.on('videoData', function(name, data) {
//         ws.sendVideo(name, data);
//     });

//     ipcam.on('audio1Data', function(name, data) {
//         ws.sendAudio(name, data);
//     });

//     ipcam.on('audio2Data', function(name, data) {
//         // ws.sendAudio(name, data);
//     });

//     ipCams[socket.remoteAddress] = ipcam;
// }

// videoServer.on('connection', function(socket) {
//     addCamera(socket);
// });

// audio1Server.on('connection', function(socket) {
//     addCamera(socket);
// });

// audio2Server.on('connection', function(socket) {
//     addCamera(socket);
// });

// controlServer.on('connection', function(socket) {
//     addCamera(socket);
// });

// controlServer.on('data', function (socket, data) {
//     console.log(data+"");
// });

module.exports = ws;