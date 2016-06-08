define(function (require) {
	var IndexPageDataSet = require('indexPageDataSet.js');
	var indexPageData = new IndexPageDataSet();
	$(document).ready(function() {
		$('#build-status-index').DataTable( {
			"paging": false,
			"data": indexPageData.indexPageDataSet,
			"columns": [
				{title: "Snapshot"},
				{title: "Stabil"},
				{title: "Edu-T"},
				{title: "Test"},
				{title: "Integration"},
				{title: "Schulung"},
				{title: "Produktion"},
			]
		});
	});
});