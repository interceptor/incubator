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
					{title: "Mega/Stage", data: "megaStage"},
					{title: "Snapshot", data: "snapshot"},
					{title: "Stabil", data: "stabil"},
					{title: "Edut", data: "edut"},
					{title: "Test", data: "test"},
					{title: "Integration", data: "integration"},
					{title: "Schulung", data: "schulung"},
					{title: "Produktion", data: "produktion"},
				],
				columnDefs: [
					{targets: '_all', defaultContent: "-" },
					{
					"targets": 0,
					"data": "download_link",
					"render": function ( data, type, full, meta ) {return '<a href="'+data+'">Download</a>';}
					}
				]
			});
		});
	};
});