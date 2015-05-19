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

// BLL source code based on the SDK demo software provided by ADH Technology:
// http://www.adh-tech.com.tw/?22,gt-511c3-gt-511c31-%28uart%29

// http://dlnmh9ip6v2uc.cloudfront.net/datasheets/Sensors/Biometric/GT-511C3_datasheet_V1%201_20130411%5B4%5D.pdf
// https://github.com/sparkfun/Fingerprint_Scanner-TTL

// Header Of Cmd and Ack Packets
var STX1					= 0x55;	//Header1
var STX2					= 0xAA;	//Header2

// Header Of Data Packet
var STX3					= 0x5A;	//Header1
var STX4					= 0xA5;	//Header2

// Command codes
var CMD_NONE				= 0x00;
var CMD_OPEN				= 0x01;
var CMD_CLOSE				= 0x02;
var CMD_USB_INTERNAL_CHECK	= 0x03;
var CMD_CHANGE_BAUDRATE		= 0x04;
	
var CMD_CMOS_LED			= 0x12;

var CMD_ENROLL_COUNT		= 0x20;
var CMD_CHECK_ENROLLED		= 0x21;
var CMD_ENROLL_START		= 0x22;
var CMD_ENROLL1				= 0x23;
var CMD_ENROLL2				= 0x24;
var CMD_ENROLL3				= 0x25;
var CMD_IS_PRESS_FINGER		= 0x26;
	
var CMD_DELETE				= 0x40;
var CMD_DELETE_ALL			= 0x41;
	
var CMD_VERIFY				= 0x50;
var CMD_IDENTIFY			= 0x51;
var CMD_VERIFY_TEMPLATE		= 0x52;
var CMD_IDENTIFY_TEMPLATE	= 0x53;
	
var CMD_CAPTURE				= 0x60;

var CMD_GET_IMAGE			= 0x62;
var CMD_GET_RAWIMAGE		= 0x63;
	
var CMD_GET_TEMPLATE		= 0x70;
var CMD_ADD_TEMPLATE		= 0x71;
var CMD_GET_DATABASE_START  = 0x72;
var CMD_GET_DATABASE_END  	= 0x73;
	
var CMD_FW_UPDATE			= 0x80;
var CMD_ISO_UPDATE			= 0x81;
	
var ACK_OK					= 0x30;
var NACK_INFO				= 0x31;

// error codes
var NACK_NONE				= 0x1000;
var NACK_TIMEOUT			= 0x1001;
var NACK_INVALID_BAUDRATE	= 0x1002;
var NACK_INVALID_POS		= 0x1003;
var NACK_IS_NOT_USED		= 0x1004;
var NACK_IS_ALREADY_USED	= 0x1005;
var NACK_COMM_ERR			= 0x1006;
var NACK_VERIFY_FAILED		= 0x1007;
var NACK_IDENTIFY_FAILED	= 0x1008;
var NACK_DB_IS_FULL			= 0x1009;
var NACK_DB_IS_EMPTY		= 0x100A;
var NACK_TURN_ERR			= 0x100B;
var NACK_BAD_FINGER			= 0x100C;
var NACK_ENROLL_FAILED		= 0x100D;
var NACK_IS_NOT_SUPPORTED	= 0x100E;
var NACK_DEV_ERR			= 0x100F;
var NACK_CAPTURE_CANCELED	= 0x1010;
var NACK_INVALID_PARAM		= 0x1011;
var NACK_FINGER_IS_NOT_PRESSED	= 0x1012;

var NACK_INVALID_RESPONSE	= 0x2001;

// read timeout in ms
var COMM_DEF_TIMEOUT		= 15000;

// fixed device ID
var DEVICE_ID				= 0x0001;

var TRACE_READS				= 0;
var TRACE_WRITES			= 0;
var TRACE_RESULT			= 0;

exports.ACK_OK				= ACK_OK;
exports.NACK_INFO			= NACK_INFO;

// -- public functions --

exports.pins = {
    scanner: {type: "Serial", baud: 9600}
};

exports.configure = function(configuration) {
    this.serialConfiguration = configuration.pins.scanner;
    this.scanner.init();

    trace_read = TRACE_READS ? traceRead : nop;
    trace_write = TRACE_WRITES ? traceWrite : nop;
    trace_result = TRACE_RESULT ? traceResult : nop;
}

exports.close = function() {
	this.cmos_led.call(this, 0);
	this.terminate.call(this);
	this.scanner.close();
}

exports.restart = function(baudrate) {
    this.scanner.close();
    this.serialConfiguration.baud = baudrate; 
    this.scanner = PINS.create(this.serialConfiguration);
    this.scanner.init();
}

exports.initialize = function() {
	var result = CommandRun.call(this, CMD_OPEN, 0);
	return result;
}

exports.terminate = function() {
	var result = CommandRun.call(this, CMD_CLOSE, 0);
	return result;
}

exports.cmos_led = function(on) {
	var result = CommandRun.call(this, CMD_CMOS_LED, on ? 1 : 0);
	return result;
}

exports.change_baudrate = function(baudrate) {
	trace("in change baudrate to " + baudrate + "\n");
	
	var timeout = COMM_DEF_TIMEOUT;
	COMM_DEF_TIMEOUT = 500;
	
	var result = CommandRun.call(this, CMD_CHANGE_BAUDRATE, baudrate);
	
	COMM_DEF_TIMEOUT = timeout;
	this.restart(baudrate);

	trace("out change baudrate to " + baudrate + "\n");
	
	return {response: ACK_OK};
}

exports.enroll_count = function() {
	var result = CommandRun.call(this, CMD_ENROLL_COUNT, 0);
	return result;
}

exports.check_enrolled = function(pos) {
	var result = CommandRun.call(this, CMD_CHECK_ENROLLED, pos);
	return result;
}

exports.enroll_start = function(pos) {
	var result = CommandRun.call(this, CMD_ENROLL_START, pos);
	return result;
}

exports.capture = function(quality) {
	while (false) {	// @@ doesn't seem to be necessary
		var packet = this.scanner.read("Chunk");
		if (0 == packet.length)
			break;
		trace("read " + packet.length + "bytes\n");
		sensorUtils.mdelay(100);
	}
	var result = CommandRun.call(this, CMD_CAPTURE, quality);
	return result;
}

exports.enroll = function(params) {
	var result = CommandRun.call(this, CMD_ENROLL_START + params.index, params.pos);
	return result;
}

exports.is_finger_pressed = function() {
	var result = CommandRun.call(this, CMD_IS_PRESS_FINGER, 0);
	return result;
}

exports.delete_one = function(pos) {
	var result = CommandRun.call(this, CMD_DELETE, pos);
	return result;
}

exports.delete_all = function() {
	var result = CommandRun.call(this, CMD_DELETE_ALL, 0);
	return result;
}

exports.verify = function(pos) {
	var result = CommandRun.call(this, CMD_VERIFY, pos);
	return result;
}

exports.identify = function() {
	var result = CommandRun.call(this, CMD_IDENTIFY, 0);
	return result;
}

exports.get_rawimage = function() {
	CommandRun.call(this, CMD_GET_RAWIMAGE, 0);
	var result = ReceiveData.call(this, 19200);
	return result;
}

// -- utility functions --

function calc_checksum(buffer, length) {
	var sum = 0;
	var c = length ? length : buffer.length;
	for (var i = 0; i < c; ++i)
		sum += buffer[i];
	sum &= 0xFFFF;
	return sum;
}

function CheckCmdAckPkt(packet)
{
	if (12 != packet.length)
		return {status: "fail", error: "Invalid response size"};

	if (STX1 != packet[0] || STX2 != packet[1])
		return {status: "fail", error: "Invalid packet header"};

	var deviceID = (packet[3] << 8) | packet[2];
	if (deviceID != DEVICE_ID)
		return {status: "fail", error: "Invalid device id"};
	
	var checksum = (packet[11] << 8) | packet[10];
	if (checksum != calc_checksum(packet, 10))
		return {status: "fail", error: "Invalid checksum"};
		
	return {status: "ok"};
}

function CommandRun(command, parameter) {
	SendCmdOrAck.call(this, command, parameter);
	var result = ReceiveCmdOrAck.call(this);
	trace_result(result);
	return result;
}

function SendCmdOrAck(command, parameter) {
	var packet = new Chunk(12);
	packet[0] = STX1;
	packet[1] = STX2;
	packet[2] = DEVICE_ID & 0xFF;
	packet[3] = (DEVICE_ID >> 8) & 0xFF;
	packet[4] = parameter & 0xFF;
	packet[5] = (parameter >> 8) & 0xFF;
	packet[6] = (parameter >> 16) & 0xFF;
	packet[7] = (parameter >> 24) & 0xFF;
	packet[8] = command & 0xFF;
	packet[9] = (command >> 8) & 0xFF;
	
	var checksum = calc_checksum(packet);
	packet[10] = checksum & 0xFF;
	packet[11] = (checksum >> 8) & 0xFF;
	
	trace_write(packet);

	this.scanner.write(packet);
}

function ReceiveCmdOrAck() {
	var packet = this.scanner.read("Chunk", 12, COMM_DEF_TIMEOUT);

	trace_read(packet);

	var result = CheckCmdAckPkt(packet);
	if ("ok" != result.status)
		return {parameter: CheckCmdAckPkt, response: NACK_INFO};

	var response = (packet[9] << 8) | packet[8];	// ACK_OK or NACK_INFO
	var parameter = (packet[7] << 24) | (packet[6] << 16) | (packet[5] << 8) | (packet[4] & 0xFF); // Output parameter or NACK error code
	
	return {parameter: parameter, response: response};
}

function SendData(data) {
	var packet = new Chunk(4 + data.length + 2);
	packet[0] = STX3;
	packet[1] = STX4;
	packet[2] = DEVICE_ID & 0xFF;
	packet[3] = (DEVICE_ID >> 8) & 0xFF;
	packet.append(data);
	var checksum = calc_checksum(packet);
	packet[4 + data.length] = checksum & 0xFF;
	packet[4 + data.length + 1] = (checksum >> 8) & 0xFF;
	this.scanner.write(packet);
}

function ReceiveData(size) {
	var responseSize = size + 2 + 2 + 2;
	var packet = this.scanner.read("Chunk", responseSize, COMM_DEF_TIMEOUT);
	
	if (responseSize != packet.length)
		return {status: "fail", error: "Invalid response size", chunk: new Chunk(0)};
	
	if (STX3 != packet[0] || STX4 != packet[1])
		return {status: "fail", error: "Invalid response header", chunk: new Chunk(0)};
	
	var deviceID = (packet[3] << 8) | packet[2];
	if (deviceID != DEVICE_ID)
		return {status: "fail", error: "Invalid device id", chunk: new Chunk(0)};
	
	var packetLength = packet.length;
	var checksum = (packet[packetLength - 1] << 8) | packet[packetLength - 2];
	if (checksum != calc_checksum(packet, size + 2 + 2))
		return {status: "fail", error: "Invalid checksum", chunk: new Chunk(0)};

	return {status: "ok", chunk: packet.slice(4, 4 + size)};
}

function traceRead(packet) {
	trace("read: ");
	for (var i = 0, c = packet.length; i < c; ++i)
		trace(packet[i].toString(16) + ' ');
	trace("\n");
}

function traceWrite(packet) {
	trace("write: ");
	for (var i = 0, c = packet.length; i < c; ++i)
		trace(packet[i].toString(16) + ' ');
	trace("\n");
}

function traceResult(result) {
	trace("result: " + JSON.stringify(result) + "\n");
}

function nop() {
}

