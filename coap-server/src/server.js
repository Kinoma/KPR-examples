/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */

// Behavior that responds to server events
var behavior = {
	onUpdateStats: function(server) {},
	onUpdateColors: function(server) {},
};

// Instance of CoAP server
var server;

// Array to keep session ids
var sessions = [];

// Current color
var color = {red:0, green:0, blue:0};

var stats = {
	sent: 0,
	received: 0,
};

var name = null;

/*
 * Dependencies:
 * updateXXXX() functions are defined in main.js to update UI
 */
function broadcastColorToListeners() {
	if (!server) return;

	var missing = [];

	sessions.forEach(function(id) {
		var session = server.getSession(id);
		if (session) {
			sendColor(session);
			stats.sent += 1;
		} else {
			missing.push(id);
		}
	});

	missing.forEach(function(id) {
		var index = sessions.indexOf(id);
		if (index > -1) sessions.splice(index, 1);
	});

	behavior.onUpdateStats();
}


function sendColor(session) {
	var response = session.createResponse();
	response.setPayload(JSON.stringify(color), 'application/json');
	session.send(response);
}

function handleColorRequest(query, session) {
	var changed = false;

	if ('red' in query) {
		if (color.red != query.red) {
			changed = true;
			color.red = query.red;
		}
	}

	if ('green' in query) {
		if (color.green != query.green) {
			changed = true;
			color.green = query.green;
		}
	}

	if ('blue' in query) {
		if (color.blue != query.blue) {
			changed = true;
			color.blue = query.blue;
		}
	}

	if (changed) {
		behavior.onUpdateColors();
		broadcastColorToListeners();
	}

	var response = session.createResponse();
	session.send(response);
}


function start(aBehavior) {
	if (!CoAP) return;

	behavior = aBehavior;
	server = new CoAP.Server();

	server.bind("/name", function(session) {
		stats.received += 1;
		stats.sent += 1;
		behavior.onUpdateStats();

		if (session.method != 'GET') return false;

		var response = session.createResponse();
		response.payload = name;
		session.send(response);
	});

	server.bind("/color", function(session) {
		stats.received += 1;
		stats.sent += 1;
		behavior.onUpdateStats();

		var query = parseQuery(session.payload ? session.payload : session.query);

		switch (session.method) {
			case 'GET':
				if (session.observe) {
					session.acceptObserve();
					sessions.push(session.id);
				}

				sendColor(session);
				break;

			case 'POST':
				handleColorRequest(query, session);
				break;

			case 'DELETE':
				handleColorRequest({red: 0, green: 0, blue: 0}, session);
				break;

			default:
				return false;
		}
	});

	server.start();
}

function setName(value) {
	name = value;
}

export default {
	start, broadcastColorToListeners, color, stats, setName
}

