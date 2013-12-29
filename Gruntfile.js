/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		watch: {
			sass: {
				files: 'project/styles/**/*.scss',
				tasks: [ 'sass' ]
			},
			copy: {
				files: 'project/src/**/*',
				tasks: [ 'clean', 'copy', 'sass' ]
			}
		},

		sass: {
			options: { style: 'compressed' },
			styles: {
				files: {
					'build/min.css': 'project/styles/**/*.scss'
				}
			}
		},

		clean: {
			files: 'build/*'
		},

		copy: {
			example: {
				files: [{expand: true, cwd: 'project/src/', src: ['**/*'], dest: 'build/'}]
			}
		}


	});

	grunt.loadNpmTasks( 'grunt-contrib-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	grunt.registerTask('default', [ 'sass', 'copy', 'watch' ]);
	grunt.registerTask( 'build', [ 'clean', 'default' ] );

};
