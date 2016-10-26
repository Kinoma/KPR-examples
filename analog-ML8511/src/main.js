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

application.behavior = Behavior({
    onLaunch(application) {
        this.data = { labels: {} };
		Pins.configure({
            ML8511: {
                require: "ML8511",
                pins: {
                  power: {pin: 51, type:"Power", voltage:3.3},
        					uv: {pin: 52},
                  ground: {pin: 53, type:"Ground"},
        					vref: {pin: 54}
                }
            }
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			Pins.repeat("/ML8511/read", 100, value => this.onUVDataChanged(value));
			
			application.skin = new Skin({ fill: "#76b321" });
			var style = new Style({ font:"bold 34px", color:"white", horizontal:"left", vertical:"middle" });
			application.add(this.data.labels.uv = new Label({left: 30, right: 0, top: 0, bottom: 120, style: style}));
			application.add(this.data.labels.uvi = new Label({left: 30, right: 0, top: 120, bottom: 0, style: style}));

			Pins.share("ws", {zeroconf: true, name: "analog-ML8511"});
		}
		else {
            application.skin = new Skin({ fill: "#f78e0f" });
            var style = new Style({ font:"bold 36px", color:"white", horizontal:"center", vertical:"middle" });
            application.add(new Label({ left:0, right:0, top:0, bottom:0, style: style, string:"Error could not configure pins" }));
		}
	},
	onUVDataChanged(value) {		
        var data = this.data;
        data.uvData = value;
        data.labels.uv.string = "UV Intensity: " + data.uvData.intensity.toPrecision(2);
        data.labels.uvi.string = "UV Index: " + data.uvData.index;
	},
});
