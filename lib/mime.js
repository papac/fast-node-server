var mime = (function() {
	var mimes = {
		"js": "text/javascript",
		"html": "text/html",
		"txt": "text/plain",
		"json": "application/json",
		"jpg": "image/jpeg",
		"jpeg": "image/jpeg",
		"png": "image/png",
		"gif": "image/gif"
	}
	return {
		resolve: function(ext) {
			if (typeof ext === "undefined") {
				throw new TypeError("[Error: une chaine de caractere attendu.]");
			}
			ext = ext.repalce(".", "");
			return mimes[ext];
		}
	}
})();

module.exports = mime;