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

exports.pins = {
    red: { type: "PWM", value: 1 },
    green: { type: "PWM", value: 1  },
    blue: { type: "PWM", value: 1  },
    anode: { type: "Digital", direction: "output", value: 1  } 
};

exports.configure = function( led ) {
	this.red.init();
	this.green.init();
	this.blue.init();
	this.anode.init();
	
	//turn off the lights
	this.red.write( led.pins.red.value );
	this.green.write( led.pins.green.value );
	this.blue.write( led.pins.blue.value );
	this.anode.write( led.pins.anode.value );
}

exports.write = function( parameters ) {
	switch( parameters.color ){
		case( "red" ):
			this.red.write( 1 - parameters.value );
			return;
		case( "green" ):
			this.green.write( 1 - parameters.value );
			return;
		case( "blue" ):
			this.blue.write( 1 - parameters.value );
			return;
	}
}

exports.close = function( led ){
	this.red.close();
	this.green.close();
	this.blue.close();
	this.anode.close();
	
	//turn off the lights
	this.red.write( led.pins.red.value );
	this.green.write( led.pins.green.value );
	this.blue.write( led.pins.blue.value );
	this.anode.write( led.pins.anode.value );
}


