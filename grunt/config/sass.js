module.exports = {
	options: { style: 'compressed' },
	shared: {
		files: {
			'build/shared.css': 'shared/scss/main.scss'
		}
	},
	main: {
		files: {
			'build/main.css': 'src/scss/main.scss'
		}
	}
};
