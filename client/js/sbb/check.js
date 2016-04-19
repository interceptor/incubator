define(function () {
	console.log('Loading module Check...');
	
	var Check = function(clusterName, appName, urls) {
		console.log('instatiating Check of module check...');
		this.clusterName = clusterName;
		this.appName = appName;
		this.urls = urls;
	};
	
	return Check;
});