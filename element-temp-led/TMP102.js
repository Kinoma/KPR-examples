//@module
/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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
let FAHRENHEIT = true;

exports.pins = {
    temperature: {type: "I2C", address: 0x48}
};

exports.configure = function () {
	this.temperature.init();
}

exports.read = function () {
    let data = this.temperature.readWordDataSMB(0);
	let value = ((data & 0xFF) << 4) | ((data >> 8) >> 4);
	if (value & 0x800) {
	    value -= 1;
	    value = ~value & 0xFFF;
        value = -value;
    }

	/* convert to Fahrenheit if FAHRENHEIT=true, convert to Celsius if false */
    FAHRENHEIT? (value = value*(0.1125)+32) : (value *= 0.0625);
    return value;
}

exports.close = function() {
    this.temperature.close();
}
