module.exports = {
	html: {
		files: 'src/*.html',
		tasks: 'concat:html'
	},
	sass: {
		files: [ 'src/scss/**/*.scss', 'shared/scss/**/*.scss' ],
		tasks: [ 'sass' ]
	},
	copy: {
		files: [ 'src/**/*', '!src/scss/**', '!src/js/**' ],
		tasks: [ 'copy' ]
	},
	js: {
		files: [ 'src/js/**/*', 'shared/js/**/*.js', 'shared/components/**' ],
		tasks: 'requirejs'
	},
	data: {
		files: 'src/data/**',
		tasks: 'spelunk'
	}
};
