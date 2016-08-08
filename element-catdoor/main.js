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
		    catdoor: {
		        require: "catdoor",
		        pins: {
				    outPower: { pin: 9, type: 'Power' },
				    switchOut: { pin: 10, type: 'Digital', direction: 'input' },
				    outGround: { pin: 11, type: 'Ground' },
				    inPower: { pin: 12, type: 'Power' },
				    switchIn: { pin: 13, type: 'Digital', direction: 'input' },
				    inGround: { pin: 14, type: 'Ground' },
				    light: { pin: 15, type: 'Digital', direction: 'output' },
				    lightGround: { pin: 16, type: 'Ground' }
		        }
		    },
		}, function(success) {
			if (success) {
				Pins.share("ws", {zeroconf: true, name: "element-catdoor"});
				Pins.repeat('/catdoor/updateStatus', 100);
			} else {
				trace('Failed to configure.\n');
			} 
		});
	}
}

export default main;