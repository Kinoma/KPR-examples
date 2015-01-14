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

Handler.bind("/proximityData", {
	onInvoke: function(handler, message) {
        var data = model.data;
        data.VCNL4000 = message.requestObject;
        trace(JSON.stringify(data) + "\n");
        data.labels.ambient.string = "Ambient: " + data.VCNL4000.ambient;
        data.labels.proximity.string = "Proximity: " + data.VCNL4000.proximity;

        var ambient = data.VCNL4000.ambient;            // good place to apply logarithmic adjustment
        var proximity = data.VCNL4000.proximity;        // good place to apply logarithmic adjustment

        var gray = ambient >> 8;
        gray = (gray >> 4).toString(16) + (gray & 0x0f).toString(16);
        application.skin = new Skin({ fill: "#" + gray + gray + gray });

        var gray = 255 - (ambient >> 8);
        gray = (gray >> 4).toString(16) + (gray & 0x0f).toString(16);
        var size = 36 + 20 * ((proximity - 2000) / (65535 - 2000));
        var style = new Style({ font:"bold " + (size | 0) + "px", color:"#" + gray + gray + gray, horizontal:"center", vertical:"middle" });
        data.labels.ambient.style = style;
        data.labels.proximity.style = style;
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            application.skin = new Skin({ fill: "#f78e0f" });
            var style = new Style({ font:"bold 36px", color:"white", horizontal:"center", vertical:"middle" });
            application.add(new Label({ left:0, right:0, top:0, bottom:0, style: style, string:"Error " + message.error }));
            return;
        }

        application.invoke(new MessageWithObject("pins:/VCNL4000/read?repeat=on&callback=/proximityData&interval=30"));

        application.skin = new Skin({ fill: "black" });
        application.add(model.data.labels.ambient = new Label({left: 0, right: 0, top: 0, bottom: 120}));
        application.add(model.data.labels.proximity = new Label({left: 0, right: 0, top: 120, bottom: 0}));
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            VCNL4000: {
                require: "VCNL4000",
                pins: {
                    data: {sda: 27, clock: 29}
                }
            }}), Message.JSON);

        this.data = { labels: {} };
    }},
});
