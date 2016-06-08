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
				"data": indexPageData.indexPageDataSet,
				"columns": [
					{title: "Mega/Stage"},
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
	};
});