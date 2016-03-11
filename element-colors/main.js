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

import Pins from "pins";var main = {	onLaunch(){		Pins.configure({			colorSensor: {				require: "TCS34725",				pins: {					rgb:{sda: 13, clock: 14},					ground: {pin: 1, type: "Ground"},					power: {pin: 2, type: "Power"},				}			},			led: {
				require: 'led',
				pins: {
		            red: { pin: 9 },		            anode: { pin: 10 },		            green: { pin: 11 },		            blue: { pin: 12 }, 
				}			}		}, function(success) {
			if (success) {
				trace("Configured pins.\n");
				/* Get color values and change color of LED */				Pins.repeat('/colorSensor/getColor', 100, colors => { Pins.invoke("/led/write", colors) });	
			} else {
				trace("Failed to configure pins.\n");
			}		});	},};export default main;