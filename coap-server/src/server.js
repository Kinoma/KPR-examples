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

// instance of CoAP server
var server;
// array to keep session ids
var sessions = [];
// current color
var color = {red:0, green:0, blue:0};

var stats = {
	sent: 0,
	received: 0,
};

var name = null;

/*
 * Dependencies:
 * updateXXXX() functions are defined in main.xml to update UI
 */

function brodcastColorToListeners() {
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

	updateStats();
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
		updateColors();
		brodcastColorToListeners();
	}

	var response = session.createResponse();
	session.send(response);
}


function start() {
	if (!CoAP) return;

	server = new CoAP.Server();

	server.bind("/name", function(session) {
		stats.received += 1;
		stats.sent += 1;
		updateStats();

		if (session.method != 'GET') return false;

		var response = session.createResponse();
		response.payload = name;
		session.send(response);
	});

	server.bind("/color", function(session) {
		stats.received += 1;
		stats.sent += 1;
		updateStats();

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


exports.start = start;
exports.brodcastColorToListeners = brodcastColorToListeners;
exports.color = color;
exports.stats = stats;

exports.setName = function(value) {
	name = value;
}

