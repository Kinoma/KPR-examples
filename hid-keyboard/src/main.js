/*  Copyright 2011-2016 Marvell Semiconductor, Inc.    Licensed under the Apache License, Version 2.0 (the "License");  you may not use this file except in compliance with the License.  You may obtain a copy of the License at        http://www.apache.org/licenses/LICENSE-2.0        Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and  limitations under the License.*/
import HID from "HID";
let SYS_KEYBOARD = require("keyboard");
let HID_KEYBOARD = new HID.Keyboard();

application.behavior = Behavior({
	onDisplayed: function(application) {
		application.skin = new Skin({ fill:"white" });
		SYS_KEYBOARD.show();
	},
	onKeyDown: function(application, key, repeat, ticks) {		if (key) {
			var code = key.charCodeAt(0);			var edited = false;			switch (code) {			case 1: /* home */				return false;			case 2: /* delete selection */				return false;			case 3: /* enter */				return false;			case 4: /* end */				return false;			case 5: /* help */				return false;			case 8: /* backspace */
				HID_KEYBOARD.sendSpecial(0x2A, 1);				break;			case 9: /* tab */				return false;			case 11: /* page up */				return false;			case 12: /* page down */				return false;			case 13: /* return */
				HID_KEYBOARD.sendSpecial(0x28, 1)				break;			case 27: /* escape */				return false;			case 28: /* left */				return false;			case 29: /* right */				return false;			case 30: /* up */				return false;			case 31: /* down */				return false;			case 127: /* delete */
				HID_KEYBOARD.sendSpecial(0x2A, 1);				break;			default:
				if ((Event.FunctionKeyPlay <= code) && (code <= Event.FunctionKeyPower)) {					return false;
				}				if (code > 0x000F0000) {					return false;
				}
				HID_KEYBOARD.sendKey(key);			}		}	},
})

