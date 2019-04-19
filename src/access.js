var DOOR = require('./door');
var REMOTE = require('./remote');
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
		getAccess: function(hostType, callback, printCallback) {
			if(hostType === 'local') {
				getCredential(login, callback);
			}
			else if(hostType === 'remote') {
				remoteHost( function(credential) {
					this.login(null, credential, callback);
				}, printCallback);
			}
		}
	};
})();

// exports the variables and functions above so that other modules can use them
module.exports.getAccess = ACCESS.getAccess;


