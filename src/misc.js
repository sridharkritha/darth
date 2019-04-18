


// Namespace using Module Pattern 
// https://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript/
// https://liangwu.wordpress.com/2016/07/11/module-pattern-variations-and-common-practices/
var MISC = (function() {
	/////////////////////////////////////////////////////////////////////////////////
	// Private Members
	//////////////////////////////////////////////////////////////////////////////////////
	var pri;

	return {
	
		///////////////////////////////////////////////////////////////////////////////////
		// Public Members
		//////////////////////////////////////////////////////////////////////////////////

		// Get Session
	// Get the current session information.
	// This API provides the ability to validate a session is still active. A successful response indicates a valid and active
	// session. A 401 response means that the session has expired.
	getSession: function () {
		var options = UTIL.UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/bpapi/rest/security/session';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Account
	// Get the account information for the user currently logged in.
	// This API requires authentication and will return a 401 in case the session expired or no session token is provided.
	getAccount: function () {
		var options = UTIL.UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/account';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Casino Wallet Balance
	// Get the casino wallet balance for the user currently logged in.
	// This API requires authentication and will return a 401 in case the session expired or no session token is provided.
	getCasioWalletBalance: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/bpapi/rest/account/balance';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Sports Wallet Balance
	// Get the new sports balance for the user currently logged in.
	// This API requires authentication and will return a 401 in case the session expired or no session token is provided.
	getSportsWalletBalance: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/account/balance';
		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);
			//console.log(body);
		});
	},

	// Wallet Transfer
	// Transfer a specific balance amount between the wallets. The direction of transfer is determined by signal of the value.
	// Values greater than zero: Executes a transfer from the Casino to the Sports wallet.
	// Values smaller than zero: Executes a transfer from the Sports to the Casino wallet.
	walletTransfer: function () {
		// https://api.matchbook.com/bpapi/rest/account/transfer
	},

	// Get Navigation
	// Get the tree structure used for the navigation of events.
	getNavigation: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/navigation';
		options.qs = { offset: '0', 'per-page': '20'};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			// console.log(body);
		});
	},

	// Get Markets
	getMarkets: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/events/:event_id/markets';
		options.qs = {
			offset: '0',
			'per-page': '20',
			states: 'open,suspended',
			'exchange-type': 'back-lay',
			'odds-type': 'DECIMAL',
			'include-prices': 'false',
			'price-depth': '3',
			'price-mode': 'expanded',
			'minimum-liquidity': '10'
		};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Market
	getMarket: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/events/:event_id/markets/:market_id';
		options.qs = {
				'exchange-type': 'back-lay',
				'odds-type': 'DECIMAL',
				'include-prices': 'false',
				'price-depth': '3',
				'price-mode': 'expanded',
				'minimum-liquidity': '10'
		};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Runners
	getRunners: function (eventId, marketId) {
		var options = UTIL.getDefaultOptions();
		options.qs = {
			states: 'open,suspended',
			'include-withdrawn': 'true',
			'include-prices': 'true',
			'price-depth': '3',
			'price-mode': 'expanded',
			'exchange-type': 'back-lay',
			'odds-type': 'DECIMAL',
			'minimum-liquidity': '10'
		};

		// event id and market id
		options.url = 'https://api.matchbook.com/edge/rest/events/'+ eventId +'/markets/' + marketId + '/runners';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Runner
	getRunner: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/events/:event_id/markets/:market_id/runners/:runner_id';
		options.qs = {
			'include-prices': 'false',
			'price-depth': '3',
			'price-mode': 'expanded',
			'exchange-type': 'back-lay',
			'odds-type': 'DECIMAL',
			'minimum-liquidity': '10'
		};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Prices
	getPrices: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/events/:event_id/markets/:market_id/runners/:runner_id/prices';
		options.qs = {
				'exchange-type': 'back-lay',
				'odds-type': 'DECIMAL',
				depth: '3',
				'minimum-liquidity': '10',
				'price-mode': 'expanded'
		};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Popular Markets
	getPopularMarkets: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/popular-markets';
		options.qs = {
			'exchange-type': 'back-lay',
			'odds-type': 'DECIMAL',
			'price-depth': '3',
			'price-mode': 'expanded',
			'minimum-liquidity': '10',
			'old-format': 'false'
		};		

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Popular Sports
	getPopularSports: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/popular/sports';
		options.qs = { 'num-sports': '5' };

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;
		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	///////////////////// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



	
	// Edit Offers
	// Update the odds or the remaining stake on one or more unmatched offers.
	editOffers: function () {
		// https://api.matchbook.com/edge/rest/v2/offers
	},

	//  Edit Offer
	//  Update the odds or stake on an unmatched offer.
	editOffer: function () {
		// https://api.matchbook.com/edge/rest/v2/offers/:offer_id
	},

	// Cancel Offers
	// Cancel some or all of your open offers.
	cancelOffers: function () {
		var options = UTIL.getDefaultOptions();
		options.method = 'DELETE';
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Cancel Offer
	// Cancel a specific unmatched offer.
	cancelOffer: function () {
		var options = UTIL.getDefaultOptions();
		options.method = 'DELETE';
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers/:offer_id';
		
		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Offers
	// Get the current unsettled offers. This can include offers in all statuses.
	getOffers: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers';
		options.qs = { offset: '0', 'per-page': '20', 'include-edits': 'false' };

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Offer
	// Get a single specific unsettled offer.
	getOffer: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers/:offer_id';
		options.qs = { offset: '0', 'per-page': '20', 'include-edits': 'false' };

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Offer Edits
	// Get a single specific unsettled offer.
	getOfferEdits: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers/:offer_id/offer-edits';
		options.qs = { offset: '0', 'per-page': '20' };

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Offer Edit
	// Get a single specific unsettled offer.
	getOfferEdit:  function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/v2/offers/:offer_id/offer-edits/:offer_edit_id';		

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Old Wallet Transactions
	// Get a list of transactions on the old Matchbook wallet.
	getOldWalletTransactions: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/bpapi/rest/reports/transactions';
		options.qs = { offset: '0', 'per-page': '20', categories: 'categories'};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get New Wallet Transactions
	// Get a list of transactions on the New Matchbook wallet.
	getNewWalletTransactions: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/reports/v1/transactions';
		options.qs = { offset: '0', 'per-page': '20'};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},


	// Get Current Offers
	// Get a list of current offers i.e. offers on markets yet to be settled.
	getCurrentOffers: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/reports/v2/offers/current';
		options.qs = { offset: '0', 'per-page': '20', 'odds-type': 'DECIMAL'};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Current Bets
	// Get a list of current bets i.e. bets on markets yet to be settled.
	getCurrentBets: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/reports/v2/bets/current';
		options.qs = { offset: '0', 'per-page': '20', 'odds-type': 'DECIMAL'};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Settled Bets
	getSettledBets: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/edge/rest/reports/v2/bets/settled';
		options.qs = { offset: '0', 'per-page': '20', 'odds-type': 'DECIMAL'};

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Countries
	// Get the list of countries used for account registration.
	getCountries: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/bpapi/rest/lookups/countries';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Regions
	// Get the list of regions within a Country for account registration.
	getRegions: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/bpapi/rest/lookups/regions/:country_id';

		// Cookie data for maintaining the session
		options.headers['session-token'] = sessionToken;

		request(options, function (error, response, body) {
			if (error) throw new Error(error);

			//console.log(body);
		});
	},

	// Get Currencies
	// Get the list of currencies supported by Matchbook.
	getCurrencies: function () {
		var options = UTIL.getDefaultOptions();
		options.url = 'https://api.matchbook.com/bpapi/rest/lookups/currencies';

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
module.exports.getSession = MISC.getSession;
module.exports.getAccount = MISC.getAccount;
module.exports.getCasioWalletBalance = MISC.getCasioWalletBalance;
module.exports.getSportsWalletBalance = MISC.getSportsWalletBalance;
module.exports.walletTransfer = MISC.walletTransfer;
module.exports.getNavigation = MISC.getNavigation;
module.exports.getMarkets = MISC.getMarkets;
module.exports.getMarket = MISC.getMarket;
module.exports.getRunners = MISC.getRunners;
module.exports.getRunner = MISC.getRunner;
module.exports.getPrices = MISC.getPrices;
module.exports.getPopularMarkets = MISC.getPopularMarkets;
module.exports.getPopularSports = MISC.getPopularSports;
module.exports.editOffers = MISC.editOffers;
module.exports.editOffer = MISC.editOffer;
module.exports.cancelOffers = MISC.cancelOffers;
module.exports.cancelOffer = MISC.cancelOffer;
module.exports.getOffers = MISC.getOffers;
module.exports.getOffer = MISC.getOffer;
module.exports.getOfferEdits = MISC.getOfferEdits;
module.exports.getOfferEdit = MISC.getOfferEdit;
module.exports.getOldWalletTransactions = MISC.getOldWalletTransactions;
module.exports.getNewWalletTransactions = MISC.getNewWalletTransactions;
module.exports.getCurrentOffers = MISC.getCurrentOffers;
module.exports.getCurrentBets = MISC.getCurrentBets;
module.exports.getSettledBets = MISC.getSettledBets;
module.exports.getCountries = MISC.getCountries;
module.exports.getRegions = MISC.getRegions;
module.exports.getCurrencies = MISC.getCurrencies;
