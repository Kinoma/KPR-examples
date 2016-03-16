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

import {
	PlayButtonBehavior,
	RecordButtonBehavior
} from "buttons";

/* ASSETS */

let backgroundSkin = new Skin({ fill:'white' });

/* LAYOUTS */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Line($, {
			left:10, right:10, top:10, bottom:10,
			contents: [
				Canvas($, {
					left:10, right:10, top:10, bottom:10, active:true,
					Behavior: class extends RecordButtonBehavior {
						onButtonTouchBegan(canvas) {
							Pins.invoke("/sounds/startRecording");
						}
						onButtonTouchEnded(canvas) {
							Pins.invoke("/sounds/stopRecording", runTime => canvas.delegate("onRecordingComplete", runTime));
						}
					}
				}),
				Canvas($, {
					left:10, right:10, top:10, bottom:10, active:true,
					Behavior: class extends PlayButtonBehavior {
						onButtonTouchBegan(canvas) {
							Pins.invoke("/sounds/stopPlay");
							Pins.invoke("/sounds/playRecording");
						}
					}
				}),
			]
		})
	]
}));

/* APPLICATION */

application.behavior = Behavior({
	onLaunch(application) {
		Pins.configure({
			sounds: {
        		require: "audioBLL",
        		pins: {
        			microphone: { sampleRate: 8000, channels: 1 },
        			speaker: { sampleRate: 8000, channels: 1 }
        		}
    		},
		}, success => this.onPinsConfigured(application, success));
    },
	onPinsConfigured(application, success) {		
		if (success) {		
			application.add(new MainScreen);

			Pins.share("ws", {zeroconf: true, name: "audio-recorder-player"});
		}
		else
			trace("failed to configure pins\n");
	}
});
