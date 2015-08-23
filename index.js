'use strict';

var url = require("url");
var querystring = require("querystring");
var Response = require("./lib/response");
var Route = require("./lib/route");
var header = require("./lib/header");
var serveFavicon = require("serve-favicon");
var bodyParser = require("body-parser");
/*
* middelware externe
*/
var serveStatic = function() {

};
var bobyParser = require("body-parser");
/**
* Class request.
*
* Permetant de reconstruire la requete.
* 
*/
var request = function (req, pathname) {
	var method = req.method.toLowerCase();
	if (method == "get") {
		if (/(:([\w_-]+))+/g.test(pathname)) {
			req.params = {};
			req.params[RegExp.$1] = "";
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
	/*
	* Object de configuration
	*/
	var config = {
		engine: "ejs",
		views: undefined,
		title: undefined
	};
	'use strict';
	/*
	* Objet de collection des differents method
	* http en occurence GET, POST
	*/
	var methods = {
		get: [],
		post: []
	};

	var events = require("events").EventEmitter;
	var connection = new events();
	/*
	* lancement du serveur.
	*/
	var run = function(req, res, pathname) {
		var method = req.method.toLowerCase();
		var match = false;
		pathname = pathname.substring(1).replace(/\//g, "\/");
		methods[method].forEach(function(item) {
			if (item.match(pathname)) {
				req.params = {};
				match = pathname.match(/([\w\d_-]+)\/?/g);
				Object.keys(match || []).forEach(function(item, index) {
					if (index > 1) {
						req.params[item] = undefined;
					}
				});
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
		* Body-parse function
		*/
		body: bobyParser,
		/*
		* Server de fichier static
		*/
		static: serveStatic,
		/*
		* Server de favicon
		*/
		favicon: serveFavicon,
		/*
		* mutateur des donnees de configuration
		*/
		set: function(name, value) {
			config[name] = value;
		},
		/*
		* Gestion de plugin | middelware.
		*/
		use: function (mount, middleware) {
			var me = this;
			/*
			* next middelware launcher
			*/
			var next = function() {
				me._nexted = true; 
				console.log("next");
			};
			connection.on("start", function(req, res) {
				if (typeof mount === "function") {
					middleware = mount;
					mount = '';
				}else {
					if (typeof middleware !== "function") {
						throw new TypeError("La fonction use() prend en paramtre un middleware.");
					}
				}
				/*
				* coeur de la logique du middelware this.use
				*/
				if (!this._nextedInit) {
					this._nextedInit = true;
					this._nexted = false;
					middleware(req, res, next);
				} else {
					if (this._nexted) {
						middleware(req, res, next);
					}
				}
			});
			return this;
		},
		/*
		* Accesseur des donnees de la configuration
		*
		* Route get.
		*/
		get: function(path, callback) {

			if (typeof callback === "undefined") {
				if (typeof path === "string") {
					if (! name in config) {
						return null;
					}
					return config[name];
				} else {
					throw new TypeError("Cette fonction ne peut pas execute de callback.");
				}
			}

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
				* Gestionnaire d'erreur sur la reponse.
				*/
				res.on("error", function(er) {
					console.log(er);
					return;
				});
				/*
				* default header.
				*/
				res.writeHead(200, header("text/html"));
				var respone = new Response(res);
				/*
				* information du reste de l'application du debut de serveur
				*/
				connection.emit("start", req, respone);
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