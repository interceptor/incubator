define(function (require) {
	// libs
	var $ = require('jquery');
	var datatables =  require('datatables');
	var IndexPageDataSetGenerated = require('indexPageDataSet.js');
	return function () {
		$(document).ready(function() {
			var indexPageData = new IndexPageDataSetGenerated();
			$('#build-status-index').dataTable( {
				"paging": false,
				"ajax": indexPageData.indexPageDataSet,
				"columns": [
					{data: "Mega/Stage"},
					{data: "Snapshot"},
					{data: "Stabil"},
					{data: "Edu-T"},
					{data: "Test"},
					{data: "Integration"},
					{data: "Schulung"},
					{data: "Produktion"},
				]
			});
		});
	};
});