/*
* serve-static class description
*/
var fs = require("fs");

var serveStatic = function(staticDir) {
	return function() {
		console.log("Hello world");
	};
};

module.exports = serveStatic;