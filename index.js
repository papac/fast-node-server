var url = require("url");
var querystring = require("querystring");
/**
* Class request.
*
* Permetant de reconstruire la requete.
* 
*/
var request = function (req, pathname) {
	var method = req.method.toLowerCase();
	if (method == "post") {
		req.on("readable", function(data) {
			req.body = JSON.parse(data.toString());
		});
	} else if (method == "get") {
		if (/(:([\w_-]+))+/g.test(pathname)) {
			req.params = {
			};
		}else {
			req.query = querystring.parse(pathname);
		}
	}
	return req;
};
/**
* Class response.
*
* Permetant de reconstruire la response.
* 
*/
var Response = function (res) {

	/*
	* SetHeader function.
	*/
	this.setHeader = function(name, value) {
		res.setHeader(name, value);
	};

	/*
	* WriteHead function.
	*/
	this.writeHead = function(code, statusMessage, header) {
		if (typeof statusMessage === "object" || Array.isArray(statusMessage)) {
			headers = statusMessage;
			res.writeHead(code, headers);
		} else {
			if (typeof statusMessage === "string") {
				if (!(typeof headers === "object" || Array.isArray(headers))) {
					headers = { "Content-Type": "text/html" };
				}
				res.writeHead(code, statusMessage, headers);
			} else {
				res.writeHead(code, headers);
			}
		}
	};

	/*
	* Send function.
	*/
	this.send = function(data, encoding) {
		if (typeof encoding !== "object") {
			encoding = {encoded: "utf-8"};
		}
		res.end(data, encoding);
	};

	/*
	* Lanceur d'execution de temple.
	*/
	this.render = function(renderFile, data) {
	};

	/*
	* Status information.
	*/
	this.statusCode = res.statusCode;
	this.statusMessage = res.statusMessage;
};
/*
* Class route
*/
var Route = function(path, cb) {
	this.path = path.substring(1);
	this.cb = cb;
	this.run = function(request, response) {
		return this.cb(request, response);
	};
	this.match = function(pathname) {
		var path = this.path.replace(/:([\w_]+)/g, "([^/])");
		var regex = new RegExp(path);
		if (!regex.test(pathname)) {
			return false;
		}
		return true;
	};
};

/*
* Gestionnaire d'execption.
*/
var RouterException = {};
RouterException.prototype = Error.prototype;

module.exports = function Router() {
	var config = [];
	'use strict';
	/*
	* Objet de collection des differents method
	* http en occurence GET, POST
	*/
	var methods = {
		get: [],
		post: []
	};
	/*
	* lancement du serveur.
	*/
	var run = function(req, res, pathname) {
		var method = req.method.toLowerCase();
		pathname = pathname.substring(1).replace("/", "\/");
		methods[method].forEach(function(item) {
			if (item.match(pathname)) {
				return item.run(req, res);
			} else {
				res.send("<h3>Cannot " + method + "/</h3>");
			}
		});
	};
	/*
	* Controlleur des routes
	*/
	return {
		/*
		* mutateur des donnees de configuration
		*/
		set: function(name, value) {
			config[name] = value;
		},
		/*
		* Accesseur des donnees de la configuration
		*/
		get: function (name) {
			if (! name in config) {
				return null;
			}
			return config[name];
		},
		/*
		* Gestion de plugin.
		*/
		use: function (middleware) {
			return this;
		},
		/*
		* Route get.
		*/
		get: function(path, callback) {
			methods.get.push(new Route(path, callback));
			return this;
		},
		/*
		* Route post.
		*/
		post: function(path, callback) {
			methods.post.push(new Route(path, callback));
			return this;
		},
		/*
		* Lanceur du serveur.
		*/
		listen: function(port, hostname, callback) {
			var http = require("http");
			var server = http.createServer(function(req, res) {	
				/*
				* default header.
				*/
				res.on("error", function(er) {
					console.log(er);
					return;
				})
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
				var pathname = url.parse(req.url).pathname;
				/*
				* Lancement du control de path
				*/
				var exist = false;
				/*
				* Comparation de la route courante dans ma collection de route.
				*/
				run(req, respone, pathname);
			});
			/*
			* Error handler.
			*/
			server.on("error", function(err) {
				console.log("Error more information: ", err);
				process.exit();
			});
			if (typeof hostname === "function") {
				callback = hostname;
			} else {
				hostname = "localhost";
				if (typeof callback !== "undefined") {
					callback = function(){};
				}
			}
			/*
			* Launcher
			*/
			server.listen(parseInt(port, 10), hostname, callback);
		}
	};
};