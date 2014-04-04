module.exports = {
	compile: {
		options: {
			out: 'build/js/main.js',
			baseUrl: 'src/js/',
			name: 'main',
			optimize: '<%= prod ? "uglify2" : "none" %>',
			logLevel: 1,
			keepBuildDir: true,

			paths: '<%= paths %>'
		}
	}
};
