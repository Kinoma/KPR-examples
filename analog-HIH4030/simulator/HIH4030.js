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
	humidity: {type: "A2D"}
};

exports.configure = function() {
    this.pinsSimulator = shell.delegate("addSimulatorPart", {
        header : { 
            label : "HIH4030",
            name : "Humidity Sensor Input",
            iconVariant : PinsSimulators.SENSOR_MODULE
        },
		axes : [
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Percent",
					valueID : "humidity",
					minValue : 0,
					maxValue : 100,
					value : 75,
					speed : 1,
                    defaultControl: PinsSimulators.SLIDER
				}
			)
		]
    });
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.read = function(temperature) {
	var axes = this.pinsSimulator.delegate("getValue");
	return axes.humidity;				
}
