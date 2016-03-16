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
let Pins = require('pins');

/* ASSETS */

let mainSkin = new Skin({ fill:'#F0F0F0' });
let buttonSkin = new Skin({ fill:['#707070','#4E4E4E'] });

let buttonStyle = new Style({ font:'bold 50px', color:'white' });

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:mainSkin,
	Behavior: class extends Behavior {
		onDisplayed(container) {
			/* Create message for communication with hardware pins.
	    	   motor: name of pins object, will use later for calling 'button' methods.
	    	   require: name of the BLL bodule.
	    	   pins: initializes 'servo' (matches 'servo' object in the BLL) with the given pin numbers. Pin types and directions are set within the bll.
	    	*/
			Pins.configure({
				motor: {
					require: "servo",
					pins: {
						servo: { pin: 28 }
					}
				}
			}, success => this.onPinsConfigured(container, success));
		}
		onPinsConfigured(container, success) {		
			if (success) {
				Pins.share("ws", {zeroconf: true, name: "pwm-continuous-servo"});
			}
			else
				trace("failed to configure pins\n");
		}
	},
	contents: [
		Container($, {
			left:80, right:80, top:80, bottom:80, active:true, skin:buttonSkin, style:buttonStyle,
			Behavior: class extends Behavior {
				onTouchBegan(container) {
					container.state = 1;
					Pins.invoke("/motor/rotate");             
				}
				onTouchEnded(container) {
					container.state = 0;
					Pins.invoke("/motor/stop");             
				}
			},
			contents:[
				Label($, { left:0, right:0, string:'rotate' })
			]
		})
	]
}));

/* APPLICATION */

application.add(new MainScreen);
