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
 */
import CONTROL from 'mobile/control';
import MODEL from'mobile/model';

/* Skins, styles, and textures */
var videoHeaderFooterSkin = new Skin({ fill: '#9a000000',});
var videoBackgroundSkin = new Skin({ fill: 'black',});
var videoControllerViewedSkin = new Skin({ fill: 'white',});
var videoControllerUnviewedSkin = new Skin({ fill: '#9affffff',});

var videoControlsTexture = new Texture('./assets/media-transport-controls.png', 2);
var videoControlsSkin = new Skin({ texture: videoControlsTexture, width: 36, height: 40, variants: 36, states: 40, });

var videoErrorTexture = new Texture('./assets/video-error.png', 2);
var videoErrorSkin = new Skin({ texture: videoErrorTexture, width: 80, height: 80, });

var videoTimeStyle = new Style({ color: 'white', font: '18px', horizontal: 'center', vertical: 'middle', });

/* Handlers */
Handler.bind("/main", Behavior({
	hasSelection: function(data, delta) {
		var tab = data.tabs[data.selection];
		var selection = tab.selection + delta;
		return (0 <= selection) && (selection < tab.items.length)
	},
	getSelection: function(data, delta) {
		var tab = data.tabs[data.selection];
		var selection = tab.selection + delta;
		return tab.items[selection];
	},
	onDescribe: function(query, selection) {
		return {
			Screen: MediaPlayerScreen,
			url: "http://cvs.kinoma.com/~brian/KinomaCreateWidescreen.mp4",
			scroll: {
				x: 0,
				y: 0
			},
			selection: -1,
		};
	}
}));

/* UI templates */
class Slider extends CONTROL.ButtonBehavior {
	compute(container, min, max, x) {
		var button = container.last;
		var bar = button.previous;
		var background = bar.previous;
		var value = (max - min) * (x - background.x) / background.width;
		if (value < min) value = min;
		else if (value > max) value = max;
		return value;
	}
	onTouchBegan(container, id, x, y, ticks) {
		var button = container.last;
		button.state = 2;
		this.onTouchMoved(container, id, x, y, ticks);
		super.onTouchBegan(container, id, x, y, ticks);
		this.data.CONTROLS.delegate("onTrackingBegan");
	}
	onTouchEnded(container, id, x, y, ticks) {
		super.onTouchEnded(container, id, x, y, ticks);
		this.data.CONTROLS.delegate("onTrackingEnded");
		var button = container.last;
		button.state = 1;
	}
	onTouchCancelled(container, id, x, y, ticks) {
		super.onTouchCancelled(container, id, x, y, ticks);
		this.data.CONTROLS.delegate("onTrackingEnded");
	}
	update(container, value) {
		var button = container.last;
		var bar = button.previous;
		var background = bar.previous;
		var backgroundCoordinates = background.coordinates;
		var barCoordinates = bar.coordinates;
		var buttonCoordinates = button.coordinates;
		barCoordinates.width = Math.round(value * (container.width - backgroundCoordinates.left - backgroundCoordinates.right));
		buttonCoordinates.left = barCoordinates.left + barCoordinates.width - (button.width >> 1);
		bar.coordinates = barCoordinates;
		button.coordinates = buttonCoordinates;
	}
}

class MediaBehavior extends Behavior {
	onCreate(media, data) {
		this.data = data;
	}
	onDisplaying(media) {
		media.url = this.data.url;
	}
	onLoaded(media) {
		media.volume = 0.8;
		media.start();
	}
	onStateChanged(media) {
		media.container.distribute("onMediaStateChanged", media);
	}
	onTimeChanged(media) {
		media.container.distribute("onMediaTimeChanged", media);
	}
	onFinished(media) {
		media.stop();
	}
}

var MediaPlayerHeader = Container.template($ => ({ 
	left: 0, right: 0, top: 0, height: 40, active: true, skin: videoHeaderFooterSkin, 
	contents: [
		Line($, { 
			left: 0, right: 0, top: 0, bottom: 0, 
			contents: [
				Layout($, { 
					left: 0, right: 0, top: 0, bottom: 0, active: true, anchor: 'SEEKER', 
					contents: [
						Label($, { left: 0, width: 60, top: 0, bottom: 0, style: videoTimeStyle, }),
						Label($, { width: 60, right: 0, top: 0, bottom: 0, style: videoTimeStyle, }),
						Content($, { left: 60, right: 60, height: 4, skin: videoControllerUnviewedSkin, }),
						Content($, { left: 60, width: 0, height: 4, skin: videoControllerViewedSkin, }),
						Content($, { left: 60, top: 0, bottom: 0, skin: videoControlsSkin, state: 1, variant: 4, }),
					], 
					Behavior: class extends Slider {
						onCreate(container, data) {
							this.data = data;
						}
						onMeasureVertically(container, height) {
							var media = this.data.MEDIA;
							if (media) {
								var value = media.ready ? media.time / media.duration : 0;
								this.update(container, value);
							}
							return height;
						}
						onMediaTimeChanged(container, media) {
							var duration = media.duration;
							var time = media.time;
							var left = container.first;
							var right = left.next;
							left.string = this.toTimeCode(time);
							right.string = this.toTimeCode(duration);
							this.update(container, time / duration);
						}
						onTouchBegan(container, id, x, y, ticks) {
							var media = this.data.MEDIA;
							this.playing = media.state == Media.PLAYING;
							if (this.playing)
								media.stop();
							media.seeking = true;
							super.onTouchBegan(container, id, x, y, ticks);
						}
						onTouchEnded(container, id, x, y, ticks) {
							var media = this.data.MEDIA;
							media.seeking = false;
							if (this.playing)
								media.start();
							super.onTouchEnded(container, id, x, y, ticks);
						}
						onTouchMoved(container, id, x, y, ticks) {
							var media = this.data.MEDIA;
							media.time = this.compute(container, 0, media.duration, x);
						}
						toTimeCode(timeInMS) {
							var seconds = timeInMS / 1000;
							let result = "";
							seconds = Math.floor(seconds);
							var hours = Math.floor(seconds / 3600);
							seconds = seconds % 3600;
							var minutes = Math.floor(seconds / 60);
							seconds = Math.round(seconds % 60);
							if (hours)
								result += hours + ":";
							if (minutes < 10)
								result += "0";
							result += minutes;
							result += ":";
							if (seconds < 10)
								result += "0";
							result += seconds;
							return result;
						}
					}, 
				}),
			], 
		}),
	], 
}));

var MediaPlayerFooter = Container.template($ => ({ 
	left: 0, right: 0, height: 40, bottom: 0, active: true, skin: videoHeaderFooterSkin, 
	contents: [
		Line($, { 
			width: 120, top: 0, bottom: 0, anchor: 'TRANSPORT', 
			contents: [
				Container($, { 
					left: 0, right: 0, top: 3, active: false, anchor: 'PLAY', 
					contents: [ Content($, { skin: videoControlsSkin, variant: 1, }) ],
					Behavior: class extends CONTROL.ButtonBehavior {
						onMediaStateChanged(container, media) {
							var button = container.first;
							switch (media.state) {
								case Media.FAILED:
									container.active = false;
									button.visible = false;
									break;
								case Media.PAUSED:
									container.active = true;
									button.visible = true;
									button.variant = 1;
									break;
								case Media.PLAYING:
									container.active = true;
									button.visible = true;
									button.variant = 0;
									break;
								case Media.WAITING:
									container.active = false;
									break;
							}
						}
						onTap(button) {
							var media = this.data.MEDIA;
							if (media) {
								if (media.state == Media.PAUSED) {
									if (media.time >= media.duration)
										media.time = 0;
									media.start();
								}
								else if (media.state == Media.PLAYING)
									media.stop();
							}
						}
					}, 
				}),
			], 
		}),
	], 
}));

class MediaPlayerControlsBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.container = container;
		container.duration = 5000;
	}
	onDisplaying(container) {
		var media = this.data.MEDIA;
		if (media)
			this.onMediaStateChanged(container, media);
	}
	onMediaStateChanged(container, media) {
		if (!media.url) return;
		switch (media.state) {
			case Media.FAILED:
				this.data.ERROR.visible = true;
				this.data.FOOTER.visible = false;
				this.data.SEEKER.visible = false;
				this.data.WAIT.delegate("stop");
				break;
			case Media.WAITING:
				container.stop();
				this.data.HEADER.visible = true;
				this.data.FOOTER.visible = true;
				this.data.WAIT.delegate("start");
				break;
			case Media.PLAYING:
				this.data.WAIT.delegate("stop");
				container.time = 0;
				container.start();
				break;
			case Media.PAUSED:
				this.data.HEADER.visible = true;
				this.data.FOOTER.visible = true;
				this.data.WAIT.delegate("stop");
				container.stop();
				break;
		}
	}
	onTrackingBegan(container) {
		container.stop();
	}
	onTrackingEnded(container) {
		var media = this.data.MEDIA;
		if (Media.PLAYING == media.state) {
			container.time = 0;
			container.start();
		}
	}
	onFinished(container) {
		this.hideShowHeaderFooter(container, false);
	}
	hideShowHeaderFooter(container, show) {
		container.run(new MediaPlayerHeaderFooterShowHideTransition(), this.data.HEADER, this.data.FOOTER, show);
	}
	onTransitionEnded(container) {
		if (this.data.HEADER.visible) {
			container.time = 0;
			container.start();
		}
	}
	onTouchBegan(container, id, x, y, ticks) {
		if (this.data.HEADER.visible || container.transitioning) return;
		
		container.stop();
		this.hideShowHeaderFooter(container, true);
	}
}

var MediaPlayerScreen = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: videoBackgroundSkin, 
	contents: [
		Media($, { left: 0, right: 0, top: 0, bottom: 0, anchor: 'MEDIA', Behavior: MediaBehavior }),
		Container($, { 
			left: 0, right: 0, top: 0, bottom: 0, active: true, anchor: 'CONTROLS', 
			Behavior: MediaPlayerControlsBehavior, 
			contents: [
				MediaPlayerHeader($, { anchor: 'HEADER', }),
				MediaPlayerFooter($, { anchor: 'FOOTER', }),
				Container($, { 
					left: 0, right: 0, top: 40, bottom: 40, visible: false, skin: videoHeaderFooterSkin, anchor: 'WAIT', 
					Behavior: class extends Behavior {
						onCreate(container, data) {
							this.container = container;
						}
						start() {
							this.container.visible = true;
							this.container.first.start();
						}
						stop() {
							this.container.visible = false;
							this.container.first.stop();
						}
					}, 
					contents: [
						Picture($, { 
							width: 200, height: 200, url: './assets/streak-spinner-white.png', 
							Behavior: class extends Behavior {
								onCreate(picture) {
									picture.origin = {x: 100, y: 100};
									picture.scale = {x: 0.4, y: 0.4};
								}
								onTimeChanged(picture) {
									var rotation = picture.rotation;
									rotation += 6;
									if (rotation == 360)
										rotation = 0;
									picture.rotation = rotation;
								}
							}
						}),
					], 
				}),
				Content($, { width: 80, height: 80, visible: false, skin: videoErrorSkin, anchor: 'ERROR', }),
			], 
		}),
	], 
}));

class MediaPlayerHeaderFooterShowHideTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 250;
		super(duration)
	}
	onBegin(application, header, footer, flag) {
		this.flag = flag;
		this.layer0 = new Layer;
		this.layer1 = new Layer;
		if (flag) {
			header.visible = true;
			footer.visible = true;
		}
		this.layer0.attach(header);
		this.layer1.attach(footer);
	}
	onEnd(application, header, footer, flag) {
		this.layer0.detach();
		this.layer1.detach();
		if (!flag) {
			header.visible = false;
			footer.visible = false;
		}
	}
	onStep(fraction) {
		var flag = this.flag;
		var header = this.layer0;
		var footer = this.layer1;
		header.translation = { y: (0 - header.height) * (flag ? (1 - fraction) : fraction ) };
		footer.translation = { y: footer.height * (flag ? (1 - fraction) : fraction ) };
	}
}

/* Application set-up */
application.behavior = new MODEL.ApplicationBehavior(application);
