# node-server
Simple http server and routing manager,

## INSTALL

```js
$ npm install small-express --save
```

## USAGE

```js
var small = require("small-express");
var app = small();

app.set("views", __dirname + "/views");

app.use(samll.static(__dirname + "/views"));

app.get("/", function (req, res) {
	res.send("hello world");
});

app.listen("5000", function() {
	console.log("App run at port 5000");
});
```

# License

ISC
