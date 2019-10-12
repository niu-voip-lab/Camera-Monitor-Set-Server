var ws = require('./ws');
var logger = require('../logger')

// Waiting for broadcast.
var udpServer = require('../modules/udpServer');
udpServer.start();

var controller = require('../modules/cameraController')(ws);

controller.on('cameraReady', function(name, cam) {
    cam.on('angleChanged', function(vAngle, hAngle) {
        ws.sendControl(name, JSON.stringify({
            vAngle: vAngle,
            hAngle: hAngle
        }));
    });
});

ws.on('message', function (id, msg) {
    var cam = controller.getIpCam(id);
    if(cam == null) return;

    var json = null;
    try {
        json = JSON.parse(msg);
    } catch(e) {
        logger.error('ws client control format error.');
        logger.error(e);
        return;
    }

    if(json.vAngle != null && json.vAngle != undefined && typeof(json.vAngle) == 'number') {
        cam.setVAngle(json.vAngle);
    }

    if(json.hAngle != null && json.hAngle != undefined && typeof(json.hAngle) == 'number') {
        cam.setHAngle(json.hAngle);
    }
});

module.exports = ws;