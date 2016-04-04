;(function (context) {
    function tachikoma (api, commitSepuku) {
        this.api = api;
        this.commitSepuku = commitSepuku;

        this.ws = new WebSocket("ws://localhost:3000/");

        this.ws.onopen = function (ev) {
            console.info(ev);
            api.write(null, "open");
        }

        this.ws.onclose = function (ev) {
            console.info(ev);
            api.write(ev, "close");
        }

        this.ws.onerror = function (ev) {
            console.error(ev);
            api.write(ev, "error");
        }

        this.ws.onmessage = function (msg) {
            api.write(msg, "message");
        }

        this.api.on("send").run(this.handleSend.bind(this));
    }

    tachikoma.prototype.handleDestroy = function handleDestroy () {
        //this.api.write(null, "destroying");
        this.ws.close();
        this.commitSepuku();
        this.api.write(null, "destroyed");
    }

    tachikoma.prototype.handleSend = function handleSend (msg) {
        this.ws.send(msg);
    }

    tachikoma.prototype.send = function send (msg) {

    }

    if (context.seele) {
      context.seele.register("tachikoma", tachikoma);
    } else if (context.require) {
        // stuff
    } else if (context.module && context.module.exports) {
        // other stuff
    }
})(window);
