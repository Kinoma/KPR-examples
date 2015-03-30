//@module
/*
 *     Copyright (C) 2002-2015 Kinoma, Inc.
 *
 *     All rights reserved.
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

// instance of CoAP client
var client;
// server address
var host;
// server informations discovered
var servers = {};
// request object for observing color
var observeRequest;
// current color
var color = {red:0, green:0, blue:0};

var stats = {
	sent: 0,
	received: 0,
	server: null,
};


function setColor(component, value) {
	if (value === undefined) {
		color.red = component.red;
		color.green = component.green;
		color.blue = component.blue;
	} else {
		color[component] = value;
	}
}


function sendColor() {
	if (!isConnected() || !client) return;

	var request = client.createRequest("coap://" + host + "/color?" + serializeQuery(color), 'POST');
	request.confirmable = true;
	client.send(request);

	sent();
}


function fromChunkToString(chunk) {
	if (!chunk) return "";

	var chars = [];
	for (var i = 0, len = chunk.length; i < len; i++) {
		chars.push(chunk.peek(i));
	}
	return String.fromCharCode.apply(String, chars);
}


function received() {
	stats.received += 1;
	updateStats();
}


function sent() {
	stats.sent += 1;
	updateStats();
}


function start() {
	if (!CoAP) return;

	client = new CoAP.Client();

	client.onResponse = function(request, response) {
		received();
	};
}


function connect(server) {
	if (!client) return;

	disconnect();

	host = server;
	trace("## connected\n");

	observeRequest = client.createRequest("coap://" + server + "/color", 'GET');
	observeRequest.token = 'c' + String.fromCharCode(Math.random() * 254 + 1);
	observeRequest.confirmable = true;
	observeRequest.observe = true;

	observeRequest.onResponse = function(response) {
		var query = JSON.parse(response.payload);
		setColor(query);

		updateColors();
		received();
	};

	client.send(observeRequest);
	sent();
}


function disconnect() {
	// if (observeRequest) observeRequest.cancel();
	observeRequest = null;

	updateStats();
}


function isConnected() {
	return !!host;
}

function discoverServer(info) {
	trace("## discoverServer\n");

	if (!client) return;

	var uuid = info.uuid;
	var server = info.url.split(':')[1].substring(2);

	var url = 'coap://' + server + '/name';
	var request = client.createRequest(url, 'GET');
	request.confirmable = true;
	request.onResponse = function(response) {
		stats.server = response.payload;
		servers[uuid] = server;
		if (!isConnected()) connect(server);
	};

	client.send(request);
	sent();
	updateStats();
}


function forgetServer(info) {
	trace("## forgetServer\n");

	var uuid = info.uuid;
	var server = servers[uuid];
	if (!server) return;

	delete servers[uuid];

	if (server == host) {
		disconnect();
		stats.server = null;

		var uuids = Object.keys(servers);
		if (uuids.length > 0) connect(servers[uuids[0]]);

		updateStats();
	}
}


exports.start = start;
exports.connect = start;
exports.isConnected = isConnected;
exports.setColor = setColor;
exports.sendColor = sendColor;
exports.color = color;
exports.stats = stats;
exports.discoverServer = discoverServer;
exports.forgetServer = forgetServer;


