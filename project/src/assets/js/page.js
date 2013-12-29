// if CSS transforms aren't supported, don't show the 'fork me' button.
// Quick and dirty detect
style = document.createElement( 'div' ).style;

if ( style.transform !== undefined ) {
	document.body.className += 'transforms-enabled';
} else {
	[ 'webkit', 'moz', 'ms', 'o' ].forEach( function ( vendor ) {
		if ( style[ vendor + 'Transform' ] !== undefined ) {
			document.body.className += 'transforms-enabled';
		}
	});
}

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-5602942-3', 'ractivejs.org');
ga('send', 'pageview');