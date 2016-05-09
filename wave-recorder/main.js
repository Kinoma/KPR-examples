/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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

var sampleRate = 16000;
var channels = 1;

import { buildWAVE } from "wave";

let backgroundSkin = new Skin({ fill:"white" });
let buttonSkin = new Skin({ texture: new Texture('./media-buttons.png'), width:48, height:48, variants:48 });let titleSkin = new Skin({ fill:"gray" });

let timecodeStyle = new Style({ font:"bold 48px", horizontal:"center", vertical:"middle", color:"black" });
let titleStyle = new Style({ font:"bold 28px", horizontal:"center", vertical:"top", color:"white", top:4, bottom:4 });

let IconButton = Content.template($ => ({
	width:buttonSkin.width, height:buttonSkin.height, active:true, skin:buttonSkin,
}));

let RecordButton = IconButton.template($ => ({
	Behavior: class extends Behavior {
		onCreate(button, data) {
			button.variant = 2;
		}
		onTouchBegan(button) {
			if (2 == button.variant) {
				button.variant = 3;
				application.distribute("onStartRecording");
			}
			else {
				button.variant = 2;
				application.distribute("onStopRecording");
			}
		}
	}
}));

let PlayButton = IconButton.template($ => ({
	Behavior: class extends Behavior {
		onMediaStateChanged(button, state) {
			button.variant = (Media.PLAYING == state) ? 1 : 0;
		}
		onTouchBegan(button) {
			application.distribute("onPlayPause");
		}
	}
}));

let Recording = Media.template($ => ({
	Behavior: class extends Behavior {
		onFinished(media) {
			media.stop();
			media.time = 0;
		}
		onLoaded(media) {
			this.onTimeChanged(media);
			media.volume = 0.8;
		}
		onStateChanged(media) {
			application.distribute("onMediaStateChanged", media.state);		}		onTimeChanged(media) {
			application.distribute("onMediaTimeChanged", media.time);
		}
	}
}));

let Timecode = Label.template($ => ({
	style: timecodeStyle, string:toTimeCode(0),
	Behavior: class extends Behavior {
		onMediaTimeChanged(label, time) {
			label.string = toTimeCode(time);
		}
	}
}));

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, style:titleStyle, skin:backgroundSkin,
	Behavior: class extends Behavior {
		onDisplaying(container) {
			this.media = container.last;
			container.interval = 500;
		}
		onRecording(container, recording) {
			if (recording) {
				let wave = buildWAVE(recording, sampleRate, channels);
				let path = Files.documentsDirectory + "capture.wav";
				Files.writeBuffer(path, wave);
				this.media.url = path;
			}
		}
		onPlayPause(container) {
			if (Media.PLAYING == this.media.state)
				this.media.stop();
			else if (Media.PAUSED == this.media.state)
				this.media.start();
		}
		onStartRecording(container) {
			Pins.invoke("/recorder/startRecording");
			container.time = 0;
			container.start();		}
		onStopRecording(container) {
			container.stop();
			Pins.invoke("/recorder/stopRecording", recording => this.onRecording(container, recording));		}
		onTimeChanged(container) {
			application.distribute("onMediaTimeChanged", container.time);
		}
	},
	contents: [
		Label($, { left:0, right:0, top:0, skin:titleSkin, string:$.title }),
		Timecode($),
		Line($, {
			bottom:10,
			contents: [
				RecordButton($),
				Content($, { width:5 }),
				PlayButton($),
			]
		}),
		Recording($)
	]
}));

let toTimeCode = function(timeInMS) {	let seconds = timeInMS / 1000;	let result = "";	seconds = Math.floor(seconds);	let hours = Math.floor(seconds / 3600);	seconds = seconds % 3600;	let minutes = Math.floor(seconds / 60);	seconds = Math.round(seconds % 60);	if (hours)		result += hours + ":";	if (minutes < 10)		result += "0";	result += minutes;	result += ":";	if (seconds < 10)		result += "0";	result += seconds;	return result;};

application.behavior = Behavior({	onLaunch(application) {		Pins.configure({			recorder: {        		require: "audio",        		pins: {        			microphone: { sampleRate, channels },        		}    		},		}, success => this.onPinsConfigured(application, success));    },	onPinsConfigured(application, success) {				if (success) {					let data = {
				title: "WAVE Recorder"
			};
			application.add(new MainScreen(data));		}		else			trace("failed to configure pins\n");	}});

