var main = function () {
    require([
        "dojo/_base/array",
        "dojo/node!repl",
        "dojo/node!util",
        "dojo/node!socket.io-client"
    ], function (array, repl, util, io) {
        var resourceUrl = (process.argv[2] ? process.argv[2] : "");

        var who = (process.argv[3] ? process.argv[3] : "");

        var socket = io.connect(resourceUrl, { "force new connection": false });

        var appendMessage = function (label, message) {
            console.log("%s: %s", label, message);
        };

        var logMessage = function (data) {
            appendMessage("System", data.message);
        };

        var handleMessage = function () {
            socket.on("connecting", function () {
                appendMessage("System", "connecting");
            });

            socket.on("connect", function () {
                appendMessage("System", "connect");

                socket.on("heartbeat", function (data) {
                    appendMessage("heartbeat", data.when);

                    socket.emit("heartbeat", {
                        who: who,
                        when: new Date().getTime()
                    }, logMessage);
                });

                socket.on("you.are", function (data) {
                    appendMessage("you.are", data.who);
                });

                socket.on("he.is", function (data) {
                    appendMessage("he.is", data.who);
                });

                socket.on("there.are", function (data) {
                    array.forEach(data.who, function (item, index) {
                        appendMessage("there.are", item.id);
                    });
                });

                socket.on("someone.said", function (data) {
                    appendMessage("someone.said", data.what + " by " + data.who);
                });

                socket.on("someone.joined", function (data) {
                    appendMessage("someone.joined", data.who);
                });

                socket.on("someone.beat", function (data) {
                    appendMessage("someone.beat", data.when + " by " + data.who);
                });

                iAm();
            });

            socket.on("connect_failed", function (e) {
                appendMessage("System", (e ? e.type : "connect_failed"));
            });

            socket.on("message", function (message, callback) {
                appendMessage("System", message);
            });

            socket.on("disconnect", function () {
                appendMessage("System", "disconnect");
            });

            socket.on("reconnecting", function () {
                appendMessage("System", "reconnecting");
            });

            socket.on("reconnect", function () {
                appendMessage("System", "reconnect");
            });

            socket.on("reconnect_failed", function (e) {
                appendMessage("System", (e ? e.type : "reconnect_failed"));
            });

            socket.on("error", function (e) {
                appendMessage("System", (e ? e.type : "unknown error"));
            });
        };

        var iAm = function () {
            socket.emit("i.am", {
                who: who,
                when: new Date().getTime()
            }, logMessage);
        };

        var tellOther = function (what) {
            socket.emit("tell.other", {
                who: who,
                what: what,
                when: new Date().getTime()
            }, logMessage);
        };

        var whoAreThere = function () {
            socket.emit("who.are.there", null, logMessage);
        };

        var replContext = repl.start({
            prompt: "",
            ignoreUndefined: true,
            writer: function (data) {
                return "OK";
            }
        }).context;

        replContext.socket = socket;
        replContext.logMessage = logMessage;

        handleMessage();
    });
};