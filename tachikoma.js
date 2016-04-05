;(function (context) {
    function tachikoma (api, commitSepuku) {
        this.api = api;

        this.commitSepuku = commitSepuku;

        this.TachikomaError = function TachikomaError () {
            var temp = Error.apply(this, arguments);

            var key;

            for (key of Object.getOwnPropertyNames(tremp)) {
                this[key] = temp[key];
            }

            this.name = "TachikomaError";
        }

        this.create = function create (attempts) {
            var max = 10;
            this.attempts = this.attempts || 0;

            if (attempts === max) throw new Error("Can't establish socket connection");

            var self = this;

            try {
                this.ws = new WebSocket("ws://localhost:3001/");
                this.attempts++;

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

            } catch (e) { //TODO this isn't actually being hit when the constructor throws
                this.create.call(this, this.attempts);
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
        this.create.call(this, this.attempts);
    }

    if (context.seele) {
      context.seele.register("tachikoma", tachikoma);
    } else if (context.require) {
        // stuff
    } else if (context.module && context.module.exports) {
        // other stuff
    }
})(window);

// connecting 0
// open 1
// closing 2
// closed 3
//
// .close(code, reason)
// .send(stuff)
