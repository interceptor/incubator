define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	var IndexPageDataSetGenerated = require('indexPageDataSet.js');
	return function () {
		$(document).ready(function() {
			$('#build-status-index').dataTable( {
				"paging": false,
				"processing": true,
				"ajax": "indexPageData.json",
				"columns": [
					{title: "Mega/Stage", ajax: "mega"},
					{title: "Snapshot", ajax: "snapshot"},
					{title: "Stabil", ajax: "stabil"},
					{title: "Edut", ajax: "edut"},
					{title: "Test", ajax: "test"},
					{title: "Integration", ajax: "integration"},
					{title: "Schulung", ajax: "schulung"},
					{title: "Produktion", ajax: "produktion"},
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