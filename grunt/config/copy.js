module.exports = {
	assets: {
		files: [{
			cwd: 'shared/assets/',
			expand: true,
			src: '**',
			dest: 'build/assets/'
		}]
	},
	requirejs: {
		src: 'shared/js/require.js',
		dest: 'build/js/require.js'
	}
};
