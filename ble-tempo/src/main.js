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

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var valueStyle = new Style({font:"bold 26px", color:"white", horizontal:"left", vertical:"middle", lines:"1"});

// ----------------------------------------------------------------------------------
// assets
// ----------------------------------------------------------------------------------
var blackSkin = new Skin({fill:"black"});

// ----------------------------------------------------------------------------------
// Main screen
// ----------------------------------------------------------------------------------
class BLEDeviceDiscoveryBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.startScanning(container);
	}
	onPeripheralDiscovered(container, peripheral) {
		application.distribute("onScanResponse", peripheral.data);
	}
	startScanning(container) {
		Pins.invoke("/ble/gapStartScanning");
	}
};

class BLETempoBehavior extends BLEDeviceDiscoveryBehavior {
	onCreate(container, data) {
		super.onCreate(container, data);
		container.duration = 5000;
	}
	onFinished(container) {
		this.data.BUSY.visible = true;
		this.data.READINGS.visible = false;
	}
	onScanResponse(container, scanResponseData) {
		for (var i = 0, c = scanResponseData.length; i < c; ++i) {
			var entry = scanResponseData[i];
			if (0xFF == entry.flag) {	// Manufacturer specific data advertising type
				var chunk = entry.data;
				if (chunk.length > 8) {
					if (chunk[0] == 0x33 && chunk[1] == 0x01) {	// Manufacturer ID 0x0133
						if (chunk[2] == 0 || chunk[2] == 1)	{	// Product code for Tempo T30 or Tempo THP
							this.onTempoDiscovered(container, chunk);
							return;
						}
					}
				}
			}
		}
	}
	onTempoDiscovered(container, data) {
		var temperature, humidity, pressure;
		temperature = data[5] | (data[6] << 8);
		temperature /= 10;
		if (data.length > 9) {
			humidity = data[9];
			pressure = data[10] | (data[11] << 8);
		}
		this.data.TEMPERATURE.string = "Temperature: " + temperature + " ˚C";
		if (humidity)
			this.data.HUMIDITY.string = "Relative humidity: " + humidity + " % ";
		if (pressure)
			this.data.PRESSURE.string = "Barometric pressure: " + pressure + " hPa";
		this.data.READINGS.visible = true;
		this.data.BUSY.visible = false;
		container.stop();
		container.time = 0;
		container.start();
	}
};

var ValueLabel = Label.template($ => ({
	left: 20, right: 20, top: 0, bottom: 0, style: valueStyle
}));

var MainScreen = Container.template($ => ({
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
			Behavior : BLETempoBehavior,
			contents: [
				CREATIONS.BusyPicture($, {anchor: "BUSY", url: "./assets/spinner.png", top: 50}),
				Column($, {
					anchor: "READINGS", left: 0, right: 0, top: 10, bottom: 10, visible: false,
					contents: [
						ValueLabel($, {anchor: "TEMPERATURE"}),
						ValueLabel($, {anchor: "HUMIDITY"}),
						ValueLabel($, {anchor: "PRESSURE"})
					]
				})
			],
		})
	]
}));

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
				title: "Blue Maestro Tempo",
				titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle
			};
		
			Pins.when("ble", "notification", this.onBLENotification);

			application.add(new MainScreen(this.data));
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	}
});
