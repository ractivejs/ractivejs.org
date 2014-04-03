/* The one-size-fits-all key to Grunt.js happiness - http://bit.ly/grunt-happy */

/*global module:false*/
module.exports = function ( grunt ) {

    'use strict';

    var config, dependency;

    require( 'jit-grunt' )( grunt );

    config = {
        pkg: grunt.file.readJSON( 'package.json' ),

        nav: grunt.file.read( 'shared/partials/nav.html' )
    };

    // Read config files from the `grunt/config/` folder
    grunt.file.expand( 'grunt/config/*.js' ).forEach( function ( path ) {
        var property = /grunt\/config\/(.+)\.js/.exec( path )[1],
            module = require( './' + path );
        config[ property ] = typeof module === 'function' ? module( grunt ) : module;
    });

    // Initialise grunt
    grunt.initConfig( config );

    // Load development dependencies specified in package.json
    for ( dependency in config.pkg.devDependencies ) {
        if ( /^grunt-/.test( dependency) ) {
            grunt.loadNpmTasks( dependency );
        }
    }

    // Load tasks from the `grunt-tasks/` folder
    grunt.loadTasks( 'grunt/tasks' );

};
