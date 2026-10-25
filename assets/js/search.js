/**
 * Header search palette ("The Desk"). Loaded by app.js the first time someone opens search
 * (the Search button, / or Cmd/Ctrl+K), so it costs nothing on page load.
 *
 * Search and quick actions (donate, projects, impact, about, report) in one list, with a preview of the highlighted item beside it
 * (a bottom sheet without the preview on phones). Data: NFS_CONFIG.search, with the quick
 * actions inline and the results from GET /wp-json/nfs/v1/search?q= (nfs-core
 * includes/quick-search.php). Help words (help, report, hotline, emergency...) pin the
 * Report human trafficking action first.
 */
( function () {
	if ( window.nfsSearchOpen ) { return; }
	var CFG   = ( window.NFS_CONFIG && window.NFS_CONFIG.search ) || {};
	var URL_  = CFG.url || '/wp-json/nfs/v1/search';
	var HOME  = CFG.all || '/';
	var ACTS  = CFG.actions || [];
	var HELP  = /\b(help|hotline|emergency|trafficked|escape|danger|rescue|report|abuse|i need)\b/i;
	var CAUSE = { ht: 'var(--clay,#c46f49)', eco: 'var(--green,#5b7747)', si: 'var(--teal,#4f8e92)' };
	var ICON  = {
		heart: '<path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
		help: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5m0 3v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
		mic: '<rect x="9" y="4" width="6" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
		doc: '<path d="M7 4h7l4 4v12H7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 13h5M10 16h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
		mail: '<rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="m5 8 7 5 7-5" stroke="currentColor" stroke-width="1.8"/>',
		match: '<path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>',
		story: '<path d="M5 5h14v14H5z" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
		place: '<path d="M12 20s6-5.4 6-10a6 6 0 0 0-12 0c0 4.6 6 10 6 10Z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2" stroke="currentColor" stroke-width="1.8"/>',
		learn: '<path d="M4 8l8-4 8 4-8 4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 10v5c2 2 6 2 8 0v-5" stroke="currentColor" stroke-width="1.8"/>',
		partner: '<circle cx="9" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/><circle cx="16" cy="10" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M4 19c1-3 3-4 5-4s4 1 5 4m-2 0c1-3 2-4 4-4s3.5 1 4.5 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
		page: '<path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8"/><path d="M10 9h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
		all: '<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
	};
	var KIND = { story: 'Story', place: 'Place', learn: 'Explainer', partner: 'Partner', page: 'Page' };

	var root, input, list, pv, count, spin, items = [], active = 0, timer = null, ctrl = null, latest = null, opener = null, seq = 0, lastQ = null;

	function esc( s ) { return String( s == null ? '' : s ).replace( /[&<>"]/g, function ( c ) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ c ]; } ); }
	function hl( text, q ) {
		var t = esc( text ), w = String( q || '' ).toLowerCase().split( /\s+/ ).filter( function ( x ) { return x.length > 1; } )
			.map( function ( x ) { return x.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ); } );
		return w.length ? t.replace( new RegExp( '(' + w.join( '|' ) + ')', 'gi' ), '<mark>$1</mark>' ) : t;
	}
	function ico( name, cls ) { return '<span class="qs-ic' + ( cls ? ' ' + cls : '' ) + '" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none">' + ( ICON[ name ] || ICON.page ) + '</svg></span>'; }

	function build() {
		root = document.createElement( 'div' );
		root.className = 'qs';
		root.hidden = true;
		root.innerHTML =
			'<div class="qs-scrim" data-qs-close></div>' +
			'<div class="qs-panel" role="dialog" aria-modal="true" aria-label="Search or jump to">' +
				'<div class="qs-field">' + ico( 'all', 'qs-ic-field' ) +
					'<input id="qsInput" type="search" role="combobox" aria-expanded="true" aria-controls="qsList" aria-autocomplete="list" autocomplete="off" spellcheck="false" enterkeyhint="go" placeholder="Search stories, projects and pages…" aria-label="Search the site">' +
					'<span class="qs-spin" hidden aria-hidden="true"></span>' +
					'<button type="button" class="qs-esc" data-qs-close aria-label="Close search"><span class="qs-esc-k">Esc</span><svg class="qs-esc-x" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
				'</div>' +
				'<div class="qs-main"><div class="qs-list" id="qsList" role="listbox" aria-label="Results"></div><aside class="qs-pv" aria-live="polite"></aside></div>' +
				'<div class="qs-foot"><span class="qs-hints"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span></span><span class="qs-count"></span></div>' +
			'</div>';
		document.body.appendChild( root );
		input = root.querySelector( '#qsInput' );
		list  = root.querySelector( '.qs-list' );
		pv    = root.querySelector( '.qs-pv' );
		count = root.querySelector( '.qs-count' );
		spin  = root.querySelector( '.qs-spin' );

		input.addEventListener( 'input', function () { clearTimeout( timer ); timer = setTimeout( query, 160 ); } );
		root.addEventListener( 'click', function ( e ) {
			if ( e.target.closest( '[data-qs-close]' ) ) { close(); return; }
			var r = e.target.closest( '.qs-r' );
			if ( r ) { go( items[ +r.getAttribute( 'data-i' ) ] ); }
		} );
		list.addEventListener( 'mousemove', function ( e ) {
			var r = e.target.closest( '.qs-r' );
			if ( r && +r.getAttribute( 'data-i' ) !== active ) { setActive( +r.getAttribute( 'data-i' ), true ); }
		} );
		root.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key ) { e.preventDefault(); close(); return; }
			if ( 'ArrowDown' === e.key ) { e.preventDefault(); setActive( active + 1 ); return; }
			if ( 'ArrowUp' === e.key ) { e.preventDefault(); setActive( active - 1 ); return; }
			if ( 'Enter' === e.key && e.target === input ) { e.preventDefault(); if ( items[ active ] ) { go( items[ active ] ); } return; }
			if ( 'Tab' === e.key ) { // keep focus inside the dialog
				var f = [].slice.call( root.querySelectorAll( 'input,button,a[href]' ) ).filter( function ( x ) { return null !== x.offsetParent; } );
				if ( ! f.length ) { return; }
				if ( e.shiftKey && document.activeElement === f[ 0 ] ) { e.preventDefault(); f[ f.length - 1 ].focus(); }
				else if ( ! e.shiftKey && document.activeElement === f[ f.length - 1 ] ) { e.preventDefault(); f[ 0 ].focus(); }
			}
		} );
	}

	function go( it ) {
		if ( ! it || ! it.u ) { return; }
		close( true );
		window.location.href = it.u;
	}

	function open( q ) {
		if ( ! root ) { build(); }
		opener = document.activeElement;
		root.hidden = false;
		document.documentElement.classList.add( 'qs-lock' );
		void root.offsetWidth; // start the opening transition from the hidden state
		root.classList.add( 'on' );
		input.value = 'string' === typeof q ? q : ( input.value || '' );
		lastQ = null;
		query();
		setTimeout( function () { input.focus(); input.select(); }, 30 );
	}

	function close( leaving ) {
		if ( ! root || root.hidden ) { return; }
		root.classList.remove( 'on' );
		document.documentElement.classList.remove( 'qs-lock' );
		setTimeout( function () { root.hidden = true; }, 180 );
		if ( ! leaving && opener && opener.focus ) { opener.focus( { preventScroll: true } ); }
	}

	function query() {
		var q = input.value.trim();
		if ( q === lastQ ) { return; }
		lastQ = q;
		if ( q.length < 2 ) {
			if ( latest ) { render( q, latest ); return; }
			render( q, null );
			fetchData( '', function ( d ) { latest = d; if ( input.value.trim().length < 2 ) { render( input.value.trim(), d ); } } );
			return;
		}
		fetchData( q, function ( d ) { if ( input.value.trim() === q ) { render( q, d ); } } );
	}

	function fetchData( q, done ) {
		if ( ctrl ) { ctrl.abort(); }
		ctrl = ( 'AbortController' in window ) ? new AbortController() : null;
		var my = ++seq;
		spin.hidden = false;
		fetch( URL_ + ( URL_.indexOf( '?' ) === -1 ? '?' : '&' ) + 'q=' + encodeURIComponent( q ), { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined } )
			.then( function ( r ) { if ( ! r.ok ) { throw r.status; } return r.json(); } )
			.then( function ( d ) { if ( my === seq ) { spin.hidden = true; done( d ); } } )
			.catch( function ( err ) {
				if ( err && 'AbortError' === err.name ) { return; }
				if ( my === seq ) { spin.hidden = true; done( { q: q, error: 1, stories: [], places: [], learn: [], partners: [], pages: [], total: 0 } ); }
			} );
	}

	function matchAct( a, q ) {
		var hay = ( a.t + ' ' + ( a.k || '' ) ).toLowerCase();
		return q.toLowerCase().split( /\s+/ ).filter( Boolean ).every( function ( w ) { return hay.indexOf( w ) !== -1; } );
	}

	function render( q, d ) {
		var groups = [], help = HELP.test( q );
		if ( q.length < 2 ) {
			groups.push( [ 'Jump to', ACTS.map( function ( a ) { return act( a ); } ) ] );
			if ( d && d.stories && d.stories.length ) { groups.push( [ 'Latest news', d.stories.map( story ) ] ); }
			count.textContent = '';
		} else {
			var acts = ACTS.filter( function ( a ) { return matchAct( a, q ); } );
			if ( help ) {
				var h = ACTS.filter( function ( a ) { return a.help; } )[ 0 ];
				if ( h ) { acts = [ h ].concat( acts.filter( function ( a ) { return a !== h; } ) ); }
			}
			if ( acts.length ) { groups.push( [ 'Actions', acts.map( act ) ] ); }
			if ( d ) {
				if ( d.stories.length ) { groups.push( [ 'Stories', d.stories.map( story ) ] ); }
				if ( d.places.length ) { groups.push( [ 'Places', d.places.map( function ( x ) { return other( x, 'place' ); } ) ] ); }
				if ( d.learn.length ) { groups.push( [ 'Learn', d.learn.map( function ( x ) { return other( x, 'learn' ); } ) ] ); }
				var pp = d.partners.map( function ( x ) { return other( x, 'partner' ); } ).concat( d.pages.map( function ( x ) { return other( x, 'page' ); } ) );
				if ( pp.length ) { groups.push( [ 'Partners and pages', pp ] ); }
				if ( d.total ) { groups.push( [ '', [ { kind: 'all', t: 'See all results for “' + q + '”', s: d.total + ( 1 === d.total ? ' result' : ' results' ), u: HOME + '?s=' + encodeURIComponent( q ), ic: 'all' } ] ] ); }
				count.textContent = d.error ? 'Search is not available right now.' : ( d.total ? d.total + ( 1 === d.total ? ' result' : ' results' ) : '' );
			}
		}
		items = [];
		var html = '';
		groups.forEach( function ( g ) {
			if ( g[ 0 ] ) { html += '<div class="qs-g" role="presentation">' + esc( g[ 0 ] ) + '</div>'; }
			g[ 1 ].forEach( function ( it ) {
				var n = items.length;
				items.push( it );
				html += '<div class="qs-r' + ( 'all' === it.kind ? ' qs-r-all' : '' ) + '" role="option" id="qs-o' + n + '" data-i="' + n + '" aria-selected="false">'
					+ ico( it.ic, it.help ? 'qs-ic-help' : ( 'action' === it.kind ? 'qs-ic-act' : '' ) )
					+ '<span class="qs-tx"><span class="qs-t">' + hl( it.t, 'all' === it.kind ? '' : q ) + '</span><span class="qs-s">' + esc( it.s ) + '</span></span><span class="qs-go" aria-hidden="true">↵</span></div>';
			} );
		} );
		if ( q.length >= 2 && d && ! d.total && ! items.length ) {
			html = '<div class="qs-none"><h3>Nothing matched “' + esc( q ) + '”.</h3><p>Try a broader word, or jump to one of these.</p></div><div class="qs-g">Jump to</div>';
			ACTS.slice( 0, 3 ).forEach( function ( a ) {
				var n = items.length; items.push( act( a ) );
				html += '<div class="qs-r" role="option" id="qs-o' + n + '" data-i="' + n + '" aria-selected="false">' + ico( a.ic, a.help ? 'qs-ic-help' : 'qs-ic-act' ) + '<span class="qs-tx"><span class="qs-t">' + esc( a.t ) + '</span><span class="qs-s">' + esc( a.s ) + '</span></span><span class="qs-go" aria-hidden="true">↵</span></div>';
			} );
		} else if ( q.length >= 2 && d && ! d.total && items.length ) {
			html += '<p class="qs-note">No stories or pages matched “' + esc( q ) + '”.</p>';
		}
		list.innerHTML = html || '<p class="qs-note">Searching…</p>';
		setActive( 0 );
	}

	function act( a ) { return { kind: 'action', t: a.t, s: a.s, u: a.u, ic: a.ic, cta: a.cta, desc: a.desc, help: !! a.help }; }
	function story( s ) { return { kind: 'story', t: s.t, s: ( s.cn ? s.cn + ' · ' : '' ) + s.d, u: s.u, ic: 'story', c: s.c, cn: s.cn, d: s.d, x: s.x, img: s.img }; }
	function other( x, kind ) { return { kind: kind, t: x.t, s: x.s, u: x.u, ic: kind }; }

	function setActive( n, fromMouse ) {
		if ( ! items.length ) { pv.innerHTML = ''; input.removeAttribute( 'aria-activedescendant' ); return; }
		active = ( n + items.length ) % items.length;
		[].forEach.call( list.querySelectorAll( '.qs-r' ), function ( r ) {
			var on = +r.getAttribute( 'data-i' ) === active;
			r.classList.toggle( 'act', on );
			r.setAttribute( 'aria-selected', on ? 'true' : 'false' );
		} );
		var el = document.getElementById( 'qs-o' + active );
		if ( el ) { input.setAttribute( 'aria-activedescendant', el.id ); if ( ! fromMouse ) { el.scrollIntoView( { block: 'nearest' } ); } }
		preview( items[ active ] );
	}

	function preview( it ) {
		var h = '';
		if ( 'story' === it.kind ) {
			// The image and the title are the links (no separate button).
			h = '<a class="qs-pv-img' + ( it.img ? '' : ' qs-pv-ph' ) + '" href="' + esc( it.u ) + '" tabindex="-1" aria-hidden="true"' + ( it.img ? '' : ' style="background:' + ( CAUSE[ it.c ] || 'var(--band)' ) + '"' ) + '>'
				+ ( it.img ? '<img src="' + esc( it.img ) + '" alt="" loading="lazy" decoding="async">' : '' ) + '</a>'
				+ ( it.cn ? '<span class="qs-cause" style="color:' + ( CAUSE[ it.c ] || 'var(--muted)' ) + '">' + esc( it.cn ) + '</span>' : '' )
				+ '<h3><a href="' + esc( it.u ) + '">' + esc( it.t ) + '</a></h3>' + ( it.x ? '<p>' + esc( it.x ) + '</p>' : '' ) + '<span class="qs-meta">' + esc( it.d ) + '</span>';
		} else if ( 'action' === it.kind ) {
			h = '<h3>' + esc( it.t ) + '</h3><p>' + esc( it.desc ) + '</p><a class="qs-btn' + ( it.help ? ' qs-btn-help' : '' ) + '" href="' + esc( it.u ) + '">' + esc( it.cta ) + '</a>';
		} else if ( 'all' === it.kind ) {
			h = '<h3>' + esc( it.t ) + '</h3><p>' + esc( it.s ) + ' across stories, places, explainers, partners and pages.</p><a class="qs-btn qs-btn-ink" href="' + esc( it.u ) + '">See all results</a>';
		} else {
			h = '<span class="qs-meta">' + esc( KIND[ it.kind ] || '' ) + '</span><h3>' + esc( it.t ) + '</h3>' + ( it.s && it.s !== KIND[ it.kind ] ? '<p>' + esc( it.s ) + '</p>' : '' ) + '<a class="qs-btn qs-btn-ink" href="' + esc( it.u ) + '">Open</a>';
		}
		pv.innerHTML = h;
	}

	window.nfsSearchOpen = open;
	window.nfsSearchClose = close;
} )();
