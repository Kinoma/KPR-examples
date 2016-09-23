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
let FAHRENHEIT = true;
let PinsSimulators = require("PinsSimulators");

export default {
	pins: {
		temperature: {type: "I2C", address: 0x48}
	},
	configure() {
	    this.pinsSimulator = shell.delegate("addSimulatorPart", {
	        header : { 
				name : "TMP102", 
				label : "Temperature Sensor", 
				iconVariant : PinsSimulators.SENSOR_MODULE
	        },
			axes : [
				new PinsSimulators.AnalogInputAxisDescription(
					{
						valueLabel : "Fahrenheit",
						valueID : "temperatureValue",
						defaultControl : PinsSimulators.SLIDER,
						minValue : -30,
						maxValue : 100,
						value : 0
					}
				),
			]
	    })
	},
	read() {
		var axes = this.pinsSimulator.delegate("getValue");
		return axes.temperatureValue;				
	},
	close() {
		shell.delegate("removeSimulatorPart", this.pinsSimulator);
	},
	metadata: {
		sources: [
			{
				name: "read",
				result: { type: "Number", name: "temperatureValue", defaultValue: 0, min: -30, max: 100, decimalPlaces: 3 }
			}
		]
	}
}