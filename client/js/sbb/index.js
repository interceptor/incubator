$(document).ready(function() {
	$('#build-status-index').DataTable( {
		"paging": false,
		"data": indexPageDataSet,
		"columns": [
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