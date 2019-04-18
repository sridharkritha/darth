var request = require('request');
var fs = require('fs');
var DOOR = (function() {
	// Private Members
	return {
	// Public Members
	
	// Login
	// Login to Matchbook and create a new session.
	// The response includes a session token value. This value should be included with all subsequent requests as either a 
	// cookie named "session-token" or a header named "session-token".
	// Matchbook sessions live for approximately 6 hours so only 1 login request every 6 hours is required. The same session 
	// should be used for all requests in that period.
	login: function (callback) {
		// Asynchronous 'json' file read
		fs.readFile('./../../../../credential.json', function(err, data) {
			if (err) throw err;
			var credential = JSON.parse(data);
			// console.log(credential);
			
			request.post(
				'https://api.matchbook.com/bpapi/rest/security/session',
				{ json: credential}, // username and passwords
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						sessionToken = body['session-token'];
						sessionStartTime = new Date().getTime();

						 return callback(null, sessionToken, sessionStartTime);
					}
					else {
						console.log(body);

						return callback(error, null, 0);
					}
				}
			);
		});
		},
	
		// Logout
		// Logout from Matchbook and terminate the current session.
		logout: function (sessionToken) {
			var options = UTIL.UTIL.getDefaultOptions();
			options.method = 'DELETE';
			options.url = 'https://api.matchbook.com/bpapi/rest/security/session';
	
			// Cookie data for maintaining the session
			options.headers['session-token'] = sessionToken;
	
			request(options, function (error, response, body) {
				if (error) throw new Error(error);
	
				//console.log(body);
			});
		}
	};
})();


// exports the variables and functions above so that other modules can use them
module.exports.login = DOOR.login;
module.exports.logout = DOOR.logout;