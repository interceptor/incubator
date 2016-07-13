define(function () {
	console.log('Loading module Check...');
	
	var Check = function(clusterName, releaseGroup, urls) {
		console.log('instatiating Check of module check...');
		this.clusterName = clusterName;
		this.releaseGroup = releaseGroup;
		this.urls = urls;
	};
	
	return Check;
});