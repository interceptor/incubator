define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	return function () {
		$(document).ready(function() {
			$('#build-status-index').DataTable( {
				"paging": false,
				"processing": true,
				"ajax": {
					"url": "indexPageData.json",
					"dataSrc": "data"
				},
				"columns": [
					{title: "Mega/Stage", "tableData": "mega"},
					{title: "Snapshot", "tableData": "snapshot"},
					{title: "Stabil", "tableData": "stabil"},
					{title: "Edut", "tableData": "edut"},
					{title: "Test", "tableData": "test"},
					{title: "Integration", "tableData": "integration"},
					{title: "Schulung", "tableData": "schulung"},
					{title: "Produktion", "tableData": "produktion"}
				],
				columnDefs: [
					{"targets": '_all', defaultContent: "-" },
					{
					"targets": '_all',
					"data": "download_link",
					"render": function (data, type, full, meta) {return '<a href="' + data + '">Download</a>';}
					}
				]
			});
		});
	};
});