var DOOR = require('./door');
var fs = require('fs');

var ACCESS = (function() {
	// Private Members
	getCredential =  function(login, callback) 
	{
		// Asynchronous 'json' file read
		fs.readFile('./../../credential.json', function(err, data) {
			if (err)
			{
				login(err, null, callback);
				throw err;
			} 
			var credential = JSON.parse(data);
			login(null, credential, callback);
		});
	},

	login = function(err, credential, callback)
	{
		if(!err)
		{
			DOOR.login(credential, callback);
		}
	};
	
	return {
		// Public Members
		getAccess: function(hostType, callback) {
			if(hostType === 'local') {
				getCredential(login, callback);
			}
			else if(hostType === 'remote') {
				remoteHost( function(credential) {
					this.login(null, credential, callback);
				});
			}
		}
	};
})();

// exports the variables and functions above so that other modules can use them
module.exports.getAccess = ACCESS.getAccess;


