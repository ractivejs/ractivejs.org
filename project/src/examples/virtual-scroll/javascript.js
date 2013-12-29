var InfiniteList, fetch, add, stream, ready, baseUrl, newestId, oldestId, pendingNewerRequest, pendingOlderRequest;

// First, the reusable stuff...
// ============================

// We extend Ractive with some logic that fires custom events - a fetchNewer
// event at regular intervals, and a fetchOlder event when we get to the bottom
// of the list
InfiniteList = Ractive.extend({
	template: template,

	totalHeight: 0,
	offsetIndex: [],
	firstVisible: 0,
	lastVisible: 0,

	data: {
		paddingBefore: 0,
		paddingAfter: 0,
		renderedPosts: [],
		allPosts: []
	},

	init: function ( options ) {
		var self = this, threshold, interval, intervalId, topBuffer, bottomBuffer, dirty, makeDirty, stopScrolling;

		// refresh when user gets within 3000px of the bottom by default. That sounds
		// like a lot, but 2000px of that is padding, and it prevents the page jumping
		// around by making it hard for the user to reach the bottom (at which point
		// the body would start scrolling, awkwardly)
		this.scrollThreshold = options.scrollThreshold || 1000;

		// display posts just outside the visible window - makes everything smoother
		this.topBuffer = 500;
		this.bottomBuffer = 500;

		// poll every 30 seconds by default
		interval = ( options.pollInterval === 0 ? 0 : options.pollInterval || 30000 );

		// start polling, unless it was disabled with pollInterval: 0
		if ( interval ) {
			intervalId = setInterval( function () {
				self.fire( 'fetchNewer' );
			}, interval );
		}

		this.scroller = this.find( '.scroller' );
		this.stream = this.find( '.stream' );

		this.before = this.find( '.before' );
		this.renderedPosts = this.find( '.renderedPosts' );
		this.after = this.find( '.after' );

		this.staging = this.find( '.staging' );

		this.positionHelper = this.find( '.positionHelper' );

		stopScrolling = function () {
			var scrollerBottom;

			console.log( 'stopped Scrolling' );

			self.scrolling = false;
			console.group( 'stopped scrolling' );
			self.determineVisiblePosts();

			self.testBottom();
			console.groupEnd();
		};

		// respond to events
		this.on({
			// when the user scrolls the scroller, see if we're near the bottom
			scroll: function ( event ) {
				var scrollerBottom, listBottom, upperBound, lowerBound;

				clearTimeout( this.scrollTimeout );

				this.scrolling = true;
				this.scrollTimeout = setTimeout( stopScrolling );

				if ( dirty ) {
					this.scrollerBoundingClientRect = this.scroller.getBoundingClientRect();
					dirty = false;
				}

				this.streamBoundingClientRect = this.stream.getBoundingClientRect();
				this.positionHelperBoundingClientRect = this.positionHelper.getBoundingClientRect();

				this.testBottom();

				this.determineVisiblePosts();
			},

			showNewer: function () {
				this.showNewer();
			},

			// if this gets torn down, we clean up after ourselves and stop polling
			teardown: function () {
				clearInterval( intervalId );
			}
		});

		makeDirty = function () {
			dirty = true;
		};

		window.addEventListener( 'scroll', makeDirty );
		window.addEventListener( 'resize', makeDirty );
		makeDirty();


		// set up an offset index, to enable virtual scrolling
		this.offsetIndex = [];
	},

	// if we're near the bottom of the list, fetch some more data
	testBottom: function () {
		var scrollerBottom, position;

		console.log( 'testing bottom' );

		scrollerBottom = this.scrollerBoundingClientRect.bottom;
		position = this.positionHelper.getBoundingClientRect().bottom;

		if ( position - scrollerBottom < this.scrollThreshold ) {
			console.log( 'threshold reached:', position - scrollerBottom );

			// we need request some more data
			this.fire( 'fetchOlder' );
		}
	},

	determineVisiblePosts: function () {
		var upperBound, lowerBound, i, len, offset, firstVisible, lastVisible, lastVisibleBottom;

		if ( this.scrolling ) {
			return;
		}

		// figure out which posts should be visible
		upperBound = ( this.scrollerBoundingClientRect.top - this.topBuffer ) - this.streamBoundingClientRect.top;
		lowerBound = ( this.scrollerBoundingClientRect.bottom + this.bottomBuffer ) - this.streamBoundingClientRect.top;

		len = i = this.offsetIndex.length;

		while ( i-- ) {
			offset = this.offsetIndex[i];

			if ( offset < lowerBound ) {
				lastVisible = i + 1;
				break;
			}
		}

		i = -1;
		while ( i++ < len ) {
			offset = this.offsetIndex[i];

			if ( offset > upperBound ) {
				firstVisible = i - 1;
				break;
			}
		}

		if ( firstVisible < 0 ) {
			firstVisible = 0;
		}

		if ( lastVisible > len - 1 ) {
			lastVisible = this.get( 'allPosts' ).length - 1;
		}

		if ( firstVisible !== this.firstVisible ) {
			this.setFirstVisible( firstVisible, lastVisible );
		}

		if ( lastVisible !== this.lastVisible ) {
			this.setLastVisible( lastVisible, firstVisible );
		}

		console.log( 'this.scrolling?', this.scrolling );
		if ( !this.scrolling ) {
			// pad the list accordingly
			this.set( 'paddingBefore', this.offsetIndex[ firstVisible ] );
		

			lastVisibleBottom = ( lastVisible >= this.offsetIndex.length - 1 ? this.totalHeight : this.offsetIndex[ lastVisible + 1 ] );

			console.log( 'lastVisibleBottom', lastVisibleBottom );
			console.log( 'paddingAfter', this.totalHeight - lastVisibleBottom );

			this.set( 'paddingAfter', this.totalHeight - lastVisibleBottom );
		}
	},

	setPosts: function ( posts ) {
		this.set( 'renderedPosts', posts );

		this.set( 'allPosts', posts.slice() );

		// find offsets for each post
		this.updateOffsetIndex();

		this.firstVisible = 0;
		this.lastVisible = posts.length - 1;
	},

	addNewer: function ( newerPosts ) {
		var existing = stream.get( 'newer' ) || [];

		newer = newerPosts.concat( existing );

		this.set( 'newer', newer );
	},

	showNewer: function () {
		var renderedPosts, newerPosts, allPosts, stagingHeight;

		renderedPosts = stream.get( 'renderedPosts' );
		newerPosts = this.get( 'newer' );
		allPosts = this.get( 'allPosts' );

		this.firstVisible += newerPosts.length;
		this.lastVisible += newerPosts.length;

		this.set( 'allPosts', newerPosts.concat( allPosts ) );

		// update offset index. first, stage the new posts
		this.set( 'staging', newerPosts );
		stagingHeight = this.staging.clientHeight;

		this.add( 'paddingBefore', stagingHeight );

		this.totalHeight += stagingHeight;
		this.offsetIndex = this.getOffsetIndexFromStaging().concat( this.offsetIndex.map( add( stagingHeight ) ) );

		this.set( 'staging', null );

		// renderedPosts.unshift.apply( renderedPosts, stream.get( 'newer' ) );
		this.set( 'newer', [] );
		// this.set( 'renderedPosts', this.get( 'allPosts' ).slice( 0, 20 ) );

		this.scroller.scrollTop = 0;


		// update visible posts
		this.fire( 'scroll' );
	},

	addOlder: function ( olderPosts ) {

		this.set( 'staging', olderPosts );

		this.totalHeight += this.staging.clientHeight;
		this.offsetIndex = this.offsetIndex.concat( this.getOffsetIndexFromStaging( this.staging.offsetTop ) );

		this.set( 'staging', null );

		this.set( 'allPosts', this.get( 'allPosts' ).concat( olderPosts ) );
		// check rendered posts are correct

		this.fire( 'scroll' );
		this.testBottom();
	},

	getOffsetIndexFromStaging: function ( startPosition ) {
		var listItems, li, i, offsetIndex;

		startPosition = startPosition || 0;

		listItems = this.staging.children;
		i = listItems.length;

		offsetIndex = [];
		
		while ( i-- ) {
			li = listItems[i];

			offsetIndex[i] = li.offsetTop + startPosition;
		}

		return offsetIndex;
	},

	updateOffsetIndex: function () {
		var listItems, li, i, offsetTop, startIndex, startPosition;

		startIndex = this.get( 'allPosts.length' ) || 0;
		startPosition = this.staging.offsetTop;

		this.endPosition = startPosition + this.staging.offsetHeight;

		listItems = this.staging.children;
		i = listItems.length;
		
		while ( i-- ) {
			li = listItems[i];

			this.offsetIndex[ i + startIndex ] = li.offsetTop + startPosition;
		}
	},

	setFirstVisible: function ( firstVisible, lastVisible ) {
		var posts = this.get( 'renderedPosts' );

		if ( firstVisible < this.firstVisible ) {
			// one or more posts need to be inserted at the top
			posts.unshift.apply( posts, this.get( 'allPosts' ).slice( firstVisible, Math.min( this.firstVisible, lastVisible ) ) );
		}

		else if ( !this.scrolling ) {
			// one or more posts need to be removed from the top
			posts.splice( 0, Math.min( firstVisible - this.firstVisible, posts.length ) );
		}

		
		
		this.firstVisible = firstVisible;
	},

	setLastVisible: function ( lastVisible, firstVisible ) {
		var posts = this.get( 'renderedPosts' ), listHeight, lastVisibleBottom;

		if ( lastVisible > this.lastVisible ) {
			// one or more posts need to be inserted at the bottom
			posts.push.apply( posts, this.get( 'allPosts' ).slice( Math.max( firstVisible, this.lastVisible ), lastVisible ) );
		}

		else {
			// one or more posts need to be removed from the bottom
			posts.splice( Math.max( 0, lastVisible - this.firstVisible ) );
		}

		
		
		this.lastVisible = lastVisible;
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

add = function ( a ) {
	return function ( b ) {
		return a + b;
	};
};


// Then, the app-specific, harder to reuse logic
// =============================================


// The API endpoint for the App.net global stream
baseUrl = 'https://alpha-api.app.net/stream/0/posts/stream/global';


// Instantiate our InfiniteList class
stream = new InfiniteList({
	el: example,
	pollInterval: 20000, // poll every 20 seconds
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
			var newerPosts = response.data || [];

			if ( newerPosts[0] ) {
				newestId = newerPosts[0].id;
			}

			stream.addNewer( newerPosts );

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
			if ( !response.data ) {
				console.log( 'No data: ', response );
				return;
			}

			stream.addOlder( response.data );

			oldestId = response.data[ response.data.length - 1 ].id;
			
			pendingOlderRequest = false;
			stream.set( 'error', false );
		}, function () {
			pendingOlderRequest = false;
			stream.set( 'error', true );
		});
	}
});


// Load the first batch of posts
fetch( baseUrl, function ( response ) {
	var posts = response.data;

	newestId = posts[0].id;
	oldestId = posts[ posts.length - 1 ].id;

	stream.addOlder( posts );

	ready = true;
}, function () {
	stream.set( 'error', true );
});