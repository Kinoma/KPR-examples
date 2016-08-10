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
			button: {
				require: "button", // Uses custom BLL button.js
				pins: {
					button: { pin: 1 },
					buttonGround: { pin: 2, type: "Ground" },
					buttonPower: { pin: 3, type: "Power" },
				}
			},
			led: { pin: 10, type: "Digital", direction: "output" }, // Uses built-in digital BLL
			ledGround: { pin: 9, type: "Ground" }
		}, success => {
			if (success) {
				Pins.invoke("/led/write", 1); // Turn light on once configured
				var ledVal = 1;
				Pins.repeat("/button/wasPressed", 100, result => {
				    if (result) {
				    	ledVal = !ledVal;
				    	Pins.invoke("/led/write", ledVal);
				    }
				}); 
			} else {
				trace("Failed to configure pins.\n");
			}
		});
	}
};

export default main;