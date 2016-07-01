/*  Copyright 2011-2016 Marvell Semiconductor, Inc.  Licensed under the Apache License, Version 2.0 (the "License");  you may not use this file except in compliance with the License.  You may obtain a copy of the License at      http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and  limitations under the License.*/
import HID from 'HID';
import Pins from 'pins';
let gamepad = new HID.Gamepad();
let keyboard = new HID.Keyboard();

application.behavior = Behavior({
	onLaunch: function(application) {
		// Configure the BLL used by this application
	    Pins.configure({
			wiiremote: {
				require: "nunchuck",
        		pins: {
         			nunchuck: {  sda: 27, clock: 29 }
        		}
      		}
    	}, success => {
    		Pins.repeat('/wiiremote/read', 33, result => {
		        gamepad.sendPosition({x: (result.x - 127 ) * 320, y: (result.y - 125) * 320});
		        gamepad.pressButtons([result.c,result.z]);
		        if(result.z === 0) keyboard.sendKey('x');
		        if(result.c === 0) keyboard.sendKey('a');
      		});
		});
  	}
});
