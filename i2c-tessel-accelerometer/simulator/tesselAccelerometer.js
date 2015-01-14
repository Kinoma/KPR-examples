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

var THEME = require ("themes/flat/theme");
var CONTROL = require ("mobile/control");
var PinsSimulators = require ("PinsSimulators");

exports.pins = {
    accelerometer: {type: "I2C", address: 0x24}
}

exports.configure = function(configuration) {
    this.pinsSimulator = shell.delegate("addSimulatorPart", {
        header : { 
            label : "Tessel Accelerometer Module",
            name : "Sensor Input",
            iconVariant : PinsSimulators.SENSOR_KNOB 
        },
		axes : [
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "X",
					valueID : "x",
					minValue : -0.5,
					maxValue : +0.5,
					value : 0.0,
					speed : 2,
                    defaultControl: 5
				}
			),
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Y",
					valueID : "y",
					minValue : -0.5,
					maxValue : +0.5,
					value : 0.0,
					speed : 2,
                    defaultControl: 5
				}
			),
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Z",
					valueID : "z",
					minValue : -0.5,
					maxValue : 0.5,
					value : 0.0,
					speed : 2,
                    defaultControl: 5
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
