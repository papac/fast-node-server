/*!
 * small-server
 * Copyright(c) 2014-2015 Franck Dakia
 * MIT Licensed
 */
 
'use strict';

var url = require("url");
var path = require("path");
var mime = require("mime");
var querystring = require("querystring");
var Response = require("./lib/response");
var Route = require("./lib/route");
var header = require("./lib/header");
var EventEmitter = require("events").EventEmitter;


// FastNodeServer Class
function FastNodeServer() {
	this._config = { engine: undefined, views: undefined, title: undefined };
	this._method = { get: [], post: [], put: [], update: [], delete: [], head: [] };
	this._nextedInit = true;
	this._nexted = false;
	this._middleware = [];
	EventEmitter.call(this);
};

FastNodeServer.prototype = EventEmitter.prototype;
FastNodeServer.prototype.constructor = FastNodeServer;

/**
* Accesseur des donnees de la configuration
*
* Route get.
* @param {string} path
* @param {function} callback
* @return {object} objet fast-node-server
*
* @api public
*/

FastNodeServer.prototype.get = function(path, callback) {
	if (typeof callback === "undefined") {
		if (typeof path === "string") {
			var name = path;
			if (!(name in this._config)) {
				return null;
			}
			return this._config[name];
		} else {
			throw new TypeError("Cette fonction ne peut pas execute de callback.");
		}
	} else {
		this._method.get.push(new Route(path, callback));
	}
	return this;
};

/**
* Route post.
*
* controlleur de http.incommingMessage de type POST
*
* @param {string} path
* @param {callback} callback
* @return {object} objet fast-node-server
*
* @api public
*/
FastNodeServer.prototype.post = function(path, callback) {
	this._method.post.push(new Route(path, callback));
	return this;
}

/**
* Route post.
*
* controlleur de http.incommingMessage de type POST
*
* @param {string} path
* @param {callback} callback
* @return {object} objet fast-node-server
*
* @api public
*/
FastNodeServer.prototype.head = function(path, callback) {
	this._method.head.push(new Route(path, callback));
	return this;
}

/**
* Route PUT.
*
* controlleur de http.incommingMessage de type PUT
*
* @param {string} path
* @param {callback} callback
* @return {object} objet fast-node-server
*
* @api public
*/
FastNodeServer.prototype.put = function(path, callback) {
	this._method.put.push(new Route(path, callback));
	return this;
}

/**
* Route DELETE.
*
* controlleur de http.incommingMessage de type DELETE
*
* @param {string} path
* @param {callback} callback
* @return {object} objet fast-node-server
*
* @api public
*/
FastNodeServer.prototype.delete = function(path, callback) {
	this._method.delete.push(new Route(path, callback));
	return this;
}

/**
* Route UPDATE.
*
* controlleur de http.incommingMessage de type UPDATE
*
* @param {string} path
* @param {callback} callback
* @return {object} objet fast-node-server
*
* @api public
*/
FastNodeServer.prototype.update = function(path, callback) {
	this._method.update.push(new Route(path, callback));
	return this;
}

// Set
FastNodeServer.prototype.set = function(name, value) {
	this._config[name] = value;
};

// use
FastNodeServer.prototype.use = function (middleware) {
	this._middleware.push(middleware);
	return this;
};

/**
* lancement du serveur.
*
* @param {http.incommingMessage} req
* @param {http.ServerResponse} res
* @param {string} pathname
* @return {boolean}
*
* @api private
*/
function run(req, res, methods, cb) {
	if (req.url == "/favicon.ico") {
		return false;
	}
	// * recuperationde la method de la requete entrante
	var method = req.method.toLowerCase();
	var pathname = url.parse(req.url).pathname;
	// * Sequenceur
	var parts = pathname.split("/");
	// * verification
	if (parts[parts.length - 1] == "") {
		parts.pop();
		pathname = parts.join("/");
	}
	// * remove surcharge
	parts.shift();
	pathname = pathname.replace(/\//g, "\/");
	// pathname is valided.
	if (pathname == "") {
		pathname = "/";
	}
	req.body = {};
	req.params = {};
	// * Formatage des donnees du post.
	if (method === "post" || method === "put") {
		req.on("readable", function(chunck) {
			req.body = querystring.parse(req.read().toString());
			if (typeof req.body.method !== "function") {
				method = req.body.method.toLowerCase();
			}
		});
	}
	var i = 0;
	var len = methods[method].length;
	var route = {};
	// * Recherche dans la collection de path
	// * le path equivalant au pathname de http.incommmingMessage
	if (len > 0) {
		methods[method].forEach(function (route) {
			if (route.match(pathname)) {
				var params = route.params();
				if (params !== null) {
					Object.keys(parts || []).forEach(function(index) {
						req.params[params[index].substring(1)] = parts[index];
					});
				}
				route.exec(req, res);
			}
		});
	} else {
		res.setHeader("Content-Type", "Not Found");
		res.status(404);
		res.end();
	}
};

/*
* Lanceur du serveur.
*
* mecanisme de lencement du server global
*
* @param {string|number} port
* @param {string} hostname|undefined
* @param {function} callback
* @return {object} objet fast-node-server
*
* @api public
*/
FastNodeServer.prototype.listen = function(port, hostname, callback) {
	
	var http = require("http");
	var next = function (err) { this._nexted = true; return err; }.bind(this);

	var server = http.createServer(function(req, res) {
		var response = new Response(res, this._config);
		response.on("writted", function(data, code, type) {
			response.writeHead(code, {"Content-Type": type});
			response.end(data);
		});
		this.on("next", function () {
			run(req, response, this._method);
		});
		var len = this._middleware.length;
		if (len == 0) {
			this.emit("next");
		} else {
			this._middleware.forEach(function(middleware, i) {
				if (this._nextedInit) {
					this._nextedInit = false;
					middleware(req, response, next);
				} else {
					if (this._nexted) {
						this._nexted = false;
						middleware(req, response, next);
					}
				}
				if (len == (i + 1)) {
					this.emit("next");
				}
			}.bind(this));
		}
	}.bind(this));

	if (typeof hostname === "function") {
		callback = hostname;
		hostname = "localhost";
	} else {
		if (typeof hostname === "undefined") {
			hostname = "localhost";
		}
	}

	// * Error handler.
	server.on("error", callback);

	// * Launch
	server.listen(parseInt(port, 10), hostname, callback);
};

// * FastNodeServer wrapper.
function fast() {
	return new FastNodeServer();
}

// ServeStatic
function serveStatic(publicPath) {
	var fs = require("fs");
	return function (req, res, next) {
		var pathname = publicPath + url.parse(req.url).pathname;
		fs.stat(pathname, function (err, stat) {
			if (err == null) {
				if (stat.isFile()) {
					var mimeType = mime.lookup(pathname);
					var data = fs.readFileSync(pathname);
					res.type(mimeType);
					res.send(data);
				}
			}
			next();
		});
	};
}

// FastNodeServer
module.exports = fast;

// Exports serveStatic
module.exports.static = function(publicPath){
	return serveStatic(publicPath);
};