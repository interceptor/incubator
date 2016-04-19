requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/status-2.0/beta',
	waitSeconds : 20,
	paths: {
        jquery: [/*'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js',*/ 'js/lib/jquery-2.1.4.min'],
		underscore: 'js/lib/underscore-1.8.3',
		favico: 'js/lib/favico-0.3.10.min',
		jqueryui: 'js/lib/jquery-ui.min',
		jqueryqtip: 'js/lib/jquery.qtip.min',
		store: 'js/lib/store.min',
		moment: 'js/lib/moment.min',
		store: 'js/lib/store.min',
		checks: 'js/sbb/checks-mru',
		checkworker: 'js/sbb/fetchCheckWorkerNode',
		image: 'js/lib/require-image',
		cssloader: 'js/sbb/cssloader',
		favloader: 'js/sbb/favloader',
		check: 'js/sbb/check',
    },
	//map: {
		//'*': {
		//'css': 'lib/require-css.min'
		//'css': 'css'
		//}
	//}
	//shim: {
	//	'uri' : {'dep': ['jquery'], 'exports': 'URI'}
	//}
});

require(['checks', 'cssloader', 'favloader'], function (Checks, cssloader, favloader) {
	console.log("Running bootstrap...");
    var cssbudtable = require.toUrl("css/bud-table.css");
	var cssjqueryqtip = require.toUrl("css/jquery.qtip.min.css");
	var favicon32x32 = require.toUrl("favicons/favicon-32x32.png");
	var favicon96x96 = require.toUrl("favicons/favicon-96x96.png");
	favloader.link(favicon32x32);
	favloader.link(favicon96x96);
    cssloader.link(cssbudtable);
	cssloader.link(cssjqueryqtip);
	new Checks();
	requirejs.onError = function (err) {
		console.log(err.requireType);
		if (err.requireType === 'timeout') {
			console.log('modules: ' + err.requireModules);
		}
		throw err;
	};
});
	
