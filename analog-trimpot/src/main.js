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

// styles
var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });
var headerStyle = new Style({ font:"bold 25px", color:"white", align:"middle,center", lines:"1" });

// assets
var volumeBackgroundTexture = new Texture("./assets/audio-background.png");
var volumeBackgroundSkin = new Skin({ texture:volumeBackgroundTexture, x:0, y:0, width:80, height:50 });

var volumeForegroundTexture = new Texture("./assets/audio-foreground.png");
var volumeForegroundSkin = new Skin({ texture:volumeForegroundTexture, x:0, y:0, width:80, height:50 });

// globals
var zeroVolumeWidth = 36;	// width of clipping container at volume level 0

// handlers
Handler.bind("/volume", {
	onInvoke: function(handler, message) {
        var data = model.data;
        var volume = message.requestObject;
        model.data.volume = volume;
        application.distribute("onVolumeChanged", volume);
	}
});

// layouts
var MainScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({ fill:"black" }),
	contents: [
		Container($, {
			left: 0, right: 0, top: 0, height: 28,
			skin: new Skin({ fill:"#7fc2c2c2" }),
			contents: [
				Label($, { left:0, right:0, style:headerStyle, string:"Kinoma Create" }),
			]
		}),
		Media($, {
			left:0, right:0, top:36, bottom:52,
			url:$.url,
			behavior: Object.create(Behavior.prototype, {
				onCreate: { value: function(media, data) {
					this.data = data;
				}},
				onLoaded: { value: function(media) {
					this.onVolumeChanged(media, this.data.volume);
					media.start();
				}},
				onVolumeChanged: { value: function(media, volume) {
					media.volume = this.data.volume = volume;
				}},
			})
		}),
		Container($, {
			left: 0, right: 0, bottom: 0, height: 50,
			contents: [
				Container($, {
					width:80, height:50,
					skin:volumeBackgroundSkin,
					contents: [
						Container($, {
							left:0, width:zeroVolumeWidth, height:50, clip:true,
							behavior: Object.create(Behavior.prototype, {
								onVolumeChanged: { value: function(container, volume) {
									container.width = Math.round(zeroVolumeWidth + 31 * volume);
								}},
							}),
							contents: [
								Content($, { left:0, width:80, height:50, skin:volumeForegroundSkin })
							]
						})
					]
				})
			]
		}),
	]
}});
					
var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            application.skin = new Skin({ fill:"#f78e0f" });
            application.add(new Label({ left:0, right:0, style:errorStyle, string:"Error " + message.error }));
            return;
        }

		// Display the media player screen
		application.add(new MainScreen(this.data));
		
		// Read the softpot periodically and adjust the volume
        application.invoke(new MessageWithObject("pins:/trimpot/read?repeat=on&callback=/volume&interval=150"));
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            trimpot: {
                require: "trimpot",
                pins: {
                    volume: {pin: 53}
                }
            }}), Message.TEXT);

        this.data = {
			url: "http://cvs.kinoma.com/~brian/KinomaCreateWidescreen.mp4",
			volume: 0
        };
    }},
});

