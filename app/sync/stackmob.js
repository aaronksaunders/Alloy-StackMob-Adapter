function S4() {
	return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
}

function guid() {
	return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter(config) {
	var self = this;
	var settings = config.settings;
	this.STACKMOB_APP_NAME = settings.STACKMOB_APP_NAME, this.STACKMOB_PUBLIC_KEY = settings.STACKMOB_PUBLIC_KEY, this.STACKMOB_PRIVATE_KEY = settings.STACKMOB_PRIVATE_KEY, this.STACKMOB_USER_OBJECT_NAME = settings.STACKMOB_USER_OBJECT_NAME || "user", this.ENDPOINT = "http://stackmob.mob1.stackmob.com/api/0/" + settings.STACKMOB_APP_NAME + "/", this.oauth = new OAuth({
		consumerKey : this.STACKMOB_PUBLIC_KEY,
		consumerSecret : this.STACKMOB_PRIVATE_KEY
	}), Ti.API.debug(JSON.stringify(self) + "");
}

function Sync(model, method, opts) {
	function storeModel(data) {
		localStorage.setItem(name, JSON.stringify(data));
	}

	var name = model.config.adapter.name, settings = model.config.adapter.settings, data = model.config.data;
	Ti.API.info("method " + method);
	switch (method) {
		case "create":
			break;
		case "read":
			break;
		case "update":
			break;
		case "delete":
	}
}

function Client(applicationName, publicKey, privateKey, userObject) {
	this.STACKMOB_APP_NAME = applicationName, this.STACKMOB_PUBLIC_KEY = publicKey, this.STACKMOB_PRIVATE_KEY = privateKey, this.STACKMOB_USER_OBJECT_NAME = userObject || "user", this.ENDPOINT = "http://stackmob.mob1.stackmob.com/api/0/" + applicationName + "/", this.oauth = OAuth({
		consumerKey : publicKey,
		consumerSecret : privateKey
	}), Ti.API.debug(JSON.stringify(this));
}

var _ = require("alloy/underscore")._, OAuth = require("alloy/sync/jsOAuth").OAuth;

exports.Client = Client, exports.OAuth = OAuth, Client.prototype.request = function(args) {
	var that = this, headers = {};
	headers = extend(headers, args.headers);
	if (args.method === "PUT" || args.method === "POST")
		headers = extend(headers, {
			"Content-Type" : "application/json"
		});
	var options = {
		method : args.method,
		headers : headers,
		url : that.ENDPOINT + args.action,
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
}, Client.prototype.create = function(args) {
	this.request({
		action : args.className,
		method : "POST",
		params : args.params,
		success : args.success,
		error : args.error,
		headers : args.headers
	});
}, Client.prototype.login = function(args) {
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
}, Client.prototype.get = function(args) {
	this.request({
		action : args.className + (args.objectId ? "/" + args.objectId : ""),
		method : "GET",
		params : args.params,
		success : args.success,
		error : args.error,
		headers : args.headers
	});
}, Client.prototype.getNear = function(args) {
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
}, Client.prototype.getWithin = function(args) {
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
}, Client.prototype.update = function(args) {
	this.request({
		action : args.className + "/" + encodeURIComponent(args.objectId),
		method : "PUT",
		params : args.params,
		success : args.success,
		error : args.error,
		headers : args.headers
	});
}, Client.prototype.remove = function(args) {
	this.request({
		action : args.className + "/" + args.objectId,
		method : "DELETE",
		success : args.success,
		error : args.error,
		headers : args.headers
	});
}, exports.base64FromFile = function(f) {
	var isAndroid = Titanium.Platform.osname == "android", content = f.read();
	if (isAndroid)
		return String.format("Content-Type: %s\nContent-Transfer-Encoding: base64\n\n%s", content.mimeType, content.toBase64());
	var utils = require("com.clearlyinnovative.utils");
	return String.format("Content-Type: %s\nContent-Transfer-Encoding: base64\n\n%s", content.mimeType, utils.base64encode(content));
};

var extend = function(obj, extObj) {
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