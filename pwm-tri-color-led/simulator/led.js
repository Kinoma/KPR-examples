//@module
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
let PinsSimulators = require("PinsSimulators");

let gColor = { r : 1, g : 1, b : 1 }

/* ASSETS */

let colorLEDSkin = new Skin({ texture: new Texture("./color-led.png"), x:0, y:0, width:150, height:233 });

/* BEHAVIORS */

let PWMLEDBehavior = Behavior.template({
	onCreate(column, data) {
		column.add(new Spacer);
		column.add(new PWMLED(data)); 
		column.distribute("onChanged");
	}
});

/* LAYOUTS */

let PWMLED = Container.template($ => ({
	width:150, height:233,
	contents: [
		Canvas($, {
			left:0, right:0, top:0, bottom:0,
			Behavior: class extends Behavior {
				draw(canvas) {
               		var ctx = canvas.getContext("2d");
					ctx.beginPath();
					ctx.rect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = this.getColorString(canvas);
					ctx.fill();
				}
				getColorString(canvas) {
					var r = Math.floor((1 - gColor.r) * 255);
					var g = Math.floor((1 - gColor.g) * 255);
					var b = Math.floor((1 - gColor.b) * 255);
					return "rgb(" + r + "," + g + "," + b +")";
				}
				onDisplaying(canvas) {
               		this.draw(canvas);
				}
			}
		}),
		Content($, { skin:colorLEDSkin })
	]
}));

let Spacer = Content.template($ => ({ width:150, height:17 }));

/* BLL */

exports.pins = {
    red: { type: "PWM", value: 1 },
    green: { type: "PWM", value: 1  },
    blue: { type: "PWM", value: 1  },
    anode: { type: "Digital", direction: "output", value: 1  } 
};

exports.configure = function( led ) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
		behavior: PWMLEDBehavior,
		header : { 
			label : "Tri Color LED", 
			name : "PWM LED", 
			iconVariant : PinsSimulators.SENSOR_LED 
		}
	})
}

exports.write = function( parameters ) {
	switch( parameters.color ){
		case( "red" ):
			gColor.r = ( 1 - parameters.value );
			break;
		case( "green" ):
			gColor.g = ( 1 - parameters.value );
			break;
		case( "blue" ):
			gColor.b = ( 1 - parameters.value );
			break;
	}
	this.pinsSimulator.distribute("draw");
}

exports.close = function( led ){
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.metadata = {
	sinks: [
		{
			name: "write",
			params: 
				{ type: "Object", name: "parameters", properties:
					[
						{ type: "String", name: "color", defaultValue: "red" },
						{ type: "Number", name: "value" },
					]
				},
		},
	]
};
