/**
* en-tête HTTP
* 
* @param {string} mime
*
* @api private 
*/
var header = function(mime, statusMessage) {

	var heads = {};
	heads["Content-Type"] = mime + "; charset=utf-8";
	heads["X-Powered-By"] = "Node-HTTP-Server";
	heads["Connection"] = "keep-alive";
	heads["Status"] = statusMessage;
	return heads;
};

module.exports = header;