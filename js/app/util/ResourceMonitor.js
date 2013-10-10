define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/node!repl",
    "dojo/node!socket.io-client",
    "app/util/ResourceConnectionHelper",
    "app/util/ResourceInboundHelper",
    "app/util/ResourceTodoHelper",
    "app/util/ResourceOutboundHelper"
], function (declare, lang, repl, io, ResourceConnectionHelper, ResourceInboundHelper, ResourceTodoHelper, ResourceOutboundHelper) {
    return declare("app.util.ResourceMonitor", null, {
        resourceUrl: null,
        who: "anonymous",
        socket: null,
        resourceConnectionHelper: null,
        resourceInboundHelper: null,
        resourceTodoHelper: null,
        resourceOutboundHelper: null,
        replContext: null,
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
        },
        appendMessage: function (data) {
            console.log("%s: %s", data.who, data.what);
        },
        logMessage: function (result) {
            if (result.status) {
                this.appendMessage({ who: "System (Succeeded)", what: result.message });
            }
            else {
                this.appendMessage({ who: "System (Failed)", what: result.message });
            }
        },
        parseUrl: function (url) {
            var urlRegExp = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$", "i");
            var urlArray = urlRegExp.exec(url);

            if (urlArray[4] != null) {
                var authorityRegExp = new RegExp("^(([^@]+)@)?([^:]*)(:(.*))?$", "i");
                var authorityArray = authorityRegExp.exec(urlArray[4]);
            }

            var parseUrl = {
                "schemeName": urlArray[2],
                "userInfo": (urlArray[4] == null ? null : authorityArray[2]),
                "hostName": (urlArray[4] == null ? null : authorityArray[3]),
                "port": (urlArray[4] == null ? null : authorityArray[5]),
                "path": urlArray[5],
                "query": urlArray[7],
                "fragment": urlArray[9]
            };

            return parseUrl;
        },
        setResourceUrl: function (data) {
            this.resourceUrl = data.url;
            var parsedUrl = this.parseUrl(this.resourceUrl);
            this.socket = io.connect(parsedUrl.schemeName + "://" + parsedUrl.hostName + ":" + (typeof parsedUrl.port == "undefined" ? "80" : parsedUrl.port), { "force new connection": false });
            this.replContext.socket = this.socket;

            this.resourceConnectionHelper.onMessage();
        },
        iAm: function (data) {
            this.resourceOutboundHelper.handleIAm(data);
        },
        iAmNoMore: function (data) {
            this.resourceOutboundHelper.handleIAmNoMore(data);
        },
        heartbeat: function () {
            this.resourceOutboundHelper.handleHeartbeat();
        },
        tellOther: function (data) {
            this.resourceOutboundHelper.handleTellOther(data);
        },
        tellSomeone: function (data) {
            this.resourceOutboundHelper.handleTellSomeone(data);
        },
        whoAreThere: function () {
            this.resourceOutboundHelper.handleWhoAreThere();
        },
        postCreate: function () {
            this.inherited(arguments);

            this.resourceConnectionHelper = new ResourceConnectionHelper({
                resourceMonitor: this
            });

            this.resourceInboundHelper = new ResourceInboundHelper({
                resourceMonitor: this
            });

            this.resourceTodoHelper = new ResourceTodoHelper({
                resourceMonitor: this
            });

            this.resourceOutboundHelper = new ResourceOutboundHelper({
                resourceMonitor: this
            });

            this.replContext = repl.start({
                prompt: "",
                ignoreUndefined: true,
                writer: function (data) {
                    return "OK";
                }
            }).context;

            this.replContext.logMessage = lang.hitch(this, this.logMessage);

            this.replContext.iAm = lang.hitch(this, this.iAm);
            this.replContext.iAmNoMore = lang.hitch(this, this.iAmNoMore);
            this.replContext.heartbeat = lang.hitch(this, this.heartbeat);
            this.replContext.tellOther = lang.hitch(this, this.tellOther);
            this.replContext.tellSomeone = lang.hitch(this, this.tellSomeone);
            this.replContext.whoAreThere = lang.hitch(this, this.whoAreThere);
        },
        destroy: function () {
            this.inherited(arguments);

            if (this.who != "anonymous") {
                this.iAmNoMore({
                    whoAmI: this.who
                });
            }
        }
    });
});
