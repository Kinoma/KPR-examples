//@program
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

// NOTE: This example application requires Kinoma Software version 6.1.337 or later.
// Use the Settings app on Kinoma Create to update.

var Pins = require('pins');

var touchSkin = new Skin({ fill: ["#00FFFFFF", "white" ] } );
var arrowsTexture = new Texture("./arrows.png");
var arrowsSkin = new Skin({ texture: arrowsTexture, x:0, y:0, width:200, height:200, variants:200, states:200 } );
var errorStyle = new Style({ font:"bold 28px", color:"white", horizontal:"center", vertical:"middle" });

class FadeBehavior extends Behavior {
	onCreate(content, data) {
		content.duration = 1500;
	}
	onTimeChanged(content) {
		content.state = 1 - Math.cubicEaseOut(content.fraction);
	}
}

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#76b321" }),
	contents: [
		Content($, { anchor:"touch left", Behavior:FadeBehavior, left:0, width:20, top:0, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch top", Behavior:FadeBehavior, left:20, right:20, top:0, height:20, skin: touchSkin }),
		Content($, { anchor:"touch right", Behavior:FadeBehavior, width:20, right:0, top:0, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch bottom", Behavior:FadeBehavior, left:20, right:20, height:20, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch center", Behavior:FadeBehavior, left:20, right:20, top:20, bottom:20, skin: touchSkin }),
		Content($, { anchor:"swipe to right", Behavior:FadeBehavior, skin: arrowsSkin, variant:0 }),
		Content($, { anchor:"swipe to left", Behavior:FadeBehavior, skin: arrowsSkin, variant:1 }),
		Content($, { anchor:"swipe down", Behavior:FadeBehavior, skin: arrowsSkin, variant:2 }),
		Content($, { anchor:"swipe up", Behavior:FadeBehavior, skin: arrowsSkin, variant:3 }),
	]
}});

var ErrorScreen = Container.template( $ => ({
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#f78e0f" }),
	contents: [
		Label( $, { left:0, right:0, top:0, bottom:0, style: errorStyle, string: $.error })
	]
}));

class ApplicationBehavior extends Behavior {
	onLaunch(application) {
		this.data = { };
 		application.add(new Screen(this.data));

		Pins.configure({
			hover: {
                require: "hover",
                pins: {
                    ts: {pin: 23},
                    reset: {pin: 24},
                    data: {sda: 27, clock: 29}
                }
            }
		}, success => this.onPinsConfigured(application, success));
	}
	onPinsConfigured(application, success) {
		if (success) {
			Pins.repeat("/hover/read", 16, hoverData => this.onHoverData(application, hoverData));

			Pins.share("ws", {zeroconf: true, name: "i2c-hover"});
		}
		else {
			var errorMessage = { error: "Failed to configure Pins" };
			application.replace(application.first, new ErrorScreen(errorMessage));
		}
	}
	onHoverData(application, hoverData) {
		var data = model.data;
		var content = data[hoverData];
		content.state = 1;
		content.time = 0;
		content.start();
	}
}

var model = application.behavior = new ApplicationBehavior
