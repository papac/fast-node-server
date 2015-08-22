var header = function(mime) {

	var head = {};
	head["Content-Type"] = mime + "; charset=utf-8";
	head["X-Powered-By"] = "Node-HTTP-Server";
	head["Connection"] = "Alive-Keep";
	head["Status"] = "200 OK";
	return head;
};

module.exports = header;