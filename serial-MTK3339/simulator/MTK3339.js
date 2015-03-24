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
	serial: {type: "Serial", baud: 9600}
};

exports.configure = function(configuration) {
    this.pinsSimulator = shell.delegate("addSimulatorPart", {
        header : { 
            label : "Adafruit GPS Breakout",
            name : "Sensor Input",
            iconVariant : PinsSimulators.SENSOR_KNOB 
        },
		axes : [
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Latitude",
					valueID : "latitude",
					minValue : 37.75,
					maxValue : 37.79,
					value : 37.774929,
					speed : 2,
                    defaultControl: 5
				}
			),
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Longitude",
					valueID : "longitude",
					minValue : -122.50,
					maxValue : -122.30,
					value : -122.419416,
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
