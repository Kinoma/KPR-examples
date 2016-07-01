/*  Copyright 2011-2016 Marvell Semiconductor, Inc.    Licensed under the Apache License, Version 2.0 (the "License");  you may not use this file except in compliance with the License.  You may obtain a copy of the License at        http://www.apache.org/licenses/LICENSE-2.0        Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and  limitations under the License.*/
import HID from "HID";
let keyboard = new HID.Keyboard();

/* =-====================================================================-= *//* =-=================== SKINS, STYLES, AND TEXTURES ====================-= *//* =-====================================================================-= */
let COLORS = {
	highlight: "#D7DD35",
	dark: "#70000000",
	white: "#c0ffffff",
	background1: "#00a3cc",
	background2: "#E42D9F",
	background3: "#02558B",
}
let THEME = 0; // 0 for dark theme, 1 for light theme

let buttonEffect = new Effect();
buttonEffect.gray(COLORS.highlight, THEME? COLORS.white : COLORS.dark);

let playPauseTexture = new Texture("assets/play-pause-button.png");
let playPauseSkin = new Skin({      width:102, height:102,      texture: playPauseTexture,      fill:"white",      aspect: "fit",
      variants:102, states: 102});

let seekTexture = new Texture("assets/seek-buttons.png");
let seekSkin = new Skin({      width:78, height:78,      texture: seekTexture,      fill:"white",      aspect: "fit",
      variants:78, states:78});


/* =-====================================================================-= *//* =-========================= UI TEMPLATES =============================-= *//* =-====================================================================-= */
let playPauseButton = Content.template($ => ({     height:102, width:102, right:15, skin: playPauseSkin,     active: true, variant:0, name: "playPauseButton",
    Behavior: class extends Behavior {
		onTouchBegan(content) {
			content.variant = !content.variant
			content.state = 1;
			keyboard.sendKey(" ")
		}
		onTouchEnded(content) {
			content.state = 0;
		}
	}}));
	
let seekButton = Content.template($ => ({     height:78, width:78, right: 15, skin: seekSkin,     active: true, variant:$.variant,
    Behavior: class extends Behavior {
		onTouchBegan(content) {
			content.state = 1;
			let variant = $.variant;
			let keyCode = (variant)? 0x4f : 0x50; // 0x4f is right arrow, 0x50 is left arrow
			keyboard.sendSpecial(keyCode, 1, keyboard.LEFT_GUI );
			let playButton = mainContainer.buttons.playSeek.playPauseButton
 			if (playButton.variant == 0) playButton.variant = 1;
		}
		onTouchEnded(content) {
			content.state = 0;
		}
	}}));

let Buttons = Layer.template($ => ({
	left:0, right:0, top:0, bottom:0, 
	name: "buttons",
	contents: [
		Line($, {
			left:15, right:0, top:10, bottom:10,
			name: "playSeek",
			contents: [
				new seekButton({variant:0}),
				new playPauseButton(),
				new seekButton({variant:1}),
			]
		}),
	]
}));

let mainContainer = new Layer({
	top: 0, bottom: 0, left: 0, right: 0,
});

let Radio = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	skin: $.radio.theme.skin,
	contents: [
		(function($, $$) { return [
			Collage($, { anchor: 'COLLAGE', }),
		]})($.radio, $), 
	], 
	Behavior: class extends Behavior{
		onCreate (container, $) {
			container.duration = 30000;
			var data = this.data = $.radio;
			data.running = true;
		}
		onDisplayed(container) {
			container.focus();
			container.start();
		}
	}, 
}));

let customEffectIndex = 0;
let Collage = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: class extends Behavior{
		doBrowse(container, delta) {
			var c = this.images.length;
			var i = this.index + delta;
			if (c) {
			if (i >= c) i = 0;
				this.index = i;
				this.loading = true;
				var picture = new Picture({ left:0, top:0 });
				picture.behavior = new CollagePictureBehavior(picture, this.images[i], this.data.theme);
				this.data.IMAGE = picture;
			}
			else
				this.data.IMAGE = null;
		}
		onComplete(container, message, json) {
			if (json && ("result" in json) && ("images" in json.result) && json.result.images.length)
				this.images = json.result.images;
			else
				this.images = this.defaultImages;
			container.stop();
			this.index = 0;
			this.doBrowse(container, 0);
		}
		onCreate(container, $) {
			this.data = $;
			container.duration = 3500;
			this.defaultImages = this.images = [ {uri: mergeURI(application.url, "./assets/background.jpg") } ];
			this.index = 0;
			this.doBrowse(container, 0);
		}
		onFinished(container) {
			if (!this.loading)
				container.run(new CollageTransition, container.first, this.data.IMAGE);
		}
		onLoaded(container) {
			if (this.data.IMAGE.ready) {
				this.loading = false;
				if (!container.transitioning && !container.running)
					container.run(new CollageTransition, container.first, this.data.IMAGE);
			}
			else
				this.doBrowse(container, 1);
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
		Content($, {}),
	], 
}));

let CollageLayerBehavior = Behavior.template({
	onCreate: function(layer, $) {
		layer.duration = 10000;
		layer.opacity = 0;
		layer.subPixel = true;
		this.dx = $.dx;
		this.dy = $.dy;
	},
	onTimeChanged: function(layer) {
		let dx = this.dx;
		let dy = this.dy;
		let f = layer.fraction;
		layer.translation = { x: 0 - (f * dx), y: 0 - (f * dy) };
	},
})

let CollagePictureBehavior = Behavior.template({
	onCreate: function(picture, $, theme) {
		if ($.uri.indexOf("file://") == 0) {
			picture.aspect = "fill";
			picture.coordinates = { width: application.width, height: application.height };
		}
		else
			picture.aspect = "draw";
		picture.url = $.uri;
		customEffectIndex++;
		if (customEffectIndex > 2)
			customEffectIndex = 0;
		picture.effect = theme.customEffects[customEffectIndex];
	},
	onLoaded: function(picture) {
		model.data.radio.COLLAGE.delegate("onLoaded");
	},
})

class CollageTransition extends Transition {	constructor(duration) {		if (!duration) duration = 1000;		super(duration);	}
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
	onStep(fraction) {
		this.layer.opacity = Math.quadEaseOut(fraction); 
	}
}

let SliderBehavior = class extends Behavior{	getMax(container) {		return this.data.max;	}	getMin(container) {		return this.data.min;	}	getOffset(container, size) {		let min = this.getMin(container);		let max = this.getMax(container);		let value = this.getValue(container);		return ((value - min) * size) / (max - min);	}	getValue(container) {		return this.data.value;	}	onCreate(container, data) {		this.data = data;	}	onTouchBegan(container, id, x, y, ticks) {		container.captureTouch(id, x, y, ticks);		this.onTouchMoved(container, id, x, y, ticks);	}	setOffset(container, size, offset) {		let min = this.getMin(container);		let max = this.getMax(container);		let value = min + ((offset * (max - min)) / size);		if (value < min) value = min;		else if (value > max) value = max;		this.setValue(container, Math.round(value));	}	setValue(container, value) {		this.data.value = value;	}}
 
let RoundSliderBehavior = class extends SliderBehavior{	onTouchBegan(container, id, x, y, ticks) {		container.captureTouch(id, x, y, ticks);		this.onTouchMoved(container, id, x, y, ticks);	}	onTouchMoved(canvas, id, x, y, ticks) {		let size = canvas.width;		let offset = (x - canvas.x);		this.setOffset(canvas, size, offset);		this.onValueChanged(canvas);	}	onValueChanged(canvas) {		let size = canvas.width;		let offset = this.getOffset(canvas, size);				let x = canvas.width >> 1;		let y = canvas.height >> 1;		let w = 16;
		let w2 = w-4;		let a = Math.atan2(y, x);		let r = ((x * x) + (y * y)) / y;		let from = 0 - a - (Math.PI / 2);		let to = a - (Math.PI / 2);		y = r + ((y + w) >> 1);				let ctx = canvas.getContext("2d");		ctx.clearRect(0, 0, canvas.width, canvas.height);		ctx.lineWidth = w;		ctx.strokeStyle = THEME? COLORS.highlight : COLORS.dark;		ctx.beginPath();		ctx.arc(x, y, r, from, to);		ctx.stroke();
		ctx.lineWidth = w2;		ctx.strokeStyle = THEME? COLORS.white : COLORS.highlight;		ctx.beginPath();		ctx.arc(x, y, r, from, from + ((to - from) * offset / size));		ctx.stroke();	}}
 
let PlayerVolumeDialogBox = Container.template($ => ({ 
 	left: 0, right: 0, height:80, bottom: 0, 
 	active: true, skin: new Skin({ fill: 'transparent' }), 
 	contents: [		Container($, { 
			left: 0, right: 0, height: 95, 
			contents: [				Canvas($, { 
					left: 0, right: 0, top: 15, bottom: 0, 
					active: true, 
					Behavior: class extends RoundSliderBehavior {
						onDisplaying(container) {
							this.onValueChanged(container);
						}
						getMax(container) {							return model.data.radio.volumeMaximum;						}						getMin(container) {							return model.data.radio.volumeMinimum;						}						getValue(container) {							return model.data.radio.volume;						}						setValue(container, value) {
							let prevValue = model.data.radio.volume;							model.data.radio.volume = value;
							if (prevValue < value) {
								 keyboard.sendSpecial(0x52, 1, keyboard.LEFT_GUI ); //turn volume up
							} else if (prevValue > value) {
								 keyboard.sendSpecial(0x51, 1, keyboard.LEFT_GUI ); //turn volume down
							}
													}
					}
				}),			], 
		}),	], 
}));

/* =-====================================================================-= *//* =-======================= APPLICATION SET-UP =========================-= *//* =-====================================================================-= */	
let model = application.behavior = Behavior({
	onLaunch: function(application) {
		let data = this.data = {
			radio: {
				running: false,
				volume: 0,				volumeMaximum: 5,				volumeMinimum: 0,
			},
		};			
		let themes = [{}, {}]
		let theme = themes[0];
		theme.customEffects = [ new Effect, new Effect, new Effect  ];
		theme.customEffects[0].gray("black", blendColors(0.1, COLORS.background1, "black"));
		theme.customEffects[1].gray("black", blendColors(0.1, COLORS.background2, "black"));
		theme.customEffects[2].gray("black", blendColors(0.1, COLORS.background3, "black"));

		theme = themes[1];
		theme.customEffects = [ new Effect, new Effect, new Effect ];
		theme.customEffects[0].gray(blendColors(0.1, COLORS.background1, "white"), "white");
		theme.customEffects[1].gray(blendColors(0.1, COLORS.background2, "white"), "white");
		theme.customEffects[2].gray(blendColors(0.1, COLORS.background3, "white"), "white");

		data.radio.theme = themes[THEME];
		
		let background = new Radio(data);
		let buttons = new Buttons;
		buttons.effect = buttonEffect;

		mainContainer.add(background);
		mainContainer.add(buttons);
		mainContainer.add( new PlayerVolumeDialogBox(data) );
		application.add(mainContainer);
	}
});