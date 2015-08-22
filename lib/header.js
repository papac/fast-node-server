var header = function(mime) {
	return {
		"Content-Type": mime "; charset=utf-8",
		"X-Powered-By": "Node-HTTP-Server",
		"Connection": "Alive-Keep",
		"Status": "200 OK"
	}
};