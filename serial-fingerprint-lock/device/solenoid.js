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
    solenoid: {type: "Digital", direction: "output"}
};

exports.configure = function() {
    this.solenoid.init();
}

exports.lock = function() {
    this.solenoid.write(1);
}
		
exports.unlock = function() {
    this.solenoid.write(0);
}

exports.close = function() {
    this.solenoid.write(0);
	this.solenoid.close();
}