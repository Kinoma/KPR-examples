//@program
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

// NOTE: This example application requires Kinoma Software version 6.1.337 or later.
// Use the Settings app on Kinoma Create to update.

var touchSkin = new Skin({ fill: ["#00FFFFFF", "white" ] } );
var arrowsTexture = new Texture("./arrows.png");
var arrowsSkin = new Skin({ texture: arrowsTexture, x:0, y:0, width:200, height:200, variants:200, states:200 } );
var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });

var fadeBehavior = Object.create(Behavior.prototype, {
	onCreate: { value: function(content, data) {
		content.duration = 1500;
	}},
	onTimeChanged: { value: function(content) {
		content.state = 1 - Math.cubicEaseOut(content.fraction);
	}},
});

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#76b321" }),
	contents: [
		Content($, { anchor:"touch left", behavior:fadeBehavior, left:0, width:20, top:0, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch top", behavior:fadeBehavior, left:20, right:20, top:0, height:20, skin: touchSkin }),
		Content($, { anchor:"touch right", behavior:fadeBehavior, width:20, right:0, top:0, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch bottom", behavior:fadeBehavior, left:20, right:20, height:20, bottom:0, skin: touchSkin }),
		Content($, { anchor:"touch center", behavior:fadeBehavior, left:20, right:20, top:20, bottom:20, skin: touchSkin }),
		Content($, { anchor:"swipe to right", behavior:fadeBehavior, skin: arrowsSkin, variant:0 }),
		Content($, { anchor:"swipe to left", behavior:fadeBehavior, skin: arrowsSkin, variant:1 }),
		Content($, { anchor:"swipe down", behavior:fadeBehavior, skin: arrowsSkin, variant:2 }),
		Content($, { anchor:"swipe up", behavior:fadeBehavior, skin: arrowsSkin, variant:3 }),
	]
}});

var ErrorScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#f78e0f" }),
	contents: [
		Label($, { left:0, right:0, top:0, bottom:0, style: errorStyle, string:"Error " + $.error })
	]
}});

Handler.bind("/hoverData", {
	onInvoke: function(handler, message) {
		var data = model.data;
		var it = message.requestObject;
		var content = data[it];
		content.state = 1;
		content.time = 0;
		content.start();
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message, text) {
		if (0 != message.error)
			application.replace(application.first, new ErrorScreen(message));
        else
            application.invoke(new MessageWithObject("pins:/hover/read?repeat=on&callback=/hoverData&interval=16"));
	}},
	onLaunch: { value: function(application) {
        var message = new MessageWithObject("pins:configure", {
            hover: {
                require: "hover",
                pins: {
                    ts: {pin: 23},
                    reset: {pin: 24},
                    data: {sda: 27, clock: 29}
                }
            }});
        application.invoke(message, Message.TEXT);

		this.data = { };
 		application.add(new Screen(this.data));
	}},
});
