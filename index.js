'use strict';
/*
* Chargement des dependense.
*/
var url = require("url");
var querystring = require("querystring");
var Response = require("./lib/response");
var Route = require("./lib/route");
var header = require("./lib/header");
/*
* Les middlewares compatibles express
* Alors tous les middleware de express sont donc compatible
*/
var serveFavicon = require("serve-favicon");
var bobyParser = require("body-parser");
/*
* middelware externe
*/
var serveStatic = function() { };

module.exports = function Router() {
	/*
	* Objet de configuration
	*/
	var config = {
		engine: undefined,
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
	var run = function(req, res, pathname) {
		// recuperationde la method de la requete entrante
		var method = req.method.toLowerCase();
		// Sequenceur
		var error = true;
		var indexes = pathname.split("/");

		if (indexes[indexes.length - 1] == "") {
			indexes.pop();
			pathname = indexes.join("/");
		}
		indexes.shift();
		indexes.shift();
		pathname = pathname.replace(/\//g, "\/");

		if (pathname == "") {
			pathname = "/";
		}
		/*
		* Recherche dans la collection de path
		* le path equivalant au pathname de http.incommmingMessage
		*/
		methods[method].forEach(function(item) {
			if (item.match(pathname)) {
				error = false;
				req.params = {};
				Object.keys(indexes || []).forEach(function(index) {
					req.params[item.paramsKeys[index].substring(1)] = indexes[index];
				});
				return item.run(req, res);
			}
		});
		return error;
	};
	/*
	* Controlleur des routes
	*
	* Object fast-node-server
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
		/**
		* Body-parse function
		*
		* @api public
		*/
		body: bobyParser,
		/**
		* Server de fichier static
		*
		* @api public
		*/
		static: serveStatic,
		/**
		* Server de favicon
		*
		* @api public
		*/
		favicon: serveFavicon,
		/**
		* mutateur des donnees de configuration
		*
		* @param {string} name
		* @param {string|object|function} value
		* @return {object} objet fast-node-server
		*
		* @api public
		*/
		set: function(name, value) {
			config[name] = value;
		},
		/**
		* Gestion de plugin | middelware.
		*
		* @param {string} mount
		* @param {function} middleware
		* @return {object} objet fast-node-server
		*
		* @api public
		*/
		use: function (mount, middleware) {
			var me = this;
			/*
			* next middelware launcher
			*/
			var next = function(err) {
				me._nexted = true;
			};
			connection.on("start", function(req, res) {
				if (typeof mount === "function") {
					middleware = mount;
					mount = '';
				}else {
					if (typeof middleware !== "function") {
						throw new TypeError("La fonction .use() prend en paramtre un middleware.");
					}
				}
				/*
				* coeur de la logique du middelware this.use
				*/
				if (!me._nextedInit) {
					me._nextedInit = true;
					me._nexted = false;
					middleware(req, res, next);
				} else {
					if (me._nexted) {
						me._nexted = false;
						middleware(req, res, next);
					}
				}
			});
			return this;
		},
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
		get: function(path, callback) {

			if (typeof callback === "undefined") {
				if (typeof path === "string") {
					var name = path;
					if (!(name in config)) {
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
		post: function(path, callback) {
			methods.post.push(new Route(path, callback));
			return this;
		},
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
		listen: function(port, hostname, callback) {
			var http = require("http");
			var server = http.createServer(function(req, res) {
				/*
				* default header.
				*/
				var response = new Response(res);
				response.writeHead(200, header("text/html", "200 OK"));
				/*
				* information du reste de l'application du debut de serveur
				*/
				connection.emit("start", req, response);
				/*
				* Gestionnaire d'erreur sur la reponse.
				* En case d'ecriture apres envoye de la reponse
				*/
				res.on("error", function(err) {
					console.log(err);
					return;
				});
				/*
				* Recuperation de la methode de transmission
				* de la requete.
				*/
				var method = methods[req.method.toLowerCase()];
				/*
				* Recuperation du path de la requete
				*/
				var pathname = url.parse(req.url).pathname;
				/*
				* Comparation de la route courante dans ma collection de route.
				*/
				console.log(response);
				var error = run(req, response, pathname);

				/*
				* Verification de la validite du path
				*/
				if (error) {
					response.writeHead(404, header("text/html", "Not Found"));
					response.send('<p style="font-size: 15px; font-family: verdana">Cannot ' + req.method + ' ' + pathname + '</p>')
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
			* Launch
			*/
			server.listen(parseInt(port, 10), hostname, callback);
		}
	};
};
