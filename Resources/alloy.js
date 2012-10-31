function isTabletFallback() {
    return !(Math.min(Ti.Platform.displayCaps.platformHeight, Ti.Platform.displayCaps.platformWidth) < 700);
}

var _ = require("alloy/underscore")._, Backbone = require("alloy/backbone"), STR = require("alloy/string");

exports._ = _;

exports.Backbone = Backbone;

exports.M = function(name, modelDesc, migrations) {
    var config = modelDesc.config, type = (config.adapter ? config.adapter.type : null) || "localDefault";
    Ti.Platform.osname === "mobileweb" && type === "localDefault" ? type = "localStorage" : type === "localDefault" && (type = "sql");
    var adapter = require("alloy/sync/" + type), extendObj = {
        defaults: config.defaults,
        sync: function(method, model, opts) {
            var config = model.config || {}, type = (config.adapter ? config.adapter.type : null) || "localDefault";
            Ti.Platform.osname === "mobileweb" && type === "localDefault" ? type = "localStorage" : type === "localDefault" && (type = "sql");
            require("alloy/sync/" + type).sync(model, method, opts);
        }
    }, extendClass = {};
    migrations && (extendClass.migrations = migrations);
    _.isFunction(adapter.beforeModelCreate) && (config = adapter.beforeModelCreate(config) || config);
    var Model = Backbone.Model.extend(extendObj, extendClass);
    Model.prototype.config = config;
    _.isFunction(adapter.afterModelCreate) && adapter.afterModelCreate(Model);
    _.isFunction(modelDesc.extendModel) && (Model = modelDesc.extendModel(Model) || Model);
    return Model;
};

exports.C = function(name, modelDesc, model) {
    var extendObj = {
        model: model,
        sync: function(method, model, opts) {
            var config = model.config || {}, type = (config.adapter ? config.adapter.type : null) || "localDefault";
            Ti.Platform.osname === "mobileweb" && type === "localDefault" ? type = "localStorage" : type === "localDefault" && (type = "sql");
            require("alloy/sync/" + type).sync(model, method, opts);
        }
    }, Collection = Backbone.Collection.extend(extendObj), config = Collection.prototype.config = model.prototype.config, type = (config.adapter ? config.adapter.type : null) || "localDefault", adapter = require("alloy/sync/" + type);
    _.isFunction(adapter.afterCollectionCreate) && adapter.afterCollectionCreate(Collection);
    _.isFunction(modelDesc.extendModel) && (Collection = modelDesc.extendCollection(Collection) || Collection);
    return Collection;
};

exports.A = function(t, type, parent) {
    _.extend(t, Backbone.Events);
    (function() {
        var al = t.addEventListener, rl = t.removeEventListener, oo = t.on, of = t.off, tg = t.trigger, cbs = [], ctx = {};
        if (!al || !rl) return;
        t.on = function(e, cb, context) {
            var wcb = function(evt) {
                try {
                    _.bind(tg, ctx, e, evt)();
                } catch (E) {
                    Ti.API.error("Error triggering '" + e + "' event: " + E);
                }
            };
            cbs[cb] = wcb;
            al(e, wcb);
            _.bind(oo, ctx, e, cb, context)();
        };
        t.off = function(e, cb, context) {
            var f = cbs[cb];
            if (f) {
                _.bind(of, ctx, e, cb, context)();
                rl(e, f);
                delete cbs[cb];
                f = null;
            }
        };
    })();
    return t;
};

exports.getWidget = function(id, name, args) {
    Ti.API.warn("Alloy.getWidget() is deprecated, use Alloy.createWidget() instead.");
    return exports.createWidget(id, name, args);
};

exports.createWidget = function(id, name, args) {
    return new (require("alloy/widgets/" + id + "/controllers/" + (name || "widget")))(args);
};

exports.getController = function(name, args) {
    Ti.API.warn("Alloy.getController() is deprecated, use Alloy.createController() instead.");
    return exports.createController(name, args);
};

exports.createController = function(name, args) {
    return new (require("alloy/controllers/" + name))(args);
};

exports.getModel = function(name, args) {
    Ti.API.warn("Alloy.getModel() is deprecated, use Alloy.createModel() instead.");
    return exports.createModel(name, args);
};

exports.createModel = function(name, args) {
    return new (require("alloy/models/" + STR.ucfirst(name)).Model)(args);
};

exports.getCollection = function(name, args) {
    Ti.API.warn("Alloy.getCollection() is deprecated, use Alloy.createCollection() instead.");
    return exports.createCollection(name, args);
};

exports.createCollection = function(name, args) {
    return new (require("alloy/models/" + STR.ucfirst(name)).Collection)(args);
};

exports.isTablet = function() {
    return Ti.Platform.osname === "ipad";
}();

exports.isHandheld = !exports.isTablet;

exports.version = "0.3.0";