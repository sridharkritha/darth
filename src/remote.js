var express = require('express');
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

remoteHost = function(callback, printCallback) {
	app.get('/sri', function (req, res) {

		//res.send('<html><body><h1>Hello World</h1></body></html>');
		//res.send({a: str});
		publishString = printCallback();
		res.send(JSON.stringify(publishString));
	});

	app.get('/', function (req, res) {
		//res.send('<html><body><h1>Hello World</h1></body></html>');
		res.sendFile('index.html', {root: __dirname });
	});

	app.post('/submit-student-data', function (req, res) {
		//var name = req.body.firstName + ' ' + req.body.lastName;

		var credential = {};
		credential.username = req.body.firstName;
		credential.password = req.body.lastName;

		return callback(credential);
	});

	/*
	app.put('/update-data', function (req, res) {
		res.send('PUT Request');
	});

	app.delete('/delete-data', function (req, res) {
		res.send('DELETE Request');
	});
	*/
	var port = process.env.PORT || 1239;
	var server = app.listen(port, function () {
		console.log('Node server is running..');
	});
};
