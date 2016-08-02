/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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

let mainSkin = new Skin({ fill:'#F0F0F0' });
let buttonSkin = new Skin({ fill: ['#707070', '#4E4E4E'] });

let buttonStyle = new Style({ font:'bold 36px', horizontal:'center', vertical:'middle', color:'white' });

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:mainSkin,
	contents:[
		Container($, {
			left:80, right:80, top:80, bottom:80, active:true, skin:buttonSkin,
			Behavior: class extends Behavior {
				onCreate(container, data) {
					this.ledState = false;
				}
				onDisplayed(container) {
		            Pins.configure({
						light: {
							require: "Digital",
							pins: {
								digital: {pin: 59, type: "Digital", direction: "output"},
								ground: {pin: 60, type: "Ground"}
							}
						}
					}, success => this.onPinsConfigured(container, success));
				}
				onPinsConfigured(label, success) {		
					if (success)
						Pins.share("ws", {zeroconf: true, name: "digital-out-led"});
					else
						trace("failed to configure pins\n");
				}
				onTouchBegan(container) {
					container.state = 1;
				}
				onTouchEnded(container) {
					container.state = 0;
					this.ledState = !this.ledState;
                    if ( this.ledState ) {
   						Pins.invoke("/light/write", 1);             
                		container.first.string = "turn off";
                	} else {
   						Pins.invoke("/light/write", 0);             
                		container.first.string = "turn on";
                	}
				}
			},
			contents: [
				Label($, { left:0, right:0, style:buttonStyle, string:'turn on' })
			]
		}),
	]
}));

/* APPLICATION */

application.add(new MainScreen);
