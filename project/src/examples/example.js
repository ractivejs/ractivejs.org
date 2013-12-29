(function () {

	var promises = {}, info;

	promises = {
		template: reqwest( 'template.html' ),
		css: reqwest({ url: 'styles.css', type: 'text' }),
		javascript: reqwest({ url: 'javascript.js', type: 'text' }),
		libs: reqwest({ url: 'libs.js', type: 'js' }),
		readme: reqwest( 'readme.html' )
	};


	domready( function () {
		var checkin, remaining;

		info = new Ractive({
			el: 'info',
			template: '#infoTemplate',
			data: {
				selected: 'readme'
			}
		});

		info.on( 'select', function ( event, tab ) {
			this.set( 'selected', tab );
		});

		promises.template.then( function ( template ) {
			var scr, libs, onload;

			window.template = template;
			window.example = document.getElementById( 'example' );

			libs = document.createElement( 'script' );
			libs.src = 'libs.js';

			onload = function () {
				scr = document.createElement( 'script' );
				scr.src = 'javascript.js';

				document.body.appendChild( scr );


				info.nodes.template.innerHTML = template.replace( /\t/g, '  ' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /\n/g, '<br>' );
				
				if ( !window.internetExploder ) {
					hljs.highlightBlock( info.nodes.template );
				}
			};

			if ( libs.onload !== undefined ) {
				libs.onload = libs.onerror = onload;
			} else if ( libs.onreadystatechange !== undefined ) {
				libs.onreadystatechange = function () {
					if ( libs.readyState === 'loaded' || libs.readyState === 'complete' ) {
						onload();
					}
				}
			} else {
				throw new Error( 'what the hell kind of browser are you using?!' );
			}

			document.body.appendChild( libs );
		});

		promises.readme.then( function ( readme ) {
			info.nodes.readme.innerHTML = readme;
			
			hljs.tabReplace = '  ';
			hljs.initHighlighting();
		});

		promises.javascript.then( function ( req ) {
			//info.nodes.javascript.innerHTML = req.responseText.replace( /\t/g, '  ' ).replace( /\n/g, '\r\n' );
			info.nodes.javascript.innerHTML = req.responseText.replace( /\t/g, '  ' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /\n/g, '<br>' );
			
			if ( !window.internetExploder ) {
				hljs.highlightBlock( info.nodes.javascript );
			}
		});

		promises.css.then( function ( req ) {
			info.nodes.css.innerHTML = req.responseText.replace( /\t/g, '  ' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /\n/g, '<br>' );
			
			if ( !window.internetExploder ) {
				hljs.highlightBlock( info.nodes.css );
			}
		});
	});
}());