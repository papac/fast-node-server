var url = require("url");
var querystring = require("querystring");
var Response = require("./lib/response");
var Route = require("./lib/route");
var serveStatic = require("./lib/serve-static");
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
		var match = false;
		pathname = pathname.substring(1).replace("/", "\/");
		methods[method].forEach(function(item) {
			if (item.match(pathname)) {
				match = true;
				return item.run(req, res);
			}
		});
		return match;
	};
	/*
	* Controlleur des routes
	*/
	return {
		/*
		* sequenseur de midelware.
		*/
		_nextedInit: false,
		_nexted: false,
		next: function() {
			this._nexted = true;
		},
		/*
		* Server de fichier static
		*/
		static: serveStatic,
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
		use: function (mount, middleware) {
			var me = this;
			/*
			* next middelware launcher
			*/
			var next = function() {
				me._nexted = true; 
			};
			if (typeof mount === "function") {
				middleware = mount;
				mount = '';
			}
			/*
			* coeur de this.use
			*/
			if (!this._nextedInit) {
				this._nextedInit = true;
				this._nexted = false;
				middleware(next);
			} else {
				if (this._nexted) {
					middleware(next);
				}
			}
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
				var isMath = run(req, respone, pathname);

				/*
				* Verification de la validite du path
				*/
				if (!isMath) {
					res.end('<p style="font-size: 15px; font-family: verdana">Cannot ' + req.method + ' ' + pathname + '</p>')
				}
			});
			/*
			* Error handler.
			*/
			server.on("error", function(err) {
				console.log("[Error: more information]: ", err);
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