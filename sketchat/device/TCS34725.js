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

var COMMAND = 0x80;
var ID = 0x12;
var ATIME = 0X1;
var CONTROL = 0XF;
var CDATAL = 0x14;
var RDATAL = 0x16;
var GDATAL = 0x18;
var BDATAL = 0x1A;
var ENABLE = 0;
var ENABLE_PON = 0x01;
var ENABLE_AEN = 0x02;

exports.pins = {
    rgb: { type: "I2C", address: 0x29, gain: 16, integrationTime: 153.6 },
    led: { type: "Digital", direction: "output", value: 1 }
};

exports.configure = function(configuration) {
	this.rgb.init();
	var id = this.rgb.readByteDataSMB( COMMAND | ID );
	if (0x44 != id)
		throw "colorSensor - cannot find device - got ID " + id;
	this.rgb.writeByteDataSMB( COMMAND | ENABLE, ENABLE_PON );
	sensorUtils.mdelay( 3 );
	this.rgb.writeByteDataSMB( COMMAND | ENABLE, ENABLE_PON | ENABLE_AEN );

    this.setGain( configuration.pins.rgb.gain );
    this.setIntegrationTime( configuration.pins.rgb.integrationTime );

    if ( "led" in this ) {
        this.led.init();
        this.setLED( configuration.pins.led.value );
    }
}

exports.close = function() {
	this.rgb.close();
    if ( "led" in this )
        this.led.close();
}

exports.getColor = function() {

	var r = this.rgb.readWordDataSMB( COMMAND | RDATAL );
	var g = this.rgb.readWordDataSMB( COMMAND | GDATAL );
	var b = this.rgb.readWordDataSMB( COMMAND | BDATAL );
	var c = this.rgb.readWordDataSMB( COMMAND | CDATAL );
	//trace(r + " " + g + " " + b + " " + c + "\n");
	return {
		raw: { r: r, g: g, b: b, c: c },
		r: Math.round( ( r / c ) * 255 ),
		g: Math.round( ( g / c ) * 255 ),
		b: Math.round( ( b / c ) * 255 )
	};
}

exports.setGain = function( gain ) {
    var value;
    switch ( gain ) {
        case 1: value = 0; break;
        case 4: value = 1; break;
        case 16: value = 2; break;
        case 60: value = 3; break;
        default: throw "Invalid gain " + gain;
    }
	this.rgb.writeByteDataSMB(COMMAND | CONTROL, value);
}

exports.setIntegrationTime = function( time ) {
    if ( ( time < 0 ) || ( time > 614.4 ) )
        throw "Invalid integrationIime " + time;

    var value = Math.round( 256 - ( time / 2.4 ) );
	this.rgb.writeByteDataSMB( COMMAND | ATIME, value );
    return value;
}

exports.setLED = function( value ) {
    this.led.write( value ? 1 : 0 );
}
