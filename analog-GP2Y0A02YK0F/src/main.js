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
/*
  Beep sound from Sound-e-Scape Studios:
  http://www.soundescapestudios.com/Sound-e-Scape-Studios-policy.html
*/
let Pins = require("pins");

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:new Skin({ fill:'gray' }),
	contents:[
		Label($, {
			left:0, right:0, string:'- - -',
			style: new Style({ font:'bold 30px', color:'white' }),
			Behavior: class extends Behavior {
				onCreate(label, data) {
					this.sound = data.sound;
					label.interval = data.interval;
				}
				onDisplayed(label) {
					Pins.configure({
			            GP2Y0A02YK0F: {
			                require: "GP2Y0A02YK0F",
			                pins: {
			                	power: { pin: 59, type: "Power", voltage: 5 },
			                	ground: { pin: 60, type: "Ground" },
			                    proximity: { pin: 61 }
			                }
			            }
					}, success => this.onPinsConfigured(label, success));
				}
				onPinsConfigured(label, success) {		
					if (success) {
						label.start();
						
						Pins.repeat("/GP2Y0A02YK0F/read", 100, value => this.onProximityChanged(label, value));
						
						Pins.share("ws", {zeroconf: true, name: "analog-GP2Y0A02YK0F"});
					}
					else {
						trace("failed to configure pins\n");
					}
				}
				onProximityChanged(label, value) {
					label.string = "Proximity: " + value.toFixed(2) + " cm";
			        label.interval = value / 15 * 150;
				}
				onTimeChanged(label) {
					this.sound.play();
				}
			}
		})
	]
}));

/* APPLICATION */

let data = {
	sound: new Sound( mergeURI( application.url, "assets/Beeps-very-short-01.wav" ) ),
	interval: 1000
};
application.add(new MainScreen(data));
