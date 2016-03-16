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
 * Kinoma LowPAN Framework: ZigBee Device Profile
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 */

var Utils = require("/lowpan/common/utils");
var Buffers = require("/lowpan/common/buffers");
var ByteBuffer = Buffers.ByteBuffer;

var Address = require("./address");

exports.ZDO_ENDPOINT = 0x00;
exports.PROFILE_ZDP = 0x0000;

const Status = {
	SUCCESS: 0x00,
	INV_REQUESTTYPE: 0x80,
	DEVICE_NOT_FOUND: 0x81,
	INVALID_EP: 0x82,
	NOT_ACTIVE: 0x83,
	NOT_SUPPORTED: 0x84,
	TIMEOUT: 0x85,
	NO_MATCH: 0x86,
	NO_ENTRY: 0x88,
	NO_DESCRIPTOR: 0x89,
	INSUFFICIENT_SPACE: 0x8a,
	NOT_PERMITTED: 0x8b,
	TABLE_FULL: 0x8c,
	NOT_AUTHORIZED: 0x8d
};
exports.Status = Status;

const Command = {
	NWK_ADDR_REQ: 0x0000,
	NWK_ADDR_RSP: 0x8000,
	IEEE_ADDR_REQ: 0x0001,
	IEEE_ADDR_RSP: 0x8001,
	NODE_DESC_REQ: 0x0002,
	NODE_DESC_RSP: 0x8002,
	POWER_DESC_REQ: 0x0003,
	POWER_DESC_RSP: 0x8003,
	SIMPLE_DESC_REQ: 0x0004,
	SIMPLE_DESC_RSP: 0x8004,
	ACTIVE_EP_REQ: 0x0005,
	ACTIVE_EP_RSP: 0x8005,
	MATCH_DESC_REQ: 0x0006,
	MATCH_DESC_RSP: 0x8006,
	COMPLEX_DESC_REQ: 0x0010,
	COMPLEX_DESC_RSP: 0x8010,
	USER_DESC_REQ: 0x0011,
	USER_DESC_RSP: 0x8011,
	DEVICE_ANNCE: 0x0013,
	END_DEVICE_BIND_REQ: 0x0020,
	END_DEVICE_BIND_RSP: 0x8020,
	BIND_REQ: 0x0021,
	BIND_RSP: 0x8021,
	UNBIND_REQ: 0x0022,
	UNBIND_RSP: 0x8022,
	MGMT_LEAVE_REQ: 0x0034,
	MGMT_LEAVE_RSP: 0x8034
};
exports.Command = Command;

function readZDPCommand(clusterId, payload) {
	let buffer = ByteBuffer.wrap(payload);
	buffer.littleEndian = true;
	switch (clusterId) {
	case Command.SIMPLE_DESC_REQ:
		return readSimpleDescriptorRequest(buffer);
	case Command.MATCH_DESC_REQ:
		return readMatchDescriptorRequest(buffer);
	case Command.DEVICE_ANNCE:
		return readDeviceAnnounce(buffer);
	case Command.SIMPLE_DESC_RSP:
		return readSimpleDescriptorResponse(buffer);
	case Command.MATCH_DESC_RSP:
		return readMatchDescriptorResponse(buffer);
	}
	return null;
}
exports.readZDPCommand = readZDPCommand;

function toPayload(clusterId, obj) {
	let buffer = ByteBuffer.allocateUint8Array(255, true);
	switch (clusterId) {
	case Command.SIMPLE_DESC_REQ:
		writeSimpleDescriptorRequest(obj, buffer);
		break;
	case Command.MATCH_DESC_REQ:
		writeMatchDescriptorRequest(obj, buffer);
		break;
	case Command.DEVICE_ANNCE:
		writeDeviceAnnounce(obj, buffer);
		break;
	case Command.SIMPLE_DESC_RSP:
		writeSimpleDescriptorResponse(obj, buffer);
		break;
	case Command.MATCH_DESC_RSP:
		writeMatchDescriptorResponse(obj, buffer);
		break;
	default:
		throw "Unknown Command";
	}
	buffer.flip();
	return buffer.getByteArray();
}
exports.toPayload = toPayload;

function readSimpleDescriptorRequest(buffer) {
	return {
		nwkAddr: readNetworkAddress(buffer),
		endpoint: buffer.getInt8()
	};
}

function writeSimpleDescriptorRequest(obj, buffer) {
	writeNetworkAddress(obj.nwkAddr, buffer);
	buffer.putInt8(obj.endpoint);
}

function readMatchDescriptorRequest(buffer) {
	let obj = {
		nwkAddr: readNetworkAddress(buffer),
		profileId: buffer.getInt16(),
		inputClusters: [],
		outputClusters: []
	};
	let inClusterCount = buffer.getInt8();
	for (let i = 0; i < inClusterCount; i++) {
		obj.inputClusters[i] = buffer.getInt16();
	}
	let outClusterCount = buffer.getInt8();
	for (let i = 0; i < outClusterCount; i++) {
		obj.outputClusters[i] = buffer.getInt16();
	}
	return obj;
}

function writeMatchDescriptorRequest(obj, buffer) {
	writeNetworkAddress(obj.nwkAddr, buffer);
	buffer.putInt16(obj.profileId);
	buffer.putInt8(obj.inputClusters.length);
	for (let i = 0; i < obj.inputClusters.length; i++) {
		buffer.putInt16(obj.inputClusters[i]);
	}
	buffer.putInt8(obj.outputClusters.length);
	for (let i = 0; i < obj.outputClusters.length; i++) {
		buffer.putInt16(obj.outputClusters[i]);
	}
}

function readDeviceAnnounce(buffer) {
	return {
		nwkAddr: readNetworkAddress(buffer),
		ieeeAddr: readIEEEAddress(buffer),
		capability: buffer.getInt8()
	};
}

function writeDeviceAnnounce(obj, buffer) {
	writeNetworkAddress(obj.nwkAddr);
	writeIEEEAddress(obj.ieeeAddr);
	buffer.putInt8(obj.capability);
}

function readSimpleDescriptorResponse(buffer) {
	let obj = {
		status: buffer.getInt8(),
		nwkAddr: readNetworkAddress(buffer),
		simpleDescriptor: null
	};
	let length = buffer.getInt8();
	if (length > 0) {
		obj.simpleDescriptor = readSimpleDescriptor(buffer);
	}
	return obj;
}

function writeSimpleDescriptorResponse(obj, buffer) {
	buffer.putInt8(obj.status);
	writeNetworkAddress(obj.nwkAddr, buffer);
	if (obj.simpleDescriptor == null) {
		buffer.putInt8(0);
		return;
	}
	buffer.putInt8(8
		+ simpleDescriptor.inputClusters.length
		+ simpleDescriptor.outputClusters.length);
	writeSimpleDescriptor(obj.simpleDescriptor, buffer);
}

function readMatchDescriptorResponse(buffer) {
	let obj = {
		status: buffer.getInt8(),
		nwkAddr: readNetworkAddress(buffer),
		matchList: []
	};
	let length = buffer.getInt8();
	for (let i = 0; i < length; i++) {
		obj.matchList[i] = buffer.getInt8();
	}
	return obj;
}

function writeMatchDescriptorResponse(obj, buffer) {
	buffer.putInt8(obj.status);
	writeNetworkAddress(obj.nwkAddr, buffer);
	buffer.putInt8(obj.matchList.length);
	for (let i = 0; i < obj.matchList.length; i++) {
		buffer.putInt8(obj.matchList[i]);
	}
}

function readNetworkAddress(buffer) {
	return Address.getNetworkAddress(
		Utils.toByteArray(buffer.getInt16(), Utils.INT_16_SIZE, false));
}

function writeNetworkAddress(address, buffer) {
	buffer.putInt16(address.toInt16());
}

function readIEEEAddress(buffer) {
	let eui64l = buffer.getInt32();
	let eui64h = buffer.getInt32();
	return Address.getIEEEAddress(
		Utils.multiIntToByteArray([eui64h, eui64l], Utils.INT_32_SIZE, 2, false));
}

function writeIEEEAddress(address, buffer) {
	buffer.putByteArray(address.toArray(true));
}

function readSimpleDescriptor(buffer) {
	let simpleDescriptor = {
		endpoint: buffer.getInt8(),
		profileId: buffer.getInt16(),
		deviceId: buffer.getInt16(),
		deviceVersion: buffer.getInt8() & 0x0F,
		inputClusters: [],
		outputClusters: []
	};
	let inClusterCount = buffer.getInt8();
	for (let i = 0; i < inClusterCount; i++) {
		simpleDescriptor.inputClusters[i] = buffer.getInt16();
	}
	let outClusterCount = buffer.getInt8();
	for (let i = 0; i < outClusterCount; i++) {
		simpleDescriptor.outputClusters[i] = buffer.getInt16();
	}
	return simpleDescriptor;
}

function writeSimpleDescriptor(simpleDescriptor, buffer) {
	buffer.putInt8(simpleDescriptor.endpoint);
	buffer.putInt16(simpleDescriptor.profileId);
	buffer.putInt16(simpleDescriptor.deviceId);
	buffer.putInt8(simpleDescriptor.deviceVersion & 0x0F);
	buffer.putInt8(simpleDescriptor.inputClusters.length);
	for (let i = 0; i < simpleDescriptor.inputClusters.length; i++) {
		buffer.putInt16(simpleDescriptor.inputClusters[i]);
	}
	buffer.putInt8(simpleDescriptor.outputClusters.length);
	for (let i = 0; i < simpleDescriptor.outputClusters.length; i++) {
		buffer.putInt16(simpleDescriptor.outputClusters[i]);
	}
}