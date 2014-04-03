module.exports = {
	options: {
		process: true
	},
	html: {
		files: [{
			cwd: 'src/',
			dest: 'build/',
			expand: true,
			src: '*.html'
		}]
	}
};
