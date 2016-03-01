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

// https://developer.bluetooth.org/TechnologyOverview/Pages/HRS.aspx
// https://developer.bluetooth.org/gatt/services/Pages/ServiceViewer.aspx?u=org.bluetooth.service.heart_rate.xml
// https://bluegiga.zendesk.com/entries/66001188--BGScript-hr-collector-Heart-Rate-collector-BLE-master

var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var CREATIONS = require("creations/creations");
var Pins = require("pins");

var HEART_RATE_SERVICE_UUID = "180D";
var HEART_RATE_MEASUREMENT_UUID = "2A37";
var CLIENT_CHARACTERISTIC_CONFIGURATION_UUID = "2902";


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
var BLEHeartRateMonitorServiceBehavior = Behavior.template({	
	changeState: function(container, state) {
		this.state = state;
		application.distribute("onStateChange", state);
	},
	connect: function(container, peripheral) {
		Pins.invoke("/ble/gapConnect", { address:peripheral.address, addressType:peripheral.addressType });		
		this.changeState(container, "connect");
	},
	initialize: function(container) {
		this.start_handle = null;
		this.end_handle = null;
		this.connection_handle = null;
		this.ccc_handle = null;
		this.measurement_handle = null;
		this.changeState(container, "idle");
	},
	onCreate: function(container, data) {
		this.data = data;
		this.initialize(container);
	},
	onDisplaying: function(container) {
		this.startScanning(container);
	},
	onGattCharacteristicNotified: function(container, result) {
		if (this.measurement_handle == result.characteristic) {
			var chunk = result.value;
			var flags = chunk[0];
			var beatsPerMinute;
			if (flags & 1)
				beatsPerMinute = chunk[1] | (chunk[2] << 8);
			else
				beatsPerMinute = chunk[1];
			if (0 == beatsPerMinute)
				beatsPerMinute = "--";
			application.distribute("onHeartRateMeasurement", beatsPerMinute);
		}
	},
	onGattCharacteristicFound: function(container, result) {
		if (HEART_RATE_MEASUREMENT_UUID == result.uuid) {
			this.measurement_handle = result.characteristic;
		}
	},
	onGattCharacteristicDescriptorFound: function(container, result) {
		if (CLIENT_CHARACTERISTIC_CONFIGURATION_UUID == result.uuid && null != this.measurement_handle && null == this.ccc_handle) {
			this.ccc_handle = result.descriptor;
		}
	},
	onGattRequestCompleted: function(container, result) {
		if ("services" == this.state) {
			if (null != this.end_handle) {
				// Discover heart rate service characteristics
				this.changeState(container, "characteristics");
				var params = {
					connection: this.connection_handle,
					start: this.start_handle,
					end: this.end_handle
				};
				Pins.invoke("/ble/gattDiscoverAllCharacteristics", params);
			}
		}
		else if ("characteristics" == this.state) {
			if (null != this.measurement_handle) {
				// Discover heart rate service characteristic descriptors
				this.changeState(container, "descriptors");
				var params = {
					connection: this.connection_handle,
					start: this.measurement_handle + 1,
					end: this.end_handle
				};
				Pins.invoke("/ble/gattDiscoverAllCharacteristicDescriptors", params);
			}
		}
		else if ("descriptors" == this.state) {
			if (null != this.ccc_handle) {
				// Enable heart rate measurement notifications
				// 16-bit little endian Client Characteristic Configuration - setting bit 1 enables notification
				var buffer = new ArrayBuffer(2);
				var ccc_data = new Uint8Array(buffer);
				ccc_data[0] = 0x01;	ccc_data[1] = 0x00;
				var params = {
					connection: this.connection_handle,
					characteristic: this.ccc_handle,
					value: buffer
				};
				Pins.invoke("/ble/gattWriteCharacteristicValue", params);
				
				this.changeState(container, "reading");
			}
		}
	},
	onGattServiceFound: function(container, result) {
		if (HEART_RATE_SERVICE_UUID == result.uuid) {
			this.start_handle = result.start;
			this.end_handle = result.end;
		}
	},
	onPeripheralConnected: function(container, peripheral) {
		this.connection_handle = peripheral.connection;
		
		// Discover primary services - we'll be looking for heart rate service
		Pins.invoke("/ble/gattDiscoverAllPrimaryServices", { connection:this.connection_handle });
		
		application.distribute("onConnected");
		
		this.changeState(container, "services");
	},
	onPeripheralDisconnected: function(container, peripheral) {
		this.initialize(container);
		application.distribute("onDisconnected");
		this.startScanning(container);
	},
	onPeripheralDiscovered: function(container, peripheral) {
		if ("discovery" != this.state) return;
		
		var scanResponseData = peripheral.data;
	
		for (var i = 0, c = scanResponseData.length; i < c; ++i) {
			var entry = scanResponseData[i];
			if (0x02 == entry.flag || 0x03 == entry.flag) {			// Partial or complete list of 16-bit UUIDs
				var uuids = entry.data;
				for (j = 0; j < uuids.length; ++j) {
					if (HEART_RATE_SERVICE_UUID == uuids[j]) {		// Look for heart rate service UUID
						this.connect(container, peripheral);		// Found heart rate service - connect to peripheral
						return;
					}
				}
			}
		}
	},
	startScanning: function(container) {
		Pins.invoke("/ble/gapStartScanning", {interval: 0x500});
		
		this.changeState(container, "discovery");
	},
});

var MainScreen = Container.template(function($) { return {
	left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin,
	behavior: Behavior({
		onBackButton: function(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		},
	}),
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLEHeartRateMonitorServiceBehavior({
				onConnected: function(container) {
				},
				onDisconnected: function(container) {
					this.data.BUSY.visible = true;
					this.data.READINGS.visible = false;
					this.data.STATUS.string = "";
				},
				onHeartRateMeasurement: function(container, beatsPerMinute) {
					this.data.BUSY.visible = false;
					this.data.READINGS.visible = true;
					this.data.HEARTRATE.string = "Heart rate\n" + beatsPerMinute + " bpm";
				},
				onStateChange: function(container, state) {
					this.data.STATUS.string = "state: " + state;
				},
			}),
			contents: [
				CREATIONS.BusyPicture($, {anchor: "BUSY", url: "./assets/spinner.png", top: 40}),
				Column($, {
					anchor: "READINGS", left: 0, right: 0, visible: false,
					contents: [
						Text($, {anchor: "HEARTRATE", left: 20, right: 20, bottom: 0, top: -20, style: valueStyle}),
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
		else if ("gatt/service" == notification) {
			application.distribute("onGattServiceFound", response);
		}
		else if ("gatt/characteristic" == notification) {
			application.distribute("onGattCharacteristicFound", response);
		}
		else if ("gatt/descriptor" == notification) {
			application.distribute("onGattCharacteristicDescriptorFound", response);
		}
		else if ("gatt/characteristic/notify" == notification) {
			application.distribute("onGattCharacteristicNotified", response);
		}
		else if ("gatt/request/complete" == notification) {
			application.distribute("onGattRequestCompleted", response);
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
				title: "Heart Rate Monitor",
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
