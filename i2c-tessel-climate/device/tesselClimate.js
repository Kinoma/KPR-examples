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

// based on tessel/si7020/index.js - https://github.com/tessel/si7020/

var RH_NO_HOLD = 0xF5;  // Measure Relative Humidity, No Hold Master Mode
var TEMP_CACHED = 0xE0; // Retrieve Cached Temperature
var CMD_RESET = 0xFE    // Software Reset

exports.pins = {
    climate: {type: "I2C", address: 0x40, units: "farenheight", heater: false}
}

exports.configure = function(configuration) {
    this.climate.init();

    this.climate.writeBlock(CMD_RESET);
    sensorUtils.mdelay(20);

    this.climate.writeBlock(0xFC, 0xC9);        // Read Electronic ID 2nd Byte
    var result = this.climate.readBlock(8, 1);  // 8 bytes to an array
    if (0x14 != result[0]) {
        trace("unrecognized device id " + result[0] + "\n");
        throw new Error(-1);
    }

    switch (configuration.pins.climate.units) {
        case "farenheight": this.farenheight = true; break;
        case "celsius": this.farenheight = false; break;
        default: trace("bad units " + this.units + "\n"); throw new Error(-1);
    }
    
    this.setHeater({enable: configuration.pins.climate.heater});
}

exports.close = function() {
    this.climate.close();
}

var TEMPERATURE_OFFSET = 46.85;
var TEMPERATURE_SLOPE = 175.72 / 65536;
var HUMIDITY_OFFSET = 6;
var HUMIDITY_SLOPE = 125 / 65536;

exports.read = function() {
    // retrieve humidity. may require multiple read attempts
    this.climate.writeBlock(RH_NO_HOLD)
    sensorUtils.mdelay(20);
    var data = undefined;
    while (!data) {
        try {
            data = this.climate.readBlock(3, 1);
        }
        catch (e) {
        }
    }
    var humidity = (((data[0] << 8) | data[1]) * HUMIDITY_SLOPE) - HUMIDITY_OFFSET;

    // retrieve temperature cached when humidity calculated
    this.climate.writeBlock(TEMP_CACHED);
    var data = this.climate.readBlock(3, 1);
    var temperature = (((data[0] << 8) | data[1]) * TEMPERATURE_SLOPE) - TEMPERATURE_OFFSET;
    if (this.farenheight)
        temperature = temperature * (9 / 5) + 32;

    return {temperature: temperature, humidity: humidity};
}

var HTRE = 0x04; // heater flag
var WRITE_USER_REG = 0xE6;
var READ_USER_REG = 0xE7;

exports.setHeater = function(params) {
    this.climate.writeBlock(READ_USER_REG)
    var value = this.climate.readBlock(1, 1)[0];
    if (params.enable)
        value |= HTRE;
    else
        value &= ~HTRE;
    this.climate.writeBlock(WRITE_USER_REG, value)
}
