var ractive, converter, sampleComments;

// make a markdown converter using the Showdown library -
// https://github.com/coreyti/showdown
converter = new Showdown.converter();

// populate our app with some sample comments
sampleComments = [
	{ author: 'Rich', text: 'FIRST!!!' },
	{ author: 'anonymous', text: 'I disagree with the previous commenter' },
	{ author: 'Samuel L. Ipsum', text: "If they don't know, that means we never told anyone. And if we never told anyone it means we never made it back. Hence we die down here. Just as a matter of deductive logic.\n\nYou think water moves fast? You should see ice. It moves like it has a mind. Like it knows it killed the world once and got a taste for murder." },
	{ author: 'Jon Grubber', text: '**Hey you guys!** I can use [markdown](http://daringfireball.net/projects/markdown/) in my posts' }
];

ractive = new Ractive({
	el: example,
	template: template,
	noIntro: true, // disable transitions during initial render
	data: {
		comments: sampleComments,
		renderMarkdown: function ( md ) {
			return converter.makeHtml( md );
		}
	}
});

ractive.on( 'post', function ( event ) {
	var comment;

	// stop the page reloading
	event.original.preventDefault();

	// we can just grab the comment data from the model, since
	// two-way binding is enabled by default
	comment = {
		author: this.get( 'author' ),
		text: this.get( 'text' )
	};

	this.get( 'comments' ).push( comment );

	// reset the form
	document.activeElement.blur();
	this.set({ author: '', text: '' });

	// fire an event so we can (for example) save the comment to a server
	this.fire( 'new comment', comment );
});