'use strict';

var fs = require("fs");
var mime = require("mime");
var path = require("path");
var EventEmitter = require("events");

/**
* Class response.
*
* Permetant de reconstruire la response.
* @param {res} HttpServerResponse
* @param {config} Object
*/
var Response = function (res, config) {
	EventEmitter.call(this);
	this._response = res;
	this._config = config;
	this._type = "text/html";
	this._data = "";
	this._encoding = {};
};

Response.prototype = EventEmitter.prototype;
Response.prototype.constructor = Response;


/**
* SetHeader function.
* 
* @param {string} name
* @param {string} value
* 
* @return this
*
* @api public 
*/
Response.prototype.setHeader = function(name, value) {
	this._response.setHeader(name, value);
	return this;
};

/**
* GetHeader function.
* 
* @param {string} name
* @param {string} value
* 
* @return this
*
* @api public 
*/
Response.prototype.getHeader = function(name, value) {
	return this._response.getHeader(name, value);
};

/**
* removeHeader function.
* 
* @param {string} name
* @param {string} value
* 
* @return this
*
* @api public 
*/
Response.prototype.removeHeader = function(name) {
	this._response.removeHeader(name, value);
	return this;
};

/**
* status function.
* 
* @param {interger} name
* 
* @return this
*
* @api public 
*/
Response.prototype.status = function(code) {
	this._response.statusCode = parseInt(code, 10);
	return this;
};

/**
* status function.
* 
* @param {interger} name
* 
* @return this
*
* @api public 
*/
Response.prototype.message = function(message) {
	this._response.statusMessage = message;
	return this;
};

/**
* writeHead function.
* 
* @param {string} code
* @param {string} value
* 
* @return this
*
* @api public 
*/
Response.prototype.writeHead = function(code, header) {
	this._response.writeHead(code, header);
	return this;
};

/**
* writeHead function.
* 
* @param {string} code
* @param {string} value
* 
* @return this
*
* @api public 
*/
Response.prototype.type = function(type) {
	this._type = type;
	return this;
};

/**
* writeHead function.
* 
* @param {string} code
* @param {string} value
* 
* @return this
*
* @api public 
*/
Response.prototype.end = function(message) {
	if (typeof message === "undefined") {
		message = this._data;
	}
	this._response.end(message);
	return this;
};

/*
* Send function.
*/
Response.prototype.send = function(data, redirect) {
	this.emit("writted", data.toString(), 200, this._type);
	if (typeof redirect === "string") {
		this.redirect(redirect);
	}
	return this;
};

/*
* Send function.
*/
Response.prototype.json = function(data, encoding) {
	if (typeof encoding !== "object") {
		encoding = {encoded: "UTF-8"};
	}
	this.type("application/json");
	this.emit("writted", data, 200, this._type);
	this._encoding = encoding;
	return this;
};

/*
* SendFile function
*/
Response.prototype.sendFile = function(file, redirect) {
	fs.exists(file, function(exist) {
		if (exist) {
			var stream = fs.readFileSync(file);
			this._type = mime.lookup(file);
			this.send(stream);
		} else {
			throw new Error("File n'est pas present dans la repertoire courant.");
			this.end();
		}
	}.bind(this));
	return this;
};
/**
* fonction redirect
*
* @param {object} obj
* 
* @api public
*/
Response.prototype.redirect = function(path) {
	this.status(301);
	this.setHeader('Content-Type', 'text/html; charset=utf-8');
	this.setHeader("Location", path);
	this.send('Redirecting to <a href="' + path + '">' + path + '</a>\n');
};

/**
* Lanceur d'execution de template.
* 
* @param {string} renderFile
* @param {object} options
*
* @api public
*/
Response.prototype.render = function(renderFile, options) {
	var viewsPath = '';
	if (this.config["views"]) {
		viewsPath = this.config["views"] + "/";
	}
	if(this.config["engine"]) {
		var tplName = require(this.config["engine"]);
		var html = getData(tplname, viewsPath + renderFile, options);
		this.send(html);
	}
};

/**
* getData function
* 
* @param filename
*
* @api private
*/

function getData(tplName, filename, options) {
	var data = undefined;
	var ext = path.parse(filename).ext;
	if (!ext) {
		filename = filename + "." + tplName;
	}
	fs.stat(filename, function(err, stats) {
		if (!err) {
			if (stats.isFile()) {
				tplName.renderFile(filename, options);
			} else {
				data = tplName.render(filename, options);
			}
		}
	});
	return data;
}

// Exports
module.exports = Response;