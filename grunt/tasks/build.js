module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'clean',
		'sass',
		'requirejs',
		'concat',
		'copy'
	]);

};
