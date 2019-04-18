var express = require('express');
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

remoteHost = function(callback) {
	app.get('/sri', function (req, res) {

		//res.send('<html><body><h1>Hello World</h1></body></html>');
		//res.send({a: str});
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

		request.post(
			'https://api.matchbook.com/bpapi/rest/security/session',
			{ json: credential}, // username and passwords
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					sessionToken = body['session-token'];
					sessionStartTime = new Date().getTime();
					// console.log(sessionToken);
					// console.log(body);
					// return callback(null,sessionToken);
					//res.redirect('/client.html');
					res.send(sessionToken + ' Submitted Successfully!' + JSON.stringify(body));

					return callback(null,sessionToken);
				}
				else {
					//return callback(error,null);
					res.send(error +'Error!');
					return callback(error, null);
				}
			}
		);
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
