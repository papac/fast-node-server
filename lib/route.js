'use strict';
/*
* Class route
*/
var Route = function(path, cb) {
	this.path = path;
	this.paramsKeys = [];
	this.cb = cb;
};
/**
* Fonction run, lanceur de callback.
* 
* @param {http.incommingMessage} request
* @param {http.ServerResponse} response
* @return {mixed}
*
* @public
*/
Route.prototype.run = function(request, response) {
	return this.cb(request, response);
};
/**
* Fonction math, Verification de pattern des routes.
* 
* @param {string} pathname
* @return {boolean}
*
* @public
*/
Route.prototype.match = function(pathname) {
	var paramRegex = /:([\d\w]+)?/g;
	var path = this.path.replace(paramRegex, "([\\w\\d]+)");
	path = "^" + path + "$";
	/*
	* Regex de validation
	*/
	var regex = new RegExp(path);
	/*
	* Teste de validation du pathname
	* 
	* console.log("'" + this.path + "'", "=" ,pathname, "=>" ,regex.test(pathname));
	*/
	if (regex.test(pathname)) {
		this.paramsKeys = this.path.match(paramRegex);
		return true;
	}
	return false;
};
/**
* Fonction run, lanceur de callback.
*
* @return {mixed}
*
* @public
*/
Route.prototype.getPatern = function() {
	return this.path;
}

module.exports = Route;