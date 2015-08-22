/*
* serve-static class description
*/
var fs = require("fs");
var path = require("path");
var mime = require("./mime");
var header = require("./header");

var serveStatic = function(root) {
	return function(req, res, next) {

		if (!root) {
			throw new TypeError("La route principale doit etre passer.");
		}
		if (typeof root !== "string") {
			throw new TypeError("La oute principale doit etre une chaine de caractere.");
		}
		var rootStatic = path.resolve(root);
		console.log(req.url);
		var filename = path.join(rootStatic, req.url);
		console.log(filename);
		fs.exists(filename, function(exist) {
			if (!exist) {
				return;
			}
			fs.stat(filename, function(stats) {
				if (stats.isFile()) {
					var fileInfo = path.parse(filename);
					var contentType = mime.resolve(filename.ext);
					res.writeHead(303, header(contentType));
					res.statusCode = 303;
				    res.setHeader('X-Content-Type-Options', 'nosniff');
					fs.createReadStream(filename).pipe(res);
				}
			});
		});

		next();
	};
};

module.exports = serveStatic;