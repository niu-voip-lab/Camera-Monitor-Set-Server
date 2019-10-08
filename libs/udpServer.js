var dgram = require('dgram'); 
var logger = require('../logger');

function UdpServer(port, host) {
    host = host || '';
    logger.info('Now create UDP Server...');
    var server = dgram.createSocket('udp4');

    var funcMap = {};
    this.on = function(name, func) {
        funcMap[name] = func;
    }

    function trigger(name, ...para) {
        if(funcMap[name]) {
            funcMap[name](...para);
        }
    }

    server.on('listening', function () {
        var address = server.address(); // 取得伺服器的位址和port
        logger.info('UDP Server listening on ' + address.address + ':' + address.port);
        trigger('listening');
    });

    server.on('message', function (message, remote) {
        var msg = "";
        for (var i = 0; i < message.length; i++) {
            msg += String.fromCharCode(message[i]);
        }
        trigger('message', msg, remote);
    });

    server.on('error', function (err) {
        logger.error('UDP Server error:\n' + err.stack);
        server.close();
        trigger('error', err);
    });

    server.on('close', function (err) {
        logger.info('UDP Server closed');
        trigger('close', err);
    });

    this.start = function() {
        server.bind(port, host);
    }    

    this.close = function() {
        server.close();
    }
}

module.exports = UdpServer;