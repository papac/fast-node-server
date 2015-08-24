'use strict';
var fs = require("fs");
var path = require("path");
/**
* Class response.
*
* Permetant de reconstruire la response.
* 
*/
var Response = function (res, root) {
	/*
	* Status information.
	*/
	this.res = res;
	this.statusCode = res.statusCode;
	this.statusMessage = res.statusMessage;
};
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
	this.res.setHeader(name, value);
	return this;
};

/*
* WriteHead function.
*/
Response.prototype.writeHead = function(code, statusMessage, header) {
	if (typeof statusMessage === "object" || Array.isArray(statusMessage)) {
		header = statusMessage;
		this.res.writeHead(code, header);
	} else {
		if (typeof statusMessage === "string") {
			if (!(typeof headers === "object" || Array.isArray(headers))) {
				headers = { "Content-Type": "text/html" };
			}
			this.res.writeHead(code, statusMessage, headers);
		} else {
			this.res.writeHead(code, headers);
		}
	}
	return this;
};

/*
* Send function.
*/
Response.prototype.send = function(data, encoding, redirect) {
	if (typeof encoding !== "object") {
		encoding = {encoded: "utf-8"};
	}
	this.res.end(data, encoding);
	return this;
};

/*
* SendFile function
*/
Response.prototype.sendFile = function(file, redirect) {
	var me = this;
	fs.exists(file, function(exist) {
		if (exist) {
			var stream = fs.createReadStream(file);
			stream.pipe(me.res);
		} else {
			throw new Error("File n'est pas present dans la repertoire courant.");
			me.res.end();
		}
	});
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
	
	if (!typeof obj === "string") {
		throw new TypeError("Vous devez donner un object, c'est plustot un stringthis");
	} else {
		this.res.statusCode = 301;
		this.res.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.res.setHeader("Location", obj.path);
		this.res.end('Redirecting to <a href="' + path + '">' + path + '</a>\n');
	}
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
	if (config["view"]) {
		viewsPath = config["view"] + "/";
	}
	if(config["engine"]) {
		var tplName = require(config["engine"]);
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
module.exports = Response;