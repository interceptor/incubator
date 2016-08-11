require.config({
    baseUrl: '/build-status-beta',
	waitSeconds : 20,
	paths: {
        jquery: [/*'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js',*/ 'client/js/lib/jquery-2.1.4.min'],
		underscore: 'client/js/lib/underscore-1.8.3',
		favico: 'client/js/lib/favico-0.3.10.min',
		jqueryui: 'client/js/lib/jquery-ui.min',
		jqueryqtip: 'client/js/lib/jquery.qtip.min',
		store: 'client/js/lib/store.min',
		moment: 'client/js/lib/moment.min',
		checks: 'client/js/sbb/checks-mru',
		checkworker: 'client/js/sbb/fetchCheckWorkerNode',
		image: 'client/js/lib/require-image',
		cssloader: 'client/js/sbb/cssloader',
		favloader: 'client/js/sbb/favloader',
		check: 'client/js/sbb/check',
    },
});

require(['checks', 'cssloader', 'favloader'], function (Checks, cssloader, favloader) {
	console.log("Running bootstrap...");
    var cssbudtable = require.toUrl("client/css/bud-table.css");
	var cssjqueryqtip = require.toUrl("client/css/jquery.qtip.min.css");
	var favicon32x32 = require.toUrl("client/favicons/favicon-32x32.png");
	var favicon96x96 = require.toUrl("client/favicons/favicon-96x96.png");
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
	
