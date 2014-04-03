module.exports = {
	html: {
		files: 'src/*.html',
		tasks: 'concat:html'
	},
	sass: {
		files: 'src/scss/**/*.scss',
		tasks: [ 'sass' ]
	},
	copy: {
		files: [ 'src/**/*', '!src/scss/**' ],
		tasks: [ 'clean', 'copy' ]
	}
};
