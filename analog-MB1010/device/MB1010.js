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

// http://www.maxbotix.com/Ultrasonic_Sensors/MB1010.htm
// http://www.maxbotix.com/articles/032.htm

// Note: This BLL assumes a +5VDC supply voltage. The app can override the supply voltage and corresponding volts per inch
// by providing values in the configuration message

exports.pins = {
	range: {type: "A2D", supplyVoltage: 5.0, voltsPerInch: 0.009766}
};

exports.configure = function(configuration) {
	this.voltsPerInch = configuration.pins.range.voltsPerInch;
	this.supplyVoltage = configuration.pins.range.supplyVoltage;
	this.range.init();
}

exports.read = function() {
    var measured = this.range.read();
    var range = (measured * this.supplyVoltage) / this.voltsPerInch;
    return range;
}

exports.close = function() {
	this.range.close();
}
