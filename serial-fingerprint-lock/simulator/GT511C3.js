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
var ACK_OK					= 0x30;
var NACK_INFO				= 0x31;

// -- public functions --

exports.pins = {
    scanner: {type: "Serial", baud: 9600}
};

exports.configure = function(configuration) {
}

exports.close = function() {
trace("scanner close\n");
}

exports.initialize = function() {
	return {response: ACK_OK};
}

exports.terminate = function() {
}

exports.cmos_led = function (on) {
	return {response: ACK_OK};
}

exports.change_baudrate = function (baudrate) {
	return {response: ACK_OK};
}

exports.enroll_count = function() {
	return {response: ACK_OK, parameter: 2};
}

exports.check_enrolled = function(pos) {
	return {response: ACK_OK};
}

exports.enroll_start = function(pos) {
	return {response: ACK_OK};
}

exports.capture = function(quality) {
	return {response: ACK_OK};
}

exports.enroll = function(params) {
	return {response: ACK_OK};
}

exports.is_finger_pressed = function() {
	return {response: ACK_OK, parameter: 0};
}

exports.delete_one = function(pos) {
	return {response: ACK_OK};
}

exports.delete_all = function() {
	return {response: ACK_OK};
}

exports.verify = function(pos) {
	return {response: ACK_OK};
}

exports.identify = function() {
	return {response: ACK_OK};
}

exports.get_rawimage = function() {
	return {response: ACK_OK};
}

