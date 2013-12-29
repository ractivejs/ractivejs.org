var ractive, Film, Actor, Director, Films, getCollectionFromData, xhr;

// First, we render our view
ractive = new Ractive({
	el: example,
	template: template,
	
	// This is how we tell Ractive to keep an eye out for Backbone objects
	adaptors: [ 'Backbone' ]
});

ractive.on({
	select: function ( event, film ) {
		// `film` is a Backbone model
		this.set( 'selectedFilm', film );
	},
	highlight: function ( event, talent ) {
		// `talent` is a Backbone model (either an Actor or Director)
		console.group();
		talent.set( 'highlighted', event.hover ); // true on mouseover, false on mouseout
		console.groupEnd();
	}
});


// Next, we create some Backbone.Model subclasses. In this case they're very
// simple, and we could just use the unextended Backbone.Model, but it's
// important to note that the adaptor works equally well in either case
Film = Backbone.Model.extend();

Actor = Backbone.Model.extend({
	initialize: function () {
		this.set( 'credits', new Films() );
	}
});

Director = Backbone.Model.extend({
	initialize: function () {
		this.set( 'credits', new Films() );
	}
});

// Create a Backbone.Collection subclass. We'll use this several times.
Films = Backbone.Collection.extend({
	model: Film,
	comparator: function ( film ) {
		return film.get( 'year' ); // sort chronologically
	}
});


// We have some JSON data that we're about to load - here's how we turn it
// into a Backbone collection
getCollectionFromData = function ( data ) {
	var films, actors, directors, mapped;

	actors = {};
	directors = {};

	mapped = data.map( function ( record ) {
		var film, actor, director;

		if ( !actors[ record.actor ] ) {
			actors[ record.actor ] = new Actor({ name: record.actor });
		}

		if ( !directors[ record.director ] ) {
			directors[ record.director ] = new Director({ name: record.director });
		}

		// Overwrite the plain-text actor and director properties of the data
		// with Backbone models representing them
		record.actor = actors[ record.actor ];
		record.director = directors[ record.director ];

		film = new Film( record );

		// Add this film to the actor's and director's credits
		record.actor.get( 'credits' ).add( film );
		record.director.get( 'credits' ).add( film );

		return film;
	});

	return new Films( mapped );
};


// Load the data from a JSON file, then process it
xhr = new XMLHttpRequest();
xhr.open( 'get', 'bond.json' );

xhr.onload = function () {
	var data = JSON.parse( xhr.responseText ), films = getCollectionFromData( data );
	ractive.set({
		films: films,
		selectedFilm: films.get( 'dr-no' )
	});
};

xhr.send();