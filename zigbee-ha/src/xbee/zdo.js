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
 * Kinoma LowPAN Framework: XBee ZDO Implementation
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 *
 * Ported (mostly) from https://github.com/FantomJAC/bekko
 */

var Utils = require("/lowpan/common/utils");
var Logger = Utils.Logger;

var Address = require("../zigbee/address");
var APS = require("../zigbee/aps");
var ZDP = require("../zigbee/zdp");

var API = require("./api");

/* Exporting low level XBee API for advanced users */
exports.API = API;

var logger = new Logger("XBee ZDO");
logger.loggingLevel = Logger.Level.INFO;

var INIT_COMMAND_SEQ = [
	{command: "HV"},
	{command: "VR"},
	{command: "SH"},
	{command: "SL"},
	{command: "AO", value: [0x03]}	// Enable ZDO passthrough
];

var _deviceInfo = {};

exports.activate = function (bll) {
	logger.debug("Activate: bll=" + bll);
	API.registerDelegate({
		responseReceived: function (response) {
			if (response.hasOwnProperty("address64")
				&& response.hasOwnProperty("address16")) {
				apsReceived(response);
			} else if (response.frameType == API.FrameType.MODEM_STATUS) {
				logger.debug("ModemStatus: " + Utils.toHexString(response.status));
				// TODO: Notify to delegate
			}
		}
	});
	API.activate(bll);
	for (var i = 0; i < 256; i++) {
		zdpContext.callbacks[i] = null;
	}
	logger.debug("Executing initial sequence...");
	API.executeCommandSequence(
		INIT_COMMAND_SEQ,
		{
			sequenceCompleted: function (responseMap) {
				_deviceInfo = readBasicInformations(responseMap);
				logger.info(_deviceInfo.name + " device is detected.");
				logger.info("NodeType: " + _deviceInfo.nodeType);
				logger.info("IEEEAddress: " + _deviceInfo.ieeeAddress.toString());
				// TODO: Notify to delegate
			},
			sequenceCompletedWithError: function (responseMap, response) {
				logger.warn("Gather basic informations failed: " + response.status);
			}
		}
	);
};

exports.getDeviceInfo = function () {
	return _deviceInfo;
};

function readBasicInformations(responseMap) {
	var info = {};
	info.hardwareVersion = Utils.toInt16(responseMap["HV"].data, false);
	switch (info.hardwareVersion & API.HV_MASK) {
	case API.HV_S2:
	case API.HV_S2_PRO:
	case API.HV_S2B_PRO:
	case 0x2100:
	case 0x2200:
		info.name = "ZigBee(S2)";
		info.zigBee = true;
		break;
	case 0x2300:
		info.name = "DigiMesh(S3)";
		info.zigBee = true;
		break;
	case 0x2400:
		info.name = "DigiMesh(S8)";
		info.zigBee = true;
		break;
	default:
		info.name = "XBee(" + Utils.toHexString(info.hardwareVersion, 2) + ")";
		info.zigBee = false;
	}
	info.firmwareVersion = Utils.toInt16(responseMap["VR"].data, false);
	info.nodeType = "Unknown";
	if (info.zigBee) {
		switch (info.firmwareVersion & API.VR_TYPE_MASK) {
		case API.VR_COORDINATOR:
			info.nodeType = "Coordinator";
			break;
		case API.VR_ROUTER:
			info.nodeType = "Router";
			break;
		case API.VR_END_DEVICE:
			info.nodeType = "EndDevice";
			break;
		}
	}
	var addr64 = [];
	addr64[0] = Utils.toInt32(responseMap["SH"].data, false);
	addr64[1] = Utils.toInt32(responseMap["SL"].data, false);
	info.ieeeAddress = Address.getIEEEAddress(
		Utils.multiIntToByteArray(addr64, 4, 2, false));
	return info;
}

/******************************************************************************
 * ZDO/ZDP Implementation
 ******************************************************************************/

var zdpContext = {
	/* All active endpoints */
	endpoints: {},
	/* Maintain ZDP transaction sequence number (8bit) */
	transactionSequence: new Utils.Sequence(8),
	/* ZDP callbacks per tsn */
	callbacks: [],
	/* ZDP server services */
	services: {},
	/* ZDP event listener */
	listener: null
};

zdpContext.services[ZDP.Command.DEVICE_ANNCE] = {
	handleZDPCommand: function (packet, obj) {
		logger.debug("DeviceAnnounce: EUI64=" + obj.ieeeAddr.toString()
			+ ", NWK=" + obj.nwkAddr.toString()
			+ ", capability=" + Utils.toHexString(obj.capability));
			updateAddressMap(obj.ieeeAddr, obj.nwkAddr);
			if (zdpContext.listener != null) {
				zdpContext.listener.deviceAnnounce(
					obj.ieeeAddr, obj.nwkAddr, obj.capability);
			}
		}
};

var ZDPReceiver = {
	apsIndication: function (indication) {
		if (indication.destinationEndpoint != ZDP.ZDO_ENDPOINT ||
			indication.profileId != ZDP.PROFILE_ZDP) {
			return;
		}

		var packet = {
			remoteAddress: indication.sourceAddress,
			localAddress: indication.destinationAddress,
			clusterId: indication.clusterId,
			tsn: indication.payload[0],
			payload: indication.payload.slice(1)
		};

		var obj = ZDP.readZDPCommand(packet.clusterId, packet.payload);
		if (obj != null) {
			logger.debug("ZDPCommand("
				+ Utils.toHexString(packet.clusterId, 2) + "): "
				+ "remote=" + packet.remoteAddress.toString()
		//		+ ", local=" + packet.localAddress.toString()
				+ ", obj=" + JSON.stringify(obj));
		}
		if ((packet.clusterId & 0x8000) > 0) {
			/* Packet is response (i.e. handle by client service) */
			var callback = zdpContext.callbacks[packet.tsn];
			if (callback != null) {
				zdpContext.callbacks[packet.tsn] = null;
				callback.responseReceived(packet, obj);
			}
		} else {
			if (zdpContext.services.hasOwnProperty(packet.clusterId)) {
				zdpContext.services[packet.clusterId].handleZDPCommand(packet, obj);
			}
		}
	}
};

exports.registerListener = function (listener) {
	zdpContext.listener = listener;
};

exports.addEndpoint = function (simpleDescriptor) {
	var endpoint = simpleDescriptor.endpoint;
	if (endpoint < APS.MIN_ENDPOINT || APS.MAX_ENDPOINT < endpoint) {
		throw "Invalid endpoint";
	}
	zdpContext.endpoints[endpoint] = simpleDescriptor;
};

exports.removeEndpoint = function (endpoint) {
	zdpContext.endpoints[endpoint] = null;
};

exports.getSimpleDescriptor = function (endpoint) {
	return zdpContext.endpoints[endpoint];
};

exports.sendZDPCommandPacket = function (address, clusterId, command, radius, txOptions, callback) {
	var tsn = zdpContext.transactionSequence.nextSequence();
	var payload = ZDP.toPayload(clusterId, command);
	var p = new Uint8Array(payload.length + 1);
	p[0] = tsn;
	for (let i = 0; i < payload.length; i++) {
		p[i + 1] = payload[i];
	}
	submitDataRequest(
		{
			destinationAddress: address,
			destinationEndpoint: ZDP.ZDO_ENDPOINT,
			sourceEndpoint: ZDP.ZDO_ENDPOINT,
			profileId: ZDP.PROFILE_ZDP,
			clusterId: clusterId,
			radius: radius,
			txOptions: txOptions,
			payload: p
		},
		{
			confirm: function (status) {
				// TODO
			}
		}
	);
	if (callback != undefined && callback != null) {
		zdpContext.callbacks[tsn] = callback;
	}
};

/******************************************************************************
 * Network Manager
 ******************************************************************************/

var nwkContext = {
	addressMap: {}
};

function updateAddressMap(address64, address16) {
	logger.debug("Update Address Map: addr64=" + address64.toString()
		+ ", addr16=" + address16.toString());
	nwkContext.addressMap[address64.toString()] = address16;
}

function lookupNodeIdByEui64(address64) {
	var key = address64.toString();
	if (nwkContext.addressMap.hasOwnProperty(key)) {
		return nwkContext.addressMap[key];
	}
	return null;
}

function lookupEui64ByNodeId(address16) {
	for (var key in nwkContext.addressMap) {
		if (nwkContext.addressMap.hasOwnProperty(key)) {
			var nodeId = nwkContext.addressMap[key];
			if (nodeId.toInt16() == address16.toInt16()) {
				return Address.parseString(key);
			}
		}
	}
	return null;
}

/******************************************************************************
 * APSDE Implementation
 ******************************************************************************/

var XBEE_BROADCAST64 = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF];
var XBEE_BROADCAST16 = [0xFF, 0xFE];

var XBEE_UNKNOWN64 = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];

var DIGI_PROFILE_ID = 0xC105;
var DIGI_CLUSTER_ID = 0x0011;
var DIGI_ENDPOINT = 0xE8;

var apsContext = {
	receivers: [ZDPReceiver]	// Register ZDP as default
};

exports.addDataReceiver = function (receiver) {
	apsContext.receivers.push(receiver);
};

/**
 * APSDE-DATA.request & APSDE-DATA.confirm
 */
function submitDataRequest(request, callback) {
	if (request.destinationAddress == null) {
		// TODO: APS Binding
		throw "No support for APS Bindings yet";
	} else {
		API.submitAPIRequest(assembleFrame(request), {
			responseReceived: function (response) {
				logger.debug("TX Status: delivery=" + Utils.toHexString(response.deliveryStatus)
					+ ", discovery=" + Utils.toHexString(response.discoveryStatus));
				if (callback != undefined && callback != null) {
					callback.confirm(response.deliveryStatus);
				}
			}
		});
	}
}
exports.submitDataRequest = submitDataRequest;

function assembleFrame(request) {
	var tx = {
		frameType: API.FrameType.EXPLICIT_ADDR_ZB_CMD_FRM,
		frameId: API.FRAME_ID_NEED_RESPONSE,
		sourceEndpoint: request.sourceEndpoint,
		destinationEndpoint: request.destinationEndpoint,
		clusterId: request.clusterId,
		profileId: request.profileId,
		transmitOptions: 0,
		broadcastRadius: request.radius,
		payload: request.payload
	};

	var address = request.destinationAddress;

	if (address.mode == Address.AddressMode.EUI64) {
		var nwk = lookupNodeIdByEui64(address);
		if (nwk == null) {
			/* XBee may have the NWK in it's own address table. */
			tx.address16 = XBEE_BROADCAST16;
		} else {
			tx.address16 = nwk.toArray(false);
		}
		tx.address64 = address.toArray(false);
	} else if (address.mode == Address.AddressMode.GROUP) {
		tx.address16 = nwk.toArray(false);
		tx.address64 = XBEE_UNKNOWN64;
		tx.transmitOptions |= API.TransmitOption.MULTICAST_ADDRESSING;
	} else if (address.mode == Address.AddressMode.NWK) {
		if (address.isBroadcast()) {
			tx.address16 = XBEE_BROADCAST16;
			tx.address64 = XBEE_BROADCAST64;
		} else {
			/* For XBee, we must provide EUI64 when send unicast. */
			var eui64 = lookupEui64ByNodeId(address);
			if (eui64 == null) {
				throw "Can't resolve NWK. (EUI64 not found in local address table.)";
			}
			tx.address16 = address.toArray(false);
			tx.address64 = eui64.toArray(false);
		}
	} else {
		throw "Unsupported addressing type:" + address.type;
	}
	tx.transmitOptions |= API.TransmitOption.EXTENDED_TIMEOUT; // Use indirect transmission timeout.
	if ((request.txOptions & APS.TXOption.SECURITY) > 0) {
		tx.transmitOptions |= API.TransmitOption.ENABLE_APS_ENCRYPTION;
	}
	if ((request.txOptions & APS.TXOption.ACK) == 0) {
		tx.transmitOptions |= API.TransmitOption.DISABLE_RETRIES;
	}

	return tx;
}

/**
 * APSDE-DATA.indication
 */
function apsReceived(response) {
	var eui64 = Address.getIEEEAddress(response.address64);
	var nwk = Address.getNetworkAddress(response.address16);
	/* Keep updated the local address table. */
	updateAddressMap(eui64, nwk);
	
	if (response.frameType != API.FrameType.ZB_RECEIVE_PACKET &&
		response.frameType != API.FrameType.ZB_EXPLICIT_RX_IND) {
		logger.debug("Invalid frame type for APS");
		return;
	}
	var indication = {
		payload: response.payload
	};
	if (response.address64 != XBEE_UNKNOWN64) {	// FIXME: Array compare works??
		indication.sourceAddress = eui64;
	} else {
		indication.sourceAddress = nwk;
	}
	
	var broadcast;
	if (response.frameType == API.FrameType.ZB_EXPLICIT_RX_IND) {
		indication.clusterId = response.clusterId;
		indication.profileId = response.profileId;
		indication.sourceEndpoint = response.sourceEndpoint;
		indication.destinationEndpoint = response.destinationEndpoint;
		broadcast = ((response.receiveOptions & API.ReceiveOption.BROADCAST_PACKET) > 0);
	} else {
		indication.clusterId = DIGI_CLUSTER_ID;
		indication.profileId = DIGI_PROFILE_ID;
		indication.sourceEndpoint = DIGI_ENDPOINT;
		indication.destinationEndpoint = DIGI_ENDPOINT;
		broadcast = ((response.receiveOptions & API.ReceiveOption.BROADCAST_PACKET) > 0);
	}
	indication.destinationAddress = broadcast
			? Address.BROADCAST_MROWI
			: null;		// FIXME: Should be my network address
	// TODO: indication.linkQuality = linkQuality;

	for (var i = 0; i < apsContext.receivers.length; i++) {
		apsContext.receivers[i].apsIndication(indication);
	}
}