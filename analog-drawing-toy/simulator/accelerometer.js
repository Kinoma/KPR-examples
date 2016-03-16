//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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
var PinsSimulators = require("PinsSimulators");

exports.pins = {
	x: { type: "Analog" },
	y: { type: "Analog" },
	z: { type: "Analog" }
};

exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
		header : { 
			label : "Accelerometer", 
			name : "3 Analog Inputs", 
			iconVariant : PinsSimulators.SENSOR_MODULE 
		},
		axes : [
			new PinsSimulators.AnalogInputAxisDescription(
				{
					valueLabel : "X",
					valueID : "x",
					speed : 0
				}
			),
			new PinsSimulators.AnalogInputAxisDescription(
				{
					valueLabel : "Y",
					valueID : "y",
					speed : 0.05
				}
			),
			new PinsSimulators.AnalogInputAxisDescription(
				{
					valueLabel : "Z",
					valueID : "z",
					speed : 0.05
				}
			),
		]
	});
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.read = function() {
	return this.pinsSimulator.delegate("getValue");
}

exports.metadata = {
	sources: [
		{
			name: "read",
			result: 
				{ type: "Object", name: "result", properties:
					[
						{ type: "Number", name: "x" },
						{ type: "Number", name: "y" },
						{ type: "Number", name: "z" },
					]
				},
		},
	]
};
