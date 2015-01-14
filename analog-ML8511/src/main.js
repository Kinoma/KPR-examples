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

Handler.bind("/uvData", {
	onInvoke: function(handler, message) {
        var data = model.data;
        data.uvData = message.requestObject;
        data.labels.uv.string = "UV Intensity: " + data.uvData.intensity.toPrecision(2);
        data.labels.uvi.string = "UV Index: " + data.uvData.index;
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

        application.invoke(new MessageWithObject("pins:/ML8511/read?repeat=on&callback=/uvData&interval=100"));

        application.skin = new Skin({ fill: "#76b321" });
        var style = new Style({ font:"bold 34px", color:"white", horizontal:"left", vertical:"middle" });
        application.add(model.data.labels.uv = new Label({left: 30, right: 0, top: 0, bottom: 120, style: style}));
        application.add(model.data.labels.uvi = new Label({left: 30, right: 0, top: 120, bottom: 0, style: style}));
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            ML8511: {
                require: "ML8511",
                pins: {
                    uv: {pin: 52},
                    vref: {pin: 54}
                }
            }}), Message.JSON);

        this.data = { labels: {} };
    }},
});
