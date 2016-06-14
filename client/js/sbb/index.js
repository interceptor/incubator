define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	return function () {
		$(document).ready(function() {
			$('#build-status-index').DataTable( {
				"paging": false,
				"processing": true,
				"ajax": "indexPageData.json",
				"columns": [
					{title: "Mega/Stage", data: "mega"},
					{title: "Snapshot", data: "snapshot"},
					{title: "Stabil", data: "stabil"},
					{title: "Edut", data: "edut"},
					{title: "Test", data: "test"},
					{title: "Integration", data: "integration"},
					{title: "Schulung", data: "schulung"},
					{title: "Produktion", data: "produktion"},
				],
				"columnDefs": [
					{"targets": '_all', "defaultContent": "-" },
					{
					"targets": '_all',
					"render": function (data, type, row) {
							if (type === "display" ) && data != "-") {
								return '<a href="' + data + '/' + row + '">' + data + '</a>';
							}
						}
					}
				]
			});
		});
	};
});