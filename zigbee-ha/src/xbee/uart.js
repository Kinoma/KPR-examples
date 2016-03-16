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
var Logger = Utils.Logger;
var Buffers = require("/lowpan/common/buffers");
var SerialBuffer = Buffers.SerialBuffer;

const FRAME_DELIMITER = 0x7E;

var logger = new Logger("XBee UART");
logger.loggingLevel = Logger.Level.INFO;

const DEFAULT_RX_PIN = 33;
const DEFAULT_TX_PIN = 31;
const DEFAULT_UART_BAUDRATE = 115200;

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_FRAME_ID = 1;
const DEFAULT_BUFFER_SIZE = 256;

const STATE_DELIMITER = 0;
const STATE_PREAMBLE = 1;
const STATE_DATA = 2;

var _state = STATE_DELIMITER;
var _expectedLength = 1;
var _readRingbuffer;
var _writeBuffer;

var _serial = null;
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
	_writeBuffer = new SerialBuffer(_serial, DEFAULT_BUFFER_SIZE, false);
	_readRingbuffer = new Ringbuffer(DEFAULT_BUFFER_SIZE * 2);
	_repeat = PINS.repeat("serial", this, function () {
		let response = receive();
		if (response != null) {
			_notification.invoke(response);
		}
	});
};

exports.send = function (packet) {
	let payload = new Uint8Array(packet.buffer, packet.offset, packet.length);
	let cs = calculateChecksum(payload, 0, payload.length);

	logger.trace("<< " + Utils.toFrameString(payload));

	_writeBuffer.clear();
	_writeBuffer.putInt8(FRAME_DELIMITER);
	_writeBuffer.putInt16(payload.length);
	_writeBuffer.putByteArray(payload);
	_writeBuffer.putInt8(cs);
	_writeBuffer.flush();
};

var responses;

function receive(timeout) {
	responses = null;

	let buffer = _serial.read("ArrayBuffer");
	if (buffer.byteLength == 0) {
		logger.debug("serial.read returns 0");
		return responses;
	}
	_readRingbuffer.write(new Uint8Array(buffer), 0, buffer.byteLength);

	while (_readRingbuffer.available() >= _expectedLength) {
		switch (_state) {
		case STATE_DELIMITER:
			logger.trace("Read Delimiter");
			let delimiter = _readRingbuffer.readByte();
			if (delimiter != FRAME_DELIMITER) {
				logger.error("Unexpected delimiter: " + Utils.toHexString(delimiter));
				break;
			}
			_expectedLength = 2;
			_state = STATE_PREAMBLE;
			break;
		case STATE_PREAMBLE:
			logger.trace("Read Preamble");
			let length = (_readRingbuffer.readByte() << 8) | _readRingbuffer.readByte();
			_expectedLength = (length + 1);
			_state = STATE_DATA;
			break;
		case STATE_DATA:
			logger.trace("Read Data");
			let data = new Uint8Array(_expectedLength);
			_readRingbuffer.read(data, 0, data.length);
			logger.trace(">> " + Utils.toFrameString(data));
			if (calculateChecksum(data, 0, data.length) == 0) {
				if (responses == null) {
					responses = new Array();
				}
				responses.push({
					buffer: data.buffer,
					offset: 0,
					length: data.length - 1
				});
			} else {
				logger.warn("[XBeeDriver] Invalid Checksum\n");
			}
			_expectedLength = 1;
			_state = STATE_DELIMITER;
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

function calculateChecksum(data, offset, length) {
	let c = 0;
	for (let i = 0; i < length; i++) {
		c += data[i + offset];
	}
	return ~c & 0xFF;
}