define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	var IndexPageDataSetGenerated = require('indexPageDataSet.js');
	return function () {
		$(document).ready(function() {
			// var indexPageData = new IndexPageDataSetGenerated();
			$('#build-status-index').dataTable( {
				"paging": false,
				"processing": true,
				// "ajax": indexPageData.indexPageDataSet,
				"ajax": "indexPageData.json",
				"columns": [
					{title: "Mega/Stage", data: "Mega/Stage"},
					{title: "Snapshot", data: "Snapshot"},
					{title: "Stabil", data: "Stabil"},
					{title: "Edut", data: "Edut"},
					{title: "Test", data: "Test"},
					{title: "Integration", data: "Integration"},
					{title: "Schulung", data: "Schulung"},
					{title: "Produktion", data: "Produktion"},
				],
				columnDefs: [
					{targets: '_all', defaultContent: "-" },
				]
			});
		});
	};
});