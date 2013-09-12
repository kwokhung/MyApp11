var main = function () {
    require([
        "dojo/_base/array",
        "dojo/node!repl",
        "dojo/node!util",
        "dojo/node!socket.io-client",
        "dojo/node!edge"
    ], function (array, repl, util, io, edge) {
        var resourceUrl = (process.argv[2] ? process.argv[2] : "");

        var who = (process.argv[3] ? process.argv[3] : "anonymous");

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

                socket.on("you.are.no.more", function (data) {
                    appendMessage("you.are.no.more", data.who);
                });

                socket.on("he.is", function (data) {
                    appendMessage("he.is", data.who);
                });

                socket.on("he.is.no.more", function (data) {
                    appendMessage("he.is.no.more", data.who);
                });

                socket.on("there.are", function (data) {
                    array.forEach(data.who, function (item, index) {
                        appendMessage("there.are", item.who);
                    });
                });

                socket.on("someone.said", function (data) {
                    appendMessage("someone.said", data.what + " by " + data.who);

                    if (typeof data.what.toDo != "undefined" && data.what.toDo != null) {
                        whatToDo(data);
                    }
                });

                socket.on("someone.joined", function (data) {
                    appendMessage("someone.joined", data.who);
                });

                socket.on("someone.left", function (data) {
                    appendMessage("someone.left", data.who);
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

        var iAm = function (data) {
            if (typeof data != "undefined" && typeof data.who != "undefined" && data.who != null && data.who != "") {
                if (socket != null) {
                    socket.emit("i.am", {
                        who: data.who,
                        when: new Date().getTime()
                    }, logMessage);
                }

                who = data.who;
            }
            else {
                if (socket != null) {
                    socket.emit("i.am", {
                        who: who,
                        when: new Date().getTime()
                    }, logMessage);
                }
            }
        };

        var iAmNoMore = function (data) {
            if (typeof data != "undefined" && typeof data.who != "undefined" && data.who != null && data.who != "") {
                if (socket != null) {
                    socket.emit("i.am.no.more", {
                        who: data.who,
                        when: new Date().getTime()
                    }, logMessage);
                }
            }
            else {
                if (socket != null) {
                    socket.emit("i.am.no.more", {
                        who: who,
                        when: new Date().getTime()
                    }, logMessage);
                }
            }

            who = "anonymous";
        };

        var tellOther = function (data) {
            if (socket != null) {
                socket.emit("tell.other", {
                    who: who,
                    what: data.what,
                    when: new Date().getTime()
                }, logMessage);
            }
        };

        var tellSomeone = function (data) {
            if (socket != null) {
                socket.emit("tell.someone", {
                    who: who,
                    whom: data.whom,
                    what: data.what,
                    when: new Date().getTime()
                }, logMessage);
            }
        };

        var whoAreThere = function () {
            if (socket != null) {
                socket.emit("who.are.there", null, logMessage);
            }
        };

        var whatToDo = function (data) {
            switch (data.what.toDo) {
                case "updateYourDetails":
                    edge.func("cs", {
                        source: "C:\\Projects\\MyApp11\\cs\\GetMyDetails.cs",
                        references: ["System.Management.dll"]
                    })({
                        data: {
                            who: who
                        }
                    }, function (error, result) {
                        if (error) {
                            appendMessage("edge", util.inspect(error, { showHidden: false, depth: 2 }));
                        }
                        else {
                            appendMessage("edge", util.inspect(result, { showHidden: false, depth: 5 }));

                            tellSomeone({
                                whom: data.who,
                                what: {
                                    toDo: "updateHisDetails",
                                    details: result.data
                                }
                            });
                        }
                    });

                    break;
            }
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
        replContext.iAm = iAm;
        replContext.iAmNoMore = iAmNoMore;
        replContext.tellOther = tellOther;
        replContext.tellSomeone = tellSomeone;
        replContext.whoAreThere = whoAreThere;

        handleMessage();
    });
};