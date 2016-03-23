//@program
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

var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var CREATIONS = require("creations/creations");
var Pins = require("pins");
var Utils = require("lowpan/common/utils");

const CLIENT_CHARACTERISTIC_CONFIGURATION_UUID	= "2902";

const CLIENT_CONFIG_NOTIFICATION = 0x0001;
const CLIENT_CONFIG_INDICATION = 0x0002;

const MESH_SERVICE_UUID = "72C90001-57A9-4D40-B746-534E22EC9F9E";
const NOTIFY_CHARACTERISTIC_UUID = "72C90003-57A9-4D40-B746-534E22EC9F9E";
const INDICATE_CHARACTERISTIC_UUID = "72C90005-57A9-4D40-B746-534E22EC9F9E";
const WRITE_CHARACTERISTIC_UUID = "72C90004-57A9-4D40-B746-534E22EC9F9E";

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var statusStyle = new Style({font:"bold 22px", color:"white", horizontal:"center", vertical:"bottom", lines:"1"});
var valueStyle = new Style({font:"bold 60px", color:"green", horizontal:"center", vertical:"middle"});

// ----------------------------------------------------------------------------------
// assets
// ----------------------------------------------------------------------------------
var blackSkin = new Skin({fill: "black"});

// ----------------------------------------------------------------------------------
// Main screen
// ----------------------------------------------------------------------------------

class BLEMESHServiceBehavior extends Behavior {
	changeState(container, state) {
		application.distribute("onStateChange", state);
	}
	onButtonEvent(container, msg) {
		_count++;
		if (_count > 100) {
			_count = 0;
		}
		this.data.MESSAGE.string = _count + "\n(" + msg + ")";
	}
	onCreate(container, data) {
		this.data = data;
	}
	onConnected(container) {
	}
	onDisconnected(container) {
		this.data.BUSY.visible = true;
		this.data.MESSAGE.visible = false;
		this.data.STATUS.string = "";
	}
	onReady(container) {
		this.data.BUSY.visible = false;
		this.data.READINGS.visible = true;
		this.data.MESSAGE.string = "(Idle)";
	}
	onStateChange(container, state) {
		this.data.STATUS.string = "state: " + state;
	}
};

var MainScreen = Container.template(function($) { return {
	left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin,
	behavior: Behavior({
		onBackButton: function (container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		},
	}),
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			Behavior: BLEMESHServiceBehavior,
			contents: [
				CREATIONS.BusyPicture($, {anchor: "BUSY", url: "./assets/spinner.png", top: 40}),
				Column($, {
					anchor: "READINGS", left: 0, right: 0, visible: false,
					contents: [
						Text($, {anchor: "MESSAGE", left: 20, right: 20, bottom: 0, top: -20, style: valueStyle}),
					]
				}),
				Label($, {anchor: "STATUS", left: 20, right: 20, bottom: 5, style: statusStyle}),
			],
		})
	]
}});

// ----------------------------------------------------------------------------------
// Application
// ----------------------------------------------------------------------------------

function findMESHService(peripheral) {
	let scanResponseData = peripheral.data;
	for (let i = 0, c = scanResponseData.length; i < c; ++i) {
		let entry = scanResponseData[i];
		if (0x06 == entry.flag || 0x07 == entry.flag) {			// Partial or complete list of 128-bit UUIDs
			let uuids = entry.data;
			for (let j = 0; j < uuids.length; ++j) {
				if (MESH_SERVICE_UUID == uuids[j]) {			// Look for MESH service UUID
					return true;
				}
			}
		}
	}
	return false;
}

class Context {
	constructor() {
		this._state = "idle";
		this.initialize();
	}
	get state() {
		return this._state;
	}
	set state(state) {
		this._state = state;
		application.distribute("changeState", state);
	}
	initialize() {
		this._connection = null;
		this._service = null;
		this._characteristics = new Array();
		this._currentCharacteristic = null;
	}
	startScanning() {
		Pins.invoke("/ble/gapStartScanning");
		this.state = "discovery";
	}
	startNextDescriptorDiscovery() {
		for (let characteristic of this._characteristics) {
			if (characteristic.hasOwnProperty("clientConfig") && characteristic.clientConfig == null) {
				this._currentCharacteristic = characteristic;
				let params = {
					connection: this._connection,
					start: characteristic.characteristic + 1,
					end: characteristic.end
				};
				Pins.invoke("/ble/gattDiscoverAllCharacteristicDescriptors", params);
				return true;
			}
		}
		this._currentCharacteristic = null;
		return false;
	}
	writeClientConfiguration(uuid, config) {
		for (let characteristic of this._characteristics) {
			if (characteristic.uuid == uuid) {
				// 16-bit little endian Client Characteristic Configuration - setting bit 1 enables notification
				let params = {
					connection: this._connection,
					characteristic: characteristic.clientConfig,
					value: Array.from(Utils.toByteArray(config, 2, true))
				};
				Pins.invoke("/ble/gattWriteCharacteristicValue", params);
				return true;
			}
		}
		return false;
	}
	writeCharacteristicValue(uuid, value) {
		for (let characteristic of this._characteristics) {
			if (characteristic.uuid == uuid) {
				let params = {
					connection: this._connection,
					characteristic: characteristic.characteristic,
					value: Array.from(value)
				};
				Pins.invoke("/ble/gattWriteCharacteristicValue", params);
				return true;
			}
		}
		return false;
	}
	responseReceived(response) {
		let notification = response.notification;
		if ("system/reset" == notification) {
			this.startScanning();
		} else if ("gap/discover" == notification) {
			if ("discovery" != this.state) {
				return;
			}
			if (findMESHService(response)) {
				Pins.invoke("/ble/gapConnect", {
					address: response.address,
					addressType: response.addressType,
				});
				this.state = "connect";
			}
		} else if ("gap/connect" == notification) {
			this._connection = response.connection;
			this.state = "authentication";
			Pins.invoke("/ble/smSetSecurityParameter", {
				connection: this._connection,
				bonding: true
			});
			Pins.invoke("/ble/smStartEncryption", {
				connection: this._connection
			});
		} else if ("sm/encryption/complete" == notification) {
			this.state = "services";
			// Discover primary services - we'll be looking for MESH service
			Pins.invoke("/ble/gattDiscoverAllPrimaryServices", {
				connection:this._connection
			});
			application.distribute("onConnected");
			this.state = "services";
		} else if ("gap/disconnect" == notification) {
			this.initialize();
			application.distribute("onDisconnected");
			this.startScanning();
		} else if ("gatt/service" == notification) {
			if (MESH_SERVICE_UUID == response.uuid) {
				this._service = response;
			}
		} else if ("gatt/characteristic" == notification) {
			if (NOTIFY_CHARACTERISTIC_UUID == response.uuid) {
				response.clientConfig = null;
				this._characteristics.push(response);
			} else if (INDICATE_CHARACTERISTIC_UUID == response.uuid) {
				response.clientConfig = null;
				this._characteristics.push(response);
			} else if (WRITE_CHARACTERISTIC_UUID == response.uuid) {
				this._characteristics.push(response);
			}
		} else if ("gatt/descriptor" == notification) {
			if (CLIENT_CHARACTERISTIC_CONFIGURATION_UUID == response.uuid) {
				this._currentCharacteristic.clientConfig = response.descriptor;
			}
		} else if ("gatt/characteristic/notify" == notification) {
			if (response.value.length == 4) {
				let event = Utils.toInt32(response.value, false);
				let msg = null;
				if (event == 0x01000102) {
					msg = "Pressed";
				} else if (event == 0x01000203) {
					msg = "Hold";
				} else if (event == 0x01000304) {
					msg = "Double";
				}
				if (msg != null) {
					application.distribute("onButtonEvent", msg);
				}
			}
		} else if ("gatt/request/complete" == notification) {
			if ("services" == this.state) {
				if (null != this._service) {
					// Discover MESH service characteristics
					this.state = "characteristics";
					let params = {
						connection: this._connection,
						start: this._service.start,
						end: this._service.end
					};
					Pins.invoke("/ble/gattDiscoverAllCharacteristics", params);
				}
			} else if ("characteristics" == this.state) {
				if (this._characteristics.length > 0) {
					for (let i = 0; i < this._characteristics.length; i++) {
						let characteristic = this._characteristics[i];
						if (i + 1 == this._characteristics.length) {
							characteristic.end = this._service.end;
						} else {
							characteristic.end = this._characteristics[i + 1].characteristic;
						}
					}
				}
				this.state = "descriptors";
				if (!this.startNextDescriptorDiscovery()) {
					this.state = "reading";
				}
			} else if ("descriptors" == this.state) {
				if (!this.startNextDescriptorDiscovery()) {
					this.state = "configure1";
					this.writeClientConfiguration(INDICATE_CHARACTERISTIC_UUID, CLIENT_CONFIG_INDICATION);
				}
			} else if ("configure1" == this.state) {
				this.state = "configure2";
				this.writeCharacteristicValue(WRITE_CHARACTERISTIC_UUID, Utils.toByteArray(0x00020103, 4, false));
			} else if ("configure2" == this.state) {
				this.state = "configure3";
				this.writeClientConfiguration(NOTIFY_CHARACTERISTIC_UUID, CLIENT_CONFIG_NOTIFICATION);
			} else if ("configure3" == this.state) {
				this.state =  "reading";
				application.distribute("onReady");
			}
		}
	}
}

var _ctx = new Context();
var _count = 0;

application.behavior = Behavior({
	onLaunch(application) {
 		Pins.configure({
            ble: {
                require: "/lowpan/ble"
            }
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			this.data = {
				title: "MESH Button Monitor",
				titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle
			};
		
			Pins.when("ble", "notification", response => _ctx.responseReceived(response));

			application.add(new MainScreen(this.data));
		} else {
			throw new Error("Unable to configure BLE");
		}
	},
});
