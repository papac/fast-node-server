/**
* en-tête HTTP
* 
* @param {string} mime
*
* @private 
*/
var header = function(mime) {

	var heads = {};
	heads["Content-Type"] = mime + "; charset=utf-8";
	heads["X-Powered-By"] = "Node-HTTP-Server";
	heads["Connection"] = "Alive-Keep";
	heads["Status"] = "200 OK";
	return heads;
};

module.exports = header;