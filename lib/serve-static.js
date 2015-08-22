/*
* serve-static class description
*/
var fs = require("fs");

var serveStatic = function(staticDir) {
	return function(next) {
		console.log("Hello world");
	};
};

module.exports = serveStatic;