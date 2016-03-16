/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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
let Pins = require("pins");

/* APPLICATION */

application.behavior = Behavior({
	gotColor(application, result) {
		// Convert the reading into hex color value and reset the skin to be that color 
		let r = result.r.toString(16), g = result.g.toString(16), b = result.b.toString(16);
		if ( r.length < 2 ) r = "0" + r;
		if ( g.length < 2 ) g = "0" + g;
		if ( b.length < 2 ) b = "0" + b;
		let color = "#" + r + g + b;
		application.skin = new Skin(color);
	},
	onLaunch(application) {
		Pins.configure({
			colorSensor: {
				require: "TCS34725",
				pins: {
					rgb: { sda: 27, clock: 29, integrationTime: 23 },
					led: { pin: 21 }
				}
			}
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {
		if (success) {
			Pins.repeat("/colorSensor/getColor", 33, result => this.gotColor(application, result));

			Pins.share("ws", {zeroconf: true, name: "i2c-color-sensor"});
		}
		else
			trace("failed to configure pins\n");
	}
});

