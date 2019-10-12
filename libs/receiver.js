function extractParameter(data) {
    var startChar = Buffer.from("-3\n-3\n");
    var startFlag = data.indexOf(startChar);

    var para = {};

    while (startFlag != -1) {
        var idBuf = data.slice(0, startFlag);
        var id = idBuf.toString();
        var arr = id.split(":");
        para[arr[0]] = arr[1];
        data = data.slice(startFlag+startChar.length, data.length);
        startFlag = data.indexOf(startChar);
    }
    
    return {
        para: para,
        data: data,
    };
}

function StreamReceiver() {
    var buffer = null;
    var funcMap = {};

    function trigger(name, socket, data) {
        if(funcMap[name]) {
            funcMap[name](socket, data);
        }
    }

    function onData(socket, data) {
        trigger('data', socket, extractParameter(data));
    }

    var startChar = Buffer.from("-2\n-2\n");
    var endChar = Buffer.from("-1\n-1\n");

    this.input = function (socket, data) {
        if(buffer == null) {
            buffer = data;
        } else {
            buffer = Buffer.concat([buffer, data]);
        }

        var startFlag = buffer.indexOf(startChar);
        var endFlag = buffer.indexOf(endChar);

        if(startFlag != -1 && endFlag != -1) {
            onData(socket, buffer.slice(startFlag+startChar.length, endFlag));
            buffer = buffer.slice(endFlag+endChar.length, buffer.length);
        }
    }

    this.on = function(name, func) {
        funcMap[name] = func;
    }
}

function ControlReceiver() {
    var buffer = "";

    var funcMap = {};
    this.on = function(name, func) {
        funcMap[name] = func;
    }

    function trigger(name, ...param) {
        if(funcMap[name]) {
            funcMap[name](...param);
        }
    }

    this.input = function(data) {
        buffer += data+"";
        while(buffer.indexOf(";") >= 0) {
            var idx = buffer.indexOf(";");
            var cmd = buffer.substring(0, idx+1);
            buffer = buffer.substring(idx+1);
            trigger('data', cmd);
        }
    }

}

module.exports = {
    StreamReceiver: StreamReceiver,
    ControlReceiver: ControlReceiver,
};