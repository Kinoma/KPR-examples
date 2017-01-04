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
 *
 */
var PinsSimulators = require('PinsSimulators');

exports.pins = {
	rgb: { type: "I2C", address: 0x29, gain: 16, integrationTime: 153.6 },
	led: { type: "Digital", direction: "output", ledValue: 1 }
};
var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : {
				label : "TCS34725",
				name : "I2C Color Sensor",
				iconVariant : PinsSimulators.SENSOR_LED
			},
			axes : [
				new PinsSimulators.FloatAxisDescription(
					{
						ioType : "input",
						dataType : "float",
						valueLabel : "Red",
						valueID : "r",
						minValue : 0,
						maxValue : 255,
						value : 255,
						speed : 0.33,
						defaultControl : PinsSimulators.SLIDER
					}
				),
				new PinsSimulators.FloatAxisDescription(
					{
						ioType : "input",
						dataType : "float",
						valueLabel : "Green",
						valueID : "g",
						minValue : 0,
						maxValue : 255,
						value : 255,
						speed : 0,
						defaultControl : PinsSimulators.SLIDER
					}
				),
				new PinsSimulators.FloatAxisDescription(
					{
						ioType : "input",
						dataType : "float",
						valueLabel : "Blue",
						valueID : "b",
						minValue : 0,
						maxValue : 255,
						value : 0,
						speed : 0,
						defaultControl : PinsSimulators.SLIDER
					}
				),
				new PinsSimulators.BooleanAxisDescription(
					{
						ioType : "output",
						dataType : "boolean",
						valueLabel : "LED",
						valueID : "led",
						minValue : 0,
						maxValue : 1,
						value : 0
					}
				),
			]
		});
}

var close = exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

var getColor = exports.getColor = function() {
	return this.getValue();
}

var getValue = exports.getValue = function() {
	var result = this.pinsSimulator.delegate("getValue");
		return { r : result.r, g : result.g, b : result.b };
}

var LEDOn = exports.LEDOn = function() {
	this.pinsSimulator.delegate("setValue", 'led', 1);
}

var LEDOff = exports.LEDOff = function() {
	this.pinsSimulator.delegate("setValue", 'led', 0);
}