module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'sass',
		'concat',
		'watch'
	]);

};
