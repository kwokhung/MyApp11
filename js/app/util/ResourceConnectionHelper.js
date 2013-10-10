define([
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (declare, lang) {
    return declare("app.util.ResourceConnectionHelper", null, {
        resourceMonitor: null,
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
        },
        onMessage: function () {
            if (this.resourceMonitor.socket == null) {
                return;
            }

            this.resourceMonitor.socket.on("connecting", lang.hitch(this, function () {
                this.resourceMonitor.appendMessage({ who: "System", what: "connecting" });
            }));

            this.resourceMonitor.socket.on("connect", lang.hitch(this, function () {
                this.resourceMonitor.appendMessage({ who: "System", what: "connect" });

                this.resourceMonitor.resourceInboundHelper.onMessage();

                this.resourceMonitor.iAmNoMore({
                    whoAmI: (process.argv[3] ? process.argv[3] : who)
                });

                this.resourceMonitor.iAm({
                    whoAmI: (process.argv[3] ? process.argv[3] : who)
                });
            }));

            this.resourceMonitor.socket.on("connect_failed", lang.hitch(this, function (e) {
                this.resourceMonitor.appendMessage({ who: "System", what: (e ? e.type : "connect_failed") });
            }));

            this.resourceMonitor.socket.on("message", lang.hitch(this, function (message, callback) {
                this.resourceMonitor.appendMessage({ who: "System", what: message });
            }));

            this.resourceMonitor.socket.on("disconnect", lang.hitch(this, function () {
                this.resourceMonitor.appendMessage({ who: "System", what: "disconnect" });
            }));

            this.resourceMonitor.socket.on("reconnecting", lang.hitch(this, function () {
                this.resourceMonitor.appendMessage({ who: "System", what: "reconnecting" });
            }));

            this.resourceMonitor.socket.on("reconnect", lang.hitch(this, function () {
                this.resourceMonitor.appendMessage({ who: "System", what: "reconnect" });
            }));

            this.resourceMonitor.socket.on("reconnect_failed", lang.hitch(this, function (e) {
                this.resourceMonitor.appendMessage({ who: "System", what: (e ? e.type : "reconnect_failed") });
            }));

            this.resourceMonitor.socket.on("error", lang.hitch(this, function (e) {
                this.resourceMonitor.appendMessage({ who: "System", what: (e ? e.type : "unknown error") });
            }));
        }
    });
});
