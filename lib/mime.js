var mime = (function() {
	var mimes = {
		"js": "text/javascript",
		"html", "text/html",
		"txt": "text/plain",
		"json": "application/json",
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg",
		"png": "image/png",
		"gif": "image/gif"
	}
	return {
		resolve: function(ext) {
			return mimes[ext];
		}
	}
})();

module.exports = mime;