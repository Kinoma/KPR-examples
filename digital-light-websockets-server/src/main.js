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

let Pins = require("pins");

/* ASSETS */

let backgroundSkin = new Skin({ fill:'white' });
let titleStyle = new Style({ font:'36px', color:'black', horizontal:'center', vertical:'middle' });

/* HANDLERS */

Handler.bind("/info", Behavior({
	onInvoke(handler, message) {
		message.responseText = JSON.stringify( { port: serverPort, name: serverName, lightState: lightState } );            
	}
}));

/* BEHAVIORS */

class ApplicationBehavior extends Behavior {
	onLaunch(application) {
		application.shared = true;
		
		// Initialize BLL with led.
		Pins.configure({
			light: {
				require: "led",
				pins: {
					ground: { pin: 60, type: "Ground" },
					led: { pin: 59 }
				}
			}
		}, success => this.onPinsConfigured(application, success));
		
		application.add(new MainScreen({ title: "Light switch server!" }))
	}
	onPinsConfigured(label, success) {		
		if (success) {
			Pins.share("ws", {zeroconf: true, name: "digital-light-websockets-server"});
		}
		else
			trace("failed to configure pins\n");
	}
	onQuit(application) {
		application.shared = false;
	}
	ON(container) {
        Pins.invoke( "/light/turnOn" );   
		for ( let i = 0; i < clients.length; i++ ) {			
			clients[ i ].send( "lightIsOn" );
		}
		lightState = "lightIsOn";
	}
	OFF(container) {
		Pins.invoke( "/light/turnOff" );   
		for ( let i = 0; i < clients.length; i++ ) {			
			clients[ i ].send( "lightIsOff" );
		}
		lightState = "lightIsOff";
	}
};

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Label($, { left:0, right:0, style:titleStyle, string:$.title })
	]
}));

/* APPLICATION */

let lightState = "lightIsOff";
let clients = [];
let serverPort = 9300; 
let serverName = "Server #" + serverPort;

let server = new WebSocketServer( serverPort );
server.onlaunch = function() {};
server.onconnect = function(conn, options) {
	clients.push( conn );
	
	conn.onmessage = function( e ) {
		//e.data == name of method to call
		application.distribute( e.data );
	};
	conn.onopen = function() {};
	conn.onclose = function( e ) {	
		clients.splice( clients.indexOf(this), 1 );
	};  
	conn.onerror = function( e ) {
		conn.close();
	};
};

application.behavior = new ApplicationBehavior(application);

