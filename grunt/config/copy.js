module.exports = {
	shared: {
		files: [{
			cwd: 'shared/assets/',
			expand: true,
			src: '**',
			dest: 'build/assets/'
		}]
	},
	assets: {
		files: [{
			cwd: 'src/assets/',
			expand: true,
			src: '**',
			dest: 'build/assets/'
		}]
	},
	snippets: {
		files: [{
			cwd: 'shared/js/snippets',
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
