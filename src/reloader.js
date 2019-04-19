// Ref: http://www.labbookpages.co.uk/web/realtime.html
window.addEventListener('load', function()
{
	var xhr = null;
	var requestMode = 'GET'; // 'GET' or 'POST'

	getXmlHttpRequestObject = function()
	{
		if(!xhr)
		{
			// All modern browsers have a built-in XMLHttpRequest object to request data from a server
			// Create a new XMLHttpRequest object 
			xhr = new XMLHttpRequest();
		}
		return xhr;
	};

	updateLiveData = function()
	{
		xhr = getXmlHttpRequestObject();
		xhr.onreadystatechange = evenHandler;
		if(requestMode === 'GET')
		{
			// GET
			var now = new Date();
			// Date string is appended as a query with live data for not to use the cached version 
			//var url = 'livefeed.txt?' + now.getTime();
			//var url = 'http://localhost:1239/sri';
			var url = 'https://stormy-waters-62271.herokuapp.com/sri';
			// asynchronous requests
			xhr.open("GET", url, true);
			// Send the request over the network
			xhr.send(null);
		}
		else
		{
			//ref: https://learn.freecodecamp.org/data-visualization/json-apis-and-ajax/post-data-with-the-javascript-xmlhttprequest-method/
			// https://github.com/freeCodeCamp/freeCodeCamp/issues/14002

			// POST
			var now = new Date();
			// Date string is appended as a query with live data for not to use the cached version 
			// var url = 'https://jsonplaceholder.typicode.com/posts';
			var url = 'http://localhost:1239/sri';
			// asynchronous requests
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
			// Send the request over the network
			var body = JSON.stringify({ userName: 'sridhar', suffix: 'loves every good things!' });
			xhr.send(body);
		}
		
	};

	updateLiveData();

	function evenHandler()
	{
		if(requestMode === 'GET')
		{
			// GET
			// Check response is ready or not
			if(xhr.readyState == 4 && xhr.status == 200)
			{
				dataDiv = document.getElementById('liveTime');
				// Set current data text
				dataDiv.innerHTML = JSON.parse(xhr.response).time;

				//dataDiv = document.getElementById('liveData');
				// Set current data text
				// dataDiv.innerHTML = xhr.responseText;
				CreateTableFromJSON(JSON.parse(xhr.response).bets);
				// Update the live data every 1 sec
				setTimeout(updateLiveData(), 1000);
			}
		}
		else
		{
			// POST
			// Check response is ready or not
			if(xhr.readyState == 4 && xhr.status == 201)
			{
				dataDiv = document.getElementById('liveData');
				// Set current data text
				//dataDiv.innerHTML = JSON.parse(xhr.response);
				dataDiv.innerHTML = xhr.responseText;
				// Update the live data every 1 sec
				setTimeout(updateLiveData(), 1000);
			}
		}
	}

	/////////////////////Json to Table //////////////////////////////////
	function CreateTableFromJSON(myBooks) {
		/*
		var myBooks = [
			{
				"Book ID": "1",
				"Book Name": "Computer Architecture",
				"Category": "Computers",
				"Price": "125.60"
			},
			{
				"Book ID": "2",
				"Book Name": "Asp.Net 4 Blue Book",
				"Category": "Programming",
				"Price": "56.00"
			},
			{
				"Book ID": "3",
				"Book Name": "Popular Science",
				"Category": "Science",
				"Price": "210.40"
			}
		]
		*/
	
		// EXTRACT VALUE FOR HTML HEADER. 
		// ('Book ID', 'Book Name', 'Category' and 'Price')
		var col = [];
		for (var i = 0; i < myBooks.length; i++) {
			for (var key in myBooks[i]) {
				if (col.indexOf(key) === -1) {
					col.push(key);
				}
			}
		}
	
		// CREATE DYNAMIC TABLE.
		var table = document.createElement("table");
	
		// CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
		var tr = table.insertRow(-1);                   // TABLE ROW.
	
		for (var i = 0; i < col.length; i++) {
			var th = document.createElement("th");      // TABLE HEADER.
			th.innerHTML = col[i];
			tr.appendChild(th);
		}
	
		// ADD JSON DATA TO THE TABLE AS ROWS.
		for (var i = 0; i < myBooks.length; i++) {
	
			tr = table.insertRow(-1);
	
			for (var j = 0; j < col.length; j++) {
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = myBooks[i][col[j]];
			}
		}
	
		// FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
		var divContainer = document.getElementById("liveData");
		divContainer.innerHTML = "";
		divContainer.appendChild(table);
	}
});


// 1. Server
// Run your server.js by
// node server.js

// 2. Client
// Local web server
// http-server  -p 8059 -c-1
// open the index.html
