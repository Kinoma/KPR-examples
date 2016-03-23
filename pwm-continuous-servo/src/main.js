/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.
  
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

let Pins = require('pins');

/* SETTINGS */

let servoPin = 51; // whichever pin the control line of your servo is connected to
let connectedModel = "SM-S4303R";
// Add your servo model to servos.json with pulse width values (in milliseconds)
// TIP: Use Pin Explorer on Kinoma Create with a 3ms period to determine 
//      good values


/* TEMPLATES */

let MainScreen = Column.template($ => ({
	name: "MAINSCREEN",
	left:0, right:0, top:0, bottom:0, skin:mainSkin,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.servoData = data;
		}
		onDisplayed(container) {
			/* Create message for communication with hardware pins.
	    	   servo: name of pins object, will use later for calling 'button' methods.
	    	   require: name of the BLL module.
	    	   pins: initializes 'servo' (matches 'servo' object in the BLL) with the given pin numbers. Pin 'type' is set within the BLL.
	    	*/
	    	let configuration = {
				servo: {
					require: "servo",
					pins: {
						servo: { pin: servoPin },
						// comment these out if not powering servo from front pins
						pwr:   { pin: 52, voltage: 5, type: "Power"},
						gnd:   { pin: 53, type: "Ground"} 
					},
					servoData: this.servoData,
				}
			}

			// Pins 28,30 and 34 on the back only support duty cycle mode
			this.pulseWidthMode = ( [28,30,34].indexOf( configuration.servo.pins.servo.pin ) == -1 ? true : false );
			configuration.servo.pulseWidthMode = this.pulseWidthMode; // BLL needs this
			trace( "Configuring for servo model " + this.servoData.model + " (i.e. " + this.servoData.url + ")\n");
	    	Pins.configure(configuration, success => this.onPinsConfigured(container, success));
		}

		onPinsConfigured( container, success ) {		
	    	
			if (success) {
				// Add the buttons 
				if(this.pulseWidthMode) { 
					let period = this.servoData.data.period || 20
					// These buttons require pulse width mode:
					container.add( new ControlButton({string:"Clockwise", messageString: "/servo/rotate", params: { pulseWidth: this.servoData.data.cw, period: period }}));
					container.add( new ControlButton({string:"Counterclockwise", messageString: "/servo/rotate", params: { pulseWidth: this.servoData.data.ccw, period: period }}));
					container.add( new ControlButton({string:"Brake", messageString: "/servo/stop", params: { stopWidth: this.servoData.data.stop || 1.5, period: period }}));
				} else {
					container.add( new ControlButton({string:"Rotate", messageString: "/servo/rotate", params: { dutyCycle: this.servoData.data.dutyCycle, period: 0.07877}}));
				}
				
				// This button works in either mode:
				container.add( new ControlButton( { string:"Stop", messageString: "/servo/stop" } ) );
				
				Pins.share("ws", { zeroconf: true, name: "pwm-continuous-servo" });
			}
			else
				trace( "failed to configure pins\n" );
		}
	},
}));

let ControlButton = Container.template($ => ({
	left:8, right:8, top:8, height: 50, active:true, skin:buttonSkin, style:buttonStyle,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.messageString = data.messageString;
			this.params = data.params;
		}
		onTouchBegan(container) {
			container.state = 1;
			Pins.invoke(this.messageString, this.params);             
		}
		onTouchEnded(container) {
			container.state = 0;
		}
	},
	contents:[
		Label($, { left:0, right:0, string:$.string })
	]
}))

/* ASSETS */

let mainSkin = new Skin( { fill:'#F0F0F0' } );
let buttonSkin = new Skin( { fill: ['#707070','#4E4E4E'] } );
let buttonStyle = new Style( { font:'50px Fira Sans', color:'white' } );

/* APPLICATION */

let servoData = loadServos( connectedModel )
application.add( new MainScreen( servoData ) );

function loadServos( modelNum ) {
	let url = mergeURI( application.url, "./servos.json" );
	let servos = JSON.parse(Files.readText( url ) );
	if( modelNum ) {
		// Returns first record matching the model number
		let result = servos.filter( model => model.model == modelNum ).shift()
		if(result) {
			return result
		} else {
			return servos.filter( model => model.model == "generic" ).shift();
		}
	} else {
		// If no model number specified in params,
		// returns an array of model numbers to populate a pick-list
		return servos.map( model => model.model )
	}
}
