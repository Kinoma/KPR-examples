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

var touchSkin = new Skin({ fill: ["#00FFFFFF", "white" ] } );
var heartTexture = new Texture("./heart.png");
var heartSkin = new Skin({ texture: heartTexture, x:0, y:0, width:200, height:200, states:200 });
var bpmStyle = new Style({ font:"bold 50px", color:"white", horizontally:"center", vertically:"middle" });
var unitStyle = new Style({ font:"20px", color:"white", horizontally:"center", vertically:"middle" });

var pulseBehavior = Object.create(Behavior.prototype, {
	onCreate: { value: function(content, data) {
		content.duration = 300;
	}},
	onFinished: { value: function(content) {
		content.time= 0;
		content.start();
	}},
	onTimeChanged: { value: function(content) {
		content.state = 1 - 0.75 * Math.quadEaseIn(content.fraction);
	}},
});

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#76b321" }),
	contents: [
		Content($, { anchor:"heart", behavior:pulseBehavior, skin:heartSkin, state:0.5 }),
		Label($, { anchor:"bpm", left:0, right:0, top:0, bottom:0, style:bpmStyle }),
		Label($, { left:0, right:0, top:140, height:20, style:unitStyle, string:"BPM" }),
	]
}});

Handler.bind("/pulseData", {
	onInvoke: function(handler, message) {
		var data = model.data;
		var it = message.requestObject;
       // trace(JSON.stringify(it) + "\n");
        var content = data.heart;
        var label = data.bpm;
        var value = it.BPM;
        if (value) {
        	label.string = Math.round(value);
			content.duration = 60000 / value;
			content.start();
        }
        else {
        	label.string = "?";
			content.state = 1;
			content.stop();
        }
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onLaunch: { value: function(application) {
        var message = new MessageWithObject("pins:configure", {
            pulse: {
                require: "pulse",
                pins: {
                    sensor: {pin: 61}
                }
            }});
        application.invoke(message);

        application.invoke(new MessageWithObject("pins:/pulse/beat?repeat=on&callback=/pulseData&interval=2"));

		this.data = { counter: 0 };
 		application.add(new Screen(this.data));
	}},
});
