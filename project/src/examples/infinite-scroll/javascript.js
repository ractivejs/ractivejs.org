var InfiniteList, fetch, stream, ready, baseUrl, newestId, oldestId, pendingNewerRequest, pendingOlderRequest;

// First, the reusable stuff...
// ============================

// We extend Ractive with some logic that fires custom events - a fetchNewer
// event at regular intervals, and a fetchOlder event when we get to the bottom
// of the list
InfiniteList = Ractive.extend({
	template: template,

	init: function ( options ) {
		var self = this, threshold, interval, intervalId;

		// refresh when user gets within 3000px of the bottom by default. That sounds
		// like a lot, but 2000px of that is padding, and it prevents the page jumping
		// around by making it hard for the user to reach the bottom (at which point
		// the body would start scrolling, awkwardly)
		threshold = options.scrollThreshold || 3000;

		// poll every 10 seconds by default
		interval = ( options.pollInterval === 0 ? 0 : options.pollInterval || 10000 );

		// start polling, unless it was disabled with pollInterval: 0
		if ( interval ) {
			intervalId = setInterval( function () {
				self.fire( 'fetchNewer' );
			}, interval );
		}

		this.on({
			// when the user scrolls the scroller, see if we're near the bottom
			scroll: function ( event ) {
				var scrollerBottom, listBottom;

				scrollerBottom = event.node.getBoundingClientRect().bottom;
				listBottom = this.nodes.stream.getBoundingClientRect().bottom;

				if ( listBottom - scrollerBottom < threshold ) {
					// we need request some more data
					this.fire( 'fetchOlder' );
				}
			},

			// if this gets torn down, we clean up after ourselves and stop polling
			teardown: function () {
				clearInterval( intervalId );
			}
		});
	}
});

// This is a simple JSONP helper function, which is also reusable
fetch = function ( url, queryParams, successHandler, errorHandler ) {
	var scr, handlerId;

	// Allow query params to be included or omitted
	if ( typeof queryParams === 'function' ) {
		errorHandler = successHandler;
		successHandler = queryParams;
		queryParams = [];
	} else if ( typeof queryParams === 'string' ) {
		queryParams = [ queryParams ];
	}

	// Create a unique handler ID
	handlerId = 'jsonpHandler_' + Math.floor( Math.random() * 1000000 );

	// Create a global variable, that will be called when we get an
	// API response
	window[ handlerId ] = function ( response ) {
		
		// Fire the callback
		successHandler( response );
		
		// Tidy up
		window[ handlerId ] = null;
		scr.parentNode.removeChild( scr );
	};

	// Create a script element
	scr = document.createElement( 'script' );
	scr.onerror = errorHandler;

	// Add our unique handler ID to the query string
	queryParams.push( 'callback=' + handlerId );
	scr.src = url + '?' + queryParams.join( '&' );

	// Add the script to the document to trigger the request
	document.body.appendChild( scr );
};


// Then, the app-specific, harder to reuse logic
// =============================================


// The API endpoint for the App.net global stream
baseUrl = 'https://alpha-api.app.net/stream/0/posts/stream/global';


// Instantiate our InfiniteList class
stream = new InfiniteList({
	el: example,
	pollInterval: 5000, // poll every 5 seconds
	data: {
		errorMessage: 'Error loading data from App.net'
	}
});


stream.on({
	fetchNewer: function () {
		
		// Make sure we're not still initialising, and that we're not already
		// making this request
		if ( !ready || pendingNewerRequest ) {
			return;
		}

		pendingNewerRequest = true;

		fetch( baseUrl, 'since_id=' + newestId, function ( response ) {
			var newer, existing = stream.get( 'newer' ) || [];

			newer = ( response.data || [] ).concat( existing );

			if ( newer[0] ) {
				newestId = newer[0].id;
			}

			stream.set( 'newer', newer );

			pendingNewerRequest = false;
			stream.set( 'error', false );
		}, function () {
			pendingNewerRequest = false;
			stream.set( 'error', true );
		});
	},

	fetchOlder: function () {
		
		// As above, only make the request if appropriate
		if ( !ready || pendingOlderRequest ) {
			return;
		}

		pendingOlderRequest = true;

		fetch( baseUrl, 'before_id=' + oldestId, function ( response ) {
			var posts = stream.get( 'posts' );

			posts.push.apply( posts, response.data );

			oldestId = posts[ posts.length - 1 ].id;
			
			pendingOlderRequest = false;
			stream.set( 'error', false );
		}, function () {
			pendingOlderRequest = false;
			stream.set( 'error', true );
		});
	},

	// When the user clicks the 'show newer posts' button, render them
	showNewer: function () {
		var posts = stream.get( 'posts' );

		posts.unshift.apply( posts, stream.get( 'newer' ) );
		stream.set( 'newer', [] );
	}
});


// Load the first batch of posts
fetch( baseUrl, function ( response ) {
	var posts = response.data;

	newestId = posts[0].id;
	oldestId = posts[ posts.length - 1 ].id;

	stream.set( 'posts', posts );

	ready = true;
}, function () {
	stream.set( 'error', true );
});