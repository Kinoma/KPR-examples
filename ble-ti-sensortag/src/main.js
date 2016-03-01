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

// http://processors.wiki.ti.com/images/a/a8/BLE_SensorTag_GATT_Server.pdf
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Accelerometer_2
// http://www.byteworks.us/Byte_Works/Blog/Entries/2012/10/31_Controlling_the_TI_SensorTag_with_techBASIC.html

var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var MODEL = require("mobile/model");
var CONTROL = require("mobile/control");
var SCROLLER = require("mobile/scroller");
var CREATIONS = require("creations/creations");
var SCREEN = require("mobile/screen");
var Pins = require("pins");

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var listItemStyle = new Style({font:"24px", color:"black", horizontal:"left", vertical:"middle", lines:"1"});
var statusStyle = new Style({font:"22px", color:"blue", horizontal:"center", vertical:"bottom", lines:"1"});
var titleStyle = new Style({font:"24px", color:"black", horizontal:"center", vertical:"bottom", lines:"1"});
var valueStyle = new Style({font:"34px", color:"black", horizontal:"center", vertical:"middle"});

// ----------------------------------------------------------------------------------
// assets
// ----------------------------------------------------------------------------------
var blackSkin = new Skin({fill: "black"});
var dividerLineSkin = new Skin({fill: "#e2e2e2"});
var listArrowTexture = new Texture("./assets/list-arrow.png");
var listArrowSkin = new Skin({ texture: listArrowTexture,  x:0, y:0, width:32, height:32, states:32 });
var whiteSkin = new Skin({fill: "white"});

// ----------------------------------------------------------------------------------
// Common layouts
// ----------------------------------------------------------------------------------

var ListEmptyItem = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0,
	contents: [
		CREATIONS.BusyPicture($, {top: 50}),
		Text($, {left:10, right:10, top:170, bottom:0, style: titleStyle, string: $}),
	]
}));

var ServiceItem = Column.template($ => ({
	left: 0, right: 0, top: 0, height: 48, active: true, skin: THEME.lineSkin,
	behavior: Object.create(SCREEN.ListItemBehavior.prototype, {}),
	contents: [
		Line($, {
			left: 2, right: 0, top: 0, bottom: 0,
			contents: [
				Label($, {anchor: "NAME", left: 10, right: 0, style: listItemStyle, string: $.title}),
				Content($, {right: 0, top: 0, bottom: 0, skin: listArrowSkin}),
			]
		}),
		Content($, {left: 0, right: 0, bottom: 0, height: 1, skin: dividerLineSkin})
	]
}));

var ValueLabel = Label.template($ => ({
	left: 20, right: 20, top: 0, bottom: 0, style: valueStyle
}));

// ----------------------------------------------------------------------------------
// Common behaviors
// ----------------------------------------------------------------------------------

var ScreenBehavior = MODEL.ScreenBehavior.template({
	getSelection(data, delta) {
		data.selection += delta;
		return data.items[data.selection];
	},
	hasSelection(data, delta) {
		var selection = data.selection + delta;
		return (0 <= selection) && (selection < data.items.length)
	}
});

var BLESensorValueScreenBehavior = Behavior.template({
	onCreate(container, data) {
		this.data = data;
		this.service = this.data.service;
	},
	onDisplaying(container) {
		var service = this.data.service;
		
		// Configure and start measurements
		if ("config_handle" in this.service) {
			var buffer = new ArrayBuffer(this.service.config_data.length);
			var config_data = new Uint8Array(buffer);
			for (var i = 0, c = config_data.length; i < c; ++i) {
				config_data[i] = this.service.config_data[i]
			}
			var params = {
				connection: model.data.connection,
				characteristic: this.service.config_handle,
				value: buffer
			}
			Pins.invoke("/ble/gattWriteCharacteristicValue", params);
		}
		
		// Enable value change notifications
		if ("ccc_handle" in this.service) {
			var buffer = new ArrayBuffer(2);
			var ccc_data = new Uint8Array(buffer);
			ccc_data[0] = 0x01;	ccc_data[1] = 0x00;
			var params = {
				connection: model.data.connection,
				characteristic: this.service.ccc_handle,
				value: buffer
			}
			Pins.invoke("/ble/gattWriteCharacteristicValue", params);
		}
	},
	onCharacteristicNotified(container, result) {
		if (this.service.value_handle == result.characteristic)
			application.distribute("onValueChanged", result.value);
	},
	onUndisplayed(container) {
		// Disable value change notifications
		if ("ccc_handle" in this.service) {
			var buffer = new ArrayBuffer(2);
			var ccc_data = new Uint8Array(buffer);
			ccc_data[0] = 0x00;	ccc_data[1] = 0x00;
			var params = {
				connection: model.data.connection,
				characteristic: this.service.ccc_handle,
				value: buffer
			}
			Pins.invoke("/ble/gattWriteCharacteristicValue", params);
		}
	}
});

// ----------------------------------------------------------------------------------
// Temperature screen
// ----------------------------------------------------------------------------------

Handler.bind("/temperature", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: TemperatureScreen,
        	title: selection.title,
        	service: model.data.services[0],
        	selection: -1
		};
	}
}));

var TemperatureScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onValueChanged(container, buffer) {
					var value = readInt16LE(buffer, 2);
					var temperature = (value / 128.0) * 1.8 + 32;
					this.data.TEMPERATURE.string = "Ambient: " + temperature.toFixed(1) + " ˚F";
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "TEMPERATURE", string: "Ambient: --"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Accelerometer screen
// ----------------------------------------------------------------------------------

Handler.bind("/accelerometer", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: AccelerometerScreen,
        	title: selection.title,
        	service: model.data.services[1],
        	selection: -1
		};
	}
}));

var AccelerometerScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onValueChanged(container, buffer) {
					this.data.X.string = "X: " + (readInt8(buffer, 0) / 64).toFixed(2) + " g";
					this.data.Y.string = "Y: " + (readInt8(buffer, 1) / 64).toFixed(2) + " g";
					this.data.Z.string = "Z: " + (readInt8(buffer, 2) / 64).toFixed(2) + " g";
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "X", string:"X: --"}),
						ValueLabel($, {anchor: "Y", string:"Y: --"}),
						ValueLabel($, {anchor: "Z", string:"Z: --"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Humidity screen
// ----------------------------------------------------------------------------------

Handler.bind("/humidity", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: HumidityScreen,
        	title: selection.title,
        	service: model.data.services[2],
        	selection: -1
		};
	}
}));

var HumidityScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onValueChanged(container, buffer) {
					var rawH = readUInt16LE(buffer, 2);
					rawH &= ~0x0003; // clear bits [1..0] (status bits)
					relativeHumidity = -6.0 + 125.0/65536 * rawH;
					this.data.HUMIDITY.string = "Relative: " + relativeHumidity.toFixed(1) + " %";
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "HUMIDITY", string: "Relative: --"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Magnetometer screen
// ----------------------------------------------------------------------------------

Handler.bind("/magnetometer", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: MagnetometerScreen,
        	title: selection.title,
        	service: model.data.services[3],
        	selection: -1
		};
	}
}));

var MagnetometerScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onValueChanged(container, buffer) {
					var c = 2000 / 65536;
				    var x = readInt16LE(buffer, 0) * c;
				    var y = readInt16LE(buffer, 2) * c;
					var z = readInt16LE(buffer, 4) * c;					
					this.data.X.string = "X: " + x.toFixed(2) + " uT";
					this.data.Y.string = "Y: " + y.toFixed(2) + " uT";
					this.data.Z.string = "Z: " + z.toFixed(2) + " uT";
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "X", string: "X: --"}),
						ValueLabel($, {anchor: "Y", string: "Y: --"}),
						ValueLabel($, {anchor: "Z", string: "Z: --"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Barometer screen
// ----------------------------------------------------------------------------------

Handler.bind("/barometer", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: BarometerScreen,
        	title: selection.title,
        	service: model.data.services[4],
        	selection: -1
		};
	}
}));

var BarometerScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onDisplaying(container) {
					this.calibrationData = null;
					var service = this.data.service;
					
					// Configure to read calibration data
					if ("config_handle" in this.service) {
						var buffer = new ArrayBuffer(this.service.config_data.length);
						var config_data = new Uint8Array(buffer);
						for (var i = 0, c = config_data.length; i < c; ++i) {
							config_data[i] = this.service.config_data[i]
						}
						var params = {
							connection: model.data.connection,
							characteristic: this.service.config_handle,
							value: buffer
						}
						Pins.invoke("/ble/gattWriteCharacteristicValue", params);
					}
					
					// Read the calibration data
					var params = {
						connection: model.data.connection,
						characteristic: this.service.calibration_handle,
					}
					Pins.invoke("/ble/gattReadCharacteristicValue", params);
				},
				onCharacteristicNotified(container, result) {
					var buffer = result.value;
					var t_r = readInt16LE(buffer, 0);
				    var p_r = readUInt16LE(buffer, 2);
				    var c = this.calibrationData;
				
				    var t_a = (100 * (c[0] * t_r / Math.pow(2,8) + c[1] * Math.pow(2,6))) / Math.pow(2,16);
				    var S = c[2] + c[3] * t_r / Math.pow(2,17) + ((c[4] * t_r / Math.pow(2,15)) * t_r) / Math.pow(2,19);
				    var O = c[5] * Math.pow(2,14) + c[6] * t_r / Math.pow(2,3) + ((c[7] * t_r / Math.pow(2,15)) * t_r) / Math.pow(2,4);
				    var p_a = (S * p_r + O) / Math.pow(2,14);
				    this.data.PRESSURE.string = "Pressure: " + (p_a / 100).toFixed(1) + " hPa";
				},
				onCharacteristicValue(container, result) {
					var buffer = result.value;
					if (this.service.calibration_handle == result.characteristic) {
						var calibrationData = this.calibrationData = new Array(8);
						calibrationData[0] = readUInt16LE(buffer, 0);
						calibrationData[1] = readUInt16LE(buffer, 2);
						calibrationData[2] = readUInt16LE(buffer, 4);
						calibrationData[3] = readUInt16LE(buffer, 6);
						calibrationData[4] = readInt16LE(buffer, 8);
						calibrationData[5] = readInt16LE(buffer, 10);
						calibrationData[6] = readInt16LE(buffer, 12);
						calibrationData[7] = readInt16LE(buffer, 14);
						
						// Configure to read barometric pressure data
						var buffer = new ArrayBuffer(1);
						var config_data = new Uint8Array(buffer);
						config_data[0] = 0x01;
						var params = {
							connection: model.data.connection,
							characteristic: this.service.config_handle,
							value: buffer
						}
						Pins.invoke("/ble/gattWriteCharacteristicValue", params);
						
						// Enable notifications
						var buffer = new ArrayBuffer(2);
						var ccc_data = new Uint8Array(buffer);
						ccc_data[0] = 0x01;	ccc_data[1] = 0x00;
						var params = {
							connection: model.data.connection,
							characteristic: this.service.ccc_handle,
							value: buffer
						}
						Pins.invoke("/ble/gattWriteCharacteristicValue", params);
					}
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "PRESSURE", string: "Pressure: --"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Gyroscope screen
// ----------------------------------------------------------------------------------

Handler.bind("/gyroscope", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: GyroscopeScreen,
        	title: selection.title,
        	service: model.data.services[5],
        	selection: -1
		};
	}
}));

var GyroscopeScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onValueChanged(container, buffer) {
					var c = 500 / 65536;
				    var x = readInt16LE(buffer, 0) * c;
				    var y = readInt16LE(buffer, 2) * c;
				    var z = readInt16LE(buffer, 4) * c;					
					this.data.X.string = "X: " + x.toFixed(2) + " ˚/s";
					this.data.Y.string = "Y: " + y.toFixed(2) + " ˚/s";
					this.data.Z.string = "Z: " + z.toFixed(2) + " ˚/s";
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "X", string: "X: --"}),
						ValueLabel($, {anchor: "Y", string: "Y: --"}),
						ValueLabel($, {anchor: "Z", string: "Z: --"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Simple keys screen
// ----------------------------------------------------------------------------------

Handler.bind("/keys", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: KeysScreen,
        	title: selection.title,
        	service: model.data.services[6],
        	selection: -1
		};
	}
}));

var KeysScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLESensorValueScreenBehavior({
				onValueChanged(container, buffer) {
					var byte = buffer[0];
					this.data.RIGHT.string = "Right: " + (byte & 1 ? "pressed" : "off");
					this.data.LEFT.string = "Left: " + (byte & 2 ? "pressed" : "off");
				},
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						ValueLabel($, {anchor: "LEFT", string: "Left: off"}),
						ValueLabel($, {anchor: "RIGHT", string: "Right: off"}),
					]
				})
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Services screen
// ----------------------------------------------------------------------------------

Handler.bind("/main", ScreenBehavior ({
	onDescribe(query, selection) {
		return {
			Screen: ServicesScreen,
        	title: "TI SensorTag",
        	status: "Connecting...",
        	items: [],
        	selection: -1
		};
	}
}));

var BLEServicesListBehavior = SCREEN.ListBehavior({
	addBusyLine(list) {
		list.add(new ListEmptyItem("Scanning..."));
	},
	addItemLine(list, item, index) {
		list.add(new ServiceItem(item));
	},
	addLines(list, items, more) {
		for (var i = 0, c = items.length; i < c; ++i) {
			this.addItemLine(list, items[i], i);
		}
		if (0 == list.length)
			this.addBusyLine(list);
	},
	onCreate(list, data) {
		this.data = data;
		this.list = list;
		this.reload(list);
	},
	onPeripheralConnected(list, peripheral) {
		model.data.connection = peripheral.connection;
		this.reload();
	},
	onPeripheralDisconnected(list, peripheral) {
		model.data.connection = null;
		this.reload();
		return true;
	},
	onPeripheralDiscovered(list, peripheral) {
		var scanResponseData = peripheral.data;
		for (var i = 0, c = scanResponseData.length; i < c; ++i) {
			var entry = scanResponseData[i];
			if (0x09 == entry.flag && 'SensorTag' == entry.data) {	// Complete local name
				Pins.invoke("/ble/gapConnect", { address:peripheral.address, addressType:peripheral.addressType });		
				return;
			}
		}
	},
	reload() {
		var list = this.list;
		list.cancel();
		list.empty();
		if (null === model.data.connection) {
			this.data.items = [];
			this.startScanning(list);
		}
		else
			this.data.items = model.data.services;
		this.addLines(list, this.data.items, false);
	},
	startScanning(container) {
		Pins.invoke("/ble/gapStartScanning");
	},
});

var ServicesScreen = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			contents: [
				SCROLLER.VerticalScroller($, {
					clip: true,
					contents: [
						Column($, {
							left:0, right:0, top:0,
							behavior: BLEServicesListBehavior
						}),
						SCROLLER.VerticalScrollbar($),
						SCROLLER.BottomScrollerShadow($)
					]
				}),
			],
		})
	]
}));

// ----------------------------------------------------------------------------------
// Application
// ----------------------------------------------------------------------------------

var readInt8 = function(buffer, offset) {
	if (!(buffer[offset] & 0x80))
		return buffer[offset];
	return ((0xff - buffer[offset] + 1) * -1);
};

var readInt16LE = function(buffer, offset) {
	var value = buffer[offset] | (buffer[offset + 1] << 8);
	return (value & 0x8000) ? value | 0xFFFF0000 : value;
};

var readUInt8 = function(buffer, offset) {
	return buffer[offset];
}

var readUInt16LE = function(buffer, offset) {
	return buffer[offset] | (buffer[offset + 1] << 8);
};

class ApplicationBehavior extends MODEL.ApplicationBehavior {
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
			application.distribute("onCharacteristicNotified", response);
		}
		else if ("gatt/characteristic/value" == notification) {
			application.distribute("onCharacteristicValue", response);
		}
	}
	onLaunch(application) {
 		Pins.configure({
            ble: {
                require: "/lowpan/ble"
            }
		}, success => this.onPinsConfigured(application, success));
	}
	onPinsConfigured(application, success) {		
		if (success) {
			this.data = {
	        	connection: null,
	        	services: [
	        		{
	        			uuid: "F000AA00-0451-4000-B000-000000000000",
	        			title: "Temperature",
	        			action: "/temperature",
	        			value_handle: 0x25,
	        			ccc_handle: 0x26,
	        			config_handle: 0x29,
	        			period_handle: 0x2D,
	        			config_data: [0x01],
	        		},
	        		{
	        			uuid: "F000AA10-0451-4000-B000-000000000000",
	        			title: "Accelerometer",
	        			action: "/accelerometer",
	        			value_handle: 0x30,
	        			ccc_handle: 0x31,
	        			config_handle: 0x34,
	        			period_handle: 0x38,
	        			config_data: [0x01],
	        		},
	         		{
	        			uuid: "F000AA20-0451-4000-B000-000000000000",
	        			title: "Humidity",
	        			action: "/humidity",
	        			value_handle: 0x3B,
	        			ccc_handle: 0x3C,
	        			config_handle: 0x3F,
	        			period_handle: 0x42,
	         			config_data: [0x01],
	        		},
	          		{
	        			uuid: "F000AA30-0451-4000-B000-000000000000",
	        			title: "Magnetometer",
	        			action: "/magnetometer",
	        			value_handle: 0x46,
	        			ccc_handle: 0x47,
	        			config_handle: 0x4A,
	        			period_handle: 0x4D,
	        			config_data: [0x01],
	        		},
	          		{
	        			uuid: "F000AA40-0451-4000-B000-000000000000",
	        			title: "Barometer",
	        			action: "/barometer",
	        			value_handle: 0x51,
	        			ccc_handle: 0x52,
	        			config_handle: 0x55,
	        			period_handle: 0x58,
	        			calibration_handle: 0x5B,
	        			config_data: [0x02],
	        		},
	          		{
	        			uuid: "F000AA50-0451-4000-B000-000000000000",
	        			title: "Gyroscope",
	        			action: "/gyroscope",
	        			value_handle: 0x60,
	        			ccc_handle: 0x61,
	        			config_handle: 0x64,
	        			period_handle: 0x67,
	        			config_data: [0x07],	// Enable X, Y and Z
	        		},
	          		{
	        			uuid: "F000AA60-0451-4000-B000-000000000000",
	        			title: "Simple keys",
	        			action: "/keys",
	        			value_handle: 0x6B,
	        			ccc_handle: 0x6C,
	        		}
	        	]
	        };
		
			Pins.when("ble", "notification", this.onBLENotification);

			// Load the screen configured by /main
			MODEL.ApplicationBehavior.prototype.onLaunch.call(this);
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	}
	onPeripheralDisconnected(application, connection) {
		model.data.connection = null;
		application.invoke(new Message("/home"));
	}
};

var model = application.behavior = new ApplicationBehavior(application);
