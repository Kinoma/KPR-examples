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

// styles
var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });

// globals
var SENSITIVITY = 16;

application.behavior = Behavior({
	onLaunch(application) {
		Pins.configure({
			microphone: {
				require: "audioin",
				pins: {
                    audio: {sampleRate: 8000, channels: 1}
				}
			},
		}, success => this.onPinsConfigured(application, success));
    },
	onMicrophoneRead(result) {
        var power = result.rms * SENSITIVITY;
        power = Math.min(power, 32767);
        var gray = Math.round(power / 256).toString(16);
        if (gray.length < 2) gray = "0" + gray;
        application.skin = new Skin({fill: "#" + gray + gray + gray});

		var labels = this.data.labels;
        labels.average.string = "Average: " + result.average;
        labels.peak.string = "Peak: " + result.peak;
        labels.rms.string = "RMS: " + result.rms;
		labels.count.string = "Samples: " + result.count;
	},
	onPinsConfigured(application, success) {		
		if (success) {
	        this.data = { labels: {} };
	
	        application.skin = new Skin({fill: "#76b321"});
	        var style = new Style({ font:"bold 34px", color:"white", horizontal:"left", vertical:"middle" });
	        application.add(this.data.labels.rms = new Label({left: 30, right: 0, top: 0, height: 60, style: style}));
	        application.add(this.data.labels.peak = new Label({left: 30, right: 0, top: 60, height: 60, style: style}));
	        application.add(this.data.labels.average = new Label({left: 30, right: 0, top: 120, height: 60, style: style}));
	        application.add(this.data.labels.count = new Label({left: 30, right: 0, top: 180, height: 60, style: style}));

			Pins.repeat("/microphone/read", "audio", result => this.onMicrophoneRead(result));
		}
		else {
            application.skin = new Skin({ fill:"#f78e0f" });
            application.add(new Label({ left:0, right:0, style:errorStyle, string:"Error" }));
		}
	}
});
