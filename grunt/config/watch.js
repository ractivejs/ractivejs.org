module.exports = {
	sass: {
		files: 'src/scss/**/*.scss',
		tasks: [ 'sass' ]
	},
	copy: {
		files: [ 'src/**/*', '!src/scss/**' ],
		tasks: [ 'clean', 'copy' ]
	}
};
