var express = require('express');
var router = express.Router();
require('express-ws')(express, { on: function () { } });
var logger = require("../logger");
var WebSocket = require("ws");

var videoClients = {};
var audioClients = {};
var controlClients = {};

var audio1Clients = {};
var audio2Clients = {};

var funcMap = {};
router.on = function(name, func) {
    funcMap[name] = func;
}

function trigger(name, ...param) {
    if(funcMap[name]) {
        funcMap[name](...param);
    }
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

router.sendVideo = function (name, data) {
    if (videoClients[name]) {
        for (var i = 0; i < videoClients[name].length; i++) {
            var client = videoClients[name][i];
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            } else {
                videoClients[name].remove(i);
                logger.info("Video Client closed");
            }
        }
    }
}

router.sendAudio = function (name, data) {
    if (audioClients[name]) {
        for (var i = 0; i < audioClients[name].length; i++) {
            var client = audioClients[name][i];
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            } else {
                audioClients[name].remove(i);
                logger.info("Audio Client closed");
            }
        }
    }
}

router.sendControl = function (name, data) {
    if (controlClients[name]) {
        for (var i = 0; i < controlClients[name].length; i++) {
            var client = controlClients[name][i];
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            } else {
                controlClients[name].remove(i);
                logger.info("Control Client closed");
            }
        }
    }
}

router.sendAudio1 = function (name, data) {
    if (audio1Clients[name]) {
        for (var i = 0; i < audio1Clients[name].length; i++) {
            var client = audio1Clients[name][i];
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            } else {
                audio1Clients[name].remove(i);
                logger.info("Audio Client closed");
            }
        }
    }
}

router.sendAudio2 = function (name, data) {
    if (audio2Clients[name]) {
        for (var i = 0; i < audio2Clients[name].length; i++) {
            var client = audio2Clients[name][i];
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            } else {
                audio2Clients[name].remove(i);
                logger.info("Audio Client closed");
            }
        }
    }
}

router.ws('/video/:id', function (ws, req) {
    req.params.id = req.params.id.replace(/\s+/gi, "");
    logger.info("New video client, request for \"%s\"", req.params.id);
    if (!videoClients[req.params.id]) {
        videoClients[req.params.id] = [];
    }
    videoClients[req.params.id].push(ws);
});

router.ws('/audio/:id', function (ws, req) {
    req.params.id = req.params.id.replace(/\s+/gi, "");
    logger.info("New audio client, request for \"%s\"", req.params.id);
    if (!audioClients[req.params.id]) {
        audioClients[req.params.id] = [];
    }
    audioClients[req.params.id].push(ws);
});

router.ws('/control/:id', function (ws, req) {
    req.params.id = req.params.id.replace(/\s+/gi, "");
    logger.info("New control client, request for \"%s\"", req.params.id);
    if (!controlClients[req.params.id]) {
        controlClients[req.params.id] = [];
    }
    controlClients[req.params.id].push(ws);

    ws.on('message', function(data) {
        trigger('message', req.params.id, data);
    });
});

router.ws('/audio1/:id', function (ws, req) {
    req.params.id = req.params.id.replace(/\s+/gi, "");
    logger.info("New audio1 client, request for \"%s\"", req.params.id);
    if (!audio1Clients[req.params.id]) {
        audio1Clients[req.params.id] = [];
    }
    audio1Clients[req.params.id].push(ws);
});

router.ws('/audio2/:id', function (ws, req) {
    req.params.id = req.params.id.replace(/\s+/gi, "");
    logger.info("New audio2 client, request for \"%s\"", req.params.id);
    if (!audio2Clients[req.params.id]) {
        audio2Clients[req.params.id] = [];
    }
    audio2Clients[req.params.id].push(ws);
});

module.exports = router;