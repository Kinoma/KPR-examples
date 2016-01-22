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
 * Kinoma LowPAN Framework: XBee API UART BLL Driver
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 */

var Utils = require("/lowpan/common/utils");
var Ringbuffer = Utils.Ringbuffer;
var Buffers = require("/lowpan/common/buffers");
var ByteBuffer = Buffers.ByteBuffer;
var SerialBuffer = Buffers.SerialBuffer;

var FRAME_DELIMITER = 0x7E;

var logger = new Utils.Logger("UART");
logger.loggingLevel = Utils.Logger.Level.INFO.level;

var DEFAULT_RX_PIN = 33;
var DEFAULT_TX_PIN = 31;
var DEFAULT_UART_BAUDRATE = 115200;

var DEFAULT_TIMEOUT = 10000;
var DEFAULT_FRAME_ID = 1;
var DEFAULT_BUFFER_SIZE = 256;

var STATE_DELIMITER = 0;
var STATE_PREAMBLE = 1;
var STATE_DATA = 2;

var state = STATE_DELIMITER;
var expectedLength = 1;
var readRingbuffer;
var tempObject = null;

var requestBuffer = ByteBuffer.allocateUint8Array(DEFAULT_BUFFER_SIZE, false);

var _serial = null;
var writeBuffer;
var _notification = null;
var _repeat = null;

exports.configure = function () {
	this.notification = _notification = PINS.create({
		type: "Notification"
	});
	this.serial = _serial = PINS.create({
		type: "Serial",
		rx: DEFAULT_RX_PIN,
		tx: DEFAULT_TX_PIN,
		baud: DEFAULT_UART_BAUDRATE
	});
	_serial.init();
	writeBuffer = new SerialBuffer(_serial, DEFAULT_BUFFER_SIZE, false);
	readRingbuffer = new Ringbuffer(DEFAULT_BUFFER_SIZE * 2);
	_repeat = PINS.repeat("serial", this, function () {
		var response = receive();
		if (response != null) {
			_notification.invoke(response);
		}
	});
};

exports.send = function (request) {
	requestBuffer.clear();
	if (!writeRequest(request, requestBuffer)) {
		throw "Unknown Request";
	}
	requestBuffer.flip();
	
	var length = requestBuffer.remaining();
	var cs = calculateChecksum(requestBuffer, length);
	var payload = requestBuffer.getByteArray(length);

	logger.trace("<< " + Utils.toFrameString(payload));

	writeBuffer.clear();
	writeBuffer.putInt8(FRAME_DELIMITER);
	writeBuffer.putInt16(length);
	writeBuffer.putByteArray(payload);
	writeBuffer.putInt8(cs);
	writeBuffer.flush();

	request.response = false;
	return request;
};

function receive(timeout) {
	var responses = [];

	var buffer = _serial.read("ArrayBuffer");
	if (buffer.byteLength == 0) {
		logger.debug("serial.read returns 0");
		return responses;
	}
	readRingbuffer.write(new Uint8Array(buffer), 0, buffer.byteLength);

	while (readRingbuffer.available() >= expectedLength) {
		switch (state) {
		case STATE_DELIMITER:
			logger.trace("Read Delimiter");
			var delimiter = readRingbuffer.readByte();
			if (delimiter != FRAME_DELIMITER) {
				logger.error("Unexpected delimiter: " + Utils.toHexString(delimiter));
				break;
			}
			expectedLength = 2;
			state = STATE_PREAMBLE;
			break;
		case STATE_PREAMBLE:
			logger.trace("Read Preamble");
			var length = (readRingbuffer.readByte() << 8) | readRingbuffer.readByte();
			expectedLength = (length + 1);
			state = STATE_DATA;
			break;
		case STATE_DATA:
			logger.trace("Read Data");
			var data = new Uint8Array(expectedLength);
			readRingbuffer.read(data, 0, data.length);
			logger.trace(">> " + Utils.toFrameString(data));
			var readBuffer = ByteBuffer.wrap(data, 0, data.length, false);
			if (calculateChecksum(readBuffer, data.length) == 0) {
				readBuffer.setLimit(data.length - 1);		// Remove checksum byte
				tempObject = readResponse(readBuffer);
				if (tempObject != null) {
					tempObject.response = true;
					responses.push(tempObject);
				}
			} else {
				logger.warn("[XBeeDriver] Invalid Checksum\n");
			}
			tempObject = null;
			expectedLength = 1;
			state = STATE_DELIMITER;
			break;
		}
	}

	return responses;
}

exports.close = function () {
	_repeat.close();
	_serial.close();
	_notification.close();
};

/******************************************************************************
 * Private Functions
 ******************************************************************************/

var AT_COMMAND = 0x08;
var AT_COMMAND_QPV = 0x09;
var AT_COMMAND_RESP = 0x88;
var MODEM_STATUS = 0x8A;

var EXPLICIT_ADDR_ZB_CMD_FRM = 0x11;
var ZB_TRANSMIT_STATUS = 0x8B;
var ZB_RECEIVE_PACKET = 0x90;
var ZB_EXPLICIT_RX_IND = 0x91;

function calculateChecksum(buffer, length) {
	buffer.mark();
	var c = 0;
	for (i = 0; i < length; i++) {
		c += buffer.getInt8();
	}
	buffer.reset();
	return ~c & 0xFF;
}

function writeRequest(obj, buffer) {
	var frameType = obj.frameType;
	switch (frameType) {
	case AT_COMMAND:
	case AT_COMMAND_QPV:
		writeATCommand(obj, buffer);
		return true;
	case EXPLICIT_ADDR_ZB_CMD_FRM:
		writeExplicitAddressingZigBeeCommandFrame(obj, buffer);
		return true;
	}
	logger.debug("Unhandled Request: " + frameType.toString(16));
	return false;
}

function readResponse(buffer) {
	var frameType = buffer.peek();
	switch (frameType) {
	case AT_COMMAND_RESP:
		return readATCommandResponse(buffer);
	case MODEM_STATUS:
		return readModemStatus(buffer);
	case ZB_TRANSMIT_STATUS:
		return readZigBeeTransmitStatus(buffer);
	case ZB_RECEIVE_PACKET:
		return readZigBeeReceivePacket(buffer);
	case ZB_EXPLICIT_RX_IND:
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