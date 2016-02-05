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
let Pins = require("pins");

/* ASSETS */

let mainSkin = new Skin({ fill:'white' });
let buttonStyle = new Style({ font:'bold 50px', color:'black' });

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:mainSkin,
	Behavior: class extends Behavior {
		onButton(result) {
             if ( result == true )             
                application.distribute("onClick");
		}
		onClick(container) {
            // When button clicked, remove letter from label's string.
            let curString = container.first.string;
            if ( curString.length == 0 )
            	container.first.string = "Hello World!"
            else
            	container.first.string = curString.substring( 0, curString.length - 1 );
		}
		onDisplayed(container) {
			Pins.configure({
				button: {
					require: "button",
					pins: {
						power: {pin: 51, voltage: 3.3, type: "Power"},
						button: { pin: 52 },
						ground: {pin: 53, type: "Ground"},
					}
				}
			}, success => this.onPinsConfigured(container, success));
		}
		onPinsConfigured(label, success) {		
			if (success) {
				this.repeater = Pins.repeat("/button/wasPressed", 20, result => this.onButton(result));

				Pins.share("ws", {zeroconf: true, name: "digital-in-hello-world"});
			}
			else
				trace("failed to configure pins\n");
		}
	},
	contents:[
		Label($, { left:0, right:0, style:buttonStyle, string:'Hello World!' }),
	]
}));

/* APPLICATION */

application.add(new MainScreen);
