var net = require('net');
var logger = require('../logger')

function TcpServer(ip, port) {
    var server = net.createServer();

    var event = {};
    this.on = function(name, func){
        event[name] = func;
    }

    this.close = function() {
        server.close();
    }

    // 監聽 listening 事件
    server.on('listening', function () {
        logger.info('Server is listening on port %s', port);

        // 如需 IP 位址等資訊，可藉由以下方式來取得
        var addr = server.address();
        logger.info('%j', addr); // {"address":"127.0.0.1","family":"IPv4","port":8877}
    });

    // 監聽 connection 事件
    server.on('connection', function (socket) {
        logger.info('Server has a new connection');
        logger.info('from : ' + socket.remoteAddress + ":" + socket.remotePort);

        if(event['connection'])
            event['connection'](socket);

        socket.on('data', function (data) {
            if(event['data'])
                event['data'](socket, data);
            // console.log(data);
        });
    });

    // 監聽 close 事件
    server.on('close', function () {
        logger.info('Server is now closed');
    });

    // 監聽指定的 Port
    server.listen(port, ip); // 會觸發 listening 方法

}

function TcpClient(host, port) {
    var client = new net.Socket();

    var funcMap = {};
    this.on = function(name, func) {
        funcMap[name] = func;
    }

    function trigger(name, ...para) {
        if(funcMap[name]) {
            funcMap[name](...para);
        }
    }

    client.on('data', function(data) {
        trigger('data', data);
    });
    
    client.on('error', function(error) {
        trigger('error', error);
    });

    client.on('close', function() {
        trigger('close');
    });

    this.close = function() {
        client.end();
    }

    this.connect = function() {
        client.connect(port, host, function() {
            trigger('connection');
        });
    }

    this.send = function(message) {
        client.write(message);
    }
}

module.exports.TcpServer = TcpServer;
module.exports.TcpClient = TcpClient;