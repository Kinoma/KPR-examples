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
			led: {
		        require: "led",
		        pins: {
				    red: { pin: 9 },
				    power: {pin: 10, type: "Power"},
				    green: { pin: 11 },
				    blue: { pin: 12 },
		        }
			},
			analogSensor: {
				require: "Analog", // Uses the built-in analog BLL
				pins: {
					power: { pin: 1, type: "Power" },
					analog: { pin: 2 },
					ground: { pin: 3, type: "Ground" },
				}
			}    		
		}, success => {			
			if (success) {
				Pins.repeat("/analogSensor/read", 150, result => {
					Pins.invoke("/led/write", result);
				});
			} else {
				trace("Failed to configure pins.\n");
			}
		});
    },
};

export default main;


