/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.

NOTE:

The web service at http://k3.cloud.kinoma.com/api is operated by the Kinoma team for making music prototypes.
It is not for commercial or large scale use. It may be modified or discontinued without notice.
*/
import CONTROL from 'mobile/control';
import SCROLLER from 'mobile/scroller';
import TRANSITION from 'mobile/transition';

import {
	channels
} from 'settings';
/* Skins, styles, and textures */
application.style = new Style({ color: 'white', font: '18px Fira Sans', horizontal: 'left', vertical: 'middle' });

let radioTitleStyle = new Style({ color: 'white', font: '32px Fira Sans Light', horizontal: 'center', vertical: 'middle', });
let radioChannelStyle = new Style({ color: 'white', font: '36px Fira Sans', horizontal: 'center', vertical: 'middle', left: 15, right: 15, });
let speakerTexture = new Texture('./assets/speaker.png', 1);
let speakerSkin = new Skin({ texture: speakerTexture, width: 40, height: 40, variants: 40, states: 40, });
let cancellerSkin = new Skin({ fill: ['transparent', '#A0000000'] });
let sliderLabelStyle = new Style({ color: 'white', font: 'bold 32px', horizontal: 'center', });
let sliderValueStyle = new Style({ color: 'white', font: 'bold 32px', horizontal: 'center' });
let sliderLeftStyle = new Style({ color: 'white', font: '32px', horizontal: 'left', left: 4, });
let sliderRightStyle = new Style({ color: 'white', font: '32px', horizontal: 'right', right: 4, });

let defaultImages = [
	{ uri: mergeURI(application.url, "./assets/default0.jpg") },
];

let channelTickSkin = function() {
	let space = 5;
	let size = 10 * space;
	let canvas = new Canvas({width:size, height:size});
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = "white";
	for (let x = 1; x < size; x += space) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, size);
		ctx.stroke();
	}
	return new Skin(new Texture(canvas, 1), {x:0, y:0, width:size, height:20}, 0, 0, { left:0, right: 0});
}();

let customEffectIndex = 0;
let customEffects = [ new Effect, new Effect, new Effect ];
customEffects[0].gray("black", blendColors(0.3, "#f24b2c", "black"));
customEffects[1].gray("black", blendColors(0.3, "#77b648", "black"));
customEffects[2].gray("black", blendColors(0.3, "#2ea7cb", "black"));

let channelBarSkin = new Skin({ fill: 'white' });

/* Handlers */
Handler.bind("/dial", {
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		let radio = model.data.radio;
		channels.some(function(channel, index) {
			if (channel.id == query.id) {
				application.distribute("onChannelChanged", index);
				return true;
			}
		});
		radio.volume = query.volume / 100;
		application.distribute("onVolumeChanged", radio);
	}
});

Handler.bind("/getAudioMedia", {
	onComplete(handler, message, text) {
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
	onInvoke(handler, msg) {
		let query = parseQuery(msg.query);
		let message = new Message("http://somafm.com/" + query.id + ".pls");
		handler.invoke(message, Message.TEXT);
	}
});

Handler.bind("/getImages", {
	onComplete(handler, message, json) {
		if (json && (true == json.result.success)) {
			handler.message.setResponseHeader("Content-Type", "text/plain");
			handler.message.responseText = JSON.stringify(json.result);
		}
	},
	onInvoke(handler, msg) {
		let query = parseQuery(msg.query);
		let message = new Message("http://k3.cloud.kinoma.com/api");
		message.method = "POST";
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
		message.requestText = body;
		message.setRequestHeader("Content-Length", body.length);
		handler.invoke(message, Message.JSON);
	}
});

/* UI Templates */
let Radio = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0,
	Behavior: class extends Behavior{
		onCreate(container, $) {
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
	},
	contents: [
		(function($, $$) { return [
			Media($, { width: 0, height: 0,
			Behavior: class extends Behavior{
				onCreate(media, $) {
					this.data = $;
					media.url = Message.URI('/getAudioMedia?id=' + channels[$.index].id);
				}
				onLoaded(media) {
					let data = this.data;
					media.start();
					media.volume = data.running ? data.volume : 0;
				}
				onMetadataChanged(media) {
					let data = this.data;
					data.title = media.title;
					data.artist = media.artist;
					application.distribute("onSongChanged");
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
					application.distribute("onBusyChanged");
				}
				onVolumeChanged(media, $) {
					media.volume = $.volume;
				}
			}
			}),
			Collage($, { anchor: 'COLLAGE' }),
			Tuner($, { anchor: 'TUNER' }),
			Canvas($, { left: 0, width: 320, top: 0, height: 40, active: true,
				Behavior: class extends Behavior{
					draw(canvas) {
						let ctx = canvas.getContext("2d");
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctx.fillStyle = "white";
						let x = this.index;
						for (let i = 0; i < 16; i++) {
							let r = (x < 160) ? x * 16 / 160 : 16 - ((x - 160) * 16 / 160);
							ctx.beginPath();
							ctx.arc(x + r, 20, r, 0, 2 * Math.PI);
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
						this.index = 15;
						this.draw(canvas);
						this.onBusyChanged(canvas);
					}
					onDisplaying(canvas) {
						canvas.interval = 25;
						canvas.start();
					}
					onTimeChanged(canvas) {
						let index = this.index - 1;
						if (index < 0)
						index = 15;
						this.index = index;
						this.draw(canvas);
					}
				}
			}),
			Scroller($, { left: 0, right: 0, top: 0, height: 40, active: true, visible: false,
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
					Label($, { style: radioTitleStyle })
				],
				loop: true
			}),

			Label($, { height: 40, bottom: 0, style: radioTitleStyle, string: 'SOMA FM' }),
			Container($, { width: 40, right: 0, height: 40, bottom: 0, active: true,
				Behavior: class extends CONTROL.ButtonBehavior{
					onTap(container) {
						let data = {
							button: container,
							label: "Volume"
						};
						model.dialog = new VolumeDialogBox(data);
						application.run(new TRANSITION.MenuOpenTransition, model.dialog, container);
					}
					onVolumeChanged(container, $) {
						container.first.variant = Math.min(Math.floor(4 * ($.volume - $.volumeMinimum) / ($.volumeMaximum - $.volumeMinimum)), 3);
					}
				},
				contents: [
					Content($, { width: 60, height: 60, skin: speakerSkin, variant: Math.min(Math.floor(4 * ($.volume - $.volumeMinimum) / ($.volumeMaximum - $.volumeMinimum)), 3) })
				]
			})
		]})($.radio, $)
	]
}));

let Collage = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0,
	Behavior: class extends Behavior{
		doBrowse(container, delta) {
			let c = this.images.length;
			let i = this.index + delta;
			if (i >= c) i = 0;
			this.index = i;
			this.loading = true;
			let picture = new Picture({ left:0, top:0 });
			picture.behavior = new CollagePictureBehavior(picture, this.images[i]);
			this.data.IMAGE = picture;
		}
		onComplete(container, message, json) {
			if (json && ("result" in json) && ("images" in json.result) && json.result.images.length) this.images = json.result.images;
			else this.images = defaultImages;
			container.stop();
			this.index = 0;
			this.doBrowse(container, 0);
		}
		onCreate(container, $) {
			this.data = $;
			container.duration = 9000;
			this.images = defaultImages;
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
				if (!container.transitioning && !container.running) container.run(new CollageTransition, container.first, this.data.IMAGE);
			}
			else this.doBrowse(container, 1);
		}
		onSongChanged(container) {
			let artist = this.data.artist;
			let title = this.data.title;
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
		Content($, { }),
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
	onCreate(picture, $) {
		picture.aspect = "draw";
		picture.url = $.uri;
		customEffectIndex++;
		if (customEffectIndex > 2) customEffectIndex = 0;
		picture.effect = customEffects[customEffectIndex];
	}
	onLoaded(picture) {
		model.data.radio.COLLAGE.delegate("onLoaded");
	}
}
class CollageTransition extends Transition{
	constructor(duration){
		super(1000);
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
			dy =    Math.round(srcHeight * scale) - dstHeight;
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

let Tuner = Container.template( $ => ({ left: 0, right: 0, top: 0, bottom: 0,
	contents: [
		Scroller($, { left: 0, right: 0, height: 140, active: true,
			Behavior: class extends SCROLLER.HorizontalScrollerBehavior{
				onChannelChanged(scroller, index) {
					this.index = index;
					scroller.scroll = { x:channels[index].offset - 160, y:0 };
				}
				onCreate(scroller, $) {
					SCROLLER.HorizontalScrollerBehavior.prototype.onCreate.call(this, scroller, $);
					this.index = $.index;
				}
				onDisplaying(scroller) {
					SCROLLER.HorizontalScrollerBehavior.prototype.onDisplaying.call(this, scroller);
					scroller.scroll = { x:channels[this.index].offset - 160, y:0 };
				}
				onScrolled(scroller) {
					if (!scroller.tracking) scroller.bubble("onChannelChanged", this.index);
				}
				snap(scroller, position, direction) {
					let c = channels.length;
					position += 160;
					let left = channels[0].offset;
					if (position < left) {
						this.index = 0;
						return left - 160;
					}
					for (let i = 1; i < c; i++) {
						var right = channels[i].offset;
						if (position < right) {
							if (position - left < right - position) {
								this.index = i - 1;
								return left - 160;
							}
							this.index = i;
							return right - 160;
						}
						left = right;
					}
					this.index = c - 1;
					return right - 160;
				}
			},
			clip: true,
			contents: [
				Layout($, { left: 0, height: 140,
					Behavior: class extends Behavior{
						onMeasureHorizontally(layout, width) {
							let container = layout.first.next;
							let i = 0;
							let bottomCoordinates = { left:0, width:0, height:140, bottom:0 };
							let bottomLabelCoordinates = { left:0, right:0, height:40, bottom:10 };
							let bottomBarCoordinates = { left:0, width:3, height:35, bottom:45 };
							let topCoordinates = { left:0, width:0, top:0, height:140 };
							let topLabelCoordinates = { left:0, right:0, top:10, height:40, };
							let topBarCoordinates = { left:0, width:3, top:45, height:35 };
							const half = width >> 1;
							while (container) {
								let channel = channels[i];
								let size = radioChannelStyle.measure(channel.title);
								let width = size.width;
								if (i == 0) {
									bottomCoordinates.left = 160 - half;
									topCoordinates.left = 160 - half;
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
							bottomCoordinates.left += 160 - half;
							topCoordinates.left += 160 - half;
							return Math.max(bottomCoordinates.left, topCoordinates.left);
						}
					},
					contents: [
						Content($, { left: -320, right: -320, height: 20, skin: channelTickSkin, }),
						(channels) ? channels.map(function($) { let $$ = this; return [
							Container($, {
								contents: [
									Label($, { style: radioChannelStyle, string: $.title, }),
									Content($, { skin: channelBarSkin, }),
								]
							}),
						]}, $) : null,
					]
				}),
				Canvas($, { left: 145, width: 30, height: 30, active: true,
					Behavior: class extends Behavior{
						draw(canvas) {
							let ctx = canvas.getContext("2d");
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx.beginPath();
							ctx.arc(16, 15, 11, 0, 2 * Math.PI);
							ctx.closePath();
							ctx.lineWidth = 2;
							ctx.fillStyle = "black";
							ctx.fill();
							ctx.strokeStyle = "white";
							ctx.stroke();
						}
						onCreate(canvas, $) {
							this.data = $;
							this.draw(canvas);
						}
					}
				})
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
let VolumeDialogBox = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	active: true, skin: cancellerSkin, 
	Behavior: VolumeDialogBoxBehavior, 
	contents: [
  		Container($, { 
  			left: 0, right: 0, height: 95, 
  			contents: [
		  		Label($, { left: 0, right: 0, top: 0, style: sliderLabelStyle, string: 'Volume', }),
		  		Label($, { left: 0, right: 0, top: 15, style: sliderLeftStyle, string: 'Low', }),
		  		Label($, { left: 0, right: 0, top: 15, style: sliderRightStyle, string: 'High', }),
		  		Label($, { left: 0, right: 0, bottom: 5, style: sliderValueStyle, }),
		  		Canvas($, { left: 0, right: 0, top: 15, bottom: 0, active: true, Behavior: VolumeDialogBoxSliderBehavior, }),
			] 
		})
	]
}));


/* Application set-up */
class ApplicationBehavior extends Behavior{
	onCreate(application) {
		application.focus();
	}
	onLaunch(application) {
		let preferences = this.preferences = this.readPreferences(application, "preferences", {
			radio: {
				index: 0,
				volume: 0.5
			}
		});
		let data = this.data = {
			radio: {
			artist: "",
			busy: true,
			index: preferences.radio.index,
			running: false,
			title: "",
			volume: preferences.radio.volume,
			volumeMaximum: 1,
			volumeMinimum: 0
			}
		};
		application.add(new Radio(data));
	}
	onQuit(application) {}
	readPreferences(application, name, preferences) {
		try {
			let url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			if (Files.exists(url))
			return JSON.parse(Files.readText(url));
		} catch(e) { }
		return preferences;
	}
	savePreferences() {
		let data = this.data;
		let preferences = this.preferences;
		preferences.radio.index = data.radio.index;
		preferences.radio.volume = data.radio.volume;
		this.writePreferences(application, "preferences", preferences);
	}
	writePreferences(application, name, preferences) {
		try {
			let url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			Files.writeText(url, JSON.stringify(preferences));
		} catch(e) { }
	}
}
let model = application.behavior = new ApplicationBehavior(application);
