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
var PinsSimulators = require('PinsSimulators');
var gColor = { r : 1, g : 1, b : 1 }

var PWMLEDBehavior = Behavior.template({
	onCreate: function(column, data) {
		column.add(new spacer);
		column.add(new PWMLED(data));
		column.distribute("onChanged");
	},
})

var colorLEDTexture = new Texture('color-led.png', 1);
var colorLEDSkin = new Skin({ texture: colorLEDTexture, width: 150, height: 233, });
var redSkin = new Skin({ fill: 'red' });

var spacer = Container.template($ => ({ width: 150, height: 17 }));
var PWMLED = Container.template($ => ({ 
	width: 150, height: 233, skin: redSkin, 
	contents: [
		Canvas($, { 
			left: 0, right: 0, top: 0, bottom: 0, 
			Behavior: class extends Behavior {
				onDisplaying(canvas) {
					this.draw(canvas);
				}
				draw(canvas) {
					var ctx = canvas.getContext("2d");
					ctx.beginPath();
					ctx.rect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = this.getColorString(canvas);
					ctx.fill();
				}
				getColorString(canvas) {
					var r = (1 - gColor.r), g = (1 - gColor.g), b = (1 - gColor.b);
					return "rgb(" + r + "," + g + "," + b + ")";
				}
			}, 
		}),
		Content($, { skin: colorLEDSkin, }),
	] 
}));

exports.pins = {
	red: { type: "PWM", value: 1 },
	green: { type: "PWM", value: 1  },
	blue: { type: "PWM", value: 1  },
	anode: { type: "Digital", direction: "output", value: 1  }
};

var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
		behavior: PWMLEDBehavior,
		header : {
			label : "Tri Color LED",
			name : "PWM LED",
			iconVariant : PinsSimulators.SENSOR_LED
		}
	});
}

var close = exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

var write = exports.write = function(parameters) {
	if ('red' in parameters)
		gColor.r = (1 - parameters.red);
	if ('green' in parameters)
		gColor.g = (1 - parameters.green);
	if ('blue' in parameters)
		gColor.b = (1 - parameters.blue);
	this.pinsSimulator.distribute("draw");
}

exports.metadata = {
	sinks: [
		{
			name: "write",
			params: 
				{ type: "Object", name: "parameters", properties:
					[
						{ type: "Number", name: "red", defaultValue: 0, min: 0, max: 255, decimalPlaces: 0 },
						{ type: "Number", name: "green", defaultValue: 0, min: 0, max: 255, decimalPlaces: 0 },
						{ type: "Number", name: "blue", defaultValue: 0, min: 0, max: 255, decimalPlaces: 0 },
					]
				},
		},
	]
};