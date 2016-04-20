define(function (require) {		
		// libs
		var $ = require('jquery');
		var _ = require('underscore');
		var Favico = require('favico');
		var moment = require('moment');
		//var lunr = require('lunr');
		var store = require('store');
		var qtip = require('jqueryqtip');
		var CheckservletsGenerated = require('js/app/checks-generated.js');
		var checkworker = require('checkworker');
		// images
		var imgreload = require('image!client/images/open-iconic/svg/reload.svg!rel');
		var imgwarning = require('image!client/images/open-iconic/svg/warning.svg!rel');
		var imgcirclecheck = require('image!client/images/open-iconic/svg/circle-check.svg!rel');
		var imgcollapseup = require('image!client/images/open-iconic/svg/collapse-up.svg!rel');
		var imgsun = require('image!client/images/open-iconic/svg/sun.svg!rel');
		var imgrain = require('image!client/images/open-iconic/svg/rain.svg!rel');
		var imgmagnifyingglass = require('image!client/images/open-iconic/svg/magnifying-glass.svg!rel');
		var imgextlink = require('image!client/images/icons/ext_link.svg!rel');
		var imgsplunk = require('image!client/images/icons/splunk.svg!rel');
		
		return function () {
			safeLog("Loading module checks-mru...");
			
			var tables = new ClusterTables();
			var globalFavicon = new Favico({animation:'slide', position: "down"});

			function ClusterTables () {
				this.success = "false";
				this.tables = {};
				this.checkURLs = {};
				this.checkRowIds = {};
				
				this.addTable = function(tableName, table) {
					if ($.inArray(tableName, this.tables) == -1) { // check if tableName has already been added
						this.tables[tableName] = table;
						this.success = "true";
					} else {
						this.success = "false";
					}
					return this.success;
				}
				
				this.addCheckURL = function(tableName, url) {
					if ($.inArray(url, this.getURLs(tableName)) == -1) { // check if URL has already been added to THIS table
						this.checkRowIds[createValidID(tableName + url)] = tableName;
						this.checkURLs[url] = tableName;
						this.success = "true";
					} else {
						this.success = "false";
					}
					return this.success;
				}
				
				this.getTable = function(tableName) {
					return this.tables[tableName];
				}
				
				this.getAllTables = function() {
					return this.tables;
				}
				
				this.getAllCheckRowIds = function() {
					return this.checkRowIds;
				}
				
				this.getURLs = function(tableName) {
					var tableURLs = [];
					$.each(this.checkURLs, function(key, value) {
						if (value == tableName) {
							tableURLs.push(key);
						}
					}); 
					return tableURLs;
				}	
			}	
			
			$.ajaxSetup ({
				cache: false,  // Disable caching of AJAX responses
				crossDomain: true,
				statusCode: {
					404: function() {
						// alert( "page not found" );
					}
				}
			});

			/* function setupResourcePaths() {
				var uri = new URI(window.location.href);
				var queries = URI.parseQuery(uri.query());
				testingPath = queries.testing;
				protocol = uri.protocol();
				host = uri.host();
				directoryPath = uri.directory();
				rootContext = uri.hasQuery("testing") === true ? (directoryPath + "/" + testingPath) : directoryPath;
				rootPath = URI(protocol + "://" + host + rootContext).normalizePathname();
				imagePath = URI(rootPath + '/images').normalizePathname();
				safeLog("Setting protocol to ["  + protocol + "]");
				safeLog("Setting host to ["  + host + "]");
				safeLog("Setting directoryPath to ["  + directoryPath + "]");
				safeLog("Setting testing path to ["  + testingPath + "]");
				safeLog("Setting root context to ["  + rootContext + "]");
				safeLog("Setting root path to ["  + rootPath + "]");
				safeLog("Setting image resource path to ["  + imagePath + "]");
			} */
							
			$(document).ready(function() {
				// setupResourcePaths();
				// createLunrIndex();
				// generate and add tables for each unique cluster to the page
				var checkservletsData = new CheckservletsGenerated();
				addControlPanel("Stage: [" + checkservletsData.stageInfo.stage + "] Major Version: [" + checkservletsData.stageInfo.majorVersion + "]");
				$('#container').append("<p/>");
				$.each(checkservletsData.checks, function(checkIndex, check) {
					if (tables.getTable(check.clusterName) === undefined) { // check if a table for this Cluster was already added
						var titleRowStatus = {"cluster-status": getClusterStatusOKElement(check.clusterName)};
						var titleRowText = {"cluster-name": "[Cluster: " + check.clusterName + "]"};
						var id = check.clusterName;
						var titleRowControls = {"reload": getReloadElement(id), "filterOK": getFilterOKElement(id), "resetFilter": getResetFilterElement(id), "collapseAll": getCollapseElement(id)};
						var titleRowData = [titleRowStatus, titleRowText, titleRowControls];
						var table = makeTable('#container', check.clusterName, titleRowData, [["Level 1 Status", "Application", "Artefact", "Artefact Version", "Node", "Port", "Build Timestamp", "Links", "Last Update"]]);
						$('#container').append("<p/>");
						var success = tables.addTable(check.clusterName, table)
						attachRefreshButtonListener(check.clusterName);
						attachFilterOKButtonListener(check.clusterName);
						attachFilterResetButtonListener(check.clusterName);
						attachCollapseButtonListener(check.clusterName);
					}
				});		
				// populate Cluster tables with checks
				$.each(checkservletsData.checks, function(checkIndex, check) {
					$.each(check.urls, function(urlIndex, url) {
						tables.addCheckURL(check.clusterName, url);
						addLoadingRowToTable(check.clusterName, url, 0);
						fetchCheckWorker(url, check.clusterName);
					});
				});
				//addFAKECheckResultToTableForTesting("Mike", "NOK");
				//addFAKECheckResultToTableForTesting("Mike", "OK");
			});
			
			function createLunrIndex() {
				lunrIndex = lunr(function () {
					this.field('artefactName', {boost: 10});
					this.field('artefactVersion');
					this.field('applicationName');
					this.field('node');
					this.field('port');
					this.field('status');
					this.ref('id');
				});
			}
			
			function updateClusterStatus(clusterName) {
				var clusterStatus = getClusterStatus(clusterName);
				safeLog("Cluster Status [" + clusterName + "] is [" + clusterStatus + "]");
				var clusterStatusSpan = $(getElementById(clusterName + "table-title-status"));
				var clusterStatusTextSpan = $(getElementById(clusterName + "table-title-text"));
				$(clusterStatusSpan).empty();
				var statusElement = "";
				if (clusterStatus == "OK") {
					statusElement = getClusterStatusOKElement(clusterName);
					$(clusterStatusTextSpan).css('color', "darkgreen");
				} else if (clusterStatus == "NOK") {
					statusElement = getClusterStatusNOKElement(clusterName);
					$(clusterStatusTextSpan).css('color', "darkred");
				} else if (clusterStatus == "NA") {
					statusElement = "N/A";
				}
				$(clusterStatusSpan).append(statusElement);
				var failedChecks = getNumberOfNOKCheckRows();
				globalFavicon.badge(failedChecks);
			}
			
			function newFavico(id) {
				return new Favico({animation:'slide', position: "down", elementId: id});
			}
			
			function addControlPanel(environmentTitle) {
				var panel = $("<div id='control-panel', class='control-panel'/>");
				$(panel).append("<h1 id='env-title' class='env-title'>" + environmentTitle + "</h1>");
				$(panel).append("<span>Control Panel:</span>");
				$(panel).append(getFilterOKElement("control-panel"));
				$(panel).append(getResetFilterElement("control-panel"));
				$(panel).append(getCollapseElement("control-panel"));
				// $(panel).append(getSearchElement("control-panel"));
				// $(panel).append(getSearchIcon("control-panel"));
				$('#container').append(panel);
				attachFilterResetAllButtonListener("control-panel");
				attachFilterAllOKButtonListener("control-panel");
				attachCollapseAllButtonListener("control-panel");
				// attachSearchInputListener("control-panel");
			}
			
			function reloadTable(tableName) {
				var URLs = tables.getURLs(tableName);
				safeLog("Refreshing: " + URLs);
				clearTable(tableName);
				$.each(URLs, function(index, url) {
					addLoadingRowToTable(tableName, url, 0);
					fetchCheckWorker(url, tableName);
				});
				// createLunrIndex();
			}
			
			function filterOKTable(tableName) {
				var table = getElementById(createValidID(tableName));
				filterTableRowsByClass(table, "status-ok");
			}
			
			// rows are filtered even if class is found only in a table cell
			function filterTableRowsByClass(table, clazz) {
				var clazz = "." + clazz;
				safeLog("Filtering table [" + $(table).attr('id') + "] rows by class [" + clazz + "]");
				var rows = getElementsByTagName(table, "tr");
				var qualifyingRows = $(rows).filter(clazz); // we will hide these...
				var remainingCells = $(_.difference(rows, qualifyingRows)).find("td"); // look only in remaining table cells
				var qualifyingCells = $(remainingCells).filter(clazz);
				$.each(qualifyingRows, function(index, row) {
					$(row).hide("slow");
				});
				$.each(qualifyingCells, function(index, cell) {
					$(cell).closest("tr").hide("slow");
				});
			}
			
			function getNumberOfNOKCheckRows() {
				return $(".status-nok").length;
			}
			
			function filterOKAllTables() {
				safeLog("Filtering All tables with status OK...");
				$.each(tables.getAllTables(), function(tableName, table) {
					filterOKTable(tableName);
				});
			}
			
			function filterResetTable(tableName) {
				safeLog("Resetting Filter on table [" + tableName + "]...");
				var rows = getElementsByTagName(getElementById(createValidID(tableName)), "tr");
				$.each(rows, function(index, row) {
					$(row).show("slow");
				});
			}
			
			function filterResetAllTables(tableName) {
				safeLog("Resetting Filter on All tables...");
				$.each(tables.getAllTables(), function(tableName, table) {
					filterResetTable(tableName);
				});
			}
			
			function collapseTable(tableName) {
				safeLog("Collapse Table...");
				var table = getElementById(createValidID(tableName));
				var rows = getElementsByTagName(table, "tr");
				$.each(rows, function(index, row) {
				var rowClass = $(row).prop('class');
					if (rowClass != "table-title") {
						$(row).hide("slow");
					}
				});
			}
			
			// http://lunrjs.com/
			function searchLunrIndex(searchString) {
				var result = "";
				if (searchString.length >= 2) {
					result = lunrIndex.search(searchString);
				}
				return result;
			}
			
			function collapseAllTables() {
				safeLog("Collapsing All tables...");
				$.each(tables.getAllTables(), function(tableName, table) {
					collapseTable(tableName);
				});
			}
			
			function attachRefreshButtonListener(tableName) {
				var button = getElementById("reload-" + tableName);
				button.click(function() {
					reloadTable(tableName);
				});
			}
			
			function attachFilterOKButtonListener(tableName) {
				var button = getElementById("filterOK-" + tableName);
				button.click(function() {
					filterOKTable(tableName);
				});
			}
			
			function attachFilterAllOKButtonListener(tableName) {
				var button = getElementById("filterOK-" + tableName);
				button.click(function() {
					filterOKAllTables();
				});
			}
			
			function attachFilterResetButtonListener(tableName) {
				var button = getElementById("filterReset-" + tableName);
				button.click(function() {
					filterResetTable(tableName);
				});
			}
			
			function attachFilterResetAllButtonListener(tableName) {
				var button = getElementById("filterReset-" + tableName);
				button.click(function() {
					filterResetAllTables();
				});
			}
			
			function attachCollapseButtonListener(tableName) {
				var button = getElementById("collapse-" + tableName);
				button.click(function() {
					collapseTable(tableName);
				});
			}
			
			function attachCollapseAllButtonListener(tableName) {
				var button = getElementById("collapse-" + tableName);
				button.click(function() {
					collapseAllTables(tableName);
				});
			}
			
			function attachSearchInputListener(elementId) {
				var input = getElementById("search-input-" + elementId);
				var debouncedSearch = _.debounce(searchLunrIndex, 300, true); // limit calls - http://underscorejs.org/#debounce
				$(input).on('input keypress', function() {
					var searchText = $(this).val();
					var resultRowIds = [];
					var searchResult = debouncedSearch(searchText);
					if (searchResult.length > 0) {
						$.each(searchResult, function(index, result) {
							resultRowIds.push(_.values(result));
							safeLog("Lunr Search for [" + searchText + "] -> [" + "ref:" + result.ref + " score: " + result.score + "]");
						});
						$.each(tables.getAllCheckRowIds(), function(rowId, tableName) {
							if ($.inArray(rowId, _.flatten(resultRowIds)) == -1) { // if its not part of the search result, hide it
								safeLog("Hiding row with Id [" + rowId + "]");
								$(getElementById(rowId)).hide("slow");
							}
						});
					} else {
						$.each(tables.getAllCheckRowIds(), function(rowId, tableName) {
							$(getElementById(rowId)).show("slow");
						});
					}
				});
			}
			
			// https://useiconic.com/open/
			function getReloadElement(tableName) {
				var button = $("<input/>");
				$(button).attr("id", 'reload-' + tableName);
				$(button).addClass("icon icon-reload-table");
				$(button).attr("type", "image");
				$(button).attr("src", imgreload.src);
				return button;
			}
			
			function getFilterOKElement(tableName) {
				var button = $("<input/>");
				$(button).attr("id", 'filterOK-' + tableName);
				$(button).addClass("icon icon-filter-ok");
				$(button).attr("type", "image");
				$(button).attr("src", imgwarning.src);
				return button;
			}
			
			function getResetFilterElement(tableName) {
				var button = $("<input/>");
				$(button).attr("id", 'filterReset-' + tableName);
				$(button).addClass("icon icon-reset-filter");
				$(button).attr("type", "image");
				$(button).attr("src", imgcirclecheck.src);
				return button;
			}
			
			function getCollapseElement(tableName) {
				var button = $("<input/>");
				$(button).attr("id", 'collapse-' + tableName);
				$(button).addClass("icon icon-collapse-table");
				$(button).attr("type", "image");
				$(button).attr("src", imgcollapseup.src);
				return button;
			}
			
			function getClusterStatusOKElement(tableName) {
				var button = $("<input/>");
				$(button).attr("id", 'clusterStatusOK-' + tableName);
				$(button).addClass("icon icon-cluster-ok");
				$(button).attr("type", "image");
				$(button).attr("src", imgsun.src);
				return button;
			}
			
			function getClusterStatusNOKElement(tableName) {
				var button = $("<input/>");
				$(button).attr("id", 'clusterStatusNOK-' + tableName);
				$(button).addClass("icon icon-cluster-nok");
				$(button).attr("type", "image");
				$(button).attr("src", imgrain.src);
				return button;
			}
			
			function getSearchIcon(elementId) {
				var button = $("<input/>");
				$(button).attr("id", 'search-icon-' + elementId);
				$(button).addClass("icon icon-mag-glass");
				$(button).attr("type", "image");
				$(button).attr("src", imgmagnifyingglass.src);
				$(button).css("cursor", "default");
				return button;
			}
			
			function getSearchElement(elementId) {
				var input = $("<input/>");
				$(input).attr("id", 'search-input-' + elementId);
				$(input).addClass("input search");
				$(input).attr("type", "search");
				return input;
			}
			
			function makeTable(container, tableId, titleRowData, headerRowData) {
				var table = $("<table/>").addClass('bud-table'); // http://www.csstablegenerator.com/
				$(table).prop('id', tableId);
				$(table).prop('cursor', "pointer");
				$(table).prop('sortable', "true");
				$.each(headerRowData, function(rowIndex, rowData) {
					var titleRow = $("<tr/>");
					var headerRow = $("<tr/>");
					$(headerRow).prop('id', tableId);
					$(headerRow).prop('class', "table-header");
					$(titleRow).prop('id', "title-" + tableId);
					$(titleRow).prop('class', "table-title");
					var titleRowDataElement = $("<td id='table-title-row-data' colSpan='" + (rowData.length)  +"' />");
					var clusterStatusSpan = $("<span id='" + (createValidID(tableId + "table-title-status")) + "' class='table-title-status'/>");
					var clusterNameSpan = $("<span id='" + (createValidID(tableId + "table-title-text")) + "' class='table-title-text'/>");
					var controlsSpan = $("<span id='" + (createValidID(tableId + "table-title-controls")) + "' class='table-title-controls'/>");
					titleRowDataElement.append($(clusterStatusSpan).append( _.values(titleRowData[0])));
					titleRowDataElement.append($(clusterNameSpan).append( _.values(titleRowData[1])));
					titleRowDataElement.append($(controlsSpan).append( _.values(titleRowData[2])));
					$.each(rowData, function(colIndex, columnData) { 
						$(headerRow).append($("<td/>").text(columnData));
					});
					$(titleRow).append(titleRowDataElement);
					$(table).append(titleRow);
					$(table).append(headerRow);
				});
				return $('#container').append(table);
			}

			function addTableRow(tableId, rowId, cellDataArrays, tableIndex) {
				var table = $('#' + tableId + '> tbody > tr').eq(tableIndex - 1); // works even if there are no data rows yet, because I am not using th for the table header
				var row = $("<tr/>");
				$(row).prop('id', createValidID(tableId + rowId));
				$(row).prop('class', tableId + "-table-row");
				var lastTableCellWithColSpan = null;
				var lastTableCell = null;
				$.each(cellDataArrays, function(rowIndex, rowDataArray) {
					var cellKey = rowDataArray[0];
					var cellVal = rowDataArray[1];
					var tableCell = $("<td/>").append(cellVal);
					if (cellKey == "colSpan") { 
						if (lastTableCellWithColSpan == null) { // first colSpan encounter
							if (lastTableCell == null) { // so its the very first cell of the row...
								$(tableCell).prop('colSpan', 2);
								lastTableCellWithColSpan = tableCell;
							} else {
								$(lastTableCell).prop('colSpan', 2);
								lastTableCellWithColSpan = lastTableCell;
							}
						} else if (lastTableCellWithColSpan != null) { // consecutive colSpan
							var currentColSpan = $(lastTableCellWithColSpan).prop('colSpan');
							$(lastTableCellWithColSpan).prop('colSpan', currentColSpan + 1);
						}
					} else { // no colSpan - we just add new Cell to row
						lastTableCellWithColSpan = null; // current cell had no span, i.e. single cell
						row.append(tableCell);
					} 
					lastTableCell = tableCell;
					$(tableCell).prop('class', cellKey);
					$(tableCell).prop('id', tableId + "-" + createValidID(cellKey));
				return $(table).after(row);
				});
			}
			
			function clearTable(tableName) {
				var table = getElementById(createValidID(tableName));
				var rows = getElementsByTagName(table, "tr");
				$.each(rows, function(index, row) {
					var rowClass = $(row).prop('class');
					if (rowClass != "table-header" && rowClass != "table-title") {
						$(row).remove();
					}
				});
			}
				
			function removeTableRow(tableId, rowId) {
				var row = $('#' + createValidID(tableId + rowId));
				safeLog("Removing table row with ID [" + createValidID(rowId) + "] from Table [" + tableId + "]");
				if (row.length != 0) {
					return $(row).remove();
				} else {
				safeLog("Could not find row with ID [" + createValidID(rowId) + "] !");
				}
			}
			
			function setTableEvenOddRowClass(tableId) {
				safeLog("Adding class \"even\" to even rows of Table with Id: " + tableId);
				var table = $('#' + tableId);
				var size = $(table).find("tr").filter("tr:even").length;
				safeLog("Found even table rows: " + size);
				$(table).find("tr").filter("tr:even").addClass("even");
			}
			
			// http://www.w3.org/TR/html4/types.html#type-id
			function createValidID(string) {
				var regex = /\/|:|\./ig; // the pipes are to be able to list multiple items to replace, the "/" and the "." are escaped
				stringValidId = string.replace(regex, "_").trim();
				return stringValidId;
			}
			
			function addDOMChangeListener(elementId) {
				$("#" + elementId).bind("DOMSubtreeModified", function(event) {
					safeLog("Element DOM changed: " + "Class: " + $(this).attr("class") + " ID: " +  $(this).attr("id"));
				});
			}
			
			function safeDOMUpdate(func) {
				$(document).ready(func);
			}
				
			function fetchCheckWorker(checkURL, clusterName) {
				var worker;
				if (typeof(Worker) !== "undefined") {
					var worker = new Worker(require.toUrl('checkworker') + '.js');
					worker.addEventListener('message', function(event) {
						safeLog("Web Worker returned with Status [" + event.data[0] + "]");
						var timerDiv = document.getElementById("timer_" + createValidID(checkURL));
						removeTableRow(clusterName, checkURL);
						if (event.data[0] == "500") {
							addErrorRowToTable(clusterName, checkURL, "Error 50x")
						} else if (event.data[0] == "timeout") {
							addErrorRowToTable(clusterName, checkURL, "Timeout")
						} else {
							addCheckResultToTable(event.data[1], clusterName, checkURL, timerDiv.innerHTML);
							attachCheckHistoryInfo(clusterName, checkURL);
						}
						worker.terminate();
						updateClusterStatus(clusterName);
					}, false);
					worker.onerror  = function(event) {
						safeLog("Webworker returned error: " + event[0]);
						worker.terminate();
					};
					worker.postMessage(checkURL); // + "?format=json");
				} else {
					safeLog("Sorry! No Web Worker support :(");
				}
			};
			
			function getFormattedTimePassedSince(startTime, format) {
				return moment(moment().subtract(startTime)).format(format);
			}
			
			function addTimer(elementId, startTime) {
				var timerDiv = document.getElementById(elementId);
				timerDiv.innerHTML =  '00:00:020'; // default to 20ms in case it is less....
				var timeinterval = setInterval(function() {
					timerDiv.innerHTML = getFormattedTimePassedSince(startTime, 'mm:ss:SSS');
				},20); 	// https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval#Example -> TODO use minidaemon.js
			}
			
			function lastUpdateTimer(rowId, dataId) {
				var row = document.getElementById(createValidID(rowId));
				var lastUpdateElement = $(row).find('#' + dataId);
				var lastUpdate = moment();
				$(lastUpdateElement).html(getHumanTimePassedSince(lastUpdate));
				var timeinterval = setInterval(function() {
					$(lastUpdateElement).html(getHumanTimePassedSince(lastUpdate));
				},10000);
			}
			
			function addErrorRowToTable(tableId, url, errorMsg) {
				var timerDiv = $("<div/>");
				var timerId = "timer_" + createValidID(url);
				$(timerDiv).prop('id', timerId);
				$(timerDiv).prop('class', "timer");
				var loadingRow = [["status status-error", errorMsg], ["url",  url], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""]];
				safeLog("Adding Error-Status row with ID [" + createValidID(url) +" ] to Table: " + tableId + " at index [" + 0 + "]");
				addTableRow(tableId, url, loadingRow, 0);
				checkHistoryManager(tableId, url, errorMsg, getTimeStamp('YYYY-MM-DD HH:mm:ss:SSS'));
			}
			
			function addLoadingRowToTable(tableId, url, index) {
				var timerDiv = $("<div/>");
				var timerId = "timer_" + createValidID(url);
				$(timerDiv).prop('id', timerId);
				$(timerDiv).prop('class', "timer");
				var loadingRow = [["checkTimer", timerDiv], ["url", "Querying : " + url + "..."], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""], ["colSpan", ""]];
				safeLog("Adding Loading-Status row with ID [" + createValidID(url) +" ] to Table: " + tableId + " at index [" + index + "]");
				addTableRow(tableId, url, loadingRow, index);
				addTimer(timerId, moment());
			}
					
			function addCheckResultToTable(checkHtml, tableId, checkURL, timeElapsed) {
				var checkResultMap = {status : "n/a", applicationName : "n/a", artefactName : "n/a", artefactVersion :"n/a", node : "n/a", port : "n/a", buildTimestamp : "n/a", checkLevelOneUrl : "n/a", lastUpdateTime : "n/a"};
				var tempHtmlDom = $("<div/>").html(checkHtml).contents(); // trick to hold html in DOM without displaying it
				var defaultSplunkURL = getDefaultSplunkURL(checkURL, tableId);
				checkResultMap.checkLevelOneUrl = '<a href="' + checkURL + '"target="_blank"><img src="' + imgextlink.src + '" width="30" height="30"></a> ' + ' <a href="' + defaultSplunkURL + '"target="_blank"><img src="' + imgsplunk.src + '" width="30" height="30"></a>';
				var statusElements = getElementsByTextContent(tempHtmlDom, "div", "sbb access")[0];
				checkResultMap.status = statusElements != null ? "OK" : "NOK";
				checkResultMap.applicationName = getLegacyCheckData(tempHtmlDom, "td", "Application:");
				checkResultMap.artefactName = getLegacyCheckData(tempHtmlDom, "td", "Project:");
				checkResultMap.artefactVersion = getVersionFromLegacy(tempHtmlDom);
				checkResultMap.port = getPort(checkURL);
				checkResultMap.node = getNode(checkURL);
				checkResultMap.buildTimestamp = getBuildTimestampFromLegacy(tempHtmlDom);
				checkResultMap.lastUpdateTime = getTimeStamp('YYYY-MM-DD HH:mm:ss:SSS');
				var statusClass = checkResultMap.status == "OK" ? "status status-ok" : "status status-nok";
				var checkResultRow = [[statusClass, checkResultMap.status + " [" + timeElapsed + "]"], ["applicationName", truncate(checkResultMap.applicationName, 35)], ["artefactName", checkResultMap.artefactName], ["artefactVersion", checkResultMap.artefactVersion], ["node", checkResultMap.node], ["port", checkResultMap.port], ["buildTimestamp", checkResultMap.buildTimestamp], ["checkLevelOneUrl", checkResultMap.checkLevelOneUrl], ["lastUpdateTime", checkResultMap.lastUpdateTime]];
				safeLog("Adding Check-Status row to Table: " + tableId);
				addTableRow(tableId, checkURL, checkResultRow, 0);
				checkHistoryManager(tableId, checkURL, checkResultMap.status, checkResultMap.lastUpdateTime);
				// lunrIndex.add({"id": createValidID(tableId+checkURL), "artefactName": checkResultMap.artefactName, "artefactVersion": checkResultMap.artefactVersion, "node": checkResultMap.node, "port": checkResultMap.port, "applicationName": checkResultMap.applicationName, "status": checkResultMap.status});
				lastUpdateTimer(tableId + checkURL, tableId + "-lastUpdateTime");
			}
			
			function getLegacyCheckData(html, tagName, searchString) {
				var checkAttributeString = "n/a";
				var foundElements = getElementsByTextContent(html, tagName, searchString);
				if (foundElements.length > 0) {
					checkAttributeString = foundElements[0].next()[0].textContent;
				}
				return checkAttributeString;
			}
				
			function getVersionFromLegacy(checkHtml) {
				var version = ""
				var legacyVersionInfo = getLegacyCheckData(checkHtml, "td", "Version:");
				if (stringOccurances(legacyVersionInfo, "-") > 1) { // like 8.0-SNAPSHOT - 03.12.15 01:16
					version = legacyVersionInfo.substring(0, getStringOccurranceIndices(legacyVersionInfo, "-")[1]); // 2nd occurance
				} else {
					version = legacyVersionInfo.substring(0, getStringOccurranceIndices(legacyVersionInfo, "-")[0]); // 1st occurance
				}
				return version;
			}
			
			function getBuildTimestampFromLegacy(checkHtml) {
				var buildTimestamp = ""
				legacyVersionInfo = getLegacyCheckData(checkHtml, "td", "Version:");
				if (stringOccurances(legacyVersionInfo, "-") > 1) { // like 8.0-SNAPSHOT - 03.12.15 01:16
					buildTimestamp = legacyVersionInfo.substring(getStringOccurranceIndices(legacyVersionInfo, "-")[1] + 1, legacyVersionInfo.length);
				} else {
					buildTimestamp = legacyVersionInfo.substring(getStringOccurranceIndices(legacyVersionInfo, "-")[0] + 1, legacyVersionInfo.length);
				}
				return buildTimestamp;
			}
			
			function getDefaultSplunkURL(checkURL, tableId) {
				var defaultSplunkURL = "";
				var timeParams = {earliest: "-4h", latest: "now"};
				if (isDevURL(checkURL)) {
					var splunkDevBaseURL = "http://wasd85mcta1.sbb.ch:8000/en-US/app/search/search?q=search ";
					var params = {index: "wasdev", host: getNode(checkURL), websphere_appsrv: getAppServerName(checkURL, tableId)};
					defaultSplunkURL = (splunkDevBaseURL + $.param(params)).replace(/&/g, " ") + "&" + $.param(timeParams); // stupid splunk query
				} else {
					var splunkPRODBaselURL = "http://splunk.sbb.ch:8000/en-US/app/search/search?q=search ";
					var params = {host: getNode(checkURL), websphere_appsrv: getAppServerName(checkURL, tableId)};
					defaultSplunkURL = (splunkPRODBaselURL + $.param(params)).replace(/&/g, " ") + "&" + $.param(timeParams); // stupid splunk query
				}
				return defaultSplunkURL;
			}
			
			function truncate(string, maxLength) {
				var truncatedString = "";
				if (string != null && string.length > maxLength + 3) {
					truncatedString = string.substring(0, maxLength) + "...";
				}
				return truncatedString;
			}
			
			function isDevURL(checkURL) {
				var hostname = getHostname(checkURL);
				return hostname.startsWith("wasd") ? true : false;
			}
			
			function getPort(checkURL) {
				var element = document.createElement('a');
				element.href = checkURL;
				return element.port;
			}
			
			function getHostname(checkURL) {
				var element = document.createElement('a');
				element.href = checkURL;
				return element.hostname;
			}
			
			function getNode(checkURL) {
				var hostname = getHostname(checkURL);
				return hostname.substring(0, hostname.indexOf(".sbb.ch"));
			}
			
			// horror
			function getAppServerName(checkURL, clusterName) {
				var appServName = "";
				var portString = getPort(checkURL);
				var port = portString.substring(0, (portString.length - 1)) + "0";
				if (stringOccurances(clusterName, "Snapshot") > 0) {
					var clusterLabel = clusterName.substring(clusterName.indexOf("_"), clusterName.indexOf("_") -1 );
					appServName = clusterName.substring(0, clusterName.indexOf("_") -1) + "_Snapshot_" + clusterLabel + "_" + port + "_" + "*";
				} else {
					var clusterLabel = clusterName.substring(clusterName.indexOf("_"), clusterName.indexOf("_") -1 );
					appServName = clusterName.substring(0, clusterName.indexOf("_") -1) + "_" + clusterLabel + "_" + port + "_" + "*";
				}
				return appServName;
			}
			
			// add usefull stuff to String Prototype
			
			if ( typeof String.prototype.startsWith != 'function' ) {
			  String.prototype.startsWith = function( str ) {
				return str.length > 0 && this.substring( 0, str.length ) === str;
			  }
			};
			
			if ( typeof String.prototype.endsWith != 'function' ) {
			  String.prototype.endsWith = function( str ) {
				return str.length > 0 && this.substring( this.length - str.length, this.length ) === str;
			  }
			};
				
			function getStringOccurranceIndices(string, word) {
				var indices = [];
				for(var i=0; i<string.length;i++) {
					if (string[i] === word) {
						indices.push(i);
					} 
				}
				return indices;
			}
			
			function getLastIndexOf(string, word) {
				var indices = getStringOccurranceIndices(string, word);
				return indices[indices.length -1];
			}

			function stringOccurances(string, word) {
			   var substrings = string.split(word);
			   return substrings.length - 1;
			}

			// https://github.com/marcuswestin/store.js/
			function checkHistoryManager(tableId, checkURL, status, timestamp) {
				//localStorage.clear();
				var historyId = createValidID(tableId + checkURL);
				var maxHistoryEntries = 9;
				var checkHistoryArrays = $.makeArray(store.get(historyId));
				if (checkHistoryArrays != null && checkHistoryArrays.length > 0) { // add new history entry
					safeLog("Adding new History Entry [" + timestamp + "] with Value [" + status + "]");
					checkHistoryArrays.push([timestamp, status])
					oldestHistoryOK = getOldestHistoryEntryByStatus(checkHistoryArrays, "OK");
					oldestHistoryNOK = getOldestHistoryEntryByStatus(checkHistoryArrays, "NOK");
					checkHistoryArrays = pruneCheckHistory(checkHistoryArrays, maxHistoryEntries);
					if (oldestHistoryOK[0] != "none" && existHistoryEntry(oldestHistoryOK, checkHistoryArrays) == false) {
						checkHistoryArrays.push(oldestHistoryOK);
						safeLog("Adding oldest OK Entry [" + oldestHistoryOK[0] + "] with Value [" + oldestHistoryOK[1] + "]");
					}
					if (oldestHistoryNOK[0] != "none" && existHistoryEntry(oldestHistoryNOK, checkHistoryArrays) == false) {
						checkHistoryArrays.push(oldestHistoryNOK);
						safeLog("Adding oldest NOK Entry [" + oldestHistoryOK[0] + "] with Value [" + oldestHistoryOK[1] + "]");
					}
					sortCheckHistory(checkHistoryArrays);
				} else { // start first history entry
					safeLog("Adding first History Entry [" + timestamp + "] with Value [" + status + "]");
					checkHistoryArrays = [];
					checkHistoryArrays.push([timestamp, status]);
				}
				store.set(historyId, checkHistoryArrays);
			}
			
			function getClusterStatus(clusterName) {
				var clusterStatus = "OK"
				var clusterURLs = tables.getURLs(clusterName);
				$.each(clusterURLs, function(index, checkURL) {
					var historyId = createValidID(clusterName + checkURL);
					var checkHistoryArrays = $.makeArray(store.get(historyId));
					var latestEntry = getLatestHistoryEntry(checkHistoryArrays);
					if (latestEntry.length > 0) {
						if (latestEntry[1] != "OK") {
							clusterStatus = "NOK";
						}
					} else {
						clusterStatus = "NA";
					}
				});
				return clusterStatus;
			}
			
			function existHistoryEntry(history, checkHistoryArrays) {
				var existHistoryEntry = false;
				$.each(checkHistoryArrays, function(key, historyArray) {
					if (existHistoryEntry == false) {
						existHistoryEntry = ($.inArray(history[0], historyArray) > -1) ? true : false;
					} else {
						return existHistoryEntry;
					}
				});
				return existHistoryEntry;
			}
			
			function getOldestHistoryEntryByStatus(checkHistoryArrays, status) {
				var oldestHistoryEntry = ["none", "none"];
				var dateFormat = 'YYYY-MM-DD HH:mm:ss:SSS';
				$.each(checkHistoryArrays, function(key, historyArray) {
					if (historyArray[1] == status) {
						if (moment(oldestHistoryEntry[0]).isValid()) { // check if there is already an entry
							if (moment(historyArray[0], dateFormat).isBefore(moment(oldestHistoryEntry[0], dateFormat))) { // if its older, set it as new oldest
								oldestHistoryEntry = historyArray;
							}
						} else { // first entry found
							oldestHistoryEntry = historyArray;
						}
					}
				});
				safeLog("Found oldest History Entry [" + oldestHistoryEntry[0] + "] with Value [" + oldestHistoryEntry[1] + "]");
				return oldestHistoryEntry;
			}
			
			function getLatestHistoryEntry(checkHistoryArrays) {
				var latestEntry = [];
				if (checkHistoryArrays != null && checkHistoryArrays.length > 0) {
					var sortedCheckHistoryArrays = sortCheckHistory(checkHistoryArrays);
					latestEntry = sortedCheckHistoryArrays[0];
				}
				return latestEntry;
			}
				
			function pruneCheckHistory(checkHistoryArrays, maxHistoryEntries) {
				sortedCheckHistoryArrays = sortCheckHistory(checkHistoryArrays);
				var counter = 1;
				var prunedCheckHistoryArrays = $.map(sortedCheckHistoryArrays, function(historyArray, key) {
					if (counter <= maxHistoryEntries) { // iteration order is guaranteed for arrays
						counter++;
						return [[historyArray[0], historyArray[1]]];				
					}
				});
				return prunedCheckHistoryArrays;
			}
			
			function sortCheckHistory(checkHistoryArrays) {
				sortedCheckHistoryArrays = checkHistoryArrays.sort(function(arrayA, arrayB) {
					var dateFormat = 'YYYY-MM-DD HH:mm:ss:SSS';
					var retVal;
					if (moment(arrayA[0], dateFormat).isAfter(moment(arrayB[0], dateFormat))) {
						retVal = 1;
					} else if (moment(arrayA[0]).isBefore(moment(arrayB[0]))) {
						retVal = -1;
					} else {
						retVal = 0;
					}
					return retVal;
				}); 
				sortedCheckHistoryArrays.reverse(); // latest entry on top
				return sortedCheckHistoryArrays;
			}
				
			function getElementsByTextContent(domFragment, tagName, searchText) {
				var foundElements = [];
				var elements = getElementsByTagName(domFragment, tagName);
				safeLog("Searching for Element(s) with Tagname [ " + tagName + "]: containing text [" + searchText + "]");
				$(elements).each(function() {
					if ($(this).text() === searchText) {
						foundElements.push($(this));
						safeLog("Found Element [" + tagName + "] with Text Match for Search String [" + searchText + "]: " + $(this).text());
					}
				});
				return foundElements;
			}
			
			function getElementsByTagName(domFragment, tagName) {
				var foundElements1 = $(domFragment).filter(tagName);
				var foundElements2 = $(domFragment).find(tagName);
				safeLog("Searching for Element(s) with Tagname [ " + tagName + "]");
				return $($.merge(foundElements1, foundElements2));
			}
			
			function getElementById(elementId) {
				return $('#' + elementId);
			}
			
			function colourElementsByTextContent(domFragment, tagName, searchText, colour) {
				var foundElements = getElementsByTextContent(domFragment, tagName, searchText);
				$(foundElements).each(function() {
					$(this).css('background-color', colour);
				});
			}
				
			function addFAKECheckResultToTableForTesting(tableId, status) {
				var fakeUrl = "";
				if (status == "NOK") {
					fakeUrl = rootPath + "/bud-proto/nok-check.html";
				} else if (status == "OK") {
					fakeUrl = rootPath + "/bud-proto/ok-check.html";
				}
				addLoadingRowToTable(tableId, fakeUrl, 0);
				fetchCheckWorker(fakeUrl, tableId);
			}
			
			function attachCheckHistoryInfo(clusterName, checkURL) {
				var historyId = createValidID(clusterName + checkURL);
				var tableCells = $('td', getElementById(historyId)); // get all table cells from the table row
				safeLog("Attaching Check History to Table Row with Id [" + historyId + "]")
				if (tableCells.length > 0) {
					checkHistoryArrays = store.get(historyId);
					var stringCheckHistory = "";
					$.each(checkHistoryArrays, function(key, historyArray) {
						valueDivClass = (historyArray[1]=="OK") ? "check-history-ok" : "check-history-nok"; // for css formatting
						stringCheckHistory = stringCheckHistory + "<span class='checkHistoryTimestamp'>" + historyArray[0] +  "</span> - <span class='" + valueDivClass + "'>" + historyArray[1] + "</span><br>";
					});
					addTooltipInfoToElement(tableCells[0], stringCheckHistory);
				} else {
					safeLog("No Table-Cells found in " + $(historyId).prop('id'));
				}
			}
			
			// http://qtip2.com
			function addTooltipInfoToElement(element, data) {
				$(element).qtip({
					show: {effect: function(offset){$(this).slideDown(200)}, solo: true, delay: 250},
					hide: {delay: 700},
					style: {classes: 'qtip-jtools check-history'}, // qtip-jtools inbuilt default theme
					content: {text: data}
				});
			};
					
			function safeLog(string) {
				window.console && console.log(string + "\n");
				$('#debug-log').append(getTimeStamp('YYYY-MM-DD HH:mm:ss:SSS') + " -> ");
				$('#debug-log').append(string);
				$('#debug-log').append("<br>");
			}
			
			// http://momentjs.com/
			function getTimeStamp(format) {
				return moment().format(format);
			}
			
			function getHumanTimePassedSince(timestamp) {
				return moment(timestamp).fromNow();
			}
		}
});
	