/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import Pins from "pins";

let textStyle = new Style({ font: "bold 50px", color: "white" });
let MainContainer = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	skin: new Skin({ fill: $.backgroundColor }),
	contents: [
		Label($, {
			top: 70, bottom: 70, left: 70, right: 70,
			style: textStyle,  string: $.string
		}),
	],
}));

class AppBehavior extends Behavior {
	onLaunch(application) {
		/* When the application is launched, configure the pins */
		Pins.configure({			led: {				require: "Digital",				pins: {					ground: { pin: 51, type: "Ground" },					digital: { pin: 52, direction: "output" },				}			},    		},  success => {			if (success) {
				/* If the pins are successfully configured, we want to share their capabilities
				   over the network. Here we specify that the pins can be accessed via 
				   WebSockets ("ws"), and we want to advertise their presence on the network
				   using Zeroconf with the name "pins-share-led" */
				Pins.share("ws", {zeroconf: true, name: "pins-share-led"});
				
				/* We also add an instance of our MainContainer template with a status
				   message so we know the pins have been configured and shared. */
				application.add(new MainContainer({ string: "Ready!", backgroundColor: "#7DBF2E" }));
			} else {
				/* If the pins are not successfully configured, we add an instance of 
				   our MainContainer template with an error message. */		   		
		   		application.add(new MainContainer({ string: "Error", backgroundColor: "red" }));
		   	};		});
	}
}
application.behavior = new AppBehavior();
