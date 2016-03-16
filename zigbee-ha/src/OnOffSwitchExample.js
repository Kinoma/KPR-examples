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

/**
 * ZigBee Home Automation: On/Off Switch Example
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 *
 * This example shows how to implement On/Off Switch device
 * on Kinoma Create device with XBee, using ZigBeeJS API.
 */

var Utils = require("/lowpan/common/utils");
var Buffers = require("/lowpan/common/buffers");
var ByteBuffer = Buffers.ByteBuffer;

var APS = require("./zigbee/aps");

// Consts from ZigBee HA 1.2 standard
const PROFILE_HA = 0x0104;
const ZCL_ON_OFF_SWITCH_DEVICE_ID = 0x0000;
const ZCL_IDENTIFY_CLUSTER_ID = 0x0003;
const ZCL_ON_OFF_CLUSTER_ID = 0x0006;
const ZCL_LEVEL_CONTROL_CLUSTER_ID = 0x0008;
const CMD_OFF = 0x00;
const CMD_ON = 0x01;
const CMD_TOGGLE = 0x02;

exports.PROFILE_HA = PROFILE_HA;

// Default values
const DEFAULT_TX_RADIUS = 12;
const DEFAULT_TX_OPTIONS = APS.TXOption.ACK;
const DEFAULT_TX_BUFFER_SIZE = 64;

// Maintain ZCL transaction sequence number (8bit)
var transactionSequence = new Utils.Sequence(8);

// Define the ZigBee APS data connection with simple descriptor
const SIMPLE_DESCRIPTOR = {
	endpoint: 0x01,		// We deploy this application on 0x01
	profileId: PROFILE_HA,
	deviceId: ZCL_ON_OFF_SWITCH_DEVICE_ID,
	deviceVersion: 0x00,
	inputClusters: [ZCL_ON_OFF_CLUSTER_ID],
	outputClusters: [ZCL_IDENTIFY_CLUSTER_ID, ZCL_ON_OFF_CLUSTER_ID]
};
exports.SIMPLE_DESCRIPTOR = SIMPLE_DESCRIPTOR;

var connection = null;

exports.openConnection = function (zdo) {
	connection = APS.openConnection(zdo, SIMPLE_DESCRIPTOR);
	// Define what to do when this endpoint receives
	connection.delegate = {
		received: received
	};
};

function received(packet) {
	let buffer = ByteBuffer.wrap(packet.payload);
	buffer.littleEndian = true;
	if (packet.clusterId == ZCL_ON_OFF_CLUSTER_ID) {
		let commandPacket = readZCLCommandPacket(buffer);
		switch (commandPacket.commandId) {
		case CMD_OFF:
			application.invoke(new MessageWithObject("pins:/led/turnOff", {color: "red"}));
			break;
		case CMD_ON:
			application.invoke(new MessageWithObject("pins:/led/turnOn", {color: "red"}));
			break;
		case CMD_TOGGLE:
			application.invoke(new MessageWithObject("pins:/led/toggle", {color: "red"}));
			break;
		}
	}
}

function sendIdentify(dstAddress, dstEndpoint) {
	sendZCLCommandPacket({
		address: dstAddress,
		endpoint: dstEndpoint,
		clusterId: ZCL_IDENTIFY_CLUSTER_ID,
		clusterSpecific: true,
		manufacturerSpecific: false,
		fromServer: false,
		disableDefaultResponse: true,
		commandId: 0x00,
		payload: [0x0a, 0x00]		// 10sec
	});
}
exports.sendIdentify = sendIdentify;

function sendOnOffToggle(dstAddress, dstEndpoint) {
	sendZCLCommandPacket({
		address: dstAddress,
		endpoint: dstEndpoint,
		clusterId: ZCL_ON_OFF_CLUSTER_ID,
		clusterSpecific: true,
		manufacturerSpecific: false,
		fromServer: false,
		disableDefaultResponse: true,
		commandId: CMD_TOGGLE,
		payload: null
	});
}
exports.sendOnOffToggle = sendOnOffToggle;

function sendOn(dstAddress, dstEndpoint) {
	sendZCLCommandPacket({
		address: dstAddress,
		endpoint: dstEndpoint,
		clusterId: ZCL_ON_OFF_CLUSTER_ID,
		clusterSpecific: true,
		manufacturerSpecific: false,
		fromServer: false,
		disableDefaultResponse: true,
		commandId: CMD_ON,
		payload: null
	});
}
exports.sendOn = sendOn;

function sendOff(dstAddress, dstEndpoint) {
	sendZCLCommandPacket({
		address: dstAddress,
		endpoint: dstEndpoint,
		clusterId: ZCL_ON_OFF_CLUSTER_ID,
		clusterSpecific: true,
		manufacturerSpecific: false,
		fromServer: false,
		disableDefaultResponse: true,
		commandId: CMD_OFF,
		payload: null
	});
}
exports.sendOff = sendOff;

// Utility function to send ZCL command
function sendZCLCommandPacket(commandPacket) {
	commandPacket.tsn = transactionSequence.nextSequence();
	
	let buffer = ByteBuffer.allocate(DEFAULT_TX_BUFFER_SIZE);
	buffer.littleEndian = true;
	writeZCLCommandPacket(commandPacket, buffer);
	buffer.flip();

	let packet = {
		address: commandPacket.address,
		endpoint: commandPacket.endpoint,
		clusterId: commandPacket.clusterId,
		payload: buffer.getByteArray()
	};

	connection.send(packet, DEFAULT_TX_RADIUS, DEFAULT_TX_OPTIONS);
}

// Utility function to packetize ZCL command
function writeZCLCommandPacket(obj, buffer) {
	let frameControl = 0;
	if (obj.clusterSpecific) {
		frameControl |= 0x01;
	}
	if (obj.manufacturerSpecific) {
		frameControl |= 0x04;
	}
	if (obj.fromServer) {
		frameControl |= 0x08;
	}
	if (obj.disableDefaultResponse) {
		frameControl |= 0x10;
	}
	buffer.putInt8(frameControl);
	if (obj.manufacturerSpecific) {
		buffer.putInt16(obj.manufacturerCode);
	}
	buffer.putInt8(obj.tsn);
	buffer.putInt8(obj.commandId);
	if (obj.payload != null) {
		buffer.putByteArray(obj.payload);
	}
}

// Utility function to parse ZCL command packet
function readZCLCommandPacket(buffer) {
	let frameControl = buffer.getInt8();
	return {
		clusterSpecific: ((frameControl & 0x03) > 0),
		manufacturerSpecific: ((frameControl & 0x04) > 0),
		manufacturerCode: ((frameControl & 0x04) > 0) ? buffer.getInt16() : -1,
		fromServer: ((frameControl & 0x08) > 0),
		disableDefaultResponse: ((frameControl & 0x10) > 0),
		tsn: buffer.getInt16(),
		commandId: buffer.getInt16(),
		payload: null
	};
}
