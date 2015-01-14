//@program
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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

var shieldTexture = new Texture("./touch-shield-bkg.png");
var shieldSkin = new Skin({ texture: shieldTexture, x:0, y:0, width:320, height:240 } );
var dotsTexture = new Texture("./number-dot-strip.png");
var dotsSkin = new Skin({ texture: dotsTexture, x:0, y:0, width:60, height:60, variants:60, states:60 } );
var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });

var fadeBehavior = Object.create(Behavior.prototype, {
	onCreate: { value: function(content, data) {
		content.duration = 400;
	}},
	onTimeChanged: { value: function(content) {
		content.state = 1 - Math.cubicEaseOut(content.fraction);
	}},
});

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: shieldSkin /* new Skin({ fill: "#76b321" }) */,
	contents: [
		Content($, { anchor:"E", behavior:fadeBehavior, left:25, width:60, top:0, bottom:0, skin: dotsSkin, variant:3 }),
		Content($, { anchor:"N", behavior:fadeBehavior, left:20, right:20, top:10, height:60, skin: dotsSkin, variant:1 }),
		Content($, { anchor:"W", behavior:fadeBehavior, width:60, right:25, top:0, bottom:0, skin: dotsSkin, variant:5 }),
		Content($, { anchor:"S", behavior:fadeBehavior, left:20, right:20, height:60, bottom:10, skin: dotsSkin, variant:7 }),
		Content($, { anchor:"Home", behavior:fadeBehavior, left:20, right:20, top:20, bottom:20, skin: dotsSkin, variant:4 }),
		Content($, { anchor:"NE", behavior:fadeBehavior, width:60, right:25, top:10, height:60, skin: dotsSkin, variant:2 }),
		Content($, { anchor:"NW", behavior:fadeBehavior, left:25, width:60, top:10, height:60, skin: dotsSkin, variant:0 }),
		Content($, { anchor:"SE", behavior:fadeBehavior, width:60, right:25, height:60, bottom:10, skin: dotsSkin, variant:8 }),
		Content($, { anchor:"SW", behavior:fadeBehavior, left:25, width:60, height:60, bottom:10, skin: dotsSkin, variant:6 })
	]
}});

var ErrorScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#f78e0f" }),
	contents: [
		Label($, { left:0, right:0, top:0, bottom:0, style: errorStyle, string:"Error " + $.error })
	]
}});

Handler.bind("/touchshieldData", {
	onInvoke: function(handler, message) {
		var data = model.data;
		var it = message.requestObject;

        for (var i = 0, down = it.down; i < down.length; i++) {
            var content = data[down[i]];
            content.stop();
            content.state = 1;
            content.time = 0;
        }

        for (var i = 0, up = it.up; i < up.length; i++) {
            var content = data[up[i]];
            content.start();
        }
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message, text) {
		if (0 != message.error)
			application.replace(application.first, new ErrorScreen(message));
        else
            application.invoke(new MessageWithObject("pins:/touchshield/read?repeat=on&callback=/touchshieldData&interval=16"));
	}},
	onLaunch: { value: function(application) {
        var message = new MessageWithObject("pins:configure", {
            touchshield: {
                require: "touchshield",
                pins: {
                    data: {sda: 60, clock: 59, keys: ["NW", "N", "NE", "E", "Home", "W", "SW", "S", "SE"]}
                }
            }});
        application.invoke(message, Message.TEXT);

		this.data = { };
 		application.add(new Screen(this.data));
	}},
});
