define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/node!util",
    "dojo/node!edge"
], function (declare, lang, array, util, edge) {
    return declare("app.util.ResourceTodoHelper", null, {
        resourceMonitor: null,
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
        },
        whatToDo: function (data) {
            switch (data.what.toDo) {
                case "updateYourDetails":
                    edge.func("cs", {
                        source: "C:\\Projects\\MyApp11\\cs\\GetMyDetails.cs",
                        references: ["System.Management.dll"]
                    })({
                        data: {
                            who: this.resourceMonitor.who
                        }
                    }, lang.hitch(this, function (error, result) {
                        if (error) {
                            this.resourceMonitor.appendMessage({ who: "edge", what: util.inspect(error, { showHidden: false, depth: 2 }) });
                        }
                        else {
                            this.resourceMonitor.appendMessage({ who: "edge", what: util.inspect(result, { showHidden: false, depth: 5 }) });

                            this.resourceMonitor.tellSomeone({
                                whom: data.who,
                                what: {
                                    toDo: "updateHisDetails",
                                    details: result.data
                                }
                            });
                        }
                    }));

                    break;
            }
        }
    });
});
