//@module
/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
exports.pins = {
    red: { type: "PWM" },
    green: { type: "PWM"  },
    blue: { type: "PWM"   },
    anode: { type: "Digital", direction: "output"  } 
};

exports.configure = function( ) {
	this.red.init();
	this.green.init();
	this.blue.init();
	this.anode.init();
	
	//turn off the lights
	this.red.write( 1 );
	this.green.write( 1 );
	this.blue.write( 1 );
	this.anode.write( 1 );
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

exports.close = function( ){
	//turn off the lights
	this.red.write( 1 );
	this.green.write( 1 );
	this.blue.write( 1 );
	this.anode.write( 0 );
	
	this.red.close();
	this.green.close();
	this.blue.close();
	this.anode.close();
}

exports.metadata = {
	sinks: [
		{
			name: "write",
			params: 
				{ type: "Object", name: "parameters", properties:
					[
						{ type: "String", name: "color", defaultValue: "red" },
						{ type: "Number", name: "value" },
					]
				},
		},
	]
};
