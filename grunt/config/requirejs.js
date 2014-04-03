module.exports = {
	compile: {
		options: {
			out: 'build/js/main.js',
			baseUrl: 'src/js/',
			name: 'main',
			optimize: 'uglify2',
			logLevel: 2,

			paths: {
				'shared': '../../shared/js'
			}
		}
	}
};
