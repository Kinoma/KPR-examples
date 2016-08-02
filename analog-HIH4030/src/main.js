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
THEME = require ("themes/sample/theme");
var TOOL = require("mobile/tool");
var Pins = require("pins");

/* ASSETS */
var menuButtonStyle = new Style({ font:"18px", color:"white", horizontal:"left", vertical:"middle" });
var readingStyle = new Style({ font:"bold 26px", color:"white", horizontal:"left", vertical:"middle" });

/* HANDLERS */
Handler.bind("/changeUnits", {
	onInvoke: function(handler, message) {
        var query = parseQuery(message.query);
        application.distribute("onUnitsChanged", query.units);
	}
});

/* LAYOUTS */
var MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({ fill: "gray" }),
	behavior: Behavior({
		onCreate(container, data) {
			this.data = data;
			container.wait(10);
		},
		onReceivedHumidity(container, value) {
			this.data.humidity = value;
			this.updateTemperatureDisplay(container);
			container.first.next.string = "Relative Humidity: " + this.data.humidity.toFixed(1) + '%';
		},
		onReceivedTemperature(container, value) {
			this.data.temperature = value;
			this.updateTemperatureDisplay(container);
		},
		onUnitsChanged(container, units) {
			this.data.units = units;
			this.updateTemperatureDisplay(container);
		},
		updateTemperatureDisplay(container) {
			var temperature = this.data.temperature;
			if ("fahrenheit" == this.data.units) {
				temperature = 1.8 * temperature + 32;
				container.first.string = "Temperature: " + temperature.toFixed(2) + '°F';
			}
			else {
				container.first.string = "Temperature: " + temperature.toFixed(2) + '°C';
			}
		},
	}),
	contents: [
		Label($, { left:10, right:10, top:60, style:readingStyle }),
		Label($, { left:10, right:10, bottom:60, style:readingStyle }),
		TOOL.MenuButton($.menu, { right:10, top:0, style: menuButtonStyle })
	]
}));

// model
application.behavior = Behavior({
	onLaunch(application) {
		Pins.configure({
			HIH4030: {
				require: "HIH4030",
				pins: {
					power: { pin: 64, type: "Power", voltage: 5 },
					humidity: { pin: 65 },
					ground: { pin: 66, type: "Ground" }
				}
			},
			TMP102: {
				require: "TMP102",
				pins: {
					temperature: { sda: 27, clock: 29 }
				}
			}
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			var data = {
				temperature: -1,
				humidity: -1,
				units: "celsius",
				menu: {
					action: "/changeUnits?units=",
					items: [
						{ title: "Celsius", value: "celsius" },
						{ title: "Fahrenheit", value: "fahrenheit" }
					],
					selection: 0,
				}
			};
			application.add(new MainScreen(data));

			Pins.repeat("/HIH4030/read", 200, function(result) {
				application.distribute("onReceivedHumidity", result);
			});
			Pins.repeat("/TMP102/read", 200, function(result) {
				application.distribute("onReceivedTemperature", result);
			});

			Pins.share("ws", {zeroconf: true, name: "analog-HIH4030"});
		}
		else {
			trace("Failed to configure Pins\n");
		}
	},
	onQuit(application) {
		Pins.close();
	},
});
