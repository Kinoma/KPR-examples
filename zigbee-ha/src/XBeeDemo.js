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
 * ZigBee Home Automation Example
 *
 * Author: Shotaro Uchida <suchida@marvell.com>
 */

var Pins = require("pins");

var Utils = require("/lowpan/common/utils");
var Logger = Utils.Logger;

var XBee = require("./xbee/zdo");

var Address = require("./zigbee/address");
var APS = require("./zigbee/aps");
var ZDP = require("./zigbee/zdp");

const XBEE_CHANNEL_MASK = 0x1FFF800; // Channel 11-24
const PERMIT_JOIN_DURATION = 80;
const HA_TC_LINK_KEY = [
	0x5A, 0x69, 0x67, 0x42, 0x65, 0x65, 0x41, 0x6C,
	0x6C, 0x69, 0x61, 0x6E, 0x63, 0x65, 0x30, 0x39
];

// Load ZigBee Applications
var ZCL = require("./OnOffSwitchExample");

var logger = new Logger("XBee Demo");
logger.loggingLevel = Logger.Level.INFO;

var discoveredList = {};

/******************************************************************************
 * Behavior
 ******************************************************************************/

class XBeeBehavior extends Behavior {
	onLaunch(content) {
		// BLL Configure
		Pins.configure(
			{
				xbee: {
					require: "/xbee/uart",
					pins: {}
				},
				led: {
					require: "LED",
					pins: {
						red: {pin: 54},
						green: {pin: 52},
						blue: {pin: 51}
					}
				}
			},
			function (success) {
				if (!success) {
					logger.error("Pins configuration failure");
					return;
				}
				// Activate ZigBee
				XBee.activate("xbee");
				ZCL.openConnection(XBee);
			}
		);
	}
}

/******************************************************************************
 * Demo
 ******************************************************************************/
exports.start = function () {
	logger.debug("******** Start ********");
	application.behavior = new XBeeBehavior();
};

exports.diagnostics = function () {
	logger.debug("******** Diagnostics ********");
	// Gather diagnostics informations
	XBee.API.executeCommandSequence(
		[
			{command: "ID"},
			{command: "AI"},
			{command: "AO"},
			{command: "SC"},
			{command: "ZS"},
			{command: "OP"},
			{command: "CH"},
			{command: "MY"}
		],
		{
			sequenceCompleted: (responseMap) => {
				let info = readDiagnostics(responseMap);
				logger.info("Extended PAN ID: " + Utils.toFrameString(info.extPANID, 0, 8));
				logger.info("Association Indication: " + Utils.toHexString(info.associationIndication));
				logger.info("API Options: " + Utils.toHexString(info.apiOption));
				logger.info("Scan Channels: " + Utils.toHexString(info.scanChannels));
				logger.info("ZigBee Stack Profile: " + Utils.toHexString(info.stackProfile));
				logger.info("Operating Extended PAN ID: " + Utils.toFrameString(info.operatingExtPANID, 0, 8));
				logger.info("Operating Channel: " + Utils.toHexString(info.operatingChannel));
				logger.info("16-bit Network Address: " + info.networkAddress.toString());
			},
			sequenceCompletedWithError: (responseMap, response) => {
				logger.warn("Gather basic informations failed: " + response.status);
			}
		}
	)
};

exports.commission = function () {
	logger.debug("******** Commission ********");

	// Set stack profile explicitly
	XBee.API.executeCommand("ZS", [0x02]);
	// Set channel mask
	XBee.API.executeCommand("SC", Utils.toByteArray((XBEE_CHANNEL_MASK >> 0x0B) & 0xFFFF, 2));

	// Setup HA Security
	XBee.API.executeCommand("EE", [0x01]);

	let nodeType = XBee.getDeviceInfo().nodeType;
	if (nodeType == "Coordinator") {
		XBee.API.executeCommand("EO", [0x02]);	// Use TrustCenter
		XBee.API.executeCommand("NK", [0x00]);	// Random NetworkKey
	} else {
		XBee.API.executeCommand("EO", [0x00]);
	}
	XBee.API.executeCommand("KY", HA_TC_LINK_KEY);
	
	if (nodeType == "Coordinator") {
		// Use my IEEEAddress for extPANID
		XBee.API.executeCommand("ID", XBee.getDeviceInfo().ieeeAddress.toArray(false));
	} else {
		// Join any available network
		XBee.API.executeCommand("ID", [0x00]);
	}
	
	// Write
	XBee.API.executeCommand("WR");
};

exports.commission2 = function () {
	logger.debug("******** Commission 2 ********");
	let nodeType = XBee.getDeviceInfo().nodeType;
	if (nodeType == "Coordinator") {
		// Permit Join
		XBee.API.executeCommand("NJ", [PERMIT_JOIN_DURATION]);
		XBee.API.executeCommand("CB", [0x02]);
	} else {
		// Leave the network
		XBee.API.executeCommand("DA");
	}
};

exports.discovery = function () {
	logger.debug("******** Discovery ********");
	sendMatchDescriptorRequest(
		Address.BROADCAST_MROWI,
		Address.BROADCAST_MROWI,
		ZCL.PROFILE_HA,
		ZCL.SIMPLE_DESCRIPTOR.outputClusters,
		[],
		{
			responseReceived: (packet, response) => {
				if (response.status == 0) {
					logger.info("Discovered: NWK=" + response.nwkAddr.toString());
					discoveredList[response.nwkAddr.toString()] = response;
				}
			}
		}
	);
};

exports.toggleAll = function () {
	logger.debug("******** Toggle All ********");
	for (let key in discoveredList) {
		if (discoveredList.hasOwnProperty(key)) {
			let discovered = discoveredList[key];
			discovered.matchList.forEach(endpoint => {
				logger.debug("Send Toggle: addr=" + discovered.nwkAddr.toString()
					+ ":" + Utils.toHexString(endpoint));
				ZCL.sendOnOffToggle(discovered.nwkAddr, endpoint);
			});
		}
	}
};

exports.toggle = function (dstAddr, dstEndpoint) {
	ZCL.sendOnOffToggle(dstAddr, dstEndpoint);
};

function readDiagnostics(responseMap) {
	return {
		extPANID: responseMap["ID"].data,
		associationIndication: responseMap["AI"].data[0] & 0xFF,
		apiOption: responseMap["AO"].data[0] & 0xFF,
		scanChannels: Utils.toInt16(responseMap["SC"].data, 2, false),
		stackProfile: responseMap["ZS"].data[0] & 0xFF,
		operatingExtPANID: responseMap["OP"].data,
		operatingChannel: responseMap["CH"].data[0] & 0xFF,
		networkAddress: Address.getNetworkAddress(responseMap["MY"].data)
	};
}

/******************************************************************************
 * ZDO
 ******************************************************************************/

// Default values
const DEFAULT_TX_RADIUS = 0;
const DEFAULT_TX_OPTIONS = APS.TXOption.ACK | APS.TXOption.FRAGMENTATION;
const DEFAULT_TX_BUFFER_SIZE = 64;

// Sample SimpleDescriptorRequest message
function sendSimpleDescriptorRequest(address, target, endpoint, callback) {
	if (!address.isUnicast()) {
		throw "Remote address must be unicast";
	}

	if (target.mode != Address.AddressMode.NWK) {
		throw "Target (NOI) must be NWK addressing mode.";
	}

	XBee.sendZDPCommandPacket(address,
		ZDP.Command.SIMPLE_DESC_REQ,
		{
			nwkAddr: target,
			endpoint: endpoint
		},
		DEFAULT_TX_RADIUS, DEFAULT_TX_OPTIONS, callback);
}

// Sample MatchDescriptorRequest message
function sendMatchDescriptorRequest(address, target, profileId, inClusters, outClusters, callback) {
//	if (!address.isUnicast()) {
//		throw "Remote address must be unicast";
//	}

	if (target.mode != Address.AddressMode.NWK) {
		throw "Target (NOI) must be NWK addressing mode.";
	}

	XBee.sendZDPCommandPacket(address,
		ZDP.Command.MATCH_DESC_REQ,
		{
			nwkAddr: target,
			profileId: profileId,
			inputClusters: inClusters,
			outputClusters: outClusters
		},
		DEFAULT_TX_RADIUS, DEFAULT_TX_OPTIONS, callback);
}