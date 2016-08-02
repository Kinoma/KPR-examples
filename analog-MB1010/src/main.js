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

let Pins = require("pins");

let errorStyle = new Style({ font:"bold 28px", color:"white", horizontal:"center", vertical:"middle" });
let rangeStyle = new Style({ font:"bold 110px", color:"black", horizontal:"center", vertical:"middle" });
let captionStyle = new Style({ font:"24px", color:"black", horizontal:"center", vertical:"bottom" });

let Ruler = Canvas.template($ => ({
	left:0, right:0, top:0, bottom:0,
	Behavior: class extends Behavior {
		onDisplaying(canvas) {
			let ctx = canvas.getContext("2d");
			ctx.strokeStyle = "#555555";
			for (let i = 0, x = 4; i < 5; ++i) {
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 10); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 14); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 10); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 16); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 10); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 14); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 10); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 6); ctx.stroke(); x += 4;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 24); ctx.stroke(); x += 4;
			}
		}
	}
}));

application.behavior = Behavior({
	onLaunch(application) {
        this.data = { label: {} };
 		Pins.configure({
            MB1010: {
                require: "MB1010",
                pins: {
                    range: { pin: 62 },
					ground: { pin: 66, type: "Ground" },
					power: { pin: 65, type: "Power", voltage:3.3 },
                }
            }
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			Pins.repeat("/MB1010/read", 250, range => this.onRangeChanged(application, range));
			
			application.skin = new Skin({ fill:"#ffeb36" });
			application.add(new Ruler);
			application.add(this.data.label = new Label({ left:0, right:0, style:rangeStyle }));
			application.add(new Label({ left:0, right:0, bottom:0, style:captionStyle, skin:new Skin({ fill:"#aaffffff" }), string:"Range in inches"} ));

			Pins.share("ws", {zeroconf: true, name: "analog-MB1010"});
		}
		else {
            application.skin = new Skin({ fill:"#f78e0f" });
            application.add(new Label({ left:0, right:0, style:errorStyle, string:"Failed to configure Pins" }));
		}
	},
	onRangeChanged(application, range) {		
        this.data.label.string = range.toFixed(2);
	}
});
