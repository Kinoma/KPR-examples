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
var Pins = require("pins");

var statusStyle = new Style({ font:"64px", color:"white", horizontal:"center", vertical:"middle" });

var blackSkin = new Skin({ fill:"black" });

var GAP_SERVICE = {
	uuid: "1800",
	characteristics: [
		{
			uuid: "2A00",						// device name string
			properties: ["read"],
			value: "Kinoma"
		},
	]
};

var HEART_RATE_SERVICE = {
	uuid: "180D",
	characteristics: [
		{
			uuid: "2A37",						// measurement
			properties: ["read","indicate","notify"],
			value: [0,60]						// 8bit (flags), uint8 (bpm) 
		},
		{
			uuid: "2A38",						// body location
			properties: ["read"],
			value: [1]							// int8, 1 = chest
		},
	]
};

var BATTERY_SERVICE = {
	uuid: "180F",
	characteristics: [
		{
			uuid: "2A19",						// level
			properties: ["read"],
			value: [50]							// uint8 (0-100)
		},
	]
};

var advertisingData = {
	incompleteUUID16List: ['180D']
};

var scanResponseData = {
	completeName: "Polar H7 252D9F",
};

var MainScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin,
	behavior: Behavior({
		onCreate(container, data) {
			container.interval = 1000;
			this.connected = false;
			this.heart_rate = 60;
			
			Pins.invoke("/ble/gattAddServices", {
				services: [GAP_SERVICE, HEART_RATE_SERVICE, BATTERY_SERVICE]
			});
		},
		onDisplaying(container) {
			Pins.invoke("/ble/gapSetScanResponseData", scanResponseData);
			Pins.invoke("/ble/gapStartAdvertising", {data: advertisingData});
			container.first.string = "Advertising";
		},
		onPeripheralConnected(container) {
			Pins.invoke("/ble/gapStopAdvertising");
			this.connected = true;
			container.time = 0;
			container.start();
		},
		onPeripheralDisconnected(container) {
			container.stop();
			this.connected = false;
			this.heart_rate = 60;
			Pins.invoke("/ble/gapStartAdvertising", {data: advertisingData});
			container.first.string = "Advertising";
		},
		onTimeChanged(container) {
			if (++this.heart_rate > 90)
				this.heart_rate = 60;
			var params = {
				service: "180D",
				characteristic: "2A37",
				value: [0, this.heart_rate]
			}
			Pins.invoke("/ble/gattWriteLocal", params);
			container.first.string = "Heart Rate\n" + this.heart_rate;
		},
		onUndisplayed(container) {
			Pins.invoke("/ble/gapStopAdvertising");
		},
	}),
	contents: [
		Text($, { left:0, right:0, style:statusStyle })
	]
}));

application.behavior = Behavior({
	onBLENotification(response) {
		var notification = response.notification;
		if ("gap/connect" == notification) {
			application.distribute("onPeripheralConnected");
		}
		else if ("gap/disconnect" == notification) {
			application.distribute("onPeripheralDisconnected");
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
			this.data = {};
			Pins.when("ble", "notification", this.onBLENotification);
			application.add(new MainScreen(this.data));
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	},
});
