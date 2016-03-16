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

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:new Skin({ fill:'white' }),
	contents:[
		Label($, {
			left:0, right:0, string:'- - -',
			style: new Style({ font:'bold 46px Fira Sans', color:'black' }),
			Behavior: class extends Behavior {
				onDisplayed(label) {
		            Pins.configure({
						tmpSensor: {
							require: "TMP102",
							pins: {
								temperature: { sda:27, clock:29 }
							}
						}
					}, success => this.onPinsConfigured(label, success));
				}
				onPinsConfigured(label, success) {
					if (success) {
						Pins.share("ws", {zeroconf: true, name: "i2c-temperature"});

						Pins.repeat("/tmpSensor/read", 300, temperature => this.onTemperatureChanged(label, temperature));
					}
					else
						trace("failed to configure pins\n");
				}
				onTemperatureChanged(label, temperature) {
					label.string = temperature.toFixed(2) + ' ˚C';
				}
			}
		})
	]
}));

/* APPLICATION */

application.add(new MainScreen);
