(function () {
	// https://developers.matchbook.com/reference
	var request = require('request');
	var fs = require('fs');
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var UTIL = require('./util');
	var DOOR = require('./door');
	var MISC = require('./misc');
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var sri = 0;
	var sessionToken = null;
	var db = {};
	db.sportId = {};
	var predictedWinners = [];
	var successfulBets = null; // array
	var report = [];
	var pastTime = 0;
	var currentTime = 0;
	var betNow = [];
	var sessionExpireTimeLimit = 5 * 60 * 60 * 1000; // 6 hours but create a new session every 5 hours
	var sessionStartTime = 0;
	var sportsList = [];
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	var winConfidencePercentage = 100; // ex: 100  (100% or more)
	var minProfitOdd = 1; // ex: 1 (1/1 = 1 even odd [or] 2.00 in decimal)
	var betMinutesOffset = 1; // place bet: +1 min before the start time, -5 min after the start time
	/*
	var sportsName = ['American Football','Athletics','Australian Rules','Baseball','Basketball','Boxing','Cricket','Cross Sport Special',
	'Cross Sport Specials','Current Events','Cycling','Darts','Gaelic Football','Golf','Greyhound Racing','Horse Racing',
	'Horse Racing (Ante Post)','Horse Racing Beta','Hurling','Ice Hockey'];
	*/
	// ['Horse Racing'];  ['ALL']; ['Cricket']; ['Horse Racing','Greyhound Racing', 'Cricket'];
	var sportsInterested = ['Horse Racing','Greyhound Racing', 'Cricket'];  
	var whichDayEvent = 'today'; // 'today'   or    'tomorrow'
	var isLockedForBetting = true; // true

	if(isLockedForBetting)
	{
		winConfidencePercentage = 10; // ex: 100  (100% or more)
		minProfitOdd = 0.1; // ex: 1 (1/1 = 1 even odd [or] 2.00 in decimal)
		betMinutesOffset = 300; // place bet: +1 min before the start time, -5 min after the start time		
		whichDayEvent = 'today'; // 'today'   or    'tomorrow'
	}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	callbackCount = function(currentCount , totalCount) {
		this.currentCount = currentCount || 0;
		this.totalCount = totalCount || 0;
	};

	isAlreadyBetPlacedEvent = function(eventId) {
		if(successfulBets && successfulBets.length) {
			for(var count  = 0; count < successfulBets.length; ++count) {
				if("event-id" in  successfulBets[count]) {
					if(successfulBets[count]["event-id"] === eventId) 
						return true;
				}
			}
		}
		return false;
	};

	requestResponse = function(options, obj, destObj, keys, filterDay, closureSave, sports_cbCount, callback) {
		request(options, function (error, response, body) {
			if (error) {
				return callback(error, sports_cbCount, null);
			}
			var jsonFormat = JSON.parse(body);

			if (Object.keys(jsonFormat[obj]).length) {
				// not empty
				db.sportId[closureSave][obj] = {};

				for(var key in jsonFormat[obj])
				{
					if( jsonFormat[obj].hasOwnProperty(key))
					{
						key = Number(key);
						var index = keys.indexOf("start");
						var dateString;
	
						if(index !== -1)
						{
							dateString = jsonFormat[obj][key][keys[index]]; // "start": "2019-03-01T16:10:00.000Z"
							var dateObject = new Date(dateString);
							var currentDate;
							if(filterDay === 'today')
							{
								// Thu Feb 28 2019 22:04:39 GMT+0000
								currentDate = new Date();
							}
							else if(filterDay === 'tomorrow')
							{
								// Fri Mar 01 2019 00:04:39 GMT+0000
								var today = new Date();
								var tomorrow = new Date();
								currentDate = new Date(tomorrow.setDate(today.getDate()+1)); // next day
							}
	
							if(dateObject.getDate() !== currentDate.getDate() || dateObject.getMonth() !== currentDate.getMonth()
								|| dateObject.getFullYear() !== currentDate.getFullYear())
							{
								continue; // skip
							}
						}
	
						var name = jsonFormat[obj][key][destObj];
						db.sportId[closureSave][obj][name] = {};
	
						for(var i = 0; i < keys.length; ++i)
						{
							db.sportId[closureSave][obj][name][keys[i]] = jsonFormat[obj][key][keys[i]];
						}
					}
				}
			}
			
			//UTIL.writeJsonFile(body,'event.json');
			// console.log(Object.keys(db.eventId));
			// console.log(body);
			// ++sports_cbCount.currentCount;
			return callback(null, sports_cbCount, closureSave);
		});
	};

	// Get Sports
	// Get the list of sports supported by Matchbook
	getSports = function (callback) {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/lookups/sports';
		options.qs = { offset: '0', 'per-page': '20', order: 'name asc', status: 'active' };

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) {
				return callback(error,null);
			} 

			var jsonFormat = JSON.parse(body);
			var sportsName = null;
			sportsList = [];

			for(var sport in jsonFormat['sports'])
			{
				if( jsonFormat['sports'].hasOwnProperty(sport))
				{
					sport = Number(sport);
					// db.sportId[jsonFormat['sports'][sport].name] = jsonFormat['sports'][sport].id;
					sportsName = jsonFormat['sports'][sport].name;
					sportsList.push(sportsName);
					db.sportId[jsonFormat['sports'][sport].name] = {};
					db.sportId[jsonFormat['sports'][sport].name].id = jsonFormat['sports'][sport].id;
				}
			}

			// UTIL.writeJsonFile(body,'sportsList.json');
			// console.log(body);
			// console.log(Object.keys(db.sportId));
			return callback(null);
		});
	};	

	// Get Events
	// Get a list of events available on Matchbook ordered by start time.
	getEvents = function (sport, sports_cbCount, callback) {
		var sportId = db.sportId[sport];
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/events';
		options.qs = {
			'offset': '0',
			'per-page': '20',
			// 'states': 'open,suspended,closed,graded',
			'states': 'open',
			'exchange-type': 'back-lay',
			'odds-type': 'DECIMAL',
			'include-prices': 'false',
			'price-depth': '3',
			'price-mode': 'expanded',
			'minimum-liquidity': '10',
			'include-event-participants': 'false'
		};		

		if(sportId)
		{
			//options.qs['sport-ids'] = ids;
			//options.qs['ids'] = ids;
			options.url = 'https://api.matchbook.com/edge/rest/events?sport-ids=' + sportId.id;
		}

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		// closure needed for storing the sport name ????
		requestResponse(options, 'events', 'name', ['id','start'], whichDayEvent, sport, sports_cbCount, callback);
	};

	// Get Event
	getEvent = function (event_id, returnFunction) {
		var options = UTIL.getDefaultOptions();
		options.qs = {
			'exchange-type': 'back-lay',
			'odds-type': 'DECIMAL',
			'include-prices': 'false',
			'price-depth': '3',
			'price-mode': 'expanded',
			'minimum-liquidity': '10',
			'include-event-participants': 'false'
		};

		// event id
		options.url = 'https://api.matchbook.com/edge/rest/events/'+event_id;

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) 
			throw new Error(error);

			var jsonFormat = JSON.parse(body);

			var runnersObj = {};

			if(jsonFormat.markets.length)
			//if(jsonFormat.markets.length && (jsonFormat.markets[0].name === 'WIN' || jsonFormat.markets[0].name === 'Winner'))
			{

			var runners = jsonFormat.markets[0].runners;

			for(var runner in runners)
			{
				if(runners.hasOwnProperty(runner))
				{
					runner = Number(runner);
					
					runnersObj[runners[runner].name] = {};
					runnersObj[runners[runner].name].runnerId = runners[runner].id;

					var back = [];
					var lay = [];
					for(var price in runners[runner]['prices'])
					{
						if(runners[runner]['prices'].hasOwnProperty(price))
						{
							if(runners[runner]['prices'][price]['side'] === "back")
							{
								back.push(Number(runners[runner]['prices'][price].odds));
							}
							else if(runners[runner]['prices'][price]['side'] === "lay")
							{
								lay.push(Number(runners[runner]['prices'][price].odds));
							}
						}
					}

					runnersObj[runners[runner].name].back = back.length ? Math.max.apply(null, back): 0;
					runnersObj[runners[runner].name].lay  =  lay.length ? Math.min.apply(null, lay): 0;
				}
			}
		}

			returnFunction(runnersObj); // return the object from the callback function 

			// UTIL.writeJsonFile(body,'runners.json');
			//console.log(Object.keys(runnersObj));
			//console.log(body);
		});
	};

	// {
	// 	"id": 24735152712200,
	// 	"events": {
	// 	  "16:30 Wincanton": {
	// 		"5 Tikkapick": {
	// 		  "runnerId": 1052216604020016,
	// 		  "back": 2.42,
	// 		  "lay": 2.44
	// 		},

	luckyMatchFilter = function(jsonObj, objLevelFilter, callback) {
		predictedWinners = []; 
		for(var prop in jsonObj) {
			if(jsonObj.hasOwnProperty(prop)) {
				if(prop === objLevelFilter) { // events: { }
				for(var race in jsonObj[prop]) { 
					if(jsonObj[prop].hasOwnProperty(race)) { // 15:05 Sandown
						var raceId = jsonObj[prop][race].id;

							// Check if already a successful bet has been placed on that event
							if(!isAlreadyBetPlacedEvent(raceId))
							{
								var startTime = jsonObj[prop][race].start;
								var raceName = race;
								var luckyRunner = [];
								for(var runner in jsonObj[prop][race]) { 
									if(jsonObj[prop][race].hasOwnProperty(runner)) {
										if(typeof jsonObj[prop][race][runner] === "object") {
											var runnerObj = jsonObj[prop][race][runner];
											runnerObj.name = runner;
											var back = jsonObj[prop][race][runner].back;
											if(!back) {
												back = Number.MAX_VALUE;
											}
											luckyRunner.push([back, runnerObj]);
										}
									}
								}
		
								luckyRunner.sort(function(a, b) { return a[0] - b[0]; });
								if(luckyRunner.length > 1)
								{
									// Calculating the win chance by comparing with very next competitor 
									var winPercentage = (luckyRunner[1][0] - luckyRunner[0][0]) * 100 / luckyRunner[0][0];
									luckyRunner[0][1].numberOfRunners = luckyRunner.length;
									// winPercentage = winPercentage + (5 / luckyRunner.length * 6);
									luckyRunner[0][1].winPercentage = winPercentage;
									luckyRunner[0][1].startTime = startTime;
									luckyRunner[0][1].raceId = raceId;
									luckyRunner[0][1].raceName = raceName;
									var profitOdd = luckyRunner[0][1].back - 1;
								
									jsonObj[prop][race].luckyWinner = luckyRunner[0][1]; // first element from an array
		
									// Build the predictedWinner list
									if((winPercentage > winConfidencePercentage) && (profitOdd > minProfitOdd))
									{
										predictedWinners.push(luckyRunner[0][1]);
									}
								}
							}
					}
				}
				}
			}
		}
		betNow = findHotBet(predictedWinners);
		return callback(null, betNow);
	};

	findLuckyMatch = function(jsonObj, objLevelFilter, callback) {
		if(successfulBets) {
			// Read from array
			luckyMatchFilter(jsonObj, objLevelFilter, callback);
		}
		else {
			// Check if a file is exist or not
			fs.open('./data/successfulBets.json', 'r', function(err, fd)
			{
				if(err)
				{
					if(err.code === 'ENOENT')
					{
						// File is not exist, creat a empty file
						fs.closeSync(fs.openSync('./data/successfulBets.json', 'w'));
						successfulBets = [] ;
						luckyMatchFilter(jsonObj, objLevelFilter, callback);
						console.log("Success: ./data/successfulBets.json - created and saved!");
					}
				}
				else
				{
					// File is exist, read from the file (Asynchronous 'json' file read)
					fs.readFile('./data/successfulBets.json', function(err, data) {
						if (err) throw err;
						if(data && data.length) {
							successfulBets = JSON.parse(data);
						}
						else {
							successfulBets = [] ;
						}
						
						luckyMatchFilter(jsonObj, objLevelFilter, callback);
					});
				}
			});
		}
	};

	findHotBet = function(predictedWinners) {
		betNow = [];
		for(var i = 0; i < predictedWinners.length; ++i) {
			var obj = predictedWinners[i];
			var startTime = new Date(obj.startTime);
			var currentTime =  new Date();

			// { 	"runner-id":1052216604020016,
				// 	"side":"back",
				// 	"odds": 2.4,
				// 	"stake": 0.0
			// }

			if( startTime.getDate() === currentTime.getDate() && startTime.getMonth() === currentTime.getMonth() && 
				startTime.getFullYear() === currentTime.getFullYear())
			{
				// betMinutesOffset = 1; // place bet: +1 min before the start time, -5 min after the start time
				if(currentTime.getTime() > (startTime.getTime() - (betMinutesOffset * 60 * 1000)))
				{
					if(!(currentTime.getTime() > startTime.getTime() + 2* 60*1000))
					{
						var betObj = {};

						var fractionNumber = 0;
						fractionNumber = predictedWinners[i].back;
						var numberBeforeDecimalPoint  = Math.floor(fractionNumber); // 2.13453 => 2
						var numberAfterDecimalPoint = (fractionNumber % 1).toFixed(2); // 2.13453 => 0.13
						var roundToNearestDecimalTen = (Math.ceil((((numberAfterDecimalPoint) * 100)+1)/10)*10)/100; // 0.13 = 0.20
						var roundedOdd = numberBeforeDecimalPoint + roundToNearestDecimalTen; // 2.13453 => 2.20

						betObj.odds = roundedOdd; // for reducing the commission charge
						// betObj.odds = predictedWinners[i].back;
						betObj['runner-id'] = predictedWinners[i].runnerId;
					
						betObj.side = 'back';
						betObj.stake = 0.1; // 1.0

						if(isLockedForBetting)
						{
							// mock bet
							betObj['event-id'] = predictedWinners[i].raceId;
							betObj['status'] = 'matched';
							betObj['decimal-odds'] = betObj.odds;
							betObj['event-name'] =  predictedWinners[i].raceName;
							betObj['runner-name'] = predictedWinners[i].name;
						}

						betNow.push(betObj);
					}
				}
			}
		}
		return betNow;
	};

		// Submit Offers
	// Submit one or more offers i.e. your intention or willingness to have bets with other users.
	submitOffers = function (callback) {
		// "16:30 Wincanton": {
		// 	"5 Tikkapick": {
		// 	  "runnerId": 1052216604020016,
		// 	  "back": 2.40,
		// 	  "lay": 2.64
		// 	},

		// var luckyBet = {
		// 	"odds-type":"DECIMAL",
		// 	"exchange-type":"back-lay",
		// 	"offers":
		// 	  [{
		// 		  "runner-id":1052216604020016,
		// 		  "side":"back",
		// 		  "odds": 2.4,
		// 		  "stake": 0.0
		// 	  }
		//   ]};

		// "{"odds-type":"DECIMAL","exchange-type":"back-lay","offers":[{"runner-id":1076420113760015,"odds":1.34482,"side":"back","stake":1}]}"

		var luckyBet = { "odds-type":"DECIMAL", "exchange-type":"back-lay" };
			luckyBet.offers = betNow; // list of bets

		var options = UTIL.getDefaultOptions();
		options.method = 'POST';
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers';
		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;
		// options.json = JSON.stringify(luckyBet); // Bet info
		// options.body = JSON.stringify(luckyBet); // Bet info
		options.json = luckyBet; // Bet info

		if(luckyBet.offers.length) {
			if(!isLockedForBetting) {
				request(options, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						//console.log(response);
						return callback(null, response);
					}
					else {
						console.log(response.statusCode + " Error in bet placed");

						if(response.body.offers) {
							for(var count = 0; count < response.body.offers.length; ++count) {
								console.log(response.body.offers[count].errors);
							}
						}

						return callback(error,null);
					}
				});
			}
			else
			{
				// mock bet placed
				//console.log(response);
				for(var i = 0; i < betNow.length; ++i) {
					var lastBetResult = betNow[i];

					var obj = {   "event-id":lastBetResult['event-id'],
					"status":lastBetResult['status'],
					"decimal-odds":lastBetResult['decimal-odds'],
					"event-name":lastBetResult['event-name'],
					"runner-name":lastBetResult['runner-name'],
					"time": UTIL.getCurrentTimeDate() };
					console.log(obj);
					successfulBets.push(obj);
					
					UTIL.writeJsonFile(successfulBets,'./data/mockSuccessfulBets.json');
				}
			}
		}
	};

	getEventInfo = function(sportName, event, eventId, startTime, sports_cbCount, events_cbCount, callback) {
		getEvent(eventId, function(obj) {
					//console.log(obj);
			
			db.sportId[sportName].events[event] = obj;  /// ?? events --- null
			db.sportId[sportName].events[event].id = eventId;
			db.sportId[sportName].events[event].start = startTime;

			++events_cbCount.currentCount;
			if(events_cbCount.currentCount === events_cbCount.totalCount)
			{
				UTIL.writeJsonFile(db.sportId[sportName],'./data/result.json');

				findLuckyMatch(db.sportId[sportName], "events", function(err, data) {
						if(err){
							console.log(err);
							throw new Error(err);
						}
						else{
							if(data) {
								return callback(null, sports_cbCount, events_cbCount, true);
							}
						}
					});
			}
			return callback(null, sports_cbCount, events_cbCount, false);
		});
	};

	run = function()
	{
		++sri;
		console.log(UTIL.getCurrentTimeDate());
		pastTime = new Date().getTime();

		findSportsIds();
	};

	findSportsIds = function() {
		// input  - null
		// output - sports id - {"name":"Horse Racing","id":24735152712200,"type":"SPORT"}
		// https://api.matchbook.com/edge/rest/lookups/sports
		getSports(callback_getSports);
	};

	callback_getSports = function(err, data) {
		if(err) {
			console.log(err);
			throw new Error(err);
		}
		else{
			if(sportsInterested.length === 1 && sportsInterested[0].toLowerCase() === 'all') {
				sportsInterested = sportsList;
			}

			--sri;
			console.log(sri);


			var sports_cbCount = new callbackCount(0, sportsInterested.length);
			// Calling callback functions inside a loop
			sportsInterested.forEach(function(sport) {
			// input  - sports id
			// output - event id
			// https://api.matchbook.com/edge/rest/events?sport-ids=24735152712200
			// getEvents('24735152712200'); // sportsid
			// getEvents(db.sportId['Horse Racing'], function(err, data) {
			getEvents(sport, sports_cbCount, callback_getEvents);
			}); //forEach
		}
	};

	callback_getEvents = function(err, sports_cbCount, sport) {
		if(err){
			console.log(err);
			console.log("ERROR: TRYING AGAIN BY A NEW REQUEST");
			run();

			// throw new Error(err);
		}
		else{
			if('events' in db.sportId[sport]) {
				// 14:00 Newbury, 14:10 Fontwell, 14:20 Ayr, 14:35 Newbury, 14:40 Fairview...... etc
				var races = Object.keys(db.sportId[sport].events);
				var events_cbCount = new callbackCount(0, races.length);

				races.forEach(function(race) {
					// input  - event id
					// output - id (player)
					// https://api.matchbook.com/edge/rest/events/1033210398700016
					getEventInfo(sport, race, db.sportId[sport].events[race].id, db.sportId[sport].events[race].start, 
									sports_cbCount, events_cbCount, callback_getEventInfo);
				}); //forEach
			}
		}
	};

	callback_getEventInfo = function(err, sports_cbCount, events_cbCount, isReadyForBetting) {
		if(err){
			console.log(err);
			throw new Error(err);
		}

		if(isReadyForBetting) {

			++sports_cbCount.currentCount;

			submitOffers(callback_submitOffers); // sports wise bet submission not as submitting all sports bet in one go.
		// }
		
			if(events_cbCount.totalCount && events_cbCount.currentCount === events_cbCount.totalCount &&
				sports_cbCount.totalCount && sports_cbCount.currentCount === sports_cbCount.totalCount)		
			{
				events_cbCount.currentCount = events_cbCount.totalCount = 0;
				sports_cbCount.currentCount = sports_cbCount.totalCount = 0;

				currentTime = new Date().getTime();
				remainingTime = currentTime - pastTime;
				remainingTime = (1000 - remainingTime) > 0 ? 1000 - remainingTime : 0;
				setTimeout(function() {
					// Check for session expire timeout
					if(currentTime - sessionStartTime > sessionExpireTimeLimit) {
						getNewSession();
					}
					else {
						run();
					}
				}.bind(this), remainingTime);
			}
		}
	};

	callback_submitOffers = function(err, response) {
		if(err){
			console.log(err);
		}
		else{
			//console.log(response);
			for(var i = 0; i < response.body.offers.length; ++i) {
				var lastBetResult = response.body.offers[i];
				if(lastBetResult.status === 'matched' || lastBetResult.status === 'open') {
					var obj = {   "event-id":lastBetResult['event-id'],
					"status":lastBetResult['status'],
					"decimal-odds":lastBetResult['decimal-odds'],
					"event-name":lastBetResult['event-name'],
					"runner-name":lastBetResult['runner-name'],
					"time": UTIL.getCurrentTimeDate() };
					console.log(obj);
					successfulBets.push(obj);
					
					UTIL.writeJsonFile(successfulBets,'./data/successfulBets.json');
				}
			}
		}
	};

	loginCallback = function(err, sessionToken, sessionStartTime) {
		if(err){
			sessionToken = null;
			sessionStartTime = 0;
			console.log(err);
		}
		else{
			sessionToken = sessionToken;
			sessionStartTime = sessionStartTime;
			run();
		} 
	};

	getNewSession = function() {
		DOOR.login(loginCallback); // login
	};

	// Entry Function
	(function () {
		getNewSession();
	})(); // IIF - Main entry (login)
}()); // namespace

/*

mb_get_sports
mb_get_events
mb_get_markets

https://github.com/xanadunf/matchbook


C# Project: https://www.dropbox.com/s/nm32ispvu8jr7hp/BpapiConsoleProject.zip?dl=0

Submit offers:
https://developers.matchbook.com/discuss/5af4eef233a27b0003957a07

Get Events

You can use the Live Betting category or navigation entry to help you with this.
Examples: 
https://www.matchbook.com/edge/rest/events?sport-ids=1&tag-url-names=live-betting&price-depth=0
https://api.matchbook.com/edge/rest/events?sport-ids=8&category-ids=410468520880009
https://api.matchbook.com/edge/rest/events?sport-ids=8&tag-url-names=live-betting
You can get all sport_ids and competitions :
https://api.matchbook.com/edge/rest/navigation


// browserify
npm install -g browserify --save

// Local web server
http-server  -p 8059 -c-1

*/