;(function (context) {
    function tachikoma (api, commitSepuku) {
        this.api = api;
        this.commitSepuku = commitSepuku;

        this.create = function create (attempts) {
            var max = 10;
            var attempts = attempts || 0;

            if (attempts === max) throw new Error("Can't establish socket connection");

            try {
                this.ws = new WebSocket("ws://localhost:3000/");

                this.ws.onopen = function (ev) {
                    console.info(ev);
                    api.write(null, "open");
                }

                this.ws.onclose = function (ev, arg) {
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

            } catch (err) {
                attempts++;
                this.create.call(this, attempts);
            }
        }

        this.create.call(this);

        this.api.on("send").run(this.handleSend.bind(this));
        this.api.on("reopen").run(this.handleReopen.bind(this));
    }


    tachikoma.prototype.handleDestroy = function handleDestroy () {
        //this.api.write(null, "destroying");
        this.ws.close();
        this.commitSepuku();
        this.api.write(null, "destroyed");
    }

    tachikoma.prototype.handleSend = function handleSend (msg) {
        if (this.ws.readyState === 2 || this.ws.readyState === 3)
            this.api.write(null, "reopen");
        this.ws.send(msg);
    }

    tachikoma.prototype.send = function send (msg) {

    }

    tachikoma.prototype.handleReopen = function handleReopen () {
        this.create.call(this);
    }

    if (context.seele) {
      context.seele.register("tachikoma", tachikoma);
    } else if (context.require) {
        // stuff
    } else if (context.module && context.module.exports) {
        // other stuff
    }
})(window);
