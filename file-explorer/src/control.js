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
 export var Skin2 = function(texture) {
	let effects = Array.apply(null, arguments);
	let c = effects.length - 1;
	let srcScale = texture.scale;
	let srcWidth = texture.width;
	let srcHeight = texture.height;
	let dstScale = screenScale;
	let dstWidth = Math.round(srcWidth / dstScale);
	let dstHeight = Math.round(srcHeight / dstScale);
	let port = new Port({width: dstWidth, height: dstHeight * c});
	port.behavior = {
		onDraw(port) {
			var y = 0;
			for (var i = 0; i < c; i++) {
				var effect = effects[1 + i];
				if (effect) {
					port.effect = effect;
					port.drawImage(texture, 0, y, dstWidth, dstHeight, 0, 0, srcWidth, srcHeight);
				}
				y += dstHeight;
			}
		}
	}
	let result = new Texture(port, srcScale);
	let size = Math.round(srcHeight / srcScale);
	Skin.call(this, result, {x:0, y:0, width:size, height:size}, size, size);
};
Skin2.prototype = Skin.prototype;


let busyCount = 16;
export class BusyBehavior extends Behavior {
	onCreate(target) {
		target.duration = 125;
		target.variant = 0;
	}
	onDisplayed(target) {
		target.start();
	}
	onFinished(target) {
		let variant = target.variant + 1;
		if (variant == busyCount) variant = 0;
		target.variant = variant;
		target.time = 0;
		target.start();
	}
}

let spinnerCount = 24;
export class SpinnerBehavior extends Behavior {
	onCreate(target) {
		target.duration = 60;
		target.variant = 0;
	}
	onDisplayed(target) {
		target.start();
	}
	onFinished(target) {
		let variant = target.variant + 1;
		if (variant == spinnerCount) variant = 0;
		target.variant = variant;
		target.time = 0;
		target.start();
	}
}

export class ButtonBehavior extends Behavior {
	changeState(container, state) {
		container.state = state;
		let content = container.first;
		while (content) {
			content.state = state;
			content = content.next;
		}
	}
	onCreate(content, data) {
		this.data = data;
	}
	onDisplaying(content) {
		this.onStateChanged(content);
	}
	onStateChanged(container) {
		this.changeState(container, container.active ? 1 : 0);
	}
	onTap(container) {
		var data = this.data;
		if (data && ("action" in data))
			container.invoke(new Message(data.action));
	}
	onTouchBegan(container, id, x, y, ticks) {
		this.changeState(container, 2);
	}
	onTouchCancelled(container, id, x, y, ticks) {
		this.changeState(container, 1);
	}
	onTouchEnded(container, id, x, y, ticks) {
		this.changeState(container, 1);
		this.onTap(container);
	}
}

export class CheckboxBehavior extends ButtonBehavior {
	onTap(container) {
		var data = this.data;

		data.value = (data.value !== 'on') ? 'on' : 'off';

		var content = container.first;
		while (content) {
			content.delegate('onValueChanged');
			content = content.next;
		}

		this.onValueChanged(container);
	}
}

let CHECK_ON = 3;
let CHECK_OFF = 2;
class CheckboxBehavior2 extends Behavior {
	onCreate(content, data) {
		this.data = data;
	}
	onValueChanged(content) {
		let data = this.data;
		content.variant = (data.value === 'on' ? CHECK_ON : CHECK_OFF);
	}
}

let dialogDisabledEffect = new Effect();
let dialogEnabledEffect = new Effect();
dialogEnabledEffect.colorize('#404040', 1);
let dialogSelectedEffect = new Effect();
dialogSelectedEffect.colorize('#598527', 1);
let dialogButtonsTexture = new Texture('assets/dialogButtons.png', 2);
let dialogButtonsSkin = new Skin2(dialogButtonsTexture, dialogDisabledEffect, dialogEnabledEffect, dialogSelectedEffect);

export var Checkbox = Content.template($ => ({ 
	skin: dialogButtonsSkin, variant: CHECK_OFF, 
	behavior: new CheckboxBehavior2
}));

export class FieldDeleterBehavior extends Behavior {
	onCreate(content, data) {
		this.data = data;
		this.onStateChanged(content);
	}
	onStateChanged(content) {
		content.state = content.active ? 1 : 0;
	}
	onTouchBegan(content, id, x, y, ticks) {
		content.state = 2;
		content.captureTouch(id, x, y, ticks);
	}
	onTouchCancelled(content, id, x, y, ticks) {
		content.state = 1;
	}
	onTouchEnded(content, id, x, y, ticks) {
		content.state = 1;
		let label = content.previous.first;
		label.string = "";
		label.focus();
		label.behavior.onEdited(label);
	}
}

export class FieldLabelBehavior extends Behavior {
	onCreate(label, data) {
		this.data = data;
	}
	onDisplayed(label) {
		this.onEdited(label);
	}
	onEdited(label) {
	}
	onFocused(label) {
		label.select(0, label.length)
		KEYBOARD.show();
	}
	onKeyDown(label, key, repeat, ticks) {
		if (key) {
			var code = key.charCodeAt(0);
			var edited = false;
			switch (code) {
			case 1: /* home */
				label.select(0, 0);
				break;
			case 2: /* delete selection */
				label.insert();
				edited = true;
				break;
			case 3: /* enter */
				return false;
			case 4: /* end */
				label.select(label.length, 0);
				break;
			case 5: /* help */
				return false;
			case 8: /* backspace */
				if (label.selectionLength == 0)
					label.select(label.selectionOffset - 1, 1)
				label.insert()
				edited = true;
				break;
			case 9: /* tab */
				return false;
			case 11: /* page up */
				return false;
			case 12: /* page down */
				return false;
			case 13: /* return */
				if (label instanceof Text) {
					label.insert(key);
					edited = true;
				}
				else
					return false;
				break;
			case 27: /* escape */
				return false;
			case 28: /* left */
				if (shiftKey) {
					label.select(label.selectionOffset - 1, label.selectionLength + 1);
				}
				else {
					if (label.selectionLength == 0)
						label.select(label.selectionOffset - 1, 0);
					else
						label.select(label.selectionOffset, 0);
				}
				break;
			case 29: /* right */
				if (shiftKey)
					label.select(label.selectionOffset, label.selectionLength + 1);
				else {
					if (label.selectionLength == 0)
						label.select(label.selectionOffset + 1, 0);
					else
						label.select(label.selectionOffset + label.selectionLength, 0);
				}
				break;
			case 30: /* up */
				return false;
			case 31: /* down */
				return false;
			case 127: /* delete */
				if (label.selectionLength == 0)
					label.select(label.selectionOffset, 1)
				label.insert()
				edited = true;
				break;
			default:
				if ((Event.FunctionKeyPlay <= code) && (code <= Event.FunctionKeyPower))
					return false;
				if (code > 0x000F0000)
					return false;
				label.insert(key);
				edited = true;
			}
		}
		else {
			label.insert()
			edited = true;
		}
		this.onReveal(label);
		if (edited)
			this.onEdited(label);
		return true;
	}
	onKeyUp(label, key, repeat, ticks) {
		if (!key) return false
		var code = key.charCodeAt(0);
		var edited = false;
		switch (code) {
		case 3: /* enter */
		case 5: /* help */
		case 9: /* tab */
		case 11: /* page up */
		case 12: /* page down */
		case 27: /* escape */
		case 30: /* up */
		case 31: /* down */
			return false;
		case 13: /* return */
			return label instanceof Text;
		default:
			if ((Event.FunctionKeyPlay <= code) && (code <= Event.FunctionKeyPower))
				return false;
			return code <= 0x000F0000;
		}
	}
	onReveal(label) {
		label.container.reveal(label.selectionBounds);
	}
	onTouchBegan(label, id, x, y, ticks) {
		this.position = label.position;
		var offset = label.hitOffset(x - this.position.x, y - this.position.y);
		if (shiftKey) {
			if (offset < label.selectionOffset)
				this.anchor = label.selectionOffset + label.selectionLength;
			else
				this.anchor = label.selectionOffset;
		}
		else
			this.anchor = offset;
		this.onTouchMoved(label, id, x, y, ticks);
	}
	onTouchEnded(label, id, x, y, ticks) {
		this.onTouchMoved(label, id, x, y, ticks);
	}
	onTouchMoved(label, id, x, y, ticks) {
		this.offset = label.hitOffset(x - this.position.x, y - this.position.y);
		label.select(this.offset, 0);
	}
}

export class FieldScrollerBehavior extends Behavior {
	onTouchBegan(scroller, id, x, y, ticks) {
		let label = scroller.first;
		this.tracking = label.focused;
		if (this.tracking)
			label.behavior.onTouchBegan(label, id, x, y, ticks);
		else
			label.focus();
	}
	onTouchMoved(scroller, id, x, y, ticks) {
		let label = scroller.first;
		if (this.tracking)
			label.behavior.onTouchMoved(label, id, x, y, ticks);
	}
	onTouchEnded(scroller, id, x, y, ticks) {
		let label = scroller.first;
		if (this.tracking)
			label.behavior.onTouchEnded(label, id, x, y, ticks);
	}
}

export class MediaBehavior extends Behavior {
	onCreate(media, data) {
		this.data = data;
	}
	onStateChanged(media) {
		let controller = this.data.CONTROLLER;
		if (controller)
			controller.behavior.onMediaStateChanged(controller, media);
	}
	onTimeChanged(media) {
		let seeker = this.data.SEEKER;
		if (seeker)
			seeker.behavior.onMediaTimeChanged(seeker, media);
	}
}

let DISABLED = 0;
let ENABLED = 1;
let SELECTED = 2;
export class MediaButtonBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
	}
	onDisplaying(container) {
		let media = this.data.MEDIA;
		if (media)
			this.onMediaStateChanged(container, media);
	}
	onMediaStateChanged(container, media) {
		let background = container.first;
		let button = background.next;
		let busy = button.next;
		switch (media.state) {
		case Media.FAILED:
			container.active = false;
			background.visible = true;
			button.visible = false;
			busy.visible = true;
			busy.stop();
			busy.variant = busyCount;
			break;
		case Media.PAUSED:
			container.active = true;
			background.visible = true;
			button.visible = true;
			busy.visible = false;
			button.state = ENABLED;
			busy.stop();
			break;
		case Media.PLAYING:
			container.active = true;
			background.visible = false;
			button.visible = false;
			busy.visible = false;
			busy.stop();
			break;
		case Media.WAITING:
			container.active = false;
			background.visible = true;
			button.visible = false;
			busy.visible = true;
			busy.start();
			break;
		}
	}
	onTouchBegan(container, id, x, y, ticks) {
		let button = container.first.next;
		button.state = SELECTED;
	}
	onTouchEnded(container, id, x, y, ticks) {
		let media = this.data.MEDIA;
		if (media) {
			if (media.state == Media.PAUSED)
				media.start();
			else if (media.state == Media.PLAYING)
				media.stop();
		}
	}
}

let mainTexture =  new Texture('assets/main.png', 1);
let mediaButtonBackgroundSkin = new Skin({ texture: mainTexture, y: 150, width: 50, height: 50, });

let STOP = 0;
let PLAY = 1;
let PAUSE = 2;
let NEXT = 3;
let PREVIOUS = 4;

let toolTexture = new Texture('assets/tools.png', 2);
let toolDisabledEffect = null;
let toolEnabledEffect = new Effect();
toolEnabledEffect.colorize('white', 1);
let toolSelectedEffect = new Effect();
toolSelectedEffect.colorize('#acd473', 1);
let toolSkin = new Skin(toolTexture, toolDisabledEffect, toolEnabledEffect, toolSelectedEffect);

let busyTexture = new Texture('assets/busy.png', 1);
let busySkin = new Skin({ texture: busyTexture, width: 40, height: 40, variants: 40, });

export var MediaButton = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	behavior: new MediaButtonBehavior,
	contents: [
		Content($, { skin: mediaButtonBackgroundSkin }),
		Content($, { skin: toolSkin, state: ENABLED, variant: PLAY }),
		Content($, { skin: busySkin, behavior: new BusyBehavior }),
	]
}));

export class MediaControllerBehavior extends ButtonBehavior {
	onDisplaying(container) {
		let media = this.data.MEDIA;
		if (media)
			this.onMediaStateChanged(container, media);
	}
	onMediaStateChanged(container, media) {
		let button = container.first;
		let busy = container.last;
		switch (media.state) {
			case Media.FAILED:
				container.active = false;
				button.visible = false;
				busy.visible = true;
				button.variant = PLAY;
				busy.stop();
				busy.state = busyCount;
				break;
			case Media.PAUSED:
				container.active = true;
				button.visible = true;
				busy.visible = false;
				button.variant = PLAY;
				busy.stop();
				break;
			case Media.PLAYING:
				container.active = true;
				button.visible = true;
				busy.visible = false;
				button.variant = PAUSE;
				busy.stop();
				break;
			case Media.WAITING:
				container.active = false;
				button.visible = false;
				busy.visible = true;
				button.variant = PLAY;
				busy.start();
				break;
		}
	}
	onTap() {
		let media = this.data.MEDIA;
		if (media) {
			if (media.state == Media.PAUSED)
				media.start();
			else if (media.state == Media.PLAYING)
				media.stop();
		}
	}
}

let screenFooterHeight = 50;
let screenHeaderHeight = 50;

export var MediaController = Container.template($ => ({ 
	width: screenFooterHeight, height: screenFooterHeight, active: true, 
	behavior: new MediaControllerBehavior, 
	contents: [
		Content($, { skin: toolSkin, variant: PLAY }),
		Content($, { skin: busySkin, behavior: Object.create((BusyBehavior).prototype) }),
	] 
}));

export class MediaSeekerBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
	}
	onDisplaying(content) {
		let media = this.data.MEDIA;
		if (media)
			this.onMediaTimeChanged(content, media);
	}
	onMediaTimeChanged(container, media) {
		let duration = media.duration;
		let time = media.time;
		let left = container.first.next;
		let right = left.next;
		left.string = toTimeCode(time / 1000);
		right.string = toTimeCode(duration / 1000);
		let button = container.last;
		let bar = button.previous;
		let background = bar.previous;
		let width = (background.width - button.width) * time / duration;
		button.x = background.x + width;
		bar.width = button.width + width;
	}
	onTouchBegan(container, id, x, y, ticks) {
		let media = this.data.MEDIA;
		this.playing = media.state == Media.PLAYING;
		if (this.playing)
			media.stop();
		media.seeking = true;
		container.last.state = 1;
		this.onTouchMoved(container, id, x, y, ticks);
	}
	onTouchEnded(container, id, x, y, ticks) {
		let media = this.data.MEDIA;
		media.seeking = false;
		if (this.playing)
			media.start();
		container.last.state = 0;
	}
	onTouchMoved(container, id, x, y, ticks) {
		let button = container.last;
		let bar = button.previous;
		let background = bar.previous;
		let media = this.data.MEDIA;
		let duration = media.duration;
		let time = duration * (x - (button.width >> 1) - background.x) / (background.width - button.width);
		if (time < 0) time = 0;
		else if (time > duration) time = duration;
		media.time = time;
	}
}

let mediaSeekerBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 } });
let mediaSeekerButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50 });
let mediaSeekerLabelSkin = new Skin({ texture: mainTexture, x: 150, y: 150, width: 50, height: 50 });
let mediaSeekerStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'center' });
let mediaSeekerLeftStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'left' });
let mediaSeekerRightStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'right' });
let mediaSeekerTopStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'center' });
let mediaSeekerBottomStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'center' });
let mediaSeekerTopSkin = new Skin({ borders: { left:1, right:1, top:1 }, stroke: '#959595' });
let mediaSeekerBottomSkin = new Skin({ fill: '#959595',});

export var MediaSeeker = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, 
	behavior: new MediaSeekerBehavior, 
	contents: [
		Content($, { width: 50, right: 0, top: 0, bottom: 0, skin: mediaSeekerLabelSkin, }),
		Label($, { width: 42, right: 4, top: 4, height: 21, style: mediaSeekerTopStyle, }),
		Label($, { width: 42, right: 4, top: 25, height: 21, style: mediaSeekerBottomStyle, }),
		Content($, { left: 0, right: 50, top: 0, bottom: 0, skin: mediaSeekerBarSkin, state: 0, }),
		Content($, { left: 0, width: 30, top: 0, bottom: 0, skin: mediaSeekerBarSkin, state: 1, }),
		Content($, { left: 0, width: 30, top: 0, bottom: 0, skin: mediaSeekerButtonSkin, state: 0, }),
	]
}));

export class SliderBehavior extends Behavior {
	changeState(container, state) {
		container.last.state = state;
	}
	getMax(container) {
		return this.data.max;
	}
	getMin(container) {
		return this.data.min;
	}
	getOffset(container, size) {
		let min = this.getMin(container);
		let max = this.getMax(container);
		let value = this.getValue(container);
		return Math.round(((value - min) * size) / (max - min));
	}
	getValue(container) {
		return this.data.value;
	}
	onAdapt(container) {
		this.onLayoutChanged(container);
	}
	onCreate(container, data) {
		this.data = data;
	}
	onDisplaying(container) {
		this.onLayoutChanged(container);
	}
	onTouchBegan(container, id, x, y, ticks) {
		container.captureTouch(id, x, y, ticks);
		this.changeState(container, 1);
		this.onTouchMoved(container, id, x, y, ticks);
	}
	onTouchEnded(container, id, x, y, ticks) {
		this.changeState(container, 0);
	}
	setOffset(container, size, offset) {
		let min = this.getMin(container);
		let max = this.getMax(container);
		let value = min + ((offset * (max - min)) / size);
		if (value < min) value = min;
		else if (value > max) value = max;
		this.setValue(container, value);
	}
	setValue(container, value) {
		this.data.value = value;
	}
}

export class HorizontalSliderBehavior extends SliderBehavior {
	onLayoutChanged(container) {
		let button = container.last;
		let bar = button.previous;
		let background = bar.previous;
		let size = (background.width - button.width);
		let offset = this.getOffset(container, size);
		button.x = background.x + offset;
		bar.width = button.width + offset;
	}
	onTouchMoved(container, id, x, y, ticks) {
		let button = container.last;
		let bar = button.previous;
		let background = bar.previous;
		let size = (background.width - button.width);
		let offset = (x - (button.width >> 1) - background.x);
		this.setOffset(container, size, offset);
		this.onLayoutChanged(container);
		this.onValueChanged(container);
	}
}

let horizontalSliderBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 } });
let horizontalSliderButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50 });
let verticalSliderBarSkin = new Skin({ texture: mainTexture, x: 200, y: 95, width: 50, height: 60, states: 50, tiles: { top:15, bottom:25 } });
let verticalSliderButtonSkin = new Skin({ texture: mainTexture, x: 250, y: 110, width: 50, height: 30, states: 50 });

export var HorizontalSlider = Layout.template($ => ({ 
	active: true, behavior: new HorizontalSliderBehavior, 
	contents: [
		Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: horizontalSliderBarSkin, state: 0, }),
		Content($, { left: 0, width: 30, top: 0, bottom: 0, skin: horizontalSliderBarSkin, state: 1, }),
		Content($, { left: 0, width: 30, top: 0, bottom: 0, skin: horizontalSliderButtonSkin, state: 0, }),
	]
}));

export class HorizontalLogSliderBehavior extends HorizontalSliderBehavior {
	getOffset(container, size) {
		let min = this.getMin(container);
		let max = this.getMax(container);
		let value = this.getValue(container);
		let logMin = Math.log(min);
		let maxv = Math.log(max);
		return Math.round(((Math.log(value) - logMin) * size) / (maxv - logMin));
	}
	setOffset(container, size, offset) {
		let min = this.getMin(container);
		let max = this.getMax(container);
		let logMin = Math.log(min);
		let logMax = Math.log(max);
		let value = Math.exp(logMin + (offset * (logMax - logMin) / size));
		if (value < min) value = min;
		else if (value > max) value = max;
		this.setValue(container, value);
	}
}

export var HorizontalLogSlider = Layout.template($ => ({ 
	active: true, behavior: new HorizontalLogSliderBehavior, 
	contents: [
		Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: horizontalSliderBarSkin, state: 0, }),
		Content($, { left: 0, width: 30, top: 0, bottom: 0, skin: horizontalSliderBarSkin, state: 1, }),
		Content($, { left: 0, width: 30, top: 0, bottom: 0, skin: horizontalSliderButtonSkin, state: 0, }),
	]
}));

export class VerticalSliderBehavior extends SliderBehavior {
	onLayoutChanged(container) {
		let button = container.last;
		let bar = button.previous;
		let background = bar.previous;
		let size = (background.height - button.height);
		let offset = this.getOffset(container, size);
		button.y = background.y + background.height - offset - button.height;
		bar.height = button.height + offset;
	}
	onTouchMoved(container, id, x, y, ticks) {
		let button = container.last;
		let bar = button.previous;
		let background = bar.previous;
		let size = (background.height - button.height);
		let offset = background.y + background.height - (y + (button.height >> 1));
		this.setOffset(container, size, offset);
		this.onLayoutChanged(container);
		this.onValueChanged(container);
	}
}

export var VerticalSlider = Layout.template($ => ({ 
	active: true, behavior: new VerticalSliderBehavior, 
	contents: [
		Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: verticalSliderBarSkin, state: 0, }),
		Content($, { left: 0, right: 0, height: 30, bottom: 0, skin: verticalSliderBarSkin, state: 1, }),
		Content($, { left: 0, right: 0, top: 0, height: 30, skin: verticalSliderButtonSkin, state: 0, }),
	] 
}));

export class VerticalLogSliderBehavior extends VerticalSliderBehavior {
	getOffset(container, size) {
		let min = this.getMin(container);
		let max = this.getMax(container);
		let value = this.getValue(container);
		let logMin = Math.log(min);
		let maxv = Math.log(max);
		return Math.round(((Math.log(value) - logMin) * size) / (maxv - logMin));
	}
	setOffset(container, size, offset) {
		let min = this.getMin(container);
		let max = this.getMax(container);
		let logMin = Math.log(min);
		let logMax = Math.log(max);
		let value = Math.exp(logMin + (offset * (logMax - logMin) / size));
		if (value < min) value = min;
		else if (value > max) value = max;
		this.setValue(container, value);
	}
}

export var VerticalLogSlider =  Layout.template($ => ({ 
	active: true, behavior: new VerticalLogSliderBehavior, 
	contents: [
		Content($, { left: 10, right: 20, top: 0, bottom: 0, skin: verticalSliderBarSkin, state: 0, }),
		Content($, { left: 10, right: 20, height: 30, bottom: 0, skin: verticalSliderBarSkin, state: 1, }),
		Content($, { left: 10, right: 20, top: 0, height: 30, skin: verticalSliderButtonSkin, state: 0, }),
	]
}));

export class TabBarBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		let content = container.content(data.selection);
		content.active = false;
	}
	onTabTap(container, item) {
		let content = container.first;
		while (content) {
			content.active = content != item;
			content = content.next;
		}
		this.data.selection = item.index;
	}
}

export class TabBehavior extends ButtonBehavior {
	onTap(content) {
		content.bubble("onTabTap", content);
	}
}

export class HorizontalTickerBehavior extends Behavior {
	onDisplaying(scroller) {
		scroller.interval = 25;
		if (scroller.width < scroller.first.width)
			scroller.start();
		else
			scroller.stop();
	}
	onTimeChanged(scroller) {
		scroller.scrollBy(1, 0);
	}
}

export class VerticalTickerBehavior extends Behavior {
	onDisplaying(scroller) {
		scroller.interval = 10;
		if (scroller.height < scroller.first.height)
			scroller.start();
		else
			scroller.stop();
	}
	onTimeChanged(scroller) {
		scroller.scrollBy(0, 1);
	}
}

export class ThumbnailBehavior extends Behavior {
	onLoaded(thumbnail) {
		thumbnail.opacity = 0;
		thumbnail.duration = 500;
		thumbnail.time = 0;
		thumbnail.start();
	}
	onTimeChanged(thumbnail) {
		thumbnail.opacity = thumbnail.fraction;
	}
}

export default {
	Skin2, BusyBehavior, SpinnerBehavior, ButtonBehavior, CheckboxBehavior, Checkbox, FieldDeleterBehavior, FieldLabelBehavior, FieldScrollerBehavior, MediaBehavior, MediaButtonBehavior, MediaButton, MediaControllerBehavior, MediaController, MediaSeekerBehavior, MediaSeeker, SliderBehavior, HorizontalSliderBehavior, HorizontalSlider, HorizontalLogSliderBehavior, HorizontalLogSlider, VerticalSliderBehavior, VerticalSlider, VerticalLogSliderBehavior, VerticalLogSlider, TabBarBehavior, TabBehavior, HorizontalTickerBehavior, VerticalTickerBehavior, ThumbnailBehavior 
};