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
// Helpful BLE docs
// https://www.bluetooth.org/en-us/specification/adopted-specifications

// ----------------------------------------------------------------------------------
// Themes/ Global Vars
// ----------------------------------------------------------------------------------
var Pins = require("pins");
var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var CREATIONS = require("creations/creations");

var CONTROL = require('mobile/control');
var MODEL = require('mobile/model');
var SCREEN = require('mobile/screen');
var SCROLLER = require('mobile/scroller');
var TOOL = require('mobile/tool');

var COLORIFIC_HANDLE = 40;

include("common");

// ----------------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------------
var applicationStyle = new Style({font: "16px Fira Sans"});
var statusStyle = new Style({font:"bold 22px", color:"white", horizontal:"center", vertical:"bottom", lines:"1"});

// ----------------------------------------------------------------------------------
// Skins
// ----------------------------------------------------------------------------------
var blackSkin = new Skin({fill: "black"});
var wheelSkin = new Skin({texture: new Texture('./assets/wheel.png', 2), width: 240, height: 240, variants: 240, aspect: "fit"});
var whiteSkin = new Skin({fill: "white"});

// ----------------------------------------------------------------------------------
// BLE Behavior Functions
// ----------------------------------------------------------------------------------
var BLERGBLightOneServiceBehavior = Behavior.template({	
	connect(container, peripheral) {
		if ("discovery" != this.state) return;
		this.changeState(container, "connect");
		var params = {
			address: peripheral.address,
			addressType: peripheral.addressType,
			intervals: {min: 8, max: 12},			// Fast connection interval for higher responsiveness
		}
		Pins.invoke("/ble/gapConnect", params);
	},
	onCreate(container, data) {
		this.data = data;
		this.buffer = new ArrayBuffer(9);
		this.payload = new Uint8Array(this.buffer);
		this.initialize(container);	
	},
	onLightChanged(container){
		if (null == this.connection) return;
		
		var rgb = hsvToColor(this.data.hue, this.data.saturation, 0.5 + this.data.brightness * 0.5);
		var rgbVals = rgb.slice(4,(rgb.length-1)).split(",");

		var payload = this.payload;
		payload[6] = rgbVals[0]; //R
		payload[7] = rgbVals[1]; //G
		payload[8] = rgbVals[2]; //B
		
		var params = {
			connection: this.connection,
			characteristic: COLORIFIC_HANDLE,
			value: this.buffer
		};
		Pins.invoke("/ble/gattWriteWithoutResponse", params);
	},
	onDisplaying(container) {
		this.startScanning(container);
	},
	onPeripheralConnected(container, peripheral) {
		if (null == this.connection) {
			this.connection = peripheral.connection;
			this.changeState(container, "");

			this.data.BUSY.visible = false;
			this.data.CONTROLS.visible = true;
			container.distribute("onLightChanged");
		}
	},
	onPeripheralDisconnected(container, peripheral) {
		this.initialize(container);
		application.distribute("onDisconnected");
		this.startScanning(container);
	},
	onPeripheralDiscovered(container, peripheral) {
		if ("discovery" != this.state) return;
		var scanResponseData = peripheral.data;
		for (var i = 0, c = scanResponseData.length; i < c; ++i) {
			var entry = scanResponseData[i];
			if (0x09 == entry.flag && 'RGBLightOne' == entry.data) {	// Complete local name
				this.connect(container, peripheral);	
				return;
			}
		}
	},
	changeState(container, state) {
		this.state = state;
		application.distribute("onStateChange", state);
	},
	initialize(container) {
		var payload = this.payload;
		payload[0] = 0x58;
		payload[1] = 0x01;
		payload[2] = 0x03;
		payload[3] = 0x01;
		payload[4] = 0x10; // White brightness
		payload[5] = 0x00; // Separator byte
		this.connection = null;
		this.changeState(container, "idle");
	},
	startScanning(container) {
		Pins.invoke("/ble/gapStartScanning");
		this.changeState(container, "discovery");
	},
});

// ----------------------------------------------------------------------------------
// Main screen / UI elements
// ----------------------------------------------------------------------------------

// Main UI container
var MainScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin, active: true,
	behavior: Behavior({
		onBackButton(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		},
		onCreate(container, data) {
			this.data = data;
		},
		onDisplaying(container) {
			this.data.BUSY.visible = true;
			this.data.CONTROLS.visible = false;
		}
	}),
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLERGBLightOneServiceBehavior({
				onDisconnected(container) {
					this.data.BUSY.visible = true;
					this.data.CONTROLS.visible = false;
					this.data.STATUS.string = "";
				},
				onStateChange(container, state) {
					this.data.STATUS.string = state;
				}
			}),
			contents: [
				CREATIONS.BusyPicture($, {anchor: "BUSY", url: "./assets/spinner.png", top: 40}),
				Container($, { anchor: "CONTROLS", left: 0, right: 0, top: 0, bottom: 0,
					contents: [ 
						HueSlider($, {}),
					]
				}),
				Label($, {anchor: "STATUS", left: 20, right: 20, bottom: 5, style: statusStyle}),
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
		else if ("gap/connect" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralConnected", peripheral);
		}
		else if ("gap/disconnect" == notification) {
			var connection = response.connection;
			application.distribute("onPeripheralDisconnected", connection);
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
	        	title: "RGBLightOne",
	        	titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle,
	        	colorable: true,
	        	hue: 1,
	        	brightness: .1,
	        	saturation: 1
			};
			Pins.when("ble", "notification", this.onBLENotification);
			application.add(new MainScreen(this.data));
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	},
});