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

// https://github.com/sparkfun/Serial7SegmentDisplay/wiki/Serial-7-Segment-Display-Datasheet
// https://github.com/sparkfun/Serial7SegmentDisplay/wiki/Special-Commands

exports.pins = {
	display: {type: "Serial", baud: 9600}
};

exports.brightness = function(level) {
	var data = Math.floor(255 * level) & 0xFF;
	this.display.write(0x7A);
	this.display.write(data);
}

exports.clear = function() {
	this.display.write(0x76);
}

exports.close = function() {
	this.display.close();
}

exports.configure = function() {
	this.display.init();
}

exports.cursor = function(digit) {
	this.display.write(0x79);
	this.display.write(digit);
}

exports.writeDecimalControl = function(command) {
	this.display.write(0x77);
	this.display.write(command);
}

exports.writeString = function(string) {
	this.cursor(0);
	for (var i = 0, c = string.length; i < c; ++i) {
		var code = string.charCodeAt(i);
		this.display.write(code);
	}
}

exports.DECIMAL_1_BIT_MASK = 0x01;
exports.DECIMAL_2_BIT_MASK = 0x02;
exports.DECIMAL_3_BIT_MASK = 0x04;
exports.DECIMAL_4_BIT_MASK = 0x08;
exports.COLON_BIT_MASK = 0x10;
exports.APOSTROPHE_BIT_MASK = 0x20;

exports.CURSOR_DIGIT_0 = 0;
exports.CURSOR_DIGIT_1 = 1;
exports.CURSOR_DIGIT_2 = 2;
exports.CURSOR_DIGIT_3 = 3;
