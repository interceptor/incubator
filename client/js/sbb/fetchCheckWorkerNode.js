// used local proxy to avoid Same Origin Policy -> Future: server must set CORS Request Headers!
// http://www.html5rocks.com/en/tutorials/workers/basics/
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

// importScripts('../scripts/jquery-1.11.2.min.js'); // not possible! NO DOM ACCESS IN WORKERS! -> http://www.html5rocks.com/en/tutorials/file/xhr2/

self.addEventListener('message', function(event) {
		var checkURL = event.data;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://mvdtools.sbb.ch:8091/fetchUrl?target=' + encodeURIComponent(checkURL), true); // async true
		// xhr.overrideMimeType('text/plain; charset=x-user-defined'); // hack to pass bytes through unprocessed.
		xhr.timeout = 10000;
		xhr.onload = function(e) { // XHR2
			if (this.status == 200) { // the proxy.php will pretty much always return with a 200, we need to look at the response content...
				if (this.responseText == 500) {
					self.postMessage([500, this.responseText]); // URL Crap
					console.log("Check Request to " + checkURL + " [FAILED:" + this.status + "]");
				}
				console.log("Check Request to " + checkURL + " [Success]");
				self.postMessage([this.status, this.responseText]);
			} else if (this.status != 200) {
				self.postMessage([this.status, this.responseText]);
				console.log("Check Request to " + checkURL + " [FAILED:" + this.status + "]");
			}
		};
		xhr.ontimeout = function(e) {
			self.postMessage(["timeout", this.responseText]);
			console.log("Check Request to " + checkURL + " [FAILED: timeout ]");
		}
		
		xhr.send();
	}, false);