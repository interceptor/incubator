var express = require('express');
var https = require('https');
var http = require('http');
var app = express();
var url = require('url');
var cors = require('cors')

app.use(cors())

app.get('/fetchUrl', function (req, res) {
   console.log(req.query.target);
   callServer(req.query.target, res);
})

function callServer(target, responseToServer) {
	console.log('==============================================================================================================');
	var urlComponents = url.parse(target, true);
	var options = {
		href: urlComponents.href,
		protocol: urlComponents.protocol,
		hostname: urlComponents.hostname,
		port: urlComponents.port,
		path: urlComponents.path,
		method: 'GET',
		rejectUnauthorized: false
	};
	console.log('Request Protocol is: ' + options.protocol);
	if (options.protocol == 'http:') {
		handleHttpRequest(options, responseToServer);
	} else if (options.protocol == 'https:') {
		handleHttpsRequest(options, responseToServer);		
	} else if (options.protocol == null || options.href == null || options.hostname == null || options.port == null) {
		responseToServer.status(500).send('Server Error 500, invalid URL')
		console.log('ERROR: cannot make call to invalid URL: [' + target + ']');
	}
}

function handleHttpRequest(options, responseToServer) {
	var responseData = '';
	var request = http.request(options, (response) => {
		console.log('INFO: statusCode: ' + response.statusCode + ' [' + options.href + ']');
		// console.log('INFO: headers: ' + response.headers);
		response.on('data', (dataChunk) => {
			responseData += dataChunk;
			console.log('Receiving data... [' + options.href + ']');
		});
		response.on('end', () => {
			responseToServer.status(response.statusCode).send(responseData);
			console.log('Reqest to ' + options.href + ' completed');
		});
		});
		request.on('error', (ex) => {
			console.error(ex);
		});
		request.end();
}

function handleHttpsRequest(options, responseToServer) {
	var responseData = '';
	var request = https.request(options, (response) => {
		console.log('INFO: statusCode: ' + response.statusCode + ' [' + options.href + ']');
		// console.log('INFO: headers: ' + response.headers);
		response.on('data', (dataChunk) => {
			responseData += dataChunk;
			console.log('Receiving data... [' + options.href + ']');
		});
		response.on('end', () => {
			responseToServer.status(response.statusCode).send(responseData);
			console.log('Reqest to ' + options.href + ' completed');
		});
		});
		request.on('error', (ex) => {
			console.error("ERROR:" + ex);
		});
		request.end();
}

var server = app.listen(8091, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("build-status node proxy listening at http://%s:%s", host, port)
})