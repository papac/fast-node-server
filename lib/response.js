'use strict';
var fs = require("fs");
var path = require("path")
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
	this._resClone = res;
	this.statusCode = res.statusCode;
	this.statusMessage = res.statusMessage;
};
/*
* SetHeader function.
*/
Response.prototype.setHeader = function(name, value) {
	this._resClone.setHeader(name, value);
	return this;
};

/*
* WriteHead function.
*/
Response.prototype.writeHead = function(code, statusMessage, header) {
	if (typeof statusMessage === "object" || Array.isArray(statusMessage)) {
		headers = statusMessage;
		this._resClone.writeHead(code, headers);
	} else {
		if (typeof statusMessage === "string") {
			if (!(typeof headers === "object" || Array.isArray(headers))) {
				headers = { "Content-Type": "text/html" };
			}
			this._resClone.writeHead(code, statusMessage, headers);
		} else {
			this._resClone.writeHead(code, headers);
		}
	}
	return this;
};

/*
* Send function.
*/
Response.prototype.send = function(data, encoding) {
	if (typeof encoding !== "object") {
		encoding = {encoded: "utf-8"};
	}
	this._resClone.end(data, encoding);
	return this;
};

/*
* SendFile function
*/
Response.prototype.sendFile = function(file) {
	var me = this;
	fs.exists(file, function(exist) {
		if (exist) {
			var stream = fs.createReadStream(file);
			stream.pipe(me._resClone);
		} else {
			throw new Error("File n'est pas present dans la repertoire courant.");
			me._resClone.end();
		}
	});
	return this;
};
/*
* Lanceur d'execution de temple.
*/
Response.prototype.render = function(renderFile, data) {
};

module.exports = Response;