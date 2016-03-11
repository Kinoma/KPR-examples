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
		            led: { pin: 9, type: "Digital" },
		            ground: {pin: 10, type: "Ground"},
		        }
			}    		
		}, success => {			
			if (success) {
				Pins.repeat("/led/toggle", 1000);
			} else {
				trace("Failed to configure light\n");
			}
		});
    },
};

export default main;


