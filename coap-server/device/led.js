//@module
/*
 *     Copyright (C) 2002-2015 Kinoma, Inc.
 *
 *     All rights reserved.
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
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

var THRESHOLD = 0.7;
var VALUE_ON_THRESHOLD = 0.3;

function convert(val) {
	var fraction = val / 255;
	return Math.pow(fraction, 4);

	if (fraction < 0) fraction = 0;
	else if (fraction > 1.0) fraction = 1.0;

	var offset, max;
	if (fraction <= THRESHOLD) {
		offset = 0;
		max = VALUE_ON_THRESHOLD;
		fraction /= THRESHOLD;
	} else {
		offset = VALUE_ON_THRESHOLD;
		max = 1.0 - VALUE_ON_THRESHOLD;
		fraction = (fraction - THRESHOLD) / (1.0 - THRESHOLD);
	}

	return offset + max * fraction;
}

exports.write = function( parameters ) {
	if ('red' in parameters)
		this.red.write( 1 - convert(parameters.red) );
	if ('green' in parameters)
		this.green.write( 1 - convert(parameters.green) );
	if ('blue' in parameters)
		this.blue.write( 1 - convert(parameters.blue) );
}

exports.close = function( led ){
	this.red.write(0);
	this.green.write(0);
	this.blue.write(0);
	this.anode.write(0);

	this.red.close();
	this.green.close();
	this.blue.close();
	this.anode.close();
}


