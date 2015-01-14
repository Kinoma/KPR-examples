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
    uv: {type: "A2D", pin: 52},
    vref: {type: "A2D", pin: 54},
}

exports.configure = function(configuration) {
    this.pinsSimulator = shell.delegate("addSimulatorPart", {
        header : { 
            label : "ML8511 UV Sensor",
            name : "Sensor Input",
            iconVariant : PinsSimulators.SENSOR_MODULE
        },
		axes : [
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "UV (mW/cm^2)",
					valueID : "intensity",
					minValue : 0,
					maxValue : 15,
					value : 3,
					speed : 1,
                    defaultControl: PinsSimulators.SLIDER
				}
			)
		]
    });
    this.lastUV = undefined;
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.read = function() {
    var result = this.pinsSimulator.delegate("getValue");
    if (result.intensity == this.lastUV)
        return;
    
    this.lastUV = result.intensity;
    
    result.index = 3;
    return result;
}
