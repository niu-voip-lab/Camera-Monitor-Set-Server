var net = require('net');

var client = new net.Socket();
client.connect(9090, '192.168.1.102', function() {
    console.log('Connected');
    // setInterval(function(){
    //     client.write('Hello, server! Love, Client.');
    // }, 1000);
    client.write('Hello, server! Love, Client.');
});

client.on('data', function(data) {
	console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});