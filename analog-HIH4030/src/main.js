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
var THEME = require ("themes/sample/theme");
var TOOL = require("mobile/tool");

// assets
var menuButtonStyle = new Style({ font:"18px", color:"white", horizontal:"left", vertical:"middle" });
var readingStyle = new Style({ font:"bold 26px", color:"white", horizontal:"left", vertical:"middle" });

// handlers
Handler.bind("/changeUnits", {
	onInvoke: function(handler, message) {
        var query = parseQuery(message.query);
        application.distribute("onUnitsChanged", query.units);
	}
});

// layouts
var MainScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({ fill: "gray" }),
	behavior: Object.create(Behavior.prototype, {
		onComplete: { value: function(container, message, result) {
			var path = message.path;
			if (0 == path.indexOf("/TMP102")) {
				this.data.temperature = result;
        		container.invoke(new MessageWithObject("pins:/HIH4030/read", this.data.temperature), Message.TEXT);
			}
			else if (0 == path.indexOf("/HIH4030")) {
				this.data.humidity = result;
				this.updateTemperatureDisplay(container);
				container.first.next.string = "Relative Humidity: " + this.data.humidity.toFixed(1) + '%';
				container.wait(1000);
			}
			else {
				// The "wait" time has completed so read the temperature and then the humidity
        		container.invoke(new MessageWithObject("pins:/TMP102/read"), Message.TEXT);
			}
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
			container.wait(10);
		}},
		onUnitsChanged: { value: function(container, units) {
			this.data.units = units;
			this.updateTemperatureDisplay(container);
		}},
		updateTemperatureDisplay: { value: function(container) {
			var temperature = this.data.temperature;
			if ("fahrenheit" == this.data.units) {
				temperature = 1.8 * temperature + 32;
				container.first.string = "Temperature: " + temperature.toFixed(2) + '°F';
			}
			else {
				container.first.string = "Temperature: " + temperature.toFixed(2) + '°C';
			}
		}},
	}),
	contents: [
		Label($, { left:10, right:10, top:60, style:readingStyle }),
		Label($, { left:10, right:10, bottom:60, style:readingStyle }),
		TOOL.MenuButton($.menu, { right:10, top:0, style: menuButtonStyle })
	]
}});

// model
var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            application.skin = new Skin({ fill: "#f78e0f" });
            var style = new Style({ font:"bold 36px", color:"white", horizontal:"center", vertical:"middle" });
            application.add(new Label({ left:0, right:0, top:0, bottom:0, style: style, string:"Error " + message.error }));
            return;
        }
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
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            HIH4030: {
                require: "HIH4030",
                pins: {
                    humidity: { pin: 65 }
                }
			},
            TMP102: {
                require: "TMP102",
                pins: {
                    temperature: { sda: 27, clock: 29 }
                }
            }
		}), Message.JSON);
    }},
});
