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

let backgroundSkin = new Skin({ fill : ["#202020", "#7DBF2E"] });
let textStyle = new Style({ font: "bold 50px", color: "white" });

let MainContainer = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	active: true, skin: backgroundSkin, state: 0,
	contents: [
		Label($, { name: "statusString", top: 0, bottom: 0, left: 0, right: 0, style: textStyle, string: "OFF" }),
	],
	Behavior: class extends Behavior {
		onTouchBegan(container) {
			container.state = 1;
			application.distribute("onToggleLight", 1);
		}
		onTouchEnded(container) {
			container.state = 0;
			application.distribute("onToggleLight", 0);
		}
		onToggleLight(container, value) {
			container.statusString.string = (value) ? "ON" : "OFF";
		}
	}
}));

let remotePins;
class AppBehavior extends Behavior {
	onLaunch(application) {
		application.add(new MainContainer());
		let discoveryInstance = Pins.discover(
		/* The first argument to Pins.discover() is a function that will be called whenever
		   remote pins are discovered. It is up to the developer to check that it's the
		   application they want to connect to--in this case, the application with the name
		   "pins-share-led." We store the connection to the remote pins in the remotePins
		   variable. */			connectionDesc => {				if (connectionDesc.name == "pins-share-led") {			        trace("Connecting to remote pins\n");			        remotePins = Pins.connect(connectionDesc);			    }			}, 
		/* The second argument is a function that will be called whenever remote pins are no
		   longer available to connect to. If we lose the connection to the "pins-share-led"
		   applcation, we update the remotePins variable so the application knows the remote 
		   pins are unavailable. */			connectionDesc => {				if (connectionDesc.name == "pins-share-led") {			        trace("Disconnected from remote pins\n");			        remotePins = undefined;			    }			}		);
	}
	onToggleLight(application, value) {
		/* Remote BLL functions are called by calling the invoke or repeat functions
		   of the object returned by the call to Pins.connect(), which we stored in the
		   remotePins variable. */
		if (remotePins) remotePins.invoke("/led/write", value);
	}
}
application.behavior = new AppBehavior();