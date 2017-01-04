let cancellerSkin = new Skin({ fill: ['transparent', '#A0000000'], });

class VolumeDialogBoxBehavior extends Behavior{
	onCancel(container) {
		this.former.focus();
		model.dialog = null;
		application.run(new MenuCloseTransition, container, this.data.button);
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

var VolumeDialogBox = Container.template($ => ({ 
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