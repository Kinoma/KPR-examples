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
 * Kinoma LowPAN Framework: ZigBee Address
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 *
 * Ported (mostly) from https://github.com/FantomJAC/bekko
 */

var Utils = require("/lowpan/common/utils");

const AddressMode = {
	NULL: 0x00,
	GROUP: 0x01,
	NWK: 0x02,
	EUI64: 0x03
};
exports.AddressMode = AddressMode;

exports.parseString = function (address) {
	if ((address.length % 2) != 0) {
		throw "Invalid address";
	}

	let addressSize = (address.length / 2);
	let byteArray = [];
	for (let i = 0; i < addressSize; i++) {
		let p = i * 2;
		byteArray[i] = parseInt("0x" + address.slice(p, p + 2));
	}

	switch (addressSize) {
	case 8:
		return new ZigBeeAddress(byteArray, AddressMode.EUI64);
	case 2:
		return new ZigBeeAddress(byteArray, AddressMode.NWK);
	}

	throw "Invalid address";
};

function getIEEEAddress(byteArray) {
	if (byteArray.length != 8) {
		throw "Invalid Length";
	}
	return new ZigBeeAddress(byteArray, AddressMode.EUI64);
}
exports.getIEEEAddress = getIEEEAddress;

function getNetworkAddress(byteArray) {
	if (byteArray.length != 2) {
		throw "Invalid Length";
	}
	return new ZigBeeAddress(byteArray, AddressMode.NWK);
};
exports.getNetworkAddress = getNetworkAddress;

function getGroupAddress(byteArray) {
	if (byteArray.length != 2) {
		throw "Invalid Length";
	}
	return new ZigBeeAddress(byteArray, AddressMode.GROUP);
}
exports.getGroupAddress = getGroupAddress;

/**
 * A class represents ZigBee address
 */
class ZigBeeAddress {
	constructor(byteArray, addressMode) {
		this._mac = byteArray;
		this._mode = addressMode;
	}
	get mode() {
		return this._mode;
	}
	isUnicast() {
		if (this._mode == AddressMode.GROUP) {
			return false;
		}
		if (this._mode == AddressMode.NWK) {
			if (this.isBroadcast()) {
				return false;
			}
		}
		return true;
	}
	toString() {
		let s = "";
		for (let i = 0; i < this._mac.length; i++) {
			s += Utils.toHexString(this._mac[i], 1, "");
		}
		return s;
	}
	toArray(littleEndian) {
		let src = this._mac;
		let dst = new Array(src.length);
		for (let i = 0; i < src.length; i++) {
			if (littleEndian) {
				dst[i] = src[src.length - 1 - i];
			} else {
				dst[i] = src[i];
			}
		}
		return dst;
	}
	isBroadcast() {
		if (this._mode != AddressMode.NWK) {
			return false;
		}
		return ((this._mac[0] & 0xFF) == 0xFF) && ((this._mac[1] & 0xFF) >= 0xF8);
	}
	toInt16() {
		if (this._mode != AddressMode.NWK) {
			throw "Invalid AddressMode";
		}
		return Utils.toInt16(this._mac, false);
	}
}

exports.NULL_ADDRESS = getIEEEAddress([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
exports.BROADCAST_ALL = getNetworkAddress([0xFF, 0xFF]);
exports.BROADCAST_MROWI = getNetworkAddress([0xFF, 0xFD]);
exports.BROADCAST_ZR_ZC = getNetworkAddress([0xFF, 0xFC]);
exports.BROADCAST_LOW_ZR = getNetworkAddress([0xFF, 0xFB]);