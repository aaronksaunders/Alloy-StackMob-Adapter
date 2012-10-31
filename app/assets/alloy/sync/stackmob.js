function S4() {
    return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
    var oauth = OAuth({
        consumerKey : Ti.App.Properties.getString('STACKMOB_PUBLIC_KEY') || config.settings.STACKMOB_PUBLIC_KEY,
        consumerSecret : Ti.App.Properties.getString('STACKMOB_PRIVATE_KEY') || config.settings.STACKMOB_PRIVATE_KEY
    });
    this.oauth = oauth;
}

function Sync(model, method, opts) {
    var name = model.config.adapter.name;
    var settings = model.config.settings;
    var data = model.config.data;
    var URL = model.url();

    Ti.API.info("method " + method);
    switch (method) {
        case "login":
            debugger;
            request({
                url : URL,
                action : "user/login",
                method : "GET",
                params : model.attributes,
                success : function(_r) {
                    var pResult = JSON.parse(_r.text);
                    model.id = pResult[settings.STACKMOB_MODEL_NAME + "_id"];
                    opts.success && opts.success(pResult);
                },
                error : function(e) {
                    opts.error && opts.error(e.text);
                }
            });
            break;

        case "create":
            model.attributes[settings.STACKMOB_MODEL_NAME + "_id"] = guid();
            request({
                url : URL,
                action : settings.STACKMOB_MODEL_NAME,
                method : "POST",
                params : model.attributes,
                success : function(_r) {
                    var pResult = JSON.parse(_r.text);
                    model.id = pResult[settings.STACKMOB_MODEL_NAME + "_id"];
                    opts.success && opts.success(pResult);
                },
                error : function(e) {
                    opts.error && opts.error(e.text);
                }
            });
            break;

        case "read":
        debugger;
            model.id = opts.id || model.id, request({
                url : URL,
                action : settings.STACKMOB_MODEL_NAME + (model.id ? "/" + model.id : ""),
                method : "GET",
                params : opts.params,
                success : function(_r) {
                    var pResult = JSON.parse(_r.text);
                    if (model.id) {
                        model.id = pResult[settings.STACKMOB_MODEL_NAME + "_id"];
                        opts.success && opts.success(pResult, _r.text);
                        model.trigger("fetch");
                        return;
                    }
                    var returnArray = [];
                    for (var i in pResult) {
                        pResult[i].id = pResult[i][settings.STACKMOB_MODEL_NAME + "_id"];
                        returnArray.push(pResult[i]);
                    }
                    opts.success && opts.success(returnArray, _r.text);
                    model.trigger("fetch");
                    return;
                },
                error : function(e) {
                    opts.error && opts.error(e.text);
                }
            });
            break;
        case "update":
            break;
        case "delete":
            model.id = opts.id || model.id, request({
                url : URL,
                action : settings.STACKMOB_MODEL_NAME + (model.id ? "/" + model.id : ""),
                method : "DELETE",
                params : model.attributes,
                success : function(_r) {
                    var pResult = JSON.parse(_r.text);
                    model.id = null;
                    opts.success && opts.success(pResult, _r.text);
                },
                error : function(e) {
                    opts.error && opts.error(e.text);
                },
                headers : opts.headers
            });
    }
}

Ti.include("alloy/sync/jsOAuth.js");

var _ = require("alloy/underscore")._, request = function(args) {
    var that = this, headers = {};
    headers = extend(headers, args.headers);
    if (args.method === "PUT" || args.method === "POST")
        headers = extend(headers, {
            "Content-Type" : "application/json"
        });
    var options = {
        method : args.method,
        headers : headers,
        url : args.url + args.action,
        data : args.method === "PUT" || args.method === "POST" ? JSON.stringify(args.params) : args.params,
        success : function(data) {
            var response = JSON.stringify(data);
            args.success !== undefined && args.success(data);
        },
        failure : function(data) {
            var response = JSON.stringify(data);
            Ti.API.error(String.format("fail: %s - %s", args.action, response)), args.error !== undefined && args.error(data);
        }
    };
    that.oauth.request(options);
}, login = function(args) {
    this.request({
        action : (args.className || "user") + "/login",
        method : "GET",
        params : {
            username : args.username,
            password : args.password
        },
        success : args.success,
        error : args.error,
        headers : args.headers
    });
}, getNear = function(args) {
    var p = {
        "location[near]" : args.params.lon + "," + args.params.lat + "," + (args.params.dist_miles ? args.params.dist_miles / 3963 : args.params.dist)
    };
    this.request({
        action : args.className,
        method : "GET",
        params : p,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
}, getWithin = function(args) {
    var d, p = {};
    d = args.params.dist_miles ? args.params.dist_miles / 3963 : args.params.dist, args.params.lon !== null && args.params.lat ? p = {
        "location[near]" : args.params.lon + "," + args.params.lat + "," + d
    } : p = {
        "location[within]" : args.params.bottomLeft.lon + "," + args.params.bottomLeft.lat + "," + args.params.topRight.lon + "," + args.params.topRight.lat + "," + d
    }, this.request({
        action : args.className,
        method : "GET",
        params : p,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
}, update = function(args) {
    this.request({
        action : args.className + "/" + encodeURIComponent(args.objectId),
        method : "PUT",
        params : args.params,
        success : args.success,
        error : args.error,
        headers : args.headers
    });
}, extend = function(obj, extObj) {
    if (arguments.length > 2)
        for (var a = 1; a < arguments.length; a++)
            extend(obj, arguments[a]);
    else
        for (var i in extObj)
        obj[i] = extObj[i];
    return obj;
};

module.exports.sync = Sync, module.exports.beforeModelCreate = function(config) {
    return config = config || {}, config.data = {}, InitAdapter(config), config;
}, module.exports.afterModelCreate = function(Model) {
    return Model = Model || {}, Model.prototype.config.Model = Model, Model;
};
