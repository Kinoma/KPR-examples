//@program
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

var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var CREATIONS = require("creations/creations");
var Pins = require("pins");

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var applicationStyle = new Style({font: "16px Fira Sans"});
var labelStyle = new Style({font:"bold 42px", color:"white", horizontal:"center", vertical:"bottom", lines:"1"});
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
	left: 0, right: 0, top: 0, bottom: 0,
	behavior: Behavior({
		doSwitch(container) {
			let column = container.first;
			if ("off" == this.state) {
				column.first.url = mergeURI(application.url, "./assets/light-off.png");
				column.last.string = "Clap to turn on!";
			}
			else {
				column.first.url = mergeURI(application.url, "./assets/light-on.png");
				column.last.string = "Clap to turn off!";
			}
			container.bubble("onSwitchStateChange", this.state);
			container.time = 0;
			container.start();
		},
		onDisplaying(container) {
			container.duration = 500;
			this.container = container;
			this.state = "off";
			this.doSwitch(container);
			this.microphone = Pins.repeat("/microphone/read", "audio", result => this.onMicrophoneRead(result));
		},
		onMicrophoneRead(result) {
			if (null != this.microphone) {
				//trace("average: " + result.average + "peak: " + result.peak + "\n");
				if ((result.average > 2000) && (result.peak == 32768) && !this.container.running) {
					this.state = ("off" == this.state ? "on" : "off");
					this.doSwitch(this.container);
				}
			}
		},
		onPeripheralDisconnected(container) {
			this.microphone.close();
			this.microphone = null;
		}
	}),
	contents: [
		Column($, {
			top:0, bottom:0, left:0, right:0,
			contents: [
				Picture($, { top:0, bottom:0 }),
				Label($, { left:0, right:0, bottom:5, style:labelStyle })
			]
		})
	]
}));

var BLESatechiIQPlugBehavior = Behavior.template({	
	doConnect(container, peripheral) {
		if ("discovery" != this.state) return;
		this.doStateChange(container, "connecting");
		Pins.invoke("/ble/gapConnect", { address:peripheral.address, addressType:peripheral.addressType });
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
		let scanResponseData = peripheral.data;
		for (let i = 0, c = scanResponseData.length; i < c; ++i) {
			let entry = scanResponseData[i];
			if (0x09 == entry.flag && 'SATECHIPLUG' == entry.data) {	// Complete local name
				this.doConnect(container, peripheral);	
				return;
			}
		}
	},
	onSwitchStateChange(container, state) {
		let command = ("on" == state ? this.data.on_command : this.data.off_command);
		let params = {
			connection: this.connection,
			characteristic: 0x2B,	// IQ Plug on/off characteristic handle
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
			behavior: BLESatechiIQPlugBehavior($),
			contents:[
				ConnectingScreen($)
			]
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
            },
			microphone: {
				require: "audioin",
				pins: {
                    audio: {sampleRate: 8000, channels: 1}
				}
			},
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			this.data = {
				off_command: [0x0F, 0x06, 0x03, 0x00, 0x00, 0x00, 0x00, 0x04, 0xFF, 0xFF],
				on_command: [0x0F, 0x06, 0x03, 0x00, 0x01, 0x00, 0x00, 0x05, 0xFF, 0xFF],
				title: "BLE Clapper",
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
