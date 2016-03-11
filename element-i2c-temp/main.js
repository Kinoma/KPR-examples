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
					ground: { pin: 12, type: "Ground" },
					power: { pin: 11, type: "Power" },
					add0: { pin: 16, type: "Ground" }
				} 
			},
		}, success => {
			if (success) {
				/* Read sensor and print temperature every 1000ms  */
				Pins.repeat("/tmpSensor/read", 1000, result => {
					trace("Temperature is: "+JSON.stringify(result)+"F\n");
				});			
			} else {
				trace("Failed to configure\n");
			}
		});
	}
};

export default main;

