module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'clean',
		'sass',
		'concat',
		'copy',
		'spelunk',
		'requirejs'
	]);

};
