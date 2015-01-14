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
    climate: {type: "I2C", address: 0x40, units: "farenheight", heater: false}
}

exports.configure = function(configuration) {
    switch (configuration.pins.climate.units) {
        case "farenheight": this.farenheight = true; break;
        case "celsius": this.farenheight = false; break;
        default: trace("bad units " + this.units + "\n"); throw new Error(-1);
    }

    this.pinsSimulator = shell.delegate("addSimulatorPart", {
        header : { 
            label : "Tessel Climate Module",
            name : "Sensor Input",
            iconVariant : PinsSimulators.SENSOR_MODULE
        },
		axes : [
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Temperature (" + configuration.pins.climate.units + ")",
					valueID : "temperature",
					minValue : this.farenheight ? -4 : -20,
					maxValue : this.farenheight ? 122 : 50,
					value : this.farenheight ? 68 : 20,
					speed : 0,
                    defaultControl: PinsSimulators.SLIDER
				}
			),
			new PinsSimulators.FloatAxisDescription(
				{
					ioType : "input",
					dataType : "float",
					valueLabel : "Relative humidity",
					valueID : "humidity",
					minValue : 0,
					maxValue : 1,
					value : 0.35,
					speed : 0,
                    defaultControl: PinsSimulators.SLIDER
				}
			),
            new PinsSimulators.DigitalOutputAxisDescription(
                {
                    valueLabel : "Heater",
                    valueID : "heater"
                }
            ),
		]
    });

    this.setHeater({enable: configuration.pins.climate.heater});
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.read = function() {
    var result = this.pinsSimulator.delegate("getValue");
    return {temperature: result.temperature, humidity: result.humidity};
}

exports.setHeater = function(params) {
    this.pinsSimulator.delegate("setValue", "heater", params.enable ? 1 : 0);
}
