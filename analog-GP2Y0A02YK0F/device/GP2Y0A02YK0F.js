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

// https://www.sparkfun.com/datasheets/Sensors/Infrared/gp2y0a02yk_e.pdf
// https://www.sparkfun.com/products/8958

exports.pins = {
    proximity: {type: "A2D", supplyVoltage: 5.0}
}

exports.configure = function(configuration) {
    this.proximity.init();
	this.supplyVoltage = configuration.pins.proximity.supplyVoltage;
	this.readings = new Array(10);
	this.count = 0;
}

exports.close = function() {
    this.proximity.close();
}

exports.read = function() {
	var value = this.proximity.read();
	value *= this.supplyVoltage;
	var readings = this.readings;
	
	// Keep a running average of 10 readings
	if (this.count < 10) {
		readings[this.count++] = value;
		return;
	}
	else {
		var total = value;
        for (var i = 0; i < 9; i++) {
            readings[i] = readings[i + 1];
            total += readings[i];
        }
        readings[9] = value;
        total /= 10;
	}
	
	var cm = (16.2537 * Math.pow(value, 4)) - (129.893 * Math.pow(value, 3)) + (382.268 * Math.pow(value, 2)) - (512.611 * value) + 306.439;
	if (cm < 15)
		cm = 15;
	else if (cm > 150)
		cm = 150;
	return cm;
}
