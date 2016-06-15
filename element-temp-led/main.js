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
import Pins from "pins";

var main = {
	onLaunch(){
		Pins.configure({
			tmpSensor: {
				require: "TMP102",
				pins: {
					temperature: { sda: 13, clock: 14 },
					ground: { pin: 16, type: "Ground" },
					power: { pin: 15, type: "Power" },
				} 
			},
			led: {
				require: "led",
				pins: {
				    red: { pin: 9 },
				    power: { pin: 10, type: "Power" },
				    blue: { pin: 12 },
				}
			}
		}, success => {
			if (success) {
				let cold = 72;
				let hot = 84;
				let range = hot - cold;
				Pins.repeat("/tmpSensor/read", 150, temp => {
					var scaledTemp;
					if (temp <= cold) {
						scaledTemp = 0;
					} else if (temp >= hot) {
						scaledTemp = 1;
					} else {
						scaledTemp = (temp - cold)/range;
					}
					Pins.invoke("/led/write", {red: scaledTemp, blue: 1-scaledTemp});
				});			
			} else {
				trace("Failed to configure pins.\n");
			}
		});
	}
};

export default main;

