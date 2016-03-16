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
 * Kinoma LowPAN Framework: ZigBee APS Layer
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 *
 * Ported (mostly) from https://github.com/FantomJAC/bekko
 */

const Status = {
	SUCCESS: 0x00,
	ASDU_TOO_LONG: 0xa0,
	DEFRAG_DEFERRED: 0xa1,
	DEFRAG_UNSUPPORTED: 0xa2,
	ILLEGAL_REQUEST: 0xa3,
	INVALID_BINDING: 0xa4,
	INVALID_GROUP: 0xa5,
	INVALID_PARAMETER: 0xa6,
	NO_ACK: 0xa7,
	NO_BOUND_DEVICE: 0xa8,
	NO_SHORT_ADDRESS: 0xa9,
	NOT_SUPPORTED: 0xaa,
	SECURED_LINK_KEY: 0xab,
	SECURED_NWK_KEY: 0xac,
	SECURITY_FAIL: 0xad,
	TABLE_FULL: 0xae,
	UNSECURED: 0xaf,
	UNSUPPORTED_ATTRIBUTE: 0xb0
};
exports.Status = Status;

const TXOption = {
	SECURITY: 0x01,
	USE_NWKKY: 0x02,
	ACK: 0x04,
	FRAGMENTATION: 0x08
};
exports.TXOption = TXOption;

exports.MAX_ENDPOINT = 0xF0;
exports.MIN_ENDPOINT = 0x01;

const BROADCAST_ENDPOINT = 0xFF;

exports.openConnection = function (zdo, simpleDescriptor) {
	zdo.addEndpoint(simpleDescriptor);
	return new DataConnection(zdo, simpleDescriptor);
};

/******************************************************************************
 * DataConnection Class (APSDE-SAP)
 ******************************************************************************/
class DataConnection {
	constructor(zdo, simpleDescriptor) {
		this._zdo = zdo;
		this._simpleDescriptor = simpleDescriptor;
		this._delegate = null;
		/* Add APS callback */
		zdo.addDataReceiver(this);
	}
	get delegate() {
		return this._delegate;
	}
	set delegate(delegate) {
		this._delegate = delegate;
	}
	close() {
		this._zdo.removeDataReceiver(this);
		this._zdo.removeEndpoint(this._simpleDescriptor.endpoint);
	}
	getSimpleDescriptor() {
		return this._simpleDescriptor;
	}
	send(packet, radius, txOptions, callback) {
		let request = {
			destinationAddress: packet.address,
			destinationEndpoint: packet.endpoint,
			profileId: this._simpleDescriptor.profileId,
			clusterId: packet.clusterId,
			payload: packet.payload,
			radius: radius,
			txOptions: txOptions
		}
		if (!("localEndpoint" in packet) || packet.localEndpoint == BROADCAST_ENDPOINT) {
			request.sourceEndpoint = this._simpleDescriptor.endpoint;
		} else {
			// Force using local endpoint
			request.sourceEndpoint = packet.localEndpoint;
		}

		this._zdo.submitDataRequest(request, callback);
	}
	/**
	 * APS Layer callback
	 */
	apsIndication(indication) {
		if (indication.profileId != this._simpleDescriptor.profileId) {
			// Ignore incompatible profiles.
			return;
		}

		// We might not need this check
		if (indication.destinationEndpoint != this._simpleDescriptor.endpoint &&
			indication.destinationEndpoint != BROADCAST_ENDPOINT) {
			return;
		}

		if (this._delegate != null) {
			this._delegate.received({
				address: indication.sourceAddress,
				data: indication.payload,
				endpoint: indication.sourceEndpoint,
				localAddess: indication.destinationAddress,
				localEndpoint:
					(indication.destinationEndpoint == BROADCAST_ENDPOINT) ?
						this._simpleDescriptor.endpoint :
						indication.destinationEndpoint,
				clusterId: indication.clusterId,
				status: indication.status,
				securityStatus: indication.securityStatus,
				linkQuality: indication.linkQuality
			});
		}
	}
}