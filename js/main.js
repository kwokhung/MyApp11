Date.prototype.yyyyMMddHHmmss = function () {
    var date = this;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();

    return "" + year +
    (month < 10 ? "0" + month : month) +
    (day < 10 ? "0" + day : day) +
    (hh < 10 ? "0" + hh : hh) +
    (mm < 10 ? "0" + mm : mm) +
    (ss < 10 ? "0" + ss : ss);
};

Date.prototype.dateFormat = function () {
    var date = this;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();

    return "" + year + "-" +
    (month < 10 ? "0" + month : month) + "-" +
    (day < 10 ? "0" + day : day) + " " +
    (hh < 10 ? "0" + hh : hh) + ":" +
    (mm < 10 ? "0" + mm : mm) + ":" +
    (ss < 10 ? "0" + ss : ss);
};

String.prototype.dateFormat = function () {
    var that = this.toString();

    var date = new Date(that.substring(0, 4), that.substring(4, 6) - 1, that.substring(6, 8), that.substring(8, 10), that.substring(10, 12), that.substring(12));
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();

    return "" + year + "-" +
    (month < 10 ? "0" + month : month) + "-" +
    (day < 10 ? "0" + day : day) + " " +
    (hh < 10 ? "0" + hh : hh) + ":" +
    (mm < 10 ? "0" + mm : mm) + ":" +
    (ss < 10 ? "0" + ss : ss);
};

Number.prototype.dateFormat = function () {
    var date = new Date(this);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();

    return "" + year + "-" +
    (month < 10 ? "0" + month : month) + "-" +
    (day < 10 ? "0" + day : day) + " " +
    (hh < 10 ? "0" + hh : hh) + ":" +
    (mm < 10 ? "0" + mm : mm) + ":" +
    (ss < 10 ? "0" + ss : ss);
};

var main = function () {
    require([
        "dojo/_base/array",
        "dojo/node!repl",
        "dojo/node!util",
        "dojo/node!socket.io-client",
        "dojo/node!edge"
    ], function (array, repl, util, io, edge) {
        var resourceUrl = (process.argv[2] ? process.argv[2] : "");

        var who = "anonymous";

        var socket = io.connect(resourceUrl, { "force new connection": false });

        var appendMessage = function (label, message) {
            console.log("%s: %s", label, message);
        };

        var logMessage = function (result) {
            if (result.status) {
                appendMessage("System (Succeeded)", result.message);
            }
            else {
                appendMessage("System (Failed)", result.message);
            }
        };

        var handleMessage = function () {
            socket.on("connecting", function () {
                appendMessage("System", "connecting");
            });

            socket.on("connect", function () {
                appendMessage("System", "connect");

                handleConnectMessage();

                iAmNoMore({
                    whoAmI: (process.argv[3] ? process.argv[3] : who)
                });

                iAm({
                    whoAmI: (process.argv[3] ? process.argv[3] : who)
                });
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

        var handleConnectMessage = function () {
            socket.on("heartbeat", function (data) {
                appendMessage("heartbeat", data.when);

                heartbeat();
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
        };

        var iAm = function (data) {
            if (typeof data != "undefined" && typeof data.whoAmI != "undefined" && data.whoAmI != null && data.whoAmI != "") {
                if (socket != null) {
                    socket.emit("resource:i.am", {
                        who: who,
                        whoAmI: data.whoAmI,
                        when: new Date().yyyyMMddHHmmss()
                    }, function (result) {
                        if (result.status) {
                            logMessage(result);

                            who = data.whoAmI;
                        }
                        else {
                            logMessage(result);
                        }
                    });
                }
            }
            else {
                if (socket != null) {
                    socket.emit("resource:i.am", {
                        who: who,
                        whoAmI: who,
                        when: new Date().yyyyMMddHHmmss()
                    }, logMessage);
                }
            }
        };

        var iAmNoMore = function (data) {
            if (typeof data != "undefined" && typeof data.whoAmI != "undefined" && data.whoAmI != null && data.whoAmI != "") {
                if (socket != null) {
                    socket.emit("resource:i.am.no.more", {
                        who: who,
                        whoAmI: data.whoAmI,
                        when: new Date().yyyyMMddHHmmss()
                    }, function (result) {
                        if (result.status) {
                            logMessage(result);

                            who = "anonymous";
                        }
                        else {
                            logMessage(result);
                        }
                    });
                }
            }
            else {
                if (socket != null) {
                    socket.emit("resource:i.am.no.more", {
                        who: who,
                        whoAmI: who,
                        when: new Date().yyyyMMddHHmmss()
                    }, function (result) {
                        if (result.status) {
                            logMessage(result);

                            who = "anonymous";
                        }
                        else {
                            logMessage(result);
                        }
                    });
                }
            }
        };

        var heartbeat = function () {
            if (socket != null) {
                socket.emit("resource:heartbeat", {
                    who: who,
                    when: new Date().yyyyMMddHHmmss()
                }, logMessage);
            }
        };

        var tellOther = function (data) {
            if (socket != null) {
                socket.emit("resource:tell.other", {
                    who: who,
                    what: data.what,
                    when: new Date().yyyyMMddHHmmss()
                }, logMessage);
            }
        };

        var tellSomeone = function (data) {
            if (socket != null) {
                socket.emit("resource:tell.someone", {
                    who: who,
                    whom: data.whom,
                    what: data.what,
                    when: new Date().yyyyMMddHHmmss()
                }, logMessage);
            }
        };

        var whoAreThere = function () {
            if (socket != null) {
                socket.emit("resource:who.are.there", {
                    who: who,
                    when: new Date().yyyyMMddHHmmss()
                }, logMessage);
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
        replContext.heartbeat = heartbeat;
        replContext.tellOther = tellOther;
        replContext.tellSomeone = tellSomeone;
        replContext.whoAreThere = whoAreThere;

        handleMessage();
    });
};