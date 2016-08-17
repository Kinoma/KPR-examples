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
import { model } from "main";
import { ButtonBehavior } from "behavior";
import { Tuner } from "tuner";
import { VolumeDialogBox } from "volume";
import { PUBNUB } from "pubnub";

import {
	MenuOpenTransition,
	MenuCloseTransition
} from "transitions";

import {
	PUBNUB_PUBLISH_KEY,
	PUBNUB_SUBSCRIBE_KEY,
	PUBNUB_CHANNEL,
	channels
} from "credentials";

let USE_PUBNUB = ((PUBNUB_PUBLISH_KEY != "YOUR_PUB_KEY_HERE") && (PUBNUB_SUBSCRIBE_KEY != "YOUR_SUB_KEY_HERE"))? true : false;

let radioTitleStyle = new Style({ color: 'white', font: '32px Fira Sans Light', horizontal: 'center', vertical: 'middle', });let nfcTokenStyle = new Style({ color: 'white', font: '20px Fira Sans', horizontal: 'left', vertical: 'middle', });let speakerTexture = (screenScale == 2) ? new Texture('./assets/speaker.png', 1) : (screenScale == 1.5) ? new Texture('./assets/speaker.png', 1) : new Texture('./assets/speaker.png', 1);let speakerSkin = new Skin({ texture: speakerTexture, width: 40, height: 40,letiants: 40, states: 40, });

let defaultImages = [	{ uri: mergeURI(application.url, "./assets/default0.jpg") },];

let customEffectIndex = 0;let customEffects = [ new Effect, new Effect, new Effect ];customEffects[0].gray("black", blendColors(0.3, "#f24b2c", "black"));customEffects[1].gray("black", blendColors(0.3, "#77b648", "black"));customEffects[2].gray("black", blendColors(0.3, "#2ea7cb", "black"));


let Collage = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: CollageBehavior, 
	contents: [ Content($, {}) ] 
}));class CollageBehavior extends Behavior {  	doBrowse(container, delta) {		let c = this.images.length;		let i = this.index + delta;		if (i >= c) i = 0;		this.index = i;		this.loading = true;		var picture = new Picture({ left:0, top:0 });		picture.behavior = new CollagePictureBehavior(picture, this.images[i]);		this.data.IMAGE = picture;	}  	onCreate(container, $) {		this.data = $;		container.duration = 9000;		this.images = defaultImages;		this.index = 0;		this.doBrowse(container, 0);	}  	onFinished(container) {		if (!this.loading) container.run(new CollageTransition, container.first, this.data.IMAGE);	}  	onLoaded(container) {		if (this.data.IMAGE.ready) {			this.loading = false;			if (!container.transitioning && !container.running)				container.run(new CollageTransition, container.first, this.data.IMAGE);		} else this.doBrowse(container, 1);	}  	onTransitionBeginning(container) {		this.doBrowse(container, 1);	}  	onTransitionEnded(container) {		application.purge();		container.time = 0;		container.start();	}}
class CollageLayerBehavior extends Behavior {  	onCreate(layer, $) {		layer.duration = 10000;		layer.opacity = 0;		layer.subPixel = true;		this.dx = $.dx;		this.dy = $.dy;	}  	onTimeChanged(layer) {		let dx = this.dx;		let dy = this.dy;		let f = layer.fraction;		layer.translation = { x: 0 - (f * dx), y: 0 - (f * dy) };	}}

class CollagePictureBehavior extends Behavior {  	onCreate(picture, $) {		picture.aspect = "draw";		picture.url = $.uri;		customEffectIndex++;		if (customEffectIndex > 2)			customEffectIndex = 0;		picture.effect = customEffects[customEffectIndex];	}  	onLoaded(picture) {		model.data.radio.COLLAGE.delegate("onLoaded");	}}

class CollageTransition extends Transition {	constructor(duration) {		if (!duration) duration = 1000;		super(duration);	}	onBegin(container, content, picture) {		let srcWidth = picture.width;		let srcHeight = picture.height;		let dstWidth = application.width;		let dstHeight = application.height;		let srcRatio = srcWidth / srcHeight;		let dstRatio = dstWidth / dstHeight;		let scale, dx, dy;		if (srcRatio > dstRatio) {			scale = dstHeight / srcHeight;			dx = Math.round(srcWidth * scale) - dstWidth;			dy = 0;		}		else {			scale = dstWidth / srcWidth;			dx = 0;			dy =  Math.round(srcHeight * scale) - dstHeight;		}		picture.scale = { x: scale, y: scale };		container.add(picture);		let layer = this.layer = new Layer({ alpha: false });		layer.capture(picture, 0, 0, dstWidth + dx, dstHeight + dy);		let coordinates = layer.coordinates;		layer.behavior = new CollageLayerBehavior(layer, { dx: dx, dy: dy });		container.replace(picture, layer);		picture.url = null;		layer.start();	}	onEnd(container, content, picture) {		container.remove(content);	}	onStep(fraction) {		this.layer.opacity = Math.quadEaseOut(fraction);	}}


let RadioBehaviors = new Array(6);RadioBehaviors[0] = class extends Behavior {  	onCreate(container, $) {		let data = this.data = $.radio;		data.running = true;        this.publishedIndex = undefined;	}  	onChannelChanged(container, index) {		let data = this.data;		if (data.index != index) {			data.artist = "";			data.busy = true;			data.index = index;			data.title = "";			model.savePreferences();			container.distribute("onBusyChanged");			let url = Message.URI('/getAudioMedia?id=' + channels[index].id);			if (container.first.url != url) container.first.url = url;            if (index != this.publishedIndex) {            	this.publishedIndex = index;                model.pubnub.publish({                	channel : PUBNUB_CHANNEL,                	message : channels[index].id ? channels[index].id : "off"                });			}		}	}  	onChannelChanging(container, index) {		if (index != this.publishedIndex) {       		this.publishedIndex = index;            
            if (USE_PUBNUB) {
	            this.pubnub.publish({	            	channel : PUBNUB_CHANNEL,	            	message : channels[index].id ? channels[index].id : "off"	            });
            }			// start channel change before UI settles, to maximize responsiveness			this.onChannelChanged(container, index);		}	}  	onDisplaying(container) {
  		if (USE_PUBNUB) {			this.pubnub = PUBNUB.init({				publish_key: PUBNUB_PUBLISH_KEY,				subscribe_key: PUBNUB_SUBSCRIBE_KEY			});			this.pubnub.subscribe({				channel : PUBNUB_CHANNEL,				message : function(message, env, channel) {					trace("PubNub message received: " + JSON.stringify(message) + "\n");				},			 });
		 }	}}RadioBehaviors[1] = class extends Behavior {  	onCreate(media, $) {		this.data = $;		media.url = Message.URI('/getAudioMedia?id=' + channels[$.index].id);	}  	onLoaded(media) {		let data = this.data;		media.start();		media.volume = data.running ? data.volume : 0;	}  	onMetadataChanged(media) {		let data = this.data;		data.title = media.title;		data.artist = media.artist;		application.distribute("onSongChanged");	}  	onStateChanged(media) {		let data = this.data;		switch (media.state) {		case Media.FAILED:			data.busy = true;			break;		case Media.PAUSED:			data.busy = false;			break;		case Media.PLAYING:			data.busy = false;			break;		case Media.WAITING:			data.busy = true;			break;		}		application.distribute("onBusyChanged");	}  	onVolumeChanged(media, $) {		media.volume = $.volume;	}  	onChannelChanging(media, index) {		if (index == (channels.length - 1)) media.stop();	}}RadioBehaviors[2] = class extends Behavior {  	draw(canvas) {		let ctx = canvas.getContext("2d");		ctx.clearRect(0, 0, canvas.width, canvas.height);		ctx.fillStyle = "white";		let x = this.index;		for (let i = 0; i < 16; i++) {			let r = (x < 160) ? x * 16 / 160 : 16 - ((x - 160) * 16 / 160);			ctx.beginPath();			ctx.arc(x + r, 20, r, 0, 2 * Math.PI);			ctx.closePath();			ctx.fill();			x += (2 * r) + 8;		}	}  	onBusyChanged(canvas) {		let busy = this.data.busy;		canvas.visible = busy;		if (busy) canvas.start();		else canvas.stop();	}  	onCreate(canvas, $) {		this.data = $;		this.index = 15;		this.draw(canvas);		this.onBusyChanged(canvas);	}  	onDisplaying(canvas) {		canvas.interval = 25;		canvas.start();	}  	onTimeChanged(canvas) {		let index = this.index - 1;		if (index < 0) index = 15;		this.index = index;		this.draw(canvas);	}}RadioBehaviors[3] = class extends Behavior {  	onBusyChanged(scroller) {		scroller.visible = !this.data.busy;		this.tick(scroller)	}  	onCreate(scroller, $) {		this.data = $;	}  	onDisplaying(scroller) {		this.onBusyChanged(scroller);		this.onSongChanged(scroller);	}  	onSongChanged(scroller) {		let title = this.data.title;		let artist = this.data.artist;		if (artist) title += " - " + artist;		scroller.first.string = " " + title + " ";		this.tick(scroller)	}  	onTimeChanged(scroller) {		scroller.scrollBy(1, 0);	}  	tick(scroller) {		scroller.interval = 25;		if (scroller.visible && (scroller.width < scroller.first.width))			scroller.start();		else			scroller.stop();	}}RadioBehaviors[4] = class extends Behavior{  	onNFCTokenChanged(label, token) {		label.string = token;	}}RadioBehaviors[5] = class extends ButtonBehavior {  	onTap(container) {		let data = {			button: container,			label: "Volume",		};		model.dialog = new VolumeDialogBox(data);		application.run(new MenuOpenTransition, model.dialog, container);	}  	onVolumeChanged(container, $) {		container.first.variant = Math.min(Math.floor(4 * ($.volume - $.volumeMinimum) / ($.volumeMaximum - $.volumeMinimum)), 3);	}} 

export var Radio = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: RadioBehaviors[0], 
	contents: [	 	(function($, $$) { return [	 		Media($, { width: 0, height: 0, Behavior: RadioBehaviors[1], }),	 		Collage($, { anchor: 'COLLAGE', }),	 		Tuner($, { anchor: 'TUNER', }),	  		Canvas($, { 
	  			left: 0, width: 320, top: 0, height: 40, active: true, 
	  			Behavior: RadioBehaviors[2], 
	  		}),	  		Scroller($, { 
	  			left: 0, right: 0, top: 0, height: 40, 
	  			active: true, visible: false, clip: true, 
	  			Behavior: RadioBehaviors[3],
	  			contents: [	  				Label($, { style: radioTitleStyle, }),				], 
				loop: true, 
			}),	  		Label($, { 
	  			left: 0, height: 40, bottom: 0, style: nfcTokenStyle, 
	  			Behavior: RadioBehaviors[4], 
	  			string: '[...]', 
	  		}),	  		Label($, { height: 40, bottom: 0, style: radioTitleStyle, string: 'SOMA FM', }),	  		Container($, { 
	  			width: 40, right: 0, height: 40, bottom: 0, active: true, 
	  			Behavior: RadioBehaviors[5], 
	  			contents: [	  				Content($, { width: 60, height: 60, skin: speakerSkin, variant: Math.min(Math.floor(4 * ($.volume - $.volumeMinimum) / ($.volumeMaximum - $.volumeMinimum)), 3), }),				]
			}),		]})($.radio, $), 	]
}));