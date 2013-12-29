var ractive = new Ractive({
	el: example,
	template: template,
	data: {
		rating: 5,
		stars: new Array( 10 ) // just so we have something to iterate over
	}
});

ractive.on({
	select: function ( event, rating ) {
		this.set( 'rating', rating );
	},
	highlight: function ( event, rating ) {
		if ( event.hover ) {
			this.set( 'highlight', rating );
		} else {
			this.set( 'highlight', 0 );
		}
	}
});

// if you wanted to save the rating...
ractive.observe( 'rating', function ( rating ) {
	// jQuery pseudo-code:
	// $.post( backendURL, rating, successHandler );
	console.log( 'saving rating: ', rating );
}, { init: false }); // init: false so it doesn't save until it changes