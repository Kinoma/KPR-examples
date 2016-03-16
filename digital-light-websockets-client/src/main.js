//@program
/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
      
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/* ASSETS */

let backgroundSkin = new Skin({ fill:'black' });
let offSkin = new Skin({ fill:'#00FFFFFF' });
let pressedSkin = new Skin({ fill:'#B0FFFFFF' });
let onSkin = new Skin({ fill:'#D9FFFFFF' });
let ledOffSkin = new Skin({ texture:new Texture('./assets/led_off.png'), x:0, y:0, width:84, height:177 });
let ledOnSkin = new Skin({ texture:new Texture('./assets/led_on.png'), x:0, y:0, width:84, height:177 });

/* HANDLERS */

Handler.bind("/discover", Behavior({
	onComplete(handler, message, json) {
		//Recieves and stores server info and changes light switch to match server's state. 
		let query = parseQuery( message.query );
		let server = model.getServer( query.uuid );
		server.update( json );
		server.conn = model.doConnect( server.url );
		application.distribute( json.lightState );
	},
	onInvoke(handler, message) {
		//Uses SSDP to find and connect to available servers.
		//Then opens a Websocket with each server.
		let discovery = JSON.parse( message.requestText );
		let serversTable = model.getServersTable();
		let uuid = discovery.uuid;
		if ( !( uuid in serversTable ) ) {
			let server = new Server( discovery );
			let message = server.createMessage( "info", { uuid: server.uuid } );
			handler.invoke( message, Message.JSON );
			serversTable[ server.uuid ] = server;
		}
	}
}));

Handler.bind("/forget", Behavior({
	onInvoke(handler, message) {
		//Removes a disconnected server from the serversTable.
		let discovery = JSON.parse( message.requestText );
		let serversTable = model.getServersTable();
		let uuid = discovery.uuid;
		if ( uuid in serversTable ) {
			delete serversTable[ uuid ];
		}
	}
}));

/* BEHAVIORS */

class ApplicationBehavior extends Behavior {
	doConnect(url) {
		let conn = new WebSocket( url );

		conn.onmessage = function( e ) {
			//e.data == name of method to call
			application.distribute( e.data );
		};
		conn.onopen = function() {};
		conn.onclose = function() {};
		conn.onerror = function( e ) {};
		
		return conn;			        
	}
	clicked(application, lightState) {
		let serversTable = this.serversTable;
		for ( let uuid in serversTable ) {
			let server = serversTable[ uuid ];
			server.conn.send( lightState );
		}				
	}
	onLaunch(application) {
		application.discover( "digitallightwebsocketsserver.example.kinoma.marvell.com" );
		application.shared = true;
		this.serversTable = {};
		application.add(new MainScreen);
	}
	onQuit(application) {
		let serversTable = this.serversTable;
		for ( let uuid in serversTable ) {
			let server = serversTable[ uuid ];
			server.conn.close();
		}		
		application.forget( "digitallightwebsocketsserver.example.kinoma.marvell.com" );
		application.shared = false;
	}
	getServer(uuid) {
		return this.serversTable[ uuid ];
	}
	getServersTable(uuid) {
		return this.serversTable;
	}
};

/* TEMPLATES */

let MainScreen = Column.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Container($, {
			left:10, right:10, top:10, bottom:10, skin:onSkin, active:true,
			Behavior: class extends Behavior {
				lightIsOff(container) {
	                container.skin = onSkin;
				}
				lightIsOn(container) {
	                container.skin = offSkin;
				}
				onTouchEnded(container) {
                    application.distribute( "clicked", "OFF" );   
				}
			},
			contents: [
				Content($, { left:10, right:10, top:10, bottom:10, skin:ledOffSkin })
			]
		}),
		Container($, {
			left:10, right:10, top:10, bottom:10, active:true,
			Behavior: class extends Behavior {
				lightIsOff(container) {
	                container.skin = offSkin;
				}
				lightIsOn(container) {
					container.skin = onSkin;
				}
				onTouchEnded(container) {
					application.distribute( "clicked", "ON" );
				}
			},
			contents: [
				Content($, { left:10, right:10, top:10, bottom:10, skin:ledOnSkin })
			]
		}),
	]
}));

/* APPLICATION */

class Server {
	constructor(discovery) {
		this.location = discovery.url;
		this.type = discovery.id;
		this.uuid = discovery.uuid;
		this.name = "- Untitled -";
		this.port = undefined;
		this.url = undefined;
		this.conn = undefined;
	}
	createMessage(name, query) {
		let url = this.location + name;
		if ( query )
			url += "?" + serializeQuery( query );
		return new Message( url );
	}
	update(json) {
		this.name = json.name;
		this.port = json.port;
		this.url = 'ws:' + this.location.split( ':' )[ 1 ] + ':' + this.port;
	}
};

var model = application.behavior = new ApplicationBehavior(application);

