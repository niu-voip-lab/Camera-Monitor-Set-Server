var express = require('express');
var router = express.Router();
require('express-ws')(express, {on:function(){}});
var logger = require("../logger");

var videoClients = {};
var audioClients = {};

router.sendVideo = function(name, data) {
    if(videoClients[name]) {
        for(var i = 0; i < videoClients[name].length; i++) {
            var client = videoClients[name][i];
            if(!client) continue;

            if(client.readyState == 3 || client.readyState == 2) {
                delete videoClients[name][i];
            } else {
                client.send(data);
            }
        }
    }
}

router.sendAudio = function(name, data) {
    if(audioClients[name]) {
        for(var i = 0; i < audioClients[name].length; i++) {
            var client = audioClients[name][i];
            if(!client) continue;

            if(client.readyState == 3) {
                delete audioClients[name][i];
            } else {
                client.send(data);
            }
        }
    }
}

router.ws('/video/:id', function (ws, req) {
    logger.info("New video client, request for %s", req.params.id);
    req.params.id = req.params.id.replace(/\s+/gi, "").replace("\t", "");
    if(!videoClients[req.params.id]) {
        videoClients[req.params.id] = [];
    }
    videoClients[req.params.id].push(ws);
});

router.ws('/audio/:id', function (ws, req) {
    logger.info("New audio client, request for %s", req.params.id);
    req.params.id = req.params.id.replace(/\s+/gi, "").replace("\t", "");
    if(!audioClients[req.params.id]) {
        audioClients[req.params.id] = [];
    }
    audioClients[req.params.id].push(ws);
});

module.exports = router;