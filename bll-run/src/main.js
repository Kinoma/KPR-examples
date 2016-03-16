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

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:new Skin({ fill:'white' }),
	contents:[
		Text($, {
			left:5, right:5,
			style: new Style({ font:'22px', horizontal:'center', vertical:'middle' }),
			Behavior: class extends Behavior {
				onDisplayed(text) {
		            Pins.configure({
						greeter: {
							require: "hello",
						}
					}, success => this.onPinsConfigured(text, success));
				}
				onPing(text, result) {
					text.string = result.value;
				}	
				onPinsConfigured(text, success) {		
					if (success) {
						Pins.invoke("/greeter/ping", result => this.onPing(text, result));

						Pins.share("ws", {zeroconf: true, name: "bll-run"});
					}
					else
						trace("failed to configure pins\n");
				}
			}
		})
	]
}));

/* APPLICATION */

application.add(new MainScreen);
