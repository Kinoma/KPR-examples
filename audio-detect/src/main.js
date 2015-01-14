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

var SENSITIVITY = 16;

Handler.bind("/gotAudio", {
	onInvoke: function(handler, message) {
        var response = message.requestObject;
        var power = response.rms;
        var power = response.rms * SENSITIVITY;

        power = Math.min(power, 32767);
        var gray = Math.round(power / 256).toString(16);
        if (gray.length < 2) gray = "0" + gray;
        application.skin = new Skin({fill: "#" + gray + gray + gray});

        model.data.labels.average.string = "Average: " + response.average;
        model.data.labels.peak.string = "Peak: " + response.peak;
        model.data.labels.rms.string = "RMS: " + response.rms;
        model.data.labels.count.string = "Samples: " + response.count;
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
           microphone: {
               require: "audioin",
               pins: {
                    audio: {sampleRate: 8000, channels: 1}
               }
            }}));
        application.invoke(new MessageWithObject("pins:/microphone/read?repeat=on&timer=audio&callback=/gotAudio"));

        this.data = { labels: {} };

        application.skin = new Skin({fill: "#76b321"});
        var style = new Style({ font:"bold 34px", color:"white", horizontal:"left", vertical:"middle" });
        application.add(model.data.labels.rms = new Label({left: 30, right: 0, top: 0, height: 60, style: style}));
        application.add(model.data.labels.peak = new Label({left: 30, right: 0, top: 60, height: 60, style: style}));
        application.add(model.data.labels.average = new Label({left: 30, right: 0, top: 120, height: 60, style: style}));
        application.add(model.data.labels.count = new Label({left: 30, right: 0, top: 180, height: 60, style: style}));
    }}
});
