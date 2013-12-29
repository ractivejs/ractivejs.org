// create our ractive...
var ractive = new Ractive({
	el: example,
	template: template,
	data: {
		date: new Date(),
		days: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
		months: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
		
		// add suffix to numbers, e.g. 2 -> '2nd', 14 -> '14th'
		addSuffix: function ( num ) {
			// special case - any number ending with 10-19 is suffixed with 'th'
			if ( num % 100 >= 10 && num % 100 <= 19 ) {
				return num + 'th';
			}

			switch ( num % 10 ) {
				case 1: return num + 'st';
				case 2: return num + 'nd';
				case 3: return num + 'rd';
			}

			return num + 'th';
		},

		// ensure all numbers have two digits
		pad: function ( num ) {
			return ( num < 10 ? '0' + num : num );
		},

		// clock face markers - major (every 5 minutes) and minor (every minute)
		major: new Array( 12 ),
		minor: new Array( 60 )
	}
});

// ...then update it once a second
setInterval( function () {
	ractive.set( 'date', new Date() );
}, 1000 );