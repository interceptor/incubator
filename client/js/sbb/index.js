define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	return function () {
		$(document).ready(function() {
			$('#build-status-index').DataTable( {
				"paging": false,
				"searching": false,
				"processing": true,
				"jQueryUI": true,
				"autoWidth": false,
				"ajax": "indexPageData.json",
				"columns": [
					{"title": "Mega/Stage", "data": "mega"},
					{"title": "Snapshot", "data": "snapshot"},
					{"title": "Stabil", "data": "stabil"},
					{"title": "Edut", "data": "edut"},
					{"title": "Test", "data": "test"},
					{"title": "Integration", "data": "integration"},
					{"title": "Schulung", "data": "schulung"},
					{"title": "Produktion", "data": "produktion"},
				],
				"columnDefs": [
					{"targets": '_all', "defaultContent": "-" },
					{
					"targets": '_all',
					"render": function(data, type, row) {
							var retVal = data;
							if (type === "display" && data != "-") {
								retVal =  '<a href="' + row.mega + '/' + data + "/" + data + '">' + data + '</a>';
							}
							return retVal;
						}
					}
				]
			});
		});
	};
});