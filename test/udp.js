var UdpServer = require("../libs/udpServer");
var TcpClient = require("../libs/tcp").TcpClient;
var logger = require("../logger");

var TARGET_TAG = "IP_CAM_PORT";

var processing = false;
var currentStage = 0;

var server = new UdpServer(55123);
server.on('message', function(msg, remote) {
    if(processing) return;

    var sp = msg.split(":");
    if(sp.length < 2) {
        logger.info("from: %s:%d : Invalid broadcast format.", remote.address, remote.port);
        return;
    }
    var tag = sp[0];
    var port = parseInt(sp[1]);

    if(tag != TARGET_TAG) {
        logger.info("from: %s:%d : Invalid broadcast format (tag error).", remote.address, remote.port);
        return;
    }

    if(isNaN(port)) {
        logger.info("from: %s:%d : Invalid broadcast format (port error).", remote.address, remote.port);
        return;
    }
    
    processing = true;

    var client  = new TcpClient(remote.address, port);

    client.on('connection', function() {
        logger.info("IP Cam %s connected.", remote.address);
    });

    client.on('data', function(data) {
        data = data +"";
        if(currentStage == 0 && data.indexOf("HELLO") >= 0) {
            client.send("INFO");
            currentStage++;
        } else if(currentStage == 1 && data.indexOf("INFO") >= 0) {
            console.log(data+"");
            currentStage++;
            client.send("V_URL:192.168.1.100:8877");
        } else if(currentStage == 2 && data.indexOf("OK") >= 0) {
            logger.info("Video url set.");
            currentStage++;
            client.send("A_URL_1:192.168.1.100:8888");
        } else if(currentStage == 3 && data.indexOf("OK") >= 0) {
            logger.info("Audio url 1 set.");
            currentStage++;
            client.send("A_URL_2:192.168.1.100:8899");
        } else if(currentStage == 4 && data.indexOf("OK") >= 0) {
            logger.info("Audio url 2 set.");
            currentStage++;
            client.send("DONE");
        } else if(currentStage == 5 && data.indexOf("OK") >= 0) {
            currentStage++;
            logger.info("IP Cam %s setting finish.", remote.address);
            client.close();
            processing = false;
            currentStage = 0;
        } else {
            logger.error(data, remote.address);
            logger.info("IP Cam %s stage error.", remote.address);
        }
    });

    client.on('error', function(err) {
        console.log(err);
    });

    client.on('close', function(data) {
        logger.info("IP Cam %s closed.", remote.address);
    });

    client.connect();
});

server.start();