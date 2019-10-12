function WsClient(url, msg = true) {
    function log(str) {
        if (msg) console.log(`[${url}] ${str}`);
    }

    var event = document.createElement('div');
    this.on = function (name, func) {
        event.addEventListener(name, function (e) { func(e.detail); });
    }

    event.trigger = function (name, obj) {
        var e = new CustomEvent(name, {
            detail: obj
        });
        event.dispatchEvent(e);
    }

    websocket = new WebSocket(url);
    websocket.onopen = function (evt) {
        log("Connected");
        event.trigger('open', evt);
    };
    websocket.onclose = function (evt) {
        log("Colsed");
        event.trigger('close', evt);
    };
    websocket.onmessage = function (evt) {
        event.trigger('message', evt);
    };
    websocket.onerror = function (evt) {
        event.trigger('error', evt);
    };

    this.send = function (msg) {
        log('message sent!');
        websocket.send(msg);
    }
}