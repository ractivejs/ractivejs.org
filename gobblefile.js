var path = require( 'path' );
var sander = require( 'sander' );
var gobble = require( 'gobble' );

var common = gobble( 'node_modules/ractive-www' );
var components = gobble([ 'src/components', common.grab( 'components' ) ]).moveTo( 'components' );
var data = gobble( 'src/data' ).transform( 'spelunk', { type: 'es6', dest: 'data.js' });

module.exports = gobble([

	// static stuff
	gobble( 'src/root' ),

	common.grab( 'assets' ).moveTo( 'assets' ),

	gobble([
		'src/scss',
		common.grab( 'scss' ).moveTo( 'common' )
	])
		.transform( 'sass', { src: 'main.scss', dest: 'main.css' }),

	// render pages
	gobble([
		'src/pages',
		components
	])
		.transform( 'ractive', { type: 'cjs' })
		.transform( function ( inputdir, outputdir, options ) {
			return sander.readdir( inputdir ).then( function ( files ) {
				var promises = files.map( function ( file ) {
					if ( !/\.js$/.test( file ) ) return;

					var Component = require( path.join( inputdir, file ) );
					var html = new Component().toHTML();

					return sander.writeFile( outputdir, file.replace( '.js', '.html' ), html );
				});

				return Promise.all( promises );
			});
		}),

	// javascript
	gobble([ 'src/js', components, data ])
		.transform( 'ractive', { type: 'es6' })
		.transform( 'babel', {
			whitelist: [
				'es6.arrowFunctions',
				'es6.blockScoping',
				'es6.classes',
				'es6.constants',
				'es6.destructuring',
				'es6.parameters.default',
				'es6.parameters.rest',
				'es6.properties.shorthand',
				'es6.spread',
				'es6.templateLiterals'
			]
		})
		.transform( 'esperanto-bundle', {
			entry: 'app',
			type: 'cjs'
		})
		.transform( 'derequire' )
		.transform( 'browserify', {
			entries: [ './app' ],
			dest: 'app.js',
			debug: true,
			standalone: 'app'
		})

]);
