'use strict';
var nodeHttpServer = function() {
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
				res.writeHead(200, {"Content-Type":"text/html"});
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
								method.cb[index](req, res);
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
			server.on("error", function(err) {
				console.log(err);
				process.exit();
			});
			server.listen(parseInt(port, 10));
		}
	};
};

exports = nodeHttpServer;