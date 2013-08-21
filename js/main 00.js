var main = function () {
    require([
        "dojo/_base/array",
        "dojo/node!repl",
        "dojo/node!util",
        "dojo/node!socket.io-client"
    ], function (array, repl, util, io) {
        var who = (process.argv[2] ? process.argv[2] : "");

        //var socket = io.connect("http://172.21.72.71:9081", { "force new connection": false });
        //var socket = io.connect("http://localhost:9081", { "force new connection": false });
        var socket = io.connect("http://localhost:3000", { "force new connection": false });
        //var socket = io.connect("http://test10atmblinus.azurewebsites.net", { "force new connection": false });

        var message = function (from, msg) {
            console.log("%s: %s", from, msg);
        };

        var logMessage = function (data) {
            console.log(data.message);
        };

        var iAmResourceMonitor = function () {
            socket.emit("i.am", { who: who }, logMessage);
        };

        var tellOther = function (what) {
            socket.emit("tell.other", { who: who, what: what }, logMessage);
        };

        var whoAreThere = function () {
            socket.emit("who.are.there", null, logMessage);
        };

        /*var checkNickname = function (nickname, nicknameExists) {
            if (nicknameExists) {
                console.log("Nickname (%s) exists", nickname);
            }
            else {
                console.log("Nickname (%s) does not exist", nickname);
            }
        };*/

        var replContext = repl.start({
            //prompt: ">> ",
            prompt: "",
            /*eval: function (cmd, context, filename, callback) {
                callback(null, eval(cmd));
            },*/
            ignoreUndefined: true,
            /*writer: function (data) {
                console.log(util.inspect(data, { showHidden: false, depth: 2 }));
                return undefined;
            }*/
            //writer: util.inspect
            writer: function (data) {
                return "OK";
            }
        }).context;

        replContext.socket = socket;
        replContext.logMessage = logMessage;
        //replContext.checkNickname = checkNickname;

        socket.on("connecting", function () {
            message("System", "connecting");
        });

        socket.on("connect", function () {
            message("System", "connect");

            socket.on("heartbeat", function (data) {
                message("heartbeat", data.time);
            });

            socket.on("you.are", function (data) {
                message("you.are", data.who);
            });

            socket.on("he.is", function (data) {
                message("he.is", data.who);
            });

            socket.on("they.are", function (data) {
                array.forEach(data.who, function (item, index) {
                    message("they.are", item.id);
                });
            });

            socket.on("someone.said", function (data) {
                message("someone.said", data.what + " by " + data.who);
            });

            iAmResourceMonitor();
            /*socket.on("announcement", function (msg) {
                message("announcement", msg);
            });

            socket.on("nicknames", function (nicknames) {
                message("nicknames", JSON.stringify(nicknames));
            });

            socket.on("user message", message);*/
        });

        socket.on("connect_failed", function (e) {
            message("System", (e ? e.type : "connect_failed"));
        });

        socket.on("message", function (message, callback) {
            message("System", message);
        });

        socket.on("disconnect", function () {
            message("System", "disconnect");
        });

        socket.on("reconnecting", function () {
            message("System", "reconnecting");
        });

        socket.on("reconnect", function () {
            message("System", "reconnect");
        });

        socket.on("reconnect_failed", function (e) {
            message("System", (e ? e.type : "reconnect_failed"));
        });

        socket.on("error", function (e) {
            message("System", (e ? e.type : "unknown error"));
        });
    });
};