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

let GRIFFIN_PM_SERVICE_UUID = "25598CF7-4240-40A6-9910-080F19F91EBC";
let CCC_HANDLE = 45;

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var statusStyle = new Style({font:"bold 22px", color:"white", horizontal:"center", vertical:"bottom" });
var valueStyle = new Style({font:"bold 90px", color:"white", horizontal:"center", vertical:"middle"});

// ----------------------------------------------------------------------------------
// assets
// ----------------------------------------------------------------------------------
var backgroundSkin = new Skin({fill: "black"});

// ----------------------------------------------------------------------------------
// Main screen
// ----------------------------------------------------------------------------------
var BLEGriffinServiceBehavior = Behavior.template({	
	changeState: function(container, state) {
		this.state = state;
		application.distribute("onStateChange", state);
	},
	connect: function(container, peripheral) {
		Pins.invoke("/ble/gapConnect", { address:peripheral.address, addressType:peripheral.addressType });
		this.changeState(container, "connecting");
	},
	initialize: function(container) {
		this.connection = null;
		this.state = "";
		this.changeState(container, "idle");
	},
	onCreate: function(container, data) {
		this.data = data;
		this.initialize(container);
	},
	onDisplaying: function(container) {
		this.startScanning(container);
	},
	onGattCharacteristicNotified(container, result) {
		let value = result.value[0];
		application.distribute("onValue", parseInt(value));
	},
	onPeripheralConnected: function(container, peripheral) {
		this.connection = peripheral.connection;
		let buffer = new ArrayBuffer(2);
		let ccc_data = new Uint8Array(buffer);
		ccc_data[0] = 0x01;	ccc_data[1] = 0x00;
		var params = {
			connection: this.connection,
			characteristic: CCC_HANDLE,
			value: buffer
		}
		Pins.invoke("/ble/gattWriteCharacteristicValue", params);
		this.changeState(container, "connected");
		application.distribute("onConnected");
	},
	onPeripheralDisconnected: function(container, peripheral) {
		this.initialize(container);
		application.distribute("onDisconnected");
		this.startScanning(container);
	},
	onPeripheralDiscovered: function(container, peripheral) {
		if ("discovery" != this.state) return;
		
		let scanResponseData = peripheral.data;
	
		for (let i = 0, c = scanResponseData.length; i < c; ++i) {
			let entry = scanResponseData[i];
			if (0x06 == entry.flag) {			// Incomplete list of 128-bit UUIDS
				let uuids = entry.data;
				for (let j = 0; j < uuids.length; ++j) {
					if (GRIFFIN_PM_SERVICE_UUID == uuids[j]) {
						this.connect(container, peripheral);
						return;
					}
				}
			}
		}
	},
	startScanning: function(container) {
		Pins.invoke("/ble/gapStartScanning");
		this.changeState(container, "discovery");
	},
});

var MainScreen = Container.template(function($) { return {
	left: 0, right: 0, top: 0, bottom: 0, skin: backgroundSkin,
	behavior: Behavior({
		onBackButton: function(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		},
	}),
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLEGriffinServiceBehavior({
				onConnected(container) {
					this.data.BUSY.visible = false;
					this.data.READINGS.visible = true;
				},
				onDisconnected(container) {
					this.data.BUSY.visible = true;
					this.data.READINGS.visible = false;
					this.data.STATUS.string = "";
					this.data.READINGS.string = "";
				},
				onStateChange(container, state) {
					this.data.STATUS.string = state;
				},
				onValue(container, value) {
					let s = "IDLE";
					switch(value) {
						case 104: //right turn
							s = "RIGHT";
							break;
						case 103: //left turn
							s = "LEFT";
							break;
						case 101: //button press
							s = "PRESS";
							break;
					}
					this.data.READINGS.string = s;
				}
			}),
			contents: [
				CREATIONS.BusyPicture($, {anchor: "BUSY", url: "./assets/spinner.png", top: 40}),
				Label($, { anchor: "READINGS", left:0, right:0, top:0, bottom:0, visible:false, style:valueStyle, string:'IDLE' }),
				Label($, { anchor: "STATUS", left: 20, right: 20, bottom: 5, style: statusStyle }),
			],
		})
	]
}});

// ----------------------------------------------------------------------------------
// Application
// ----------------------------------------------------------------------------------

application.behavior = Behavior({
	onBLENotification(response) {
		var notification = response.notification;

		if ("gap/discover" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralDiscovered", peripheral);
		}
		else if ("gap/connect" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralConnected", peripheral);
		}
		else if ("gap/disconnect" == notification) {
			var connection = response.connection;
			application.distribute("onPeripheralDisconnected", connection);
		}
		else if ("gatt/characteristic/notify" == notification) {
			application.distribute("onGattCharacteristicNotified", response);
		}
	},
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
				title: "Griffin PowerMate",
				titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle
			};
		
			Pins.when("ble", "notification", this.onBLENotification);

			application.add(new MainScreen(this.data));
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	},
});
