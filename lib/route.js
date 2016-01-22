'use strict';


// * Class route
var Route = function(path, cb) {
	this._path = path;
	this._params = [];
	this._cb = cb;
};

/**
* Fonction run, lanceur de callback.
* 
* @param {http.incommingMessage} request
* @param {http.ServerResponse} response
* @return {mixed}
*
* @api public
*/
Route.prototype.exec = function(request, response) {
	this._cb(request, response);
	return true;
};

/**
* Fonction math, Verification de pattern des routes.
* 
* @param {string} pathname
* @return {boolean}
*
* @api public
*/
Route.prototype.match = function(pathname) {
	var paramRegex = /:([\w\d]+)/g;
	var path = this._path.replace(paramRegex, "([\\w\\d]+)");
	path = "^" + path + "$";
	
	// * Regex de validation
	var regex = new RegExp(path);
	
	// * Teste de validation du pathname
	// * 
	this._params = this._path.match(paramRegex);

	if (regex.test(pathname)) {
		return true;
	} else {
		this._params = [];
		return false;
	}
};

/**
* Fonction run, lanceur de callback.
*
* @return {mixed}
*
* @api public
*/
Route.prototype.getPath = function() {
	return this.path;
}

/**
* Fonction run, lanceur de callback.
*
* @return {mixed}
*
* @api public
*/
Route.prototype.params = function() {
	return this._params;
}

module.exports = Route;