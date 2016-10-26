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

var Pins = require("pins");

var touchSkin = new Skin({ fill: ["#00FFFFFF", "white" ] } );
var heartTexture = new Texture("./heart.png");
var heartSkin = new Skin({ texture: heartTexture, x:0, y:0, width:200, height:200, states:200 });
var bpmStyle = new Style({ font:"bold 50px", color:"white", horizontal:"center", vertical:"middle" });
var unitStyle = new Style({ font:"20px", color:"white", horizontal:"center", vertical:"middle" });

class PulseBehavior extends Behavior {
	onCreate(content, data) {
		content.duration = 300;
	}
	onFinished(content) {
		content.time= 0;
		content.start();
	}
	onTimeChanged(content) {
		content.state = 1 - 0.75 * Math.quadEaseIn(content.fraction);
	}
};

let Screen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "#76b321" }),
	contents: [
		Content($, { anchor:"heart", Behavior:PulseBehavior, skin:heartSkin, state:0.5 }),
		Label($, { anchor:"bpm", left:0, right:0, top:0, bottom:0, style:bpmStyle }),
		Label($, { left:0, right:0, top:140, height:20, style:unitStyle, string:"BPM" }),
	]
}));

application.behavior = Behavior({
    onLaunch(application) {
		this.data = { counter: 0 };
 		application.add(new Screen(this.data));
		Pins.configure({
            pulse: {
                require: "pulse",
                pins: {
                	ground: {pin: 59, type: "Ground"},
                	power: {pin: 60, type:"Power", voltage:3.3},
                    sensor: {pin: 61}
               }
            }
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			Pins.repeat("/pulse/beat", 2, value => this.onPulseDataChanged(value));
			
			Pins.share("ws", {zeroconf: true, name: "analog-pulse"});
		}
		else
			trace("\error occurred configuring pins");
	},
	onPulseDataChanged(value) {		
		var data = this.data;
		var it = value;
   		//trace(JSON.stringify(it) + "\n");
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
	},
});
