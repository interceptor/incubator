define(function (require) {
	var IndexPageDataSetGenerated = require('indexPageDataSet.js');
	$(document).ready(function() {
		var indexPageData = new IndexPageDataSetGenerated();
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