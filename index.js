/**
* Class response
*
* Permetant de reconstruire la response
* 
*/
var Response = function (res) {

	// setHeader function
	this.setHeader = function(name, value) {
		res.setHeader(name, value);
	};

	// writeHead function
	this.writeHead = function(code, satutsMessage, header) {
		if (typeof satutsMessage === "object" || Array.isArray(statusMessage)) {
			headers = satutsMessage;
			res.writeHead(code, headers);
		} else {
			if (typeof satutsMessage !== "object" || Array.isArray(statusCode))
		}
	};

	// send function
	this.send = function(data, encoding) {
		if (typeof encoding !== "object") {
			encoding = {encoded: "utf-8"};
		}
		res.write(data, encoding);
		res.end();
	};

	// status information
	this.statusCode = res.statusCode;
	this.statusMessage = res.statusMessage;
};

module.exports = function() {
	
	'use strict';

	var url = require("url");
	/*
	* Objet de collection des differents method
	* http en occurence GET, POST
	*/
	var methods = {
		get: {
			path: [],
			cb: []
		},
		post: {
			path: [],
			cb: []
		}
	};

	// Controlleur des routes
	return {
		use: function (middleware) {
			return this;
		},
		get: function(path, callback) {
			methods.get.path.push(path);
			methods.get.cb.push(callback);
			return this;
		},
		post: function(path, callback) {
			methods.post.path.push(path);
			methods.post.cb.push(callback);
			return this;
		},
		listen: function(port, hostname, callback) {
			var http = require("http");
			var server = http.createServer(function(req, res) {	
				/*
				* Recuperation de la methode de transmission
				* de la requete
				*/
				var method = methods[req.method.toLowerCase()];

				/*
				* Recuperation du path de la requete
				*/
				var requestPath = url.parse(req.url).pathname;

				/*
				* Lancement du control de path
				*/
				if (typeof method.path[0] !== "undefined") {
					method.path.forEach(function(item, index) {
						if (item == requestPath) {
							if (typeof method.cb[index] !== "undefined") {
								method.cb[index](req, respone);
							} else {
								res.end();
							}
						}
					});
				} else {
					// Erreur 404
					res.write('<h1>Not found page 404</h1>');
				}
			});

			// error handler
			server.on("error", function(err) {
				console.log("Error more information: ", err);
				process.exit();
			});

			if (typeof hostname !== "function") {
				callback = hostname;
			} else {
				hostname = "localhost";
				if (typeof callback !== "undefined") {
					callback = function(){};
				}
			}

			// Launch
			server.listen(parseInt(port, 10), hostname, callback);
		}
	};
};