//@module
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

var PinsSimulators = require( "PinsSimulators" );

/* ASSETS */

let textStyle = new Style( { color:'black', font:'bold 18px', horizontal:'center', vertical:'middle', left:5, right:5, bottom:5 } );
let whiteSkin = new Skin( {fill: "white"} );

/* TEMPLATES */

let ServoPartSim = Container.template($ => ({
	top: 12, bottom: 12, right: 0, left:0, skin: whiteSkin,	
	anchor: "CUSTOMITEM",
	contents:[
		new Column({
			left:0, right:0, top:0, bottom:0,	
			contents:[
				Container($, {
					left:0, right:0, top:0, bottom:0, 
					contents: [
						Picture($, { url:'./assets/servo-motor.png', name: "MOTOR" }),
						Picture($, {
							left: 57, top: 10, width: 121, height: 119,
							url:'./assets/servo-wheel.png', 
							name: "WHEEL",
							Behavior: WheelBehavior,
						}),
					]
				}),
				Text($, {
					left:0, right:0, bottom:0, 
					style:textStyle, name: "PWREADOUT",
					string: "Pulse Width: 0.000 msecs (0%)",
				}),
			],
		})
	],
}));

/* BEHAVIORS */

class CustomSimBehavior extends Behavior {
	onCreate( column, data ) {
        column.partContentsContainer.add( new ServoPartSim(data) );
	}
};

class WheelBehavior extends Behavior {
	onCreate( picture, data ) {
		// speed = angle bump per onTimeChanged
		this.speed = 1.6; // stately rotation speed
		this.pulseWidth = 0;
		this.direction = 0;
		this.dutyCycle = 0;
		this.period = data.servoData.data.period;
		this.servoData = data.servoData;
	}
	onDisplaying( picture ) {
		picture.origin = { x:picture.width>>1, y:picture.height>>1 };
		picture.rotation = 0;
		picture.start();
	}
	
	onUpdate(picture, params) {
		this.period = ( 'period' in params ? params.period: this.period );
		if( 'pulseWidth' in params ) {
			this.pulseWidth = params.pulseWidth;
			this.dutyCycle = this.pulseWidth/this.period;
		}
		if( 'dutyCycle' in params ) {
			this.dutyCycle = params.dutyCycle;
			this.pulseWidth = this.period * this.dutyCycle;
		}
		
		// Determine rotational direction
		let isMoving = Math.abs(Math.sign(( this.pulseWidth - this.servoData.data.stop ) * this.pulseWidth ));
		// some servos go clockwise at longer pulse widths, some at shorter
		let cwDirection = Math.sign( this.servoData.data.ccw - this.servoData.data.cw );
		this.direction = Math.sign( this.servoData.data.stop - this.pulseWidth ) * isMoving * cwDirection;
		picture.container.next.string = "Pulse Width: " + this.pulseWidth.toFixed(3)  + " msecs (" + ( this.dutyCycle*100 ).toFixed(2) + "%)";
	}
		
	onTimeChanged( picture ) {
		let rotation = picture.rotation;
		rotation += this.speed * this.direction || 0;
		if ( rotation < 0 ) rotation = 360;
		picture.rotation = rotation;
	}
}

/* BLL API */

exports.pins = {
	servo: { type: "PWM" }
};

exports.configure = function( params ) {
	this.data = {
		id: 'MyServo',
		behavior: CustomSimBehavior,
		header : { 
			label : 'Servo ' + params.servoData.model, 
			name : "Continuous Servo", 
			iconVariant : PinsSimulators.SENSOR_GAUGE 
		},
		
		servoData: params.servoData,
	};
	this.pinsSimulator = shell.delegate("addSimulatorPart", this.data);
}

exports.rotate = function( params ) {
	//params must have pulseWidth or dutyCycle, optionally period
	if( 'period' in params ) this.period = params.period;
	if( 'dutyCycle' in params ) {
		this.pulseWidth = this.period * params.dutyCycle
	}
	this.pinsSimulator.distribute( "onUpdate", params )
}

exports.stop = function( params = {} ) {
	if( 'stopWidth' in params ) { // powered stop
		params.pulseWidth = params.stopWidth;
	} else {
		params.pulseWidth = 0 // coast to a stop
	}
	this.pinsSimulator.distribute( "onUpdate", params )
}

exports.close = function() {
	shell.delegate( "removeSimulatorPart", this.pinsSimulator );
}
