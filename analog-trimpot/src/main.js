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

var zeroVolumeWidth = 36;	// width of clipping container at volume level 0

/* ASSETS */
var backgroundSkin = new Skin({ fill:'black' });
var headerSkin = new Skin({ fill:'#7fc2c2c2' });

var volumeBackgroundTexture = new Texture("./assets/audio-background.png");
var volumeBackgroundSkin = new Skin({ texture:volumeBackgroundTexture, x:0, y:0, width:80, height:50 });
var volumeForegroundTexture = new Texture("./assets/audio-foreground.png");
var volumeForegroundSkin = new Skin({ texture:volumeForegroundTexture, x:0, y:0, width:80, height:50 });

var errorStyle = new Style({ font:"bold 28px", color:"white", horizontal:"center", vertical:"middle" });
var headerStyle = new Style({ font:"bold 25px", color:"white", align:"middle,center", lines:"1" });

/* BEHAVIORS */

class MediaPlayerBehavior extends Behavior {
	onCreate(media, data) {
		this.data = data;
	}
	onLoaded(media) {
		this.onVolumeChanged(media, this.data.volume);
		media.start();
	}
	onVolumeChanged(media, volume) {
		media.volume = this.data.volume = volume;
	}
};

class VolumeControlBehavior extends Behavior {
	onVolumeChanged(container, volume) {
		container.width = Math.round(zeroVolumeWidth + 31 * volume);
	}
};

/* LAYOUTS */

var MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Container($, {
			left: 0, right: 0, top: 0, height: 28, skin:headerSkin,
			contents: [
				Label($, { left:0, right:0, style:headerStyle, string:"Kinoma Create" }),
			]
		}),
		Media($, { left:0, right:0, top:36, bottom:52, url:$.url, Behavior:MediaPlayerBehavior }),
		Container($, {
			left: 0, right: 0, bottom: 0, height: 50,
			contents: [
				Container($, {
					width:80, height:50, skin:volumeBackgroundSkin,
					contents: [
						Container($, {
							left:0, width:zeroVolumeWidth, height:50, clip:true, Behavior:VolumeControlBehavior,
							contents: [
								Content($, { left:0, width:80, height:50, skin:volumeForegroundSkin })
							]
						})
					]
				})
			]
		}),
	]
}));
					
application.behavior = Behavior({  
	onLaunch(application) {
        this.data = {
			url: "http://cvs.kinoma.com/~brian/KinomaCreateWidescreen.mp4",
			volume: 0
        };
		Pins.configure({
			trimpot: {
				require: "trimpot",
				pins: {
					power: {pin: 51, voltage: 3.3, type: "Power"},
					volume: { pin: 52 },
					ground: {pin: 53, type: "Ground"}				
				}
			},
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			// Display the media player screen
			application.add(new MainScreen(this.data));
		
			// Read the softpot periodically and adjust the volume
			Pins.repeat("/trimpot/read", 150, result => application.distribute("onVolumeChanged", result));

			Pins.share("ws", {zeroconf: true, name: "analog-trimpot"});
		}
		else {
            application.skin = new Skin({ fill:"#f78e0f" });
            application.add(new Label({ left:0, right:0, style:errorStyle, string:"Failed to configure Pins" }));
		}
	},
	onQuit(application) {
		Pins.close();
	},
});

