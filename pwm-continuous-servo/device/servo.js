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

exports.pins = {
	servo: { type: "PWM" }
}

exports.configure = function( params = {} ) {
	this.servo.pulseWidthMode = params.pulseWidthMode || true;
	this.servo.init();
}

exports.rotate = function( params = {} ) {
	if(this.servo.pulseWidthMode) {
		this.servo.write( params.pulseWidth, params.period || 20 );
	} else {
		this.servo.write( params.dutyCycle );
	}
}

exports.stop = function( params = {} ) {
	if( params.stopWidth && this.servo.pulseWidthMode ) { // powered stop
		this.servo.write( params.stopWidth, params.period || 20 );
	} else if( params.dutyCycle && !this.servo.pulseWidthMode ) {
		this.servo.write( params.dutyCycle );
	} else {
		this.servo.write( 0 ); // Coast to a stop
	}
}

exports.close = function( params ) {
	this.servo.write( 0 );
	this.servo.close();
}

exports.metadata = {
	sinks: [
		{
			name: "rotate"
		},
		{
			name: "stop"
		},
	]
};