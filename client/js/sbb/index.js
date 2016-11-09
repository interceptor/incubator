define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	return function () {
		$(document).ready(function() {
			table = $('#build-status-index').DataTable( {
				"paging": false,
				"searching": false,
				"processing": true,
				"jQueryUI": true,
				"autoWidth": true,
				"ajax": {
					"url": "indexPageData.json",
					"dataSrc": "data"
				},
				"columns": [
					{"title": "Mega/Stage", "data": "mega"},
					{"title": "Snapshot", "data": "snapshot"},
					{"title": "Stabil", "data": "stabil"},
					{"title": "Test", "data": "test"},
					{"title": "Integration", "data": "integration"},
					{"title": "Schulung", "data": "schulung"},
					{"title": "Produktion", "data": "produktion"},
				],
				"columnDefs": [
					{"targets": '_all', "defaultContent": "-" },
					{
					"targets": '_all',
					"render": function(data, type, row, meta) {
							var retVal = data;
							console.log("Cell row/col: [" + meta.row + "(" + meta.settings.aoColumns[meta.col].data + ")" + "/" + meta.col + "(" + meta.settings.aoColumns[meta.col].data + ")" + "] with value [" + data + "]");
							if (type === "display" && data != "-" && meta.col != 0) { // do not create link on first column
								var links = [];
								$.each(data, function(index, entry) {
									stage = meta.settings.aoColumns[meta.col].data;
									links.push('<a href="' + row.mega + '/' + entry + "/" + stage + '">' + entry + '</a>')
								});
								retVal = links;
							}
							return retVal;
						}
					}
				]
			});
		});
	};
});