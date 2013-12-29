var template, mainTemplate, donutTemplate, DonutChart, ractive;

// for the purposes of this demo, we need to extract the bit of the template
// that relates to the donut chart component
template = Ractive.parse( template );

mainTemplate = template.main;
donutTemplate = template.partials.donutchart;

// we use Ractive.extend() to define our donut chart component
DonutChart = Ractive.extend({
	template: donutTemplate,

	init: function ( options ) {
		var self = this, delay = this.get( 'delay' );

		// wait a bit, then animate in
		setTimeout( function () {
			self.animate( 'c', Math.PI * 2, {
				duration: 800,
				easing: 'easeOut'
			});
		}, delay );
	},

	data: {
		c: 0, // we animate from zero to Math.PI * 2 (the number of radians in a circle)

		// some colors. We could equally have passed in some colours via the component's
		// attributes, e.g.
		//
		//     <rv-donutchart colors='{ "Dogs": "#000064", "Cats": "#729d34", "Rabbits": "#5050b4" }' ... />
		//
		// Any data passed through to the component in this fashion gets parsed with JSON.parse(), 
		// or failing that is treated as a string. So the above example is equivalent to the folling
		colors: {
			Dogs: '#000064',
			Cats: '#729d34',
			Rabbits: '#5050b4'
		},

		// process the data so we can turn it into donut segments
		getSegments: function ( data ) {
			var total, start, segments;

			// tally up the total value
			total = data.reduce( function ( previous, current ) {
				return previous + current.value;
			}, 0 );

			// sort data, but clone first so we don't alter the original data
			data = data.slice().sort( function ( a, b ) {
				return b.value - a.value;
			});

			// find the start and end point of each segment
			start = 0;

			segments = data.map( function ( datum ) {
				var size = datum.value / total, end = start + size, segment;

				segment = {
					id: datum.id,
					start: start,
					end: end
				};

				start = end;
				return segment;
			});

			return segments;
		},

		// get an SVG points list for the segment
		getSegmentPoints: function ( segment, innerRadius, outerRadius, c ) {
			var points = [], i, angle, start, end, getPoint;

			start = segment.start * c;
			end = segment.end * c;

			getPoint = function ( angle, radius ) {
				return ( ( radius * Math.sin( angle ) ).toFixed( 2 ) + ',' + ( radius * -Math.cos( angle ) ).toFixed( 2 ) );
			};

			// get points along the outer edge of the segment
			for ( angle = start; angle < end; angle += 0.05 ) {
				points[ points.length ] = getPoint( angle, outerRadius );
			}

			points[ points.length ] = getPoint( end, outerRadius );

			// get points along the inner edge of the segment
			for ( angle = end; angle > start; angle -= 0.05 ) {
				points[ points.length ] = getPoint( angle, innerRadius );
			}

			points[ points.length ] = getPoint( start, innerRadius );

			// join them up as an SVG points list
			return points.join( ' ' );
		}
	}
});


ractive = new Ractive({
	el: example,
	template: mainTemplate,
	data: {
		months: [
			{ name: 'January',   data: [ { id: 'Dogs', value: 4 }, { id: 'Cats', value: 3 }, { id: 'Rabbits', value: 7 } ] },
			{ name: 'February',  data: [ { id: 'Dogs', value: 2 }, { id: 'Cats', value: 7 }, { id: 'Rabbits', value: 3 } ] },
			{ name: 'March',     data: [ { id: 'Dogs', value: 5 }, { id: 'Cats', value: 4 }, { id: 'Rabbits', value: 6 } ] },
			{ name: 'April',     data: [ { id: 'Dogs', value: 6 }, { id: 'Cats', value: 8 }, { id: 'Rabbits', value: 4 } ] },
			{ name: 'May',       data: [ { id: 'Dogs', value: 8 }, { id: 'Cats', value: 9 }, { id: 'Rabbits', value: 5 } ] },
			{ name: 'June',      data: [ { id: 'Dogs', value: 3 }, { id: 'Cats', value: 2 }, { id: 'Rabbits', value: 2 } ] },
			{ name: 'July',      data: [ { id: 'Dogs', value: 4 }, { id: 'Cats', value: 4 }, { id: 'Rabbits', value: 8 } ] },
			{ name: 'August',    data: [ { id: 'Dogs', value: 2 }, { id: 'Cats', value: 5 }, { id: 'Rabbits', value: 9 } ] },
			{ name: 'September', data: [ { id: 'Dogs', value: 3 }, { id: 'Cats', value: 6 }, { id: 'Rabbits', value: 4 } ] },
			{ name: 'October',   data: [ { id: 'Dogs', value: 7 }, { id: 'Cats', value: 2 }, { id: 'Rabbits', value: 7 } ] },
			{ name: 'November',  data: [ { id: 'Dogs', value: 5 }, { id: 'Cats', value: 8 }, { id: 'Rabbits', value: 5 } ] },
			{ name: 'December',  data: [ { id: 'Dogs', value: 1 }, { id: 'Cats', value: 0 }, { id: 'Rabbits', value: 7 } ] }
		]
	},
	
	// this is where we tell Ractive to use the DonutChart constructor for any
	// <rv-donutchart> components
	components: {
		donutchart: DonutChart
	}
});


// when the user hovers over a segment, highlight that segment for
// all the donut charts
ractive.on({
	select: function ( event, id ) {
		if ( event.hover ) {
			this.set( 'id', id );
		} else {
			this.set( 'id', null );
		}
	}
})