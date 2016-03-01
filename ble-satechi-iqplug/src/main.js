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

var PLUG_ATTRIBUTE_HANDLE = 0x2B;

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var applicationStyle = new Style({font: "16px Fira Sans"});
var statusStyle = new Style({font:"bold 22px", color:"white", horizontal:"center", vertical:"bottom", lines:"1"});

// ----------------------------------------------------------------------------------
// assets
// ----------------------------------------------------------------------------------
var blackSkin = new Skin({fill: "black"});

// ----------------------------------------------------------------------------------
// layouts
// ----------------------------------------------------------------------------------
var ConnectingScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0,
	contents: [
		CREATIONS.BusyPicture($, {url: "./assets/spinner.png", top: 40}),
		Label($, {left: 20, right: 20, bottom: 5, style: statusStyle, string: "Connecting..."})
	]
}));

var ConnectedScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, active: true,
	behavior: Behavior({
		doSwitch(container) {
			if ("off" == this.state)
				container.first.url = mergeURI(application.url, "./assets/power-off.png");
			else
				container.first.url = mergeURI(application.url, "./assets/power-on.png");
			container.bubble("onSwitchStateChange", this.state);
		},
		onDisplaying(container) {
			this.state = "off";
			this.doSwitch(container);
		},
		onTouchBegan(container) {
			this.state = ("off" == this.state ? "on" : "off");
			this.doSwitch(container);
		}
	}),
	contents: [
		Picture($, {})
	]
}));

var BLESatechiIQPlugBehavior = Behavior.template({	
	doConnect(container, peripheral) {
		if ("discovery" != this.state) return;
		this.doStateChange(container, "connecting");
		Pins.invoke("/ble/gapConnect", { address:peripheral.address, addressType:peripheral.addressType });		
	},
	doConnected(container) {
		container.add(new ConnectedScreen);
	},
	doScan(container) {
		this.doStateChange(container, "discovery");
		Pins.invoke("/ble/gapStartScanning");
	},
	doStateChange(container, state) {
		this.state = state;
	},
	onCreate(container, data) {
		this.data = data;
		this.connection = null;
		this.state = "discovery";
		container.add(new ConnectingScreen);
	},
	onDisplaying(container) {
		this.doScan(container);
	},
	onPeripheralConnected(container, peripheral) {
		if (null == this.connection) {
			this.connection = peripheral.connection;
			container.replace(container.last, new ConnectedScreen);
		}
	},
	onPeripheralDisconnected(container, connection) {
		this.connection = null;
		container.replace(container.last, new ConnectingScreen);
		this.doScan(container);
	},
	onPeripheralDiscovered(container, peripheral) {
		var scanResponseData = peripheral.data;
		for (var i = 0, c = scanResponseData.length; i < c; ++i) {
			var entry = scanResponseData[i];
			if (0x09 == entry.flag && 'SATECHIPLUG' == entry.data) {	// Complete local name
				this.doConnect(container, peripheral);	
				return;
			}
		}
	},
	onSwitchStateChange(container, state) {
		var command = ("on" == state ? this.data.on_command : this.data.off_command);
		var params = {
			connection: this.connection,
			characteristic: PLUG_ATTRIBUTE_HANDLE,
			value: command
		}
		Pins.invoke("/ble/gattWriteCharacteristicValue", params);
	}
});

var MainScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin,
	behavior: Behavior({
		onBackButton(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		},
	}),
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior: BLESatechiIQPlugBehavior($)
		})
	]
}));

// ----------------------------------------------------------------------------------
// Application
// ----------------------------------------------------------------------------------

application.behavior = Behavior({
	onBLENotification(response) {
		var notification = response.notification;
		if ("gap/connect" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralConnected", peripheral);
		}
		else if ("gap/disconnect" == notification) {
			var connection = response.connection;
			application.distribute("onPeripheralDisconnected", connection);
		}
		else if ("gap/discover" == notification) {
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
				off_command: [0x0F, 0x06, 0x03, 0x00, 0x00, 0x00, 0x00, 0x04, 0xFF, 0xFF],
				on_command: [0x0F, 0x06, 0x03, 0x00, 0x01, 0x00, 0x00, 0x05, 0xFF, 0xFF],
				title: "Satechi IQ Plug",
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
