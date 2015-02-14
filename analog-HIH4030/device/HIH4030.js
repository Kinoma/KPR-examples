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

// https://www.sparkfun.com/datasheets/Sensors/Weather/SEN-09569-HIH-4030-datasheet.pdf
// http://bildr.org/2012/11/hih4030-arduino/
// https://github.com/angryelectron/tweetpot/blob/master/arduino/HIH4030/HIH4030.cpp

// Note: For the most accurate results is recommended to use the calibration data provided for your sensor.

exports.pins = {
	humidity: {type: "A2D"}
};

exports.configure = function() {
	this.humidity.init();
	this.supplyVoltage = 5.0;									// code assumes +5 VDC supply voltage
	this.slope = 0.0062 * this.supplyVoltage;
	this.offset = 0.16 * this.supplyVoltage;
}

exports.read = function(degreesCelsius) {
	var value = this.humidity.read();							// read the value from the sensor [0,1]
	var voltage = value * this.supplyVoltage;					// convert to voltage value [0, 5]
	return ((voltage - this.offset) / this.slope) / (1.0546 - (0.00216 * degreesCelsius));
}

exports.close = function() {
	this.humidity.close();
}
