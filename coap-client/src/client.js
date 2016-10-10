/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */

// Behavior to respond to server events
var behavior = {
	onUpdateStats: function(server) {},
	onUpdateColors: function(server) {},
};

// Instance of CoAP client
var client;

// Server address
var host;

// Information about discovered servers
var servers = {};

// Request object for observing color
var observeRequest;

// Current color
var color = { red:0, green:0, blue:0 };

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
	behavior.onUpdateStats();
}

function sent() {
	stats.sent += 1;
	behavior.onUpdateStats();
}

function start(aBehavior) {
	if (!CoAP) return;

	behavior = aBehavior;
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

		behavior.onUpdateColors();
		received();
	};

	client.send(observeRequest);
	sent();
}

function disconnect() {
	// if (observeRequest) observeRequest.cancel();
	observeRequest = null;
	behavior.onUpdateStats();
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
	behavior.onUpdateStats();
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

		behavior.onUpdateStats();
	}
}

export default {
	start, connect, isConnected, setColor, sendColor, color, stats, discoverServer, forgetServer
}
