// used local proxy to avoid Same Origin Policy -> Future: server must set CORS Request Headers!
// http://www.html5rocks.com/en/tutorials/workers/basics/
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
// https://dev.opera.com/articles/xhr2/
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

// importScripts('../scripts/jquery-1.11.2.min.js'); // not possible! NO DOM ACCESS IN WORKERS! -> http://www.html5rocks.com/en/tutorials/file/xhr2/

self.addEventListener('message', function(event) {
		var checkURL = event.data;
		var xhr = new XMLHttpRequest();
		// add event listeners
		xhr.addEventListener('load', loadHandler, false); // When the request has successfully completed
		xhr.addEventListener('progress', progressHandler, false); // While loading and sending data
		xhr.addEventListener('timeout', timeoutHandler, false); // When the author specified timeout has passed before the request could complete
		xhr.addEventListener('error', errorHandler, false); // When the request has failed
		// configure 
		// xhr.responseType = 'text';
		// open
		xhr.open('GET', 'http://mvdtools.sbb.ch:8091/fetchUrl?target=' + encodeURIComponent(checkURL), true); // async true
		// setting timeout after open() method because of IE11 bug
		xhr.timeout = 10000; // 10 seconds
		xhr.send();						
	}, false);
	
	var loadHandler = function(event) {
		if (this.status == 200) {
			console.log("Check Request to " + event.target.responseURL + " [Success]");
			self.postMessage([this.status, this.responseText]);
		} else if (this.status == 404) {
			self.postMessage([this.status, "ERROR not found"]);
			console.log("Check Request to " + event.target.responseURL + " [FAILED:" + this.status + "]");
		} else if (this.status == 408) {
			self.postMessage([this.status, "Server Timeout"]);
			console.log("Check Request to " + event.target.responseURL + " [FAILED:" + this.status + "]");
		} else if (this.status == 500) {
			self.postMessage([this.status, "Server ERROR"]);
			console.log("Check Request to " + event.target.responseURL + " [FAILED:" + this.status + "]");
		}
	};
	
	var progressHandler = function(event) {
		console.log("Check Request to " + event.target.responseURL + " in Progress...");
		if (event.lengthComputable) {
			var percentComplete = event.loaded / event.total;
			// self.postMessage(["Progress...", percentComplete + " % complete"]);
			console.log("Progress...", percentComplete + " % complete");
		} else {
			// self.postMessage(["Progress...", "Unable to compute progress information since the total size is unknown"]);
			console.log("Progress...", "Unable to compute progress information since the total size is unknown");
		}
	};
	
	var timeoutHandler = function(event) {
		self.postMessage([408, "Server Timeout"]);
		console.log("Check Request to " + event.target.responseURL + " [FAILED: server timeout ]");
	};
	
	var errorHandler = function(event) {
		self.postMessage([500, "Server Error"]); // URL Crap or CORS fail
		console.log("Check Request to " + event.target.responseURL + " [FAILED: ERROR - very bad URL or CORS failed ]");
	};