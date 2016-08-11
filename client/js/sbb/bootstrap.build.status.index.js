require.config({
    baseUrl: '/build-status',
	waitSeconds : 20,
	paths: {
        jquery: [/*'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js',*/ 'client/js/lib/jquery-2.1.4.min'],
		datatables: 'client/js/lib/datatables.min',
		underscore: 'client/js/lib/underscore-1.8.3',
		favico: 'client/js/lib/favico-0.3.10.min',
		moment: 'client/js/lib/moment.min',
		image: 'client/js/lib/require-image',
		cssloader: 'client/js/sbb/cssloader',
		favloader: 'client/js/sbb/favloader',
		index: 'client/js/sbb/index',
    },
});

require(['index', 'cssloader'], function (Index, cssloader) {
	console.log("Running bootstrap...");
    var cssdatatables = require.toUrl("client/css/datatables.min.css");
	//var favicon32x32 = require.toUrl("client/favicons/favicon-32x32.png");
	//var favicon96x96 = require.toUrl("client/favicons/favicon-96x96.png");
	//favloader.link(favicon32x32);
	//favloader.link(favicon96x96);
    cssloader.link(cssdatatables);
	new Index();
	requirejs.onError = function (err) {
		console.log(err.requireType);
		if (err.requireType === 'timeout') {
			console.log('modules: ' + err.requireModules);
		}
		throw err;
	};
});
	
