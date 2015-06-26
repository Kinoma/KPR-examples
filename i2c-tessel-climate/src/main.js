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

Handler.bind("/climateData", {
	onInvoke: function(handler, message) {
        var data = model.data;
        data.climate = message.requestObject;
        data.labels.temperature.string = "Temperature: " + data.climate.temperature.toPrecision(3) + "°";
        data.labels.humidity.string = "Humidity: " + (data.climate.humidity * 100).toPrecision(3) + "%";
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            application.skin = new Skin({ fill: "#f78e0f" });
            var style = new Style({ font:"bold 36px", color:"white", horizontal:"center", vertical:"middle" });
            application.add(new Label({ left:0, right:0, top:0, bottom:0, style: style, string:"Error " + message.error }));
            return;
        }

		Pins.share("http");
		
        application.invoke(new MessageWithObject("pins:/tesselClimate/read?repeat=on&callback=/climateData&interval=30"));

        application.skin = new Skin({ fill: "#76b321" });
        var style = new Style({ font:"bold 36px", color:"white", horizontal:"left", vertical:"middle" });
        application.add(model.data.labels.temperature = new Label({left: 20, top: 80, style: style}));
        application.add(model.data.labels.humidity = new Label({left: 20, top: 120, style: style}));
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            tesselClimate: {
                require: "tesselClimate",
                pins: {
                    climate: {sda: 27, clock: 29, units: "farenheight", heater: false}
                }
            }}), Message.JSON);

		this.data = { labels: {} };
	}},
});
