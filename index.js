var util = {
	pathFilter: function(arr, fn) {
		if (Array.isArray(arr)) {
			for(var i = 0, len = arr.length; i < len; i++) {
				if (fn(arr(i))) {
					exist = true;
				}
			}
		}
	}
}
/**
* Class request
*
* Permetant de reconstruire la requete
* 
*/
var request = function (req, pathname) {
	var method = req.method.toLowerCase();
	console.log(method);
	if (method == "post") {
		req.on("readable", function(data) {
			req.body = JSON.parse(data.toString());
		});
	} else if (method == "get") {
		console.log(pathname);
		if (/:([\w_-]+)/g.test(pathname)) {
			console.log(RegExp.$1);
		}
	}
	return req;
};

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
	this.writeHead = function(code, statusMessage, header) {
		if (typeof statusMessage === "object" || Array.isArray(statusMessage)) {
			headers = statusMessage;
			res.writeHead(code, headers);
		} else {
			if (typeof statusMessage === "string") {
				if (!(typeof headers === "object" || Array.isArray(headers))) {
					headers = {
						"Content-Type": "text/html"
					};
				}
				res.writeHead(code, statusMessage, headers);
			} else {
				res.writeHead(code, headers);
			}
		}
	};

	// send function
	this.send = function(data, encoding) {
		if (typeof encoding !== "object") {
			encoding = {encoded: "utf-8"};
		}

		if (typeof data !== "string") {
			res.write(data, encoding);
		}
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
				console.log(req.url);
				// default header
				res.writeHead(200, {"Content-Type": "text/html"});
				var respone = new Response(res);

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
				var exist = false;
				method.path.forEach(function(item, index) {
					// comparation de la route courante dans ma collection de route
					if (item === requestPath) {
						exist = true;
					}
					if (exist) {
						if (item == requestPath) {
							if (typeof method.cb[index] !== "undefined") {
								method.cb[index](request(req, requestPath), respone);
							} else {
								res.end();
							}
						}
					} else {
						res.end('<h1>Not found page 404</h1>');
					}
				});
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