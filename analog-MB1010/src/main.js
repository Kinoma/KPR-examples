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

var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });
var rangeStyle = new Style({ font:"bold 110px", color:"black", horizontal:"center", vertical:"middle" });
var captionStyle = new Style({ font:"24px", color:"black", horizontal:"center", vertical:"bottom" });

Handler.bind("/range", {
	onInvoke: function(handler, message) {
        var data = model.data;
        var range = message.requestObject;
        model.data.label.string = range.toFixed(2);
	}
});

var Ruler = Canvas.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	behavior: Object.create(Behavior.prototype, {
		onDisplaying: { value: function(canvas) {
			var ctx = canvas.getContext("2d");
			ctx.strokeStyle = "#555555";
			for (var i = 0, x = 4; i < 5; ++i) {
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
		}},
	}),
}});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            application.skin = new Skin({ fill: "#f78e0f" });
            application.add(new Label({ left:0, right:0, style: errorStyle, string:"Error " + message.error }));
            return;
        }

        application.invoke(new MessageWithObject("pins:/MB1010/read?repeat=on&callback=/range&interval=250"));

        application.skin = new Skin({ fill: "#ffeb36" });
        application.add(new Ruler);
        application.add(model.data.label = new Label({left: 0, right: 0, style: rangeStyle}));
        application.add(new Label({left: 0, right: 0, bottom: 0, style: captionStyle, skin: new Skin({ fill: "#aaffffff" }), string: "Range in inches"}));
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            MB1010: {
                require: "MB1010",
                pins: {
                    range: { pin: 62 }
                }
            }}), Message.JSON);

        this.data = { label: {} };
    }},
});
