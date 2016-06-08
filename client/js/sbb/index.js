define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	var IndexPageDataSetGenerated = require('indexPageDataSet.js');
	$(document).ready(function() {
		var indexPageData = new IndexPageDataSetGenerated();
		$('#build-status-index').dataTable( {
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