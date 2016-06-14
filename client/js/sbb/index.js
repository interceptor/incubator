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
					{title: "Mega/Stage", "data": "mega"},
					{title: "Snapshot", "data": "snapshot"},
					{title: "Stabil", "data": "stabil"},
					{title: "Edut", "data": "edut"},
					{title: "Test", "data": "test"},
					{title: "Integration", "data": "integration"},
					{title: "Schulung", "data": "schulung"},
					{title: "Produktion", "data": "produktion"}
				],
				columnDefs: [
					{"targets": '_all', defaultContent: "-" },
					{
					"targets": '_all',
					// "data": "download_link",
					"render": function (data, type, full, meta) {return '<a href="' + data + '">Download</a>';}
					}
				]
			});
		});
	};
});