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
 * Kinoma LowPAN Framework: XBee API
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 *
 * Ported (mostly) from https://github.com/FantomJAC/bekko
 */

var Pins = require("pins");

var Utils = require("/lowpan/common/utils");
var Logger = Utils.Logger;
var Buffers = require("/lowpan/common/buffers");
var ByteBuffer = Buffers.ByteBuffer;

var logger = new Logger("XBee API");
logger.loggingLevel = Logger.Level.INFO;

exports.FRAME_DELIMITER = 0x7E;
const FRAME_ID_NO_RESPONSE = 0;
const FRAME_ID_NEED_RESPONSE = -1;
exports.FRAME_ID_NO_RESPONSE = FRAME_ID_NO_RESPONSE;
exports.FRAME_ID_NEED_RESPONSE = FRAME_ID_NEED_RESPONSE;
exports.VR_TYPE_MASK = 0x0F00;
exports.VR_COORDINATOR = 0x0100;
exports.VR_ROUTER = 0x0300;
exports.VR_END_DEVICE = 0x0900;
exports.VR_FIRM_MASK = 0xF000;
exports.VR_ZN = 0x1000;
exports.VR_ZB = 0x2000;
exports.VR_SE = 0x3000;
exports.HV_MASK = 0xFF00;
exports.HV_S1 = 0x1700;
exports.HV_S1_PRO = 0x1800;
exports.HV_S2 = 0x1900;
exports.HV_S2_PRO = 0x1A00;
exports.HV_S2B_PRO = 0x1E00;
exports.HV_S6 = 0x1F00;

const DEFAULT_BUFFER_SIZE = 256;

const FrameType = {
	/* Common Frames */
	AT_COMMAND: 0x08,
	AT_COMMAND_QPV: 0x09,
	AT_COMMAND_RESP: 0x88,
	MODEM_STATUS: 0x8A,
	/* S1(S6) Frames */
	TX_REQ_64: 0x00,
	RX_PACKET_64: 0x80,
	TX_REQ_16: 0x01,
	RX_PACKET_16: 0x81,
	TX_STATUS: 0x89,
	/* S2/S1(DigiMesh)/S5/S8/S3B(900HP) Frames */
	REMOTE_COMMAND_REQ: 0x17,
	REMOTE_COMMAND_RESP: 0x97,
	ZB_TRANSMIT_REQ: 0x10,
	EXPLICIT_ADDR_ZB_CMD_FRM: 0x11,
	ZB_TRANSMIT_STATUS: 0x8B,
	ZB_RECEIVE_PACKET: 0x90,
	ZB_EXPLICIT_RX_IND: 0x91,
	NODE_ID_IND : 0x95,
	/* S2 Frames */
	ZB_IOD_SAMPLE_RX_IND: 0x92,
	XB_SENSOR_READ_IND: 0x94,
	OTA_FIRM_UPDATE_STATUS: 0xA0,
	CREATE_SOURCE_ROUTE: 0x21,
	ROUTE_REC_IND: 0xA1,
	MOR_ROUTE_REQUEST_IND: 0xA3,
	/* S2-SE Frames */
	ZB_DEV_AUTH_IND: 0xA2,
	ZB_REGIST_JOINING_DEV: 0x24,
	ZB_REGIST_JOINING_DEV_STAT: 0xA4,
	/* S6 Frames */
	TX_REQ_IP_V4: 0x20,
	RX_PACKET_IP_V4: 0xB0,
	/* S8/S3B(900HP) Frame */
	ROUTE_INFO_PACKET: 0x8D,
	AGGREGATE_ADDR_UPDATE: 0x8E
};
exports.FrameType = FrameType;

const ATCommandStatus = {
	OK: 0,
	ERROR: 1,
	INVALID_COMMAND: 2,
	INVALID_PARAMETER: 3
};
exports.ATCommandStatus = ATCommandStatus;

const ModemStatus = {
	HW_RESET: 0,
	WDT_RESET: 1,
	ASSOCIATED: 2,
	DISASSOCIATED: 3,
	SYNC_LOST: 4,				// Obsolete
	COORDINATOR_RALGN: 5,		// Obsolete
	COORDINATOR_STARTED: 6,
	VSUPPLY_LIMIT_EXCEED: 0x0D,
	CONFIG_CHANGED: 0x11,
	SE_KEYEST_COMPLETE: 0x10,
	STACK_ERROR: 0x80
};
exports.ModemStatus = ModemStatus;

const ReceiveOption = {
	ACK: 0x01,
	BROADCAST_PACKET: 0x02,
	ENCRYPTED_APS_ENCRYPTION: 0x20,
	SENT_FROM_ENDDEVICE: 0x40
};
exports.ReceiveOption = ReceiveOption;

const TransmitOption = {
	DISABLE_RETRIES: 0x01,
	INDIRECT_ADDRESSING: 0x04,
	MULTICAST_ADDRESSING: 0x08,
	ENABLE_APS_ENCRYPTION: 0x20,
	EXTENDED_TIMEOUT: 0x40
}
exports.TransmitOption = TransmitOption;

var _bll;
var _requestBuffer = ByteBuffer.allocateUint8Array(DEFAULT_BUFFER_SIZE, false);

var _context = {
	/* XBee manages 8-bit frame id */
	frameIdSequence: new Utils.Sequence(8),
	/* API callbacks */
	callbacks: [],
	/* Higher layer delegate */
	delegate: null
};

exports.registerDelegate = function (delegate) {
	_context.delegate = delegate;
};

exports.activate = function (bll) {
	logger.debug("Activate: bll=" + bll);
	_bll = bll;
	Pins.when(bll, "notification", (responses) => {
		if (responses == null) {
			return;
		}
		logger.trace("BLL Notification: responses.length=" + responses.length);
		for (let i = 0; i < responses.length; i++) {
			let packet = responses[i];
			let ar = new Uint8Array(packet.buffer, packet.offset, packet.length);
			let response = readResponse(ByteBuffer.wrap(ar, 0, ar.length, false));
			if (response != null) {
				/* Forward to XBee callback */
				if (response.frameId > 0) {
					var callback = _context.callbacks[response.frameId];
					if (callback != null) {
						_context.callbacks[response.frameId] = null;
						callback.responseReceived(response);
						return;
					}
				}
				if (_context.delegate != null) {
					_context.delegate.responseReceived(response);
				}
			}
		}
	});
};

/**
 * Submit (single) XBee API request
 */
function submitAPIRequest(request, callback) {
	if (request.frameId == FRAME_ID_NEED_RESPONSE) {
		request.frameId = _context.frameIdSequence.nextSequence();
		if (request.frameId == FRAME_ID_NO_RESPONSE) {
			/* Don't give up, try again */
			request.frameId = _context.frameIdSequence.nextSequence();
		}
	}
	_requestBuffer.clear();
	if (!writeRequest(request, _requestBuffer)) {
		throw "Unknown Request";
	}
	_requestBuffer.flip();
	let payload = _requestBuffer.getByteArray();
	let packet = {
		buffer: payload.buffer,
		offset: 0,
		length: payload.length
	};
	Pins.invoke("/" + _bll + "/send", packet);
	if (callback != undefined && callback != null) {
		_context.callbacks[request.frameId] = callback;
	}
}
exports.submitAPIRequest = submitAPIRequest;

/**
 * Submit (single) XBee AT command
 */
function executeCommand(command, value, callback) {
	executeCommandSequence([{command: command, value: value}], callback);
}
exports.executeCommand = executeCommand;

/**
 * Submit XBee AT command(s) in sequentially
 */
function executeCommandSequence(commandSequence, callback, terminateIfFail, queued) {
	if (callback === undefined) {
		callback = null;
	}
	if (terminateIfFail === undefined) {
		terminateIfFail = true;
	}
	if (queued === undefined) {
		queued = false;
	}
	if (queued) {
		commandSequence.push({command: "AC"});	// Apply Changes
	}
	_executeCommandSequence(commandSequence, callback, terminateIfFail, queued, {});
}
exports.executeCommandSequence = executeCommandSequence;

function _executeCommandSequence(commandSequence, callback, terminate, queued, responseMap) {
	if (commandSequence.length == 0) {
		if (callback != null) {
			callback.sequenceCompleted(responseMap);
		}
		return;
	}
	var nextCommand = commandSequence.shift();
	logger.debug("Execute Next Command(" + nextCommand.command + ")");
	submitAPIRequest(
		{
			frameType: queued ? FrameType.AT_COMMAND_QPV : FrameType.AT_COMMAND,
			frameId: FRAME_ID_NEED_RESPONSE,
			command: nextCommand.command,
			value: nextCommand.hasOwnProperty("value") ? nextCommand.value : null
		},
		{
			responseReceived: function(response) {
				if (response.status != ATCommandStatus.OK) {
					logger.debug("Command(" + response.command + ") Failed: status="
						+ Utils.toHexString(response.status));
					if (terminate) {
						if (callback != null) {
							callback.sequenceCompletedWithError(responseMap, response);
						}
						return;
					}
				} else {
					logger.debug("Command(" + response.command + ") OK");
				}
				responseMap[response.command] = response;
				_executeCommandSequence(commandSequence, callback, terminate, queued, responseMap);
			}
		}
	);
}

/******************************************************************************
 * API Frames
 ******************************************************************************/

function writeRequest(obj, buffer) {
	var frameType = obj.frameType;
	switch (frameType) {
	case FrameType.AT_COMMAND:
	case FrameType.AT_COMMAND_QPV:
		writeATCommand(obj, buffer);
		return true;
	case FrameType.EXPLICIT_ADDR_ZB_CMD_FRM:
		writeExplicitAddressingZigBeeCommandFrame(obj, buffer);
		return true;
	}
	logger.debug("Unhandled Request: " + frameType.toString(16));
	return false;
}

function readResponse(buffer) {
	var frameType = buffer.peek();
	switch (frameType) {
	case FrameType.AT_COMMAND_RESP:
		return readATCommandResponse(buffer);
	case FrameType.MODEM_STATUS:
		return readModemStatus(buffer);
	case FrameType.ZB_TRANSMIT_STATUS:
		return readZigBeeTransmitStatus(buffer);
	case FrameType.ZB_RECEIVE_PACKET:
		return readZigBeeReceivePacket(buffer);
	case FrameType.ZB_EXPLICIT_RX_IND:
		return readZigBeeExplicitRxIndicator(buffer);
	}
	logger.debug("Unhandled Response: " + frameType.toString(16));
	return null;
}

/******************************************************************************
 * ATCommand
 ******************************************************************************/
function writeATCommand(obj, buffer) {
	buffer.putInt8(obj.frameType);
	buffer.putInt8(obj.frameId);
	buffer.putInt8(obj.command.charCodeAt(0));
	buffer.putInt8(obj.command.charCodeAt(1));
	if (obj.hasOwnProperty("value") && obj.value != null) {
		buffer.putByteArray(obj.value);
	}
	logger.debug("< ATCommand");
}

/******************************************************************************
 * ATCommandResponse
 ******************************************************************************/
function readATCommandResponse(buffer) {
	logger.debug("> ATCommandResponse");
	var obj = {
		frameType: buffer.getInt8(),
		frameId: buffer.getInt8(),
		command: String.fromCharCode(
			buffer.getInt8(),
			buffer.getInt8()
		),
		status: buffer.getInt8(),
		data: null
	};
	if (buffer.remaining() > 0) {
		obj.data = buffer.getByteArray();
	}
	return obj;
}

/******************************************************************************
 * ModemStatus
 ******************************************************************************/
function readModemStatus(buffer) {
	logger.debug("> ModemStatus");
	return {
		frameType: buffer.getInt8(),
		frameId: -1,
		status: buffer.getInt8()
	};
}

/******************************************************************************
 * ZigBeeTransmitStatus
 ******************************************************************************/
function readZigBeeTransmitStatus(buffer) {
	logger.debug("> ZigBeeTransmitStatus");
	return {
		frameType: buffer.getInt8(),
		frameId: buffer.getInt8(),
		address16: buffer.getInt16(),
		transmitRetryCount: buffer.getInt8(),
		deliveryStatus: buffer.getInt8(),
		discoveryStatus: buffer.getInt8()
	};
}

/******************************************************************************
 * ZigBeeReceivePacket
 ******************************************************************************/
function readZigBeeReceivePacket(buffer) {
	logger.debug("> ZigBeeReceivePacket");
	var obj = {
		frameType: buffer.getInt8(),
		frameId: -1,
		address64: buffer.getByteArray(8),
		address16: buffer.getByteArray(2),
		receiveOptions: buffer.getInt8(),
		payload: null
	}
	if (buffer.remaining() > 0) {
		obj.payload = buffer.getByteArray();
	}
	return obj;
}

/******************************************************************************
 * ExplicitAddressingZigBeeCommandFrame
 ******************************************************************************/
function writeExplicitAddressingZigBeeCommandFrame(obj, buffer) {
	buffer.putInt8(obj.frameType);
	buffer.putInt8(obj.frameId);
	buffer.putByteArray(obj.address64);
	buffer.putByteArray(obj.address16);
	buffer.putInt8(obj.sourceEndpoint);
	buffer.putInt8(obj.destinationEndpoint);
	buffer.putInt16(obj.clusterId);
	buffer.putInt16(obj.profileId);
	buffer.putInt8(obj.broadcastRadius);
	buffer.putInt8(obj.transmitOptions);
	if (obj.payload != null) {
		buffer.putByteArray(obj.payload);
	}
	logger.debug("< ExplicitAddressingZigBeeCommandFrame");
}

/******************************************************************************
 * ZigBeeExplicitRxIndicator
 ******************************************************************************/
function readZigBeeExplicitRxIndicator(buffer) {
	logger.debug("> ZigBeeExplicitRxIndicator");
	var obj = {
		frameType: buffer.getInt8(),
		frameId: -1,
		address64: buffer.getByteArray(8),
		address16: buffer.getByteArray(2),
		sourceEndpoint: buffer.getInt8(),
		destinationEndpoint: buffer.getInt8(),
		clusterId: buffer.getInt16(),
		profileId: buffer.getInt16(),
		receiveOptions: buffer.getInt8(),
		payload: null
	}
	if (buffer.remaining() > 0) {
		obj.payload = buffer.getByteArray();
	}
	return obj;
}