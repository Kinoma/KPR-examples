/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import SCROLLER from 'mobile/scroller';

/* Port will be chosen from 9300 to 9399 */let serverPort = 9300 + Math.floor(Math.random() * 100);let serverName = "Chat room #" + serverPort;

/* Skins and styles */let whiteSkin = new Skin({ fill: 'white',});let defaultStyle = new Style({ horizontal: 'left' });

/* Handlers */Handler.bind("/info", Behavior({	onInvoke: function(handler, message) {		message.responseText = JSON.stringify( { port: serverPort, name: serverName } );	}}));

/* UI templates */let ChatServer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin, style: defaultStyle, 
	Behavior: class extends Behavior {
		log(container, text, color) {			if (!color) color = '#000';							let block = new Text({left: 4, right: 4, top: 0});			block.string = text;			block.style = new Style("18px Arial", color);				let column = container.first.first;			if (column.first) {				column.insert(block, column.first);			} else {				column.add(block);			}		}
	}, 
	contents: [		SCROLLER.VerticalScroller($, { 
			left: 4, right: 4, top: 0, bottom: 0, active: true, clip: true, 
			contents: [				Column($, { left: 0, right: 0, top: 0 }),			], 
		}),	], 
}));	

/* Application set-up */class AppBehavior extends Behavior {	onLaunch(application) {		application.shared = true;
		
		let data = {};		let stage = new ChatServer(data);		application.add(stage);				let messages = [];		let connections = [];				let log = function(text, color) {			stage.delegate('log', text, color);		};				let randomHex = function() {			return Math.floor(Math.random() * 12).toString(16); 		};				let randomColor = function() {			return '#' + randomHex() + randomHex() + randomHex();  		};				let server = new WebSocketServer(serverPort);		server.onlaunch = function() {			log("server is ready to accept new connection");		};		server.onconnect = function(conn, options) {			log("-CONNECT");			let user = undefined;			let color = undefined;			let send = function(conn, type, data) {				conn.send(JSON.stringify({type: type, data: data}));			};			conn.onopen = function() {				log("-OPEN");			};			conn.onmessage = function(e) {				if (user === undefined) {					// define user name					user = e.data;										// define user color					color = randomColor();					send(conn, "color", color);										// conn is now member of chat					connections.push(conn);										// send all messages					send(conn, "history", messages);							log("-JOIN: " + user, color);				} else {					// define message					let message = {author: user, color: color, text: e.data};										// store message					messages.push(message);										// send message to all connections					connections.forEach(function(conn) {						send(conn, "message", message);					});							log(user + ": " + e.data, color);				}			};			conn.onclose = function(e) {				if (user) log("-GONE: " + user);						let i = connections.indexOf(conn);				if (i >= 0) connections.splice(i, 1);			};			conn.onerror = function(e) {				log("-ERROR", '#f00');				conn.close();			};		};		log("server is launching on port " + serverPort);	}	onQuit(application) {		application.shared = false;	}}
application.behavior = new AppBehavior();