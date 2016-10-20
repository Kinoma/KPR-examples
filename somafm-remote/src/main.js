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

NOTE:

The web service at http://k3.cloud.kinoma.com/api is operated by the Kinoma team for making music prototypes.
It is not for commercial or large scale use. It may be modified or discontinued without notice.
*/

import channels from 'settings';
import THEME from 'mobile/theme';
import CONTROL from 'mobile/control';
import DIALOG from 'mobile/dialog';
//import LOCALE from 'locale';
import KEYBOARD from 'mobile/keyboard';
import MODEL from 'mobile/model';
import SCREEN from 'mobile/screen';
import SCROLLER from 'mobile/scroller';
import TOOL from 'mobile/tool';
import TRANSITION from 'mobile/transition';

/* =-====================================================================-= */
/* =-===================== SKINS, STYLES, & TEXTURES ====================-= */
/* =-====================================================================-= */

let browseSelectedEffect = new Effect();
browseSelectedEffect.colorize('#5eccf1', 1);
let playerDisabledEffect = new Effect();
playerDisabledEffect.colorize('#515153', 1);
let channelTickSkin;
let radioChannelStyle;
application.style = new Style({ color: 'black', font: '18px Fira Sans', horizontal: 'left', vertical: 'middle', });;

let radioTitleStyle = new Style({  font: '32px Fira Sans Light', horizontal: 'center', vertical: 'middle', });
let radioFooterStyle = new Style({  font: '40px Fira Sans Light', horizontal: 'center', vertical: 'middle', });
let speakerTexture = (screenScale == 2) ? new Texture('./assets/speaker.png', 2) : (screenScale == 1.5) ? new Texture('./assets/speaker.png', 2) : new Texture('./assets/speaker.png', 2);
let speakerSkin = new CONTROL.DynamicSkin(speakerTexture, playerDisabledEffect, THEME.toolEnabledEffect, browseSelectedEffect);
let sliderLabelStyle = new Style({ color: 'white', font: 'bold 32px', horizontal: 'center', vertical: 'null', });
let sliderValueStyle = new Style({ color: 'white', font: 'bold 32px', horizontal: 'center', vertical: 'null', });
let sliderLeftStyle = new Style({ color: 'white', font: '32px', horizontal: 'left', vertical: 'null', left: 4, });
let sliderRightStyle = new Style({ color: 'white', font: '32px', horizontal: 'right', vertical: 'null', right: 4, });
let targetItemSkin = new Skin({ fill: ['white', '#73dfff'], });
let targetItemStyle = new Style({ color: '#333333', font: '24px', horizontal: 'left', vertical: 'middle', left: 8, top: 8, bottom: 8, });
let targetSearchingStyle = new Style({ color: '#96969a', font: '24px', horizontal: 'left', vertical: 'middle', left: 8, top: 8, bottom: 8, });
let marksTexture = (screenScale == 2) ? new Texture('./assets/marks.png', 2) : (screenScale == 1.5) ? new Texture('./assets/marks.png', 2) : new Texture('./assets/marks.png', 2);
let targetItemCheckMarkSkin = new Skin({ texture: marksTexture, width: 40, height: 40, });
let targetDialogArrowSkin = new Skin({ texture: marksTexture, x: 50, width: 20, height: 10, });
let dlnaIconSkin = new Skin({ texture: marksTexture, x: 80, width: 40, height: 40, });
let dialTexture = (screenScale == 2) ? new Texture('./assets/dial.png', 2) : (screenScale == 1.5) ? new Texture('./assets/dial.png', 2) : new Texture('./assets/dial.png', 2);
let dialSkin = new Skin({ texture: dialTexture, y: -40, width: 60, height: 40, variants: 60, states: 40, });


/* =-====================================================================-= */
/* =-============================ HANDLERS ==============================-= */
/* =-====================================================================-= */

Handler.bind("/dial", {
	onComplete: function(handler, message, document) {
		let device = parseQuery(handler.message.query);
		device.applicationURL = message.getResponseHeader("Application-URL") + "somafmplayer.example.kinoma.marvell.com";
		device.friendlyName = document.getElementsByTagName("friendlyName").item(0).firstChild.value;
		let element = document.getElementsByTagName("icon").item(0);
		if (element) device.iconURL = mergeURI(device.url, element.getElement("url"));
		application.invoke(new Message("/dial/SomaFM?" + serializeQuery(device)));
	},
	onInvoke: function(handler, message) {
		let server = parseQuery(message.query);
		let msg = new Message(server.url)
		handler.invoke(msg, Message.DOM);
	}
});

Handler.bind("/dial/SomaFM", {
	onComplete: function(handler, message, document) {
		let device = parseQuery(handler.message.query);
		if (message.status == 200) { // check if device supports SomaFM application
			device.applicationURL = message.url;
			let elements = document.getElementsByTagName("link");
			let c = elements.length;
			for (let i = 0; i < c; i++) {
				let element = elements.item(i);
				if ("run" == element.getAttribute("rel")) {
					device.quitURL = device.applicationURL + "/" + element.getAttribute("href");
					break;
				}
			}
			model.devices.push(device);
			application.distribute("onDevicesChanged", model.devices);
		}
	},
	onInvoke: function(handler, message) {
		let device = parseQuery(message.query);
		let msg = new Message(device.applicationURL)
		handler.invoke(msg, Message.DOM);
	}
});

Handler.bind("/dial/SomaFM/run", {
	onComplete: function(handler, message, document) {
		if (message.status == 201) { // check if device supports SomaFM application
			let device = null;
			let applicationURL = message.url;
			model.devices.some(function(item, index, array) {
				if ("applicationURL" in item) {
					if (applicationURL == item.applicationURL) {
						device = item;
						device.quitURL = message.getResponseHeader("LOCATION");
						return true;
					}
				}
			});
		}
	},
	onInvoke: function(handler, message) {
		let string = message.query;
		let msg = new Message(model.currentDevice.applicationURL);
		msg.requestText = string;
		msg.method = "POST";
		msg.setRequestHeader("Content-Type", "text/plain");
		msg.setRequestHeader("Content-Length", string.length);
		handler.invoke(msg, Message.TEXT);
	},
});

Handler.bind("/getAudioMedia", {
	onComplete: function(handler, message, text) {
		let value;
		let lines = text.split("\n");
		let c = lines.length;
		if (lines[0] == "[playlist]") {
			for (let i = 1; i < c; i++) {
				let pair = lines[i].split("=");
				if (pair.length == 2) {
					let name = pair[0].toLowerCase();
					if (name.indexOf("file") == 0) {
						value = pair[1];
						break;
					}
				}
			}
		}
		if (value) handler.redirect(value, "audio/mpeg");
	},
	onInvoke: function(handler, message) {
		let query = parseQuery(message.query);
		let msg = new Message("http://somafm.com/" + query.id + ".pls");
		handler.invoke(msg, Message.TEXT);
	}
});

Handler.bind("/getImages", {
	onComplete: function(handler, message, json) {
		if (json && (true == json.result.success)) {
			handler.message.setResponseHeader("Content-Type", "text/plain");
			handler.message.responseText = JSON.stringify(json.result);
		}
	},
	onInvoke: function(handler, message) {
		let query = parseQuery(message.query);
		let msg = new Message("http://k3.cloud.kinoma.com/api");
		msg.method = "POST";
		let transaction = {
			"action": "Artist",
			"method": "getImages",
			"data": {
				"artistName": query.artist,
				"albumName": query.album,
				"screenWidth": query.width,
				"screenHeight": query.height,
				"screenMode": "max",
				"shuffle": false,
				"limit": 30
			}
		};
		let body = JSON.stringify(transaction);
		msg.requestText = body;
		msg.setRequestHeader("Content-Length", body.length);
		handler.invoke(msg, Message.JSON);
	}
});

/* =-====================================================================-= */
/* =-========================== UI TEMPLATES ============================-= */
/* =-====================================================================-= */

let DeviceItemLine = Line.template( $ => ( { left: 0, right: 0, active: true, skin: targetItemSkin, Behavior: DeviceItemLineBehavior,
	contents: [
		Content($, { width: 2, height: 40 }),
		Container($, { width: 40, height: 40,
			contents: [
				Thumbnail($, { width: 40, height: 40, Behavior: DeviceItemLineBehavior, url: $.iconURL })
			]
		}),
		Text($, { left: 0, right: 0, style: targetItemStyle, string: $.friendlyName }),
		Content($, { width: 40, height: 40, visible: $.uuid == model.currentDevice.uuid, skin: targetItemCheckMarkSkin })
	],
}));

class DeviceItemLineBehavior extends SCREEN.ListItemBehavior{
	onTap(line) {
		model.selectDevice(this.data.uuid);
		line.bubble("onCancel");
	}
	onTouchEnded(line, id, x, y, ticks) {
		super.onTouchEnded(line, id, x, y, ticks);
		this.onTouchCancelled(line, id, x, y, ticks);
	}
}

let DevicesSearchingGlyph = Container.template( $ => ( { width: 40, height: 40,
	contents: [
		Picture($, { width: 200, height: 200,
			Behavior: class extends Behavior{
				onCreate(picture) {
					picture.opacity = 0.66;
					picture.origin = { x:100, y:100 };
					picture.scale = { x:0.2, y:0.2 };
				}
				onDisplaying(picture) {
					picture.start();
				}
				onTimeChanged(picture) {
					let rotation = picture.rotation;
					rotation += 1;
					if (rotation > 360) rotation = 0;
					picture.rotation = rotation;
				}
			},
			url: './assets/searching.png'
		})
	]
}));

let DevicesSearchingLine = Line.template( $ => ( { left: 0, right: 0, Behavior: DevicesSearchingLineBehavior,
	contents: [
		DevicesSearchingGlyph($, { }),
		Text($, { left: 0, right: 0, style: targetSearchingStyle })
	]
}));

class DevicesSearchingLineBehavior extends SCREEN.ListItemBehavior{
	onCreate(container) {
		this.onNetworkConfigurationChanged(container);
	}
	onNetworkConfigurationChanged(container) {
		let text = container.last;
		if (model.localNetworkCount) {
			let ssid = system.SSID;
			if (ssid)
				text.string = "Searching on “" + ssid + "”...";
			else
				text.string = "Searching...";
		}
		else {
			text.string = "Searching...";
		}
	}
	onTouchEnded(line, id, x, y, ticks) {
		line.bubble("onCancel");
	}
}

let DevicesScroller = Scroller.template( $ => ( { left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.whiteSkin, Behavior: SCROLLER.VerticalScrollerBehavior,
	clip: true,
	contents: [
		Column($, { left: 0, right: 0, top: 0,
			contents: [
				(model.devices) ? model.devices.map(function($) { let $$ = this; return [
					DeviceItemLine($, { }),
				]}, $) : null,
				DevicesSearchingLine($, { active: true })
			]
		})
	]
}));

let DevicesDialogBox = Container.template( $ => ( { left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.cancellerSkin,
	Behavior: class extends Behavior{
		onTouchEnded(container, id, x, y, ticks) {
			let layout = container.first;
			if (!layout.hit(x, y)) layout.behavior.onCancel(layout);
		}
	},
	contents: [
		Container($, { left: 10, width: 240, bottom: 60, skin: THEME.dialogBoxSkin,
			Behavior: class extends Behavior{
				onCancel(layout) {
					application.run(new THEME.MenuCloseTransition, application.last, this.data.button);
					model.dialog = null;
				}
				onCreate(layout, data) {
					this.data = data;
				}
				onDevicesChanged(layout, devices) {
					layout.replace(layout.first, new DevicesScroller(this.data));
				}
				onDisplaying(layout) {
					this.former = layout.focus();
				}
				onKeyDown(layout, key, repeat, ticks) {
					return true;
				}
				onKeyUp(layout, key, repeat, ticks) {
					let code = key.charCodeAt(0);
					if ((code == 8) || (code == 0xF0001))
						this.onCancel(layout);
					return true;
				}
				onUndisplayed(layout) {
					if (this.former)
						this.former.focus();
				}
			},
			contents: [
				DevicesScroller($, { }),
				Content($, { left: 20, bottom: -10, skin: targetDialogArrowSkin, })
			]
		})
	]
}));

let PlayerVolumeDialogBox = Container.template( $ => ( { left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.cancellerSkin, Behavior: VolumeDialogBoxBehavior,
	contents: [
		Container($, { left: 0, right: 0, height: 95,
			contents: [
				Label($, { left: 0, right: 0, top: 0, style: sliderLabelStyle, string: 'Volume' }),
				Label($, { left: 0, right: 0, top: 15, style: sliderLeftStyle, string: 'Low' }),
				Label($, { left: 0, right: 0, top: 15, style: sliderRightStyle, string: 'High' }),
				Label($, { left: 0, right: 0, bottom: 5, style: sliderValueStyle }),
				Canvas($, { left: 0, right: 0, top: 15, bottom: 0, active: true, Behavior: VolumeDialogBoxSliderBehavior })
			]
		})
	]
}));

class VolumeDialogBoxBehavior extends Behavior{
  	onCancel(container) {
		this.former.focus();
		model.dialog = null;
		application.run(new TRANSITION.MenuCloseTransition, container, this.data.button);
	}
  	onCreate(container, data) {
		this.data = data;
	}
  	onDisplaying(container) {
		this.former = container.focus();
	}
  	onKeyDown(container, key, repeat, ticks) {
		let code = key.charCodeAt(0);
		if ((code == 8) || (code == 0xF0001)) {
			this.onCancel(container);
			return true;
		}
	}
  	onTouchEnded(container, id, x, y, ticks) {
		this.onCancel(container);
	}
}

class VolumeDialogBoxSliderBehavior extends CONTROL.SliderBehavior {
  	draw(canvas) {
		let size = canvas.width;
		let offset = this.getOffset(canvas, size);
		let x = canvas.width >> 1;
		let y = canvas.height >> 1;
		let w = 20;
		let a = Math.atan2(y, x);
		let r = ((x * x) + (y * y)) / y;
		let from = 0 - a - (Math.PI / 2);
		let to = a - (Math.PI / 2);
		y = r + ((y + w) >> 1);
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = w;
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.arc(x, y, r, from, to);
		ctx.stroke();
		ctx.strokeStyle = "#acd473";
		ctx.beginPath();
		ctx.arc(x, y, r, from, from + ((to - from) * offset / size));
		ctx.stroke();
	}
  	getMax(container) {
		return model.data.radio.volumeMaximum;
	}
  	getMin(container) {
		return model.data.radio.volumeMinimum;
	}
  	getValue(container) {
		return model.data.radio.volume;
	}
  	onDisplaying(canvas) {
		this.draw(canvas);
	}
  	onTouchBegan(container, id, x, y, ticks) {
		container.captureTouch(id, x, y, ticks);
		this.onTouchMoved(container, id, x, y, ticks);
	}
  	onTouchEnded(container, id, x, y, ticks) {
		model.savePreferences();
	}
  	onTouchMoved(canvas, id, x, y, ticks) {
		let size = canvas.width;
		let offset = (x - canvas.x);
		this.setOffset(canvas, size, offset);
		this.onValueChanged(canvas);
	}
  	onValueChanged(container) {
		this.draw(container);
		let min = this.getMin(container);
		let max = this.getMax(container);
		let value = this.getValue(container);
		container.previous.string = (container.active)? Math.round(100 * (value - min) / (max - min)) + "%" : "";
	}
  	onVolumeChanged(container, $) {
		this.onValueChanged(container);
	}
  	setValue(container, value) {
		model.data.radio.volume = value;
		application.distribute("onVolumeChanged", model.data.radio);
	}
}

let PlayerVolumeControl = Container.template( $ => ( { width: 60, height: 60, contents: [
	(function($, $$) { return [
		Container($, { width: 60, height: 60, active: model.canSetVolume(), Behavior: PlayerVolumeControlBehavior, contents: [
			Content($, { width: 60, height: 60, skin: speakerSkin, variant: Math.min(Math.floor(4 * ($.volume - $.volumeMinimum) / ($.volumeMaximum - $.volumeMinimum)), 3), }),
		], }),
	]})(model.data.radio, $),
], }));

class PlayerVolumeControlBehavior extends CONTROL.ButtonBehavior{
	onTap(container) {
		let data = {
			button: container,
			label: "Volume",
		};
		model.dialog = new PlayerVolumeDialogBox(data);
		application.run(new MenuOpenTransition, model.dialog, container);
	}
	onVolumeChanged(container, $) {
		container.active = model.canSetVolume();
		container.first.variant = Math.min(Math.floor(4 * ($.volume - $.volumeMinimum) / ($.volumeMaximum - $.volumeMinimum)), 3);
	}
}
 class MenuOpenTransition extends Transition{
	 constructor(duration){
		if (!duration) duration = 250;
	 	super(duration);
	 }
	 onBegin(container, content, button) {
 			container.add(content);
 			this.canceller = content;
 			let layer = this.layer = new Layer({alpha: true});
 			layer.attach(content.first);
 			if (!button)
 				button = container;
 			this.translation = {
 				x: button.x + (button.width / 2) - layer.x,
 				y: button.y + (button.height / 2) - layer.y,
 			};
 		}
 		onEnd(container, content) {
 			this.layer.detach();
 		}
 		onStep(fraction) {
 			this.layer.scale = { x: fraction, y: fraction };
 			this.layer.translation = { x: this.translation.x * (1 - fraction), y: this.translation.y * (1 - Math.quadEaseIn(fraction)) };
 			this.canceller.state = fraction;
 		}
 }

class MenuCloseTransition extends Transition {
	constructor(duration){
		if (!duration) duration = 250;
		super(duration);
	}
	onBegin(container, content, button) {
			this.canceller = content;
			let layer = this.layer = new Layer({alpha: true});
			layer.attach(content.first);
			layer.opacity = 1;
			if (!button)
				button = container;
			this.translation = {
				x: button.x + (button.width / 2) - layer.x,
				y: button.y + (button.height / 2) - layer.y,
			};
	}
	onEnd(container, content) {
		this.layer.detach();
		container.remove(content);
	}
	onStep(fraction) {
		fraction = Math.quadEaseOut(fraction);
		this.layer.scale = { x: 1 - fraction, y: 1 - fraction };
		this.layer.translation = { x: this.translation.x * fraction, y: this.translation.y * fraction };
		this.canceller.state = 1 - fraction;
	}
}

let customEffectIndex = 0;

let Radio = Container.template( $ => ( { left: 0, right: 0, top: 0, bottom: 0, skin: $.radio.theme.skin, style: $.radio.theme.style,
	behavior: class extends Behavior{
		onAdapt(container) {
			let data = this.data;
			delete data.IMAGE
			let collage = new Collage(data);
			container.replace(data.COLLAGE, collage);
			data.COLLAGE = collage;
			let tuner = new Tuner(data);
			container.replace(data.TUNER, tuner);
			data.TUNER = tuner;
			let header = new Header(data);
			container.replace(data.HEADER, header);
			data.HEADER = header;
			let footer = new Footer(data);
			container.replace(data.FOOTER, footer);
			data.FOOTER = footer;
		}
		onCreate(container, $) {
			container.duration = 30000;
			let data = this.data = $.radio;
			data.running = true;
		}
		onChannelChanged(container, index) {
			let data = this.data;
			if (data.index != index) {
				data.artist = "";
				data.busy = true;
				data.index = index;
				data.title = "";
				model.savePreferences();
				container.distribute("onBusyChanged");
				container.distribute("onSongChanged");
				container.first.url = Message.URI('/getAudioMedia?id=' + channels[index].id);
			}
		}
		onDisplayed(container) {
			container.focus();
			container.start();
		}
		onFinished(container) {
			//if (this.data.TUNER.visible)
					//	this.toggle(container);
		}
		toggle(container) {
			let tuner = this.data.TUNER;
			if (tuner.visible) container.run(new HideTunerTransition, tuner);
			else container.run(new ShowTunerTransition, tuner);
		}
	},
	contents: [
		(function($, $$) { return [
			Media($, { width: 0, height: 0,
				Behavior: class extends Behavior{
					onCreate(media, $) {
						this.data = $;
						media.url = Message.URI('/getAudioMedia?id=' + channels[$.index].id);
					}
					onDeviceChanged(media, volume) {
						let data = this.data;
						media.volume = data.mute ? 0 : data.volume;
					}
					onLoaded(media) {
						let data = this.data;
						media.start();
						media.volume = data.mute ? 0 : data.volume;
					}
					onMetadataChanged(media) {
						let data = this.data;
						data.title = media.title;
						data.artist = media.artist;
						media.container.distribute("onSongChanged");
					}
					onStateChanged(media) {
						let data = this.data;
						switch (media.state) {
						case Media.FAILED:
							data.busy = true;
							break;
						case Media.PAUSED:
							data.busy = false;
							break;
						case Media.PLAYING:
							data.busy = false;
							break;
						case Media.WAITING:
							data.busy = true;
							break;
						}
						media.container.distribute("onBusyChanged");
					}
					onVolumeChanged(media, volume) {
						let data = this.data;
						media.volume = data.mute ? 0 : data.volume;
					}
				},
			}),
			Collage($, { anchor: 'COLLAGE', }),
			Tuner($, { anchor: 'TUNER', }),
			Header($, { anchor: 'HEADER', }),
			Footer($, { anchor: 'FOOTER', })
		]})($.radio, $),
	]
}));

let Header = Container.template( $ => ( { left: 0, right: 0, top: -5, bottom: 0, contents: [
	Canvas($, { left: 0, width: $.width, top: 10, height: 40, active: true,
		Behavior: class extends Behavior{
			draw(canvas) {
				let theme = this.data.theme;
				let ctx = canvas.getContext("2d");
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = "#c0ffffff";
				let x = this.index;
				let width = canvas.width;
				let halfWidth = width >> 1;
				let halfHeight = canvas.height >> 1;
				while (x < halfWidth) {
					let r = x * halfHeight / halfWidth;
					ctx.beginPath();
					ctx.arc(x + r, halfHeight, r, 0, 2 * Math.PI);
					ctx.closePath();
					ctx.fill();
					x += (2 * r) + 8;
				}
				while (x < width) {
					let r = halfHeight  * (1 - ((x - halfWidth) / halfWidth));
					ctx.beginPath();
					ctx.arc(x + r, halfHeight, r, 0, 2 * Math.PI);
					ctx.closePath();
					ctx.fill();
					x += (2 * r) + 8;
				}
			}
			onBusyChanged(canvas) {
				let busy = this.data.busy;
				canvas.visible = busy;
				if (busy) canvas.start();
				else canvas.stop();
			}
			onCreate(canvas, $) {
				this.data = $;
				this.count = 40;
				this.index = this.count - 1;
				this.draw(canvas);
				this.onBusyChanged(canvas);
			}
			onDisplaying(canvas) {
				canvas.interval = 25;
				canvas.start();
			}
			onTimeChanged(canvas) {
				let index = this.index - 1;
				if (index < 0) index = this.count - 1;
				this.index = index;
				this.draw(canvas);
			}
		}
	}),
	Scroller($, { left: 0, right: 0, top: 0, height: 60, active: true, visible: false,
		Behavior: class extends Behavior{
			onBusyChanged(scroller) {
				scroller.visible = !this.data.busy;
				this.tick(scroller)
			}
			onCreate(scroller, $) {
				this.data = $;
			}
			onDisplaying(scroller) {
				this.onBusyChanged(scroller);
							this.onSongChanged(scroller);
			}
			onDisplayed(scroller) {
				this.tick(scroller)
			}
			onSongChanged(scroller) {
				let title = this.data.title;
				let artist = this.data.artist;
				if (artist) title += " - " + artist;
				scroller.first.string = " " + title + " ";
				this.tick(scroller)
			}
			onTimeChanged(scroller) {
				scroller.scrollBy(1, 0);
			}
			tick(scroller) {
				scroller.interval = 25;
				if (scroller.visible && (scroller.width < scroller.first.width)) scroller.start();
				else scroller.stop();
			}
		},
		clip: true,
		contents: [
		Label($, { style: radioTitleStyle, }),
	], loop: true, }),
], }));

class FooterBehavior extends CONTROL.ButtonBehavior{
	onDeviceChanged(container) {
		container.first.variant = model.currentDevice == model.localDevice ? 0 : 1;
	}
	onTap(container) {
		let data = {
			button: container,
			scroll: {
				x: 0,
				y: 0
			},
			selection: -1,
		};
		model.dialog = new DevicesDialogBox(data);
		application.run(new THEME.MenuOpenTransition, model.dialog, container);
	}
}

let Footer = Container.template( $ => ( { left: 0, right: 0, top: 0, bottom: -5,
	contents: [
		Container($, { left: 0, width: 80, height: 60, bottom: 0, active: true, Behavior: FooterBehavior,
			contents: [
				Content($, { left: 10, bottom: 10, skin: dialSkin })
			]
		}),
		Label($, { height: 60, bottom: 0, style: radioFooterStyle, string: 'SOMA FM' }),
		PlayerVolumeControl($, { right: 0, bottom: 0 })
	]
}));

let Tuner = Container.template( $ => ( { left: 0, right: 0, top: 0, bottom: 0,
	contents: [
		Scroller($, { left: 0, right: 0, height: $.height, active: true, Behavior: TunerScrollerBehavior, clip: true,
			contents: [
				Layout($, { left: 0, height: $.height, Behavior: TunerLayoutBehavior,
					contents: [
						Content($, { left: 0 - $.width, right: 0 - $.width, height: $.tickSize, skin: channelTickSkin }),
						(channels) ? channels.map(function($) { let $$ = this; return [
							Container($, { contents: [
								Label($, { style: radioChannelStyle, string: $.title }),
								Content($, { skin: $$.theme.barSkin })
							]}),
						]}, $) : null,
					],
				}),
				Canvas($, { width: $.dotSize, height: $.dotSize, Behavior: TunerCanvasBehavior })
			]
		})
	]
}));

class TunerScrollerBehavior extends SCROLLER.HorizontalScrollerBehavior{
	onCreate(scroller, $) {
		super.onCreate(scroller, $);
		this.index = $.index;
	}
	anAdapt(scroller, width, height) {
		scroller.height = height;
	}
	onDisplaying(scroller) {
		super.onDisplaying(scroller);
		scroller.scroll = { x:channels[this.index].offset - (scroller.width >> 1), y:0 };
	}
	onScrolled(scroller) {
		if (!scroller.tracking) scroller.bubble("onChannelChanged", this.index);
	}
	snap(scroller, position, direction) {
		let c = channels.length;
		let delta = application.width >> 1
		position += delta;
		let left = channels[0].offset;
		if (position < left) {
			this.index = 0;
			return left - delta;
		}
		let right;
		for (let i = 1; i < c; i++) {
			right = channels[i].offset;
			if (position < right) {
				if (position - left < right - position) {
					this.index = i - 1;
					return left - delta;
				}
				this.index = i;
				return right - delta;
			}
			left = right;
		}
		this.index = c - 1;
		return right - delta;
	}
}
class TunerLayoutBehavior extends Behavior{
	onCreate(layout, data) {
		this.data = data;
	}
	onMeasureHorizontally(layout, width) {
		let container = layout.first.next;
		let $ = model.data.radio;
		let i = 0;

		let delta = $.width >> 1
		let barHeight = $.barHeight;
		let barY = Math.round((($.height + $.tickSize) / 2) - barHeight);

		let labelHeight = $.labelHeight;
		let labelY = barY - labelHeight;

		let bottomCoordinates = { left:0, width:0, height:$.height, bottom:0 };
		let bottomLabelCoordinates = { left:0, right:0, height:labelHeight, bottom:labelY };
		let bottomBarCoordinates = { left:0, width:$.barWidth, height:barHeight, bottom:barY };
		let topCoordinates = { left:0, width:0, top:0, height:$.height };
		let topLabelCoordinates = { left:0, right:0, top:labelY, height:labelHeight, };
		let topBarCoordinates = { left:0, width:$.barWidth, top:barY, height:barHeight };
		let half;
		while (container) {
			let channel = channels[i];
			let size = radioChannelStyle.measure(channel.title);
			let width = size.width;
			half = width >> 1;
			if (i == 0) {
				bottomCoordinates.left = delta - half;
				topCoordinates.left = delta - half;
			}
			if (i % 2) {
				bottomCoordinates.width = width;
				container.coordinates = bottomCoordinates;
				container.first.coordinates = bottomLabelCoordinates;
				bottomBarCoordinates.left = half - ((bottomCoordinates.left + half) % 5);
				container.last.coordinates = bottomBarCoordinates;
				channel.offset = bottomCoordinates.left + bottomBarCoordinates.left + 1;
				bottomCoordinates.left += width;
			}
			else {
				topCoordinates.width = width;
				container.coordinates = topCoordinates;
				container.first.coordinates = topLabelCoordinates;
				topBarCoordinates.left = half - ((topCoordinates.left + half) % 5);
				container.last.coordinates = topBarCoordinates;
				channel.offset = topCoordinates.left + topBarCoordinates.left;
				topCoordinates.left += width;
			}
			container = container.next;
			i++;
		}
		bottomCoordinates.left += delta - half;
		topCoordinates.left += delta - half;
		return Math.max(bottomCoordinates.left, topCoordinates.left);
	}
}
class TunerCanvasBehavior extends Behavior{
	draw(canvas) {
		let data = this.data;
		let theme = data.theme;
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		let radius = canvas.width >> 1;
		let lineWidth = data.dotThickness;
		ctx.beginPath();
		ctx.arc(radius, radius, radius - lineWidth, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.lineWidth = lineWidth;
		ctx.fillStyle = theme.backgroundColor;
		ctx.fill();
		ctx.strokeStyle = theme.foregroundColor;
		ctx.stroke();
	}
	onCreate(canvas, $) {
		this.data = $;
		this.draw(canvas);
	}
}
let Collage = Container.template( $ => ( { left: 0, right: 0, top: 0, bottom: 0,
	Behavior: class extends Behavior{
		doBrowse(container, delta) {
			let c = this.images.length;
			let i = this.index + delta;
			if (c) {
			if (i >= c) i = 0;
				this.index = i;
				this.loading = true;
				let picture = new Picture({ left:0, top:0 });
				picture.behavior = new CollagePictureBehavior(picture, this.images[i], this.data.theme);
				this.data.IMAGE = picture;
			}
			else this.data.IMAGE = null;
		}
		onComplete(container, message, json) {
			if (json && ("result" in json) && ("images" in json.result) && json.result.images.length) this.images = json.result.images;
			else this.images = this.defaultImages;
			container.stop();
			this.index = 0;
			this.doBrowse(container, 0);
		}
		onCreate(container, $) {
			this.data = $;
			container.duration = 9000;
			this.defaultImages = this.images = [ {uri: mergeURI(application.url, "./assets/default0.jpg") } ];
			this.index = 0;
			this.doBrowse(container, 0);
			this.onSongChanged(container);
		}
		onFinished(container) {
			if (!this.loading) container.run(new CollageTransition, container.first, this.data.IMAGE);
		}
		onLoaded(container) {
			if (this.data.IMAGE.ready) {
				this.loading = false;
				if (!container.transitioning && !container.running)
					container.run(new CollageTransition, container.first, this.data.IMAGE);
			}
			else this.doBrowse(container, 1);
		}
		onSongChanged(container) {
			let artist = this.data.artist;
			let title = this.data.title;
			if (artist && title) {
				let message = new Message("http://k3.cloud.kinoma.com/api");
				message.method = "POST";
				let transaction = {
					"action": "Artist",
					"method": "getImages",
					"data": {
						"artistName": artist,
						"albumName": title,
						"screenWidth": application.width,
						"screenHeight": application.height,
						"screenMode": "max",
						"shuffle": false,
						"limit": 30
					}
				}
				let body = JSON.stringify(transaction);
				message.requestText = body;
				message.setRequestHeader("Content-Length", body.length);
				container.invoke(message, Message.JSON);
			}
		}
		onTransitionBeginning(container) {
			this.doBrowse(container, 1);
		}
		onTransitionEnded(container) {
			application.purge();
			container.time = 0;
			container.start();
		}
	},
	contents: [
		Content($, { })
	]
}));

class CollageLayerBehavior extends Behavior{
	onCreate(layer, $) {
		layer.duration = 10000;
		layer.opacity = 0;
		layer.subPixel = true;
		this.dx = $.dx;
		this.dy = $.dy;
	}
	onTimeChanged(layer) {
		let dx = this.dx;
		let dy = this.dy;
		let f = layer.fraction;
		layer.translation = { x: 0 - (f * dx), y: 0 - (f * dy) };
	}
}

class CollagePictureBehavior extends Behavior{
	onCreate(picture, $, theme) {
		if ($.uri.indexOf("file://") == 0) {
			picture.aspect = "fill";
			picture.coordinates = { width: application.width, height: application.height };
		}
		else picture.aspect = "draw";
		picture.url = $.uri;
		customEffectIndex++;
		if (customEffectIndex > 2) customEffectIndex = 0;
		picture.effect = theme.customEffects[customEffectIndex];
	}
	onLoaded(picture) {
		model.data.radio.COLLAGE.delegate("onLoaded");
	}
}

class CollageTransition extends Transition{
	constructor(duration){
		if (!duration) duration = 1000;
		super(duration);
	}
	onBegin(container, content, picture) {
		let srcWidth = picture.width;
		let srcHeight = picture.height;
		let dstWidth = application.width;
		let dstHeight = application.height;
		let srcRatio = srcWidth / srcHeight;
		let dstRatio = dstWidth / dstHeight;
		let scale, dx, dy;
		if (srcRatio > dstRatio) {
			scale = dstHeight / srcHeight;
			dx = Math.round(srcWidth * scale) - dstWidth;
			dy = 0;
		}
		else {
			scale = dstWidth / srcWidth;
			dx = 0;
			dy =  Math.round(srcHeight * scale) - dstHeight;
		}
		picture.scale = { x: scale, y: scale };
		container.add(picture);
		let layer = this.layer = new Layer({ alpha: false });
		layer.capture(picture, 0, 0, dstWidth + dx, dstHeight + dy);
		let coordinates = layer.coordinates;
		layer.behavior = new CollageLayerBehavior(layer, { dx: dx, dy: dy });
		container.replace(picture, layer);
		picture.url = null;
		layer.start();
	}
	onEnd(container, content, picture) {
		container.remove(content);
	}
	onStep(fraction) {
		this.layer.opacity = Math.quadEaseOut(fraction);
	}
}

class HideTunerTransition extends Transition{
	constructor(duration){
		if (!duration) duration = 500;
		super(duration);
	}
	onBegin(container, current) {
		let layer = this.layer = new Layer({ alpha:true });
		layer.attach(current);
	}
	onEnd(container, current) {
		this.layer.detach();
		current.visible = false;
	}
	onStep(fraction) {
		fraction = Math.quadEaseOut(fraction);
		this.layer.opacity = 1 - fraction;
	}
}

class ShowTunerTransition extends Transition{
	constructor(duration){
		if (!duration) duration = 500;
		super(duration);
	}
	onBegin(container, current) {
		current.visible = true;
		let layer = this.layer = new Layer({ alpha:true });
		layer.attach(current);
	}
	onEnd(container, current) {
		this.layer.detach();
	}
	onStep(fraction) {
		fraction = Math.quadEaseOut(fraction);
		this.layer.opacity = fraction;
	}
}

class LocalDevice{
	constructor(){
		this.iconURL = mergeURI(application.url, "./assets/local.png");
		this.friendlyName = "My Phone";
		this.uuid = application.uuid;
		this.volume = 50;
	}
}

/* =-====================================================================-= */
/* =-======================== APPLICATION SET-UP ========================-= */
/* =-====================================================================-= */

class ApplicationBehavior extends Behavior{
	compute() {
		let data = this.data;
		let radio = data.radio;
		let width = radio.width;
		let height = radio.height;
		let min = radio.min = Math.min(radio.width, radio.height);
		let max = radio.max = Math.max(radio.width, radio.height);
		radio.barWidth = 5;
		radio.barHeight = 60;
		radio.dotSize = 50;
		radio.dotThickness = 4;
		radio.labelHeight = 40;
		radio.tickSize = 30;

		radioChannelStyle = new Style({ font:"Fira Sans", size: radio.tickSize, left:20, right:20 })

		let space = radio.tickSize / 4;
		let size = 10 * space;
		let canvas = new Canvas({width:size, height:size});
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 2;
		ctx.strokeStyle = radio.theme.foregroundColor;
		for (let x = 1; x < size; x += space) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, size);
			ctx.stroke();
		}
		channelTickSkin = new Skin(new Texture(canvas, 1), {x:0, y:0, width:size, height:radio.tickSize}, 0, 0, { left:0, right: 0});
	}
	canSetVolume() {
		return true;
	}
	doSetVolume() {
		application.distribute("onVolumeChanged", this.data.radio);
	}
	onAdapt(application) {
		let data = this.data;
		let radio = data.radio;
		let width = application.width;
		let height = application.height;
		if ((radio.width != width) || (radio.height != height)) {
			radio.width = width;
			radio.height = height;
			this.compute();
			application.first.distribute("onAdapt", width, height);
		}
	}
	onChannelChanged(container, index) {
		if (this.currentDevice != this.localDevice) this.postDIAL();
	}
	onLaunch(application) {
		let preferences = this.preferences = this.readPreferences(application, "preferences", {
			radio: {
				index: 0,
				volume: 0.5,
			},
		});
		this.ambient = 0;
		this.constructors = [
			Radio,
		];
		this.current = -1;
		this.trackingVolume = false;
		let data = this.data = {
			radio: {
				themes: [
					{
						backgroundColor: "black",
						foregroundColor: "white",
						state: 1,
					},
					{
						backgroundColor: "white",
						foregroundColor: "black",
						state: 0,
					},
				],
				artist: "",
				busy: true,
				index: preferences.radio.index,
				mute: false,
				running: false,
				title: "",
				volume: preferences.radio.volume,
				volumeMaximum: 1,
				volumeMinimum: 0,
				width: application.width,
				height: application.height,
			},
		};

		let theme;
		theme = data.radio.themes[0];
		theme.customEffects = [ new Effect, new Effect, new Effect ];
		theme.customEffects[0].gray("black", blendColors(0.3, "#f24b2c", "black"));
		theme.customEffects[1].gray("black", blendColors(0.3, "#77b648", "black"));
		theme.customEffects[2].gray("black", blendColors(0.3, "#2ea7cb", "black"));
		theme.hiliteColor = blendColors(0.50, theme.foregroundColor, "black");
		theme.skin = new Skin(theme.backgroundColor);
		theme.barSkin = new Skin(theme.foregroundColor);
		theme.style = new Style(undefined, theme.foregroundColor);
		theme = data.radio.themes[1];
		theme.customEffects = [ new Effect, new Effect, new Effect ];
		theme.customEffects[0].gray(blendColors(0.5, "#f24b2c", "white"), "white");
		theme.customEffects[1].gray(blendColors(0.5, "#77b648", "white"), "white");
		theme.customEffects[2].gray(blendColors(0.5, "#2ea7cb", "white"), "white");
		theme.hiliteColor = blendColors(0.75, theme.foregroundColor, "white");
		theme.skin = new Skin(theme.backgroundColor);
		theme.barSkin = new Skin(theme.foregroundColor);
		theme.style = new Style(undefined, theme.foregroundColor);
		data.radio.theme = data.radio.themes[0];
		this.compute();

		application.add(new Radio(data));

		this.localDevice = this.currentDevice = new LocalDevice();
		this.devices = [ this.currentDevice ];
		this.ssdpClient = new SSDP.Client();
		this.ssdpClient.addService("urn:dial-multiscreen-org:service:dial:1");
		this.ssdpClient.behavior = this;
		this.ssdpClient.start();
	}
	onQuit(application) {
		this.ssdpClient.stop();
		this.ssdpClient = undefined;
	}
	onSSDPServerUp(server) {
		trace("DIAL Server up: " + server.url + "\n");
		application.invoke(new Message("/dial?" + serializeQuery(server)));
	}
	onSSDPServerDown(server) {
		trace("DIAL Server down: " + server.url + "\n");
		this.devices.some(function(item, index, array) {
			if (item.url == server.url) {
				array.splice(index, 1);
				if (this.currentDevice == item)
					this.selectDevice(this.localDevice.uuid);
				return true;
			}
		}, this);
		application.distribute("onDevicesChanged", this.devices);
	}
	postDIAL() {
		let radio = this.data.radio;
		let query = {
			id: channels[radio.index].id,
			volume: Math.round(100 * radio.volume)
		};
		application.invoke(new Message("/dial/SomaFM/run?" + serializeQuery(query)));
	}
	readPreferences(application, name, preferences) {
		try {
			let url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			if (Files.exists(url)) return JSON.parse(Files.readText(url));
		}
		catch(e) {
		}
		return preferences;
	}
	savePreferences() {
		let data = this.data;
		let preferences = this.preferences;
		preferences.radio.index = data.radio.index;
		preferences.radio.volume = data.radio.volume;
		this.writePreferences(application, "preferences", preferences);
	}
	selectDevice(uuid) {
		let former = this.currentDevice;
		let current = former;
		this.devices.some(function(item, index, array) {
			if (item.uuid == uuid) {
				current = item;
				return true;
			}
		});
		if (former != current) {
			this.currentDevice = current;
			let data = this.data;
			let radio = data.radio;
			if (former != this.localDevice) {
				let message = new Message(former.quitURL);
				message.method = "DELETE";
				application.invoke(message);
			}
			if (current == this.localDevice) radio.mute = false;
			else {
				radio.mute = true;
				this.postDIAL();
			}
			application.distribute("onDeviceChanged", this.currentDevice);
		}
	}
	writePreferences(application, name, preferences) {
		try {
			let url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			Files.writeText(url, JSON.stringify(preferences));
		}
		catch(e) {
		}
	}
}

let model = application.behavior = new ApplicationBehavior(application);
