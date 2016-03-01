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

var LightThumbnail = Canvas.template($ => ({
	width:80, height:80,
	behavior: Behavior({
		draw(canvas, state) {
			var ctx = canvas.getContext("2d");
			ctx.beginPath();
			ctx.arc(40, 40, 32, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.fillStyle = hsvToColor($.hue, $.saturation, 0.5 + $.brightness * 0.5);
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = blendColors(state, "white", "#5eccf1");
			ctx.stroke();
		},
		changeState(canvas, state) {
			canvas.state = state;
			this.draw(canvas);
		},
		onColorsChanged(canvas) {
			this.draw(canvas);
		},
		onLightChanged(canvas) {
			this.draw(canvas);
		},
		onCreate(canvas, $) {
			this.draw(canvas);
		},
	})
}));

var BrightnessSlider = Canvas.template($ => ({
	width: 120, height: 50, active: true,
	behavior: Behavior({ 
		getValue(canvas) {
			return this.data.brightness;
		},
		onDisplaying(container) {
			this.onValueChanged(container);
		},
		onTouchBegan(canvas, id, x, y, ticks) {
			this.onTouchMoved(container, id, x, y, ticks);
		},
		onTouchEnded(canvas, id, x, y, ticks) {
			this.setValue(container, x);
		
		},
		onTouchMoved(container, id, x, y, ticks) {
			this.setValue(container, x);
			this.onValueChanged(container);
		},
		onValueChanged(container) {
			var canvas = container.first;
			canvas.x = container.x;
			canvas.y = container.y;
		},
		setValue(canvas, x) {
			var value = x/ canvas.width;
			this.data.brightness = value;
			canvas.container.distribute("onLightChanged");
		},
	}),
	contents: [
		Canvas($, {
			left:0, width:40, top:0, height:40,
			behavior: Behavior({
				draw(canvas) {	
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.roundRect(10, 15, 220, 20, 10);
					var grd = ctx.createLinearGradient(0, 0, 240, 0);
					var hue = $.hue;
					var saturation = $.saturation;
					grd.addColorStop(0, hsvToColor(hue, saturation, 0));
					grd.addColorStop(1, hsvToColor(hue, saturation, 1));
					ctx.fillStyle = grd;
					ctx.fill();
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(20, 25, 14, 0, 2 * Math.PI);
					ctx.closePath();
					ctx.lineWidth = 6;
					ctx.strokeStyle = "black";
					ctx.stroke();
					ctx.lineWidth = 4;
					ctx.strokeStyle = "white";
					ctx.stroke();
				},
				onCreate(canvas) {
					this.draw(canvas);
				}
			})
		})
	],
}));

var HueSlider = Container.template($ => ({
	width: 200, height: 200, skin: wheelSkin, 
	behavior: Behavior({
		onCreate(container, $) {
			this.data = $;
			container.variant = $.colorable ? 0 : 1;
			container.active = $.colorable;
		},
		onDisplaying(container) {
			this.onValueChanged(container);
		},
		onTouchBegan(container, id, x, y, ticks) {
			this.onTouchMoved(container, id, x, y, ticks);
		},
		onTouchEnded(container, id, x, y, ticks) {
			var radius = container.width >> 1;
			var angle = Math.atan2(container.y + radius - y, x - container.x - radius);
			this.setAngle(container, angle);
			this.onValueChanged(container);
		},
		onTouchMoved(container, id, x, y, ticks) {
			var radius = container.width >> 1;
			var angle = Math.atan2(container.y + radius - y, x - container.x - radius);
			this.setAngle(container, angle);
			this.onValueChanged(container);
		},
		onValueChanged(container) {
			var angle = this.getAngle(container);
			var canvas = container.first;
			var radius = (container.width - canvas.width) >> 1;
			canvas.x = container.x + radius + Math.round(radius * Math.cos(angle));
			canvas.y = container.y + radius - Math.round(radius * Math.sin(angle));
		},
		getAngle(container) {
			var value = this.getValue(container);
			var angle = value * 2 * Math.PI;
			if (angle > Math.PI)
				angle -= (2 * Math.PI);
			return angle;
		},
		getMin(container) {
			return 0;
		},
		getRange(container) {
			return 1;
		},
		getValue(container) {
			return this.data.hue;
		},
		setAngle(container, angle) {
			if (angle < 0)
				angle += (2 * Math.PI);
			if (angle >= 2 * Math.PI)
				angle = 0;
			var value = angle / (2 * Math.PI);
			this.setValue(container, value);
		},
		setValue(container, value) {
			this.data.hue = value;
			application.distribute("onLightChanged");
		},
	}), 
	contents: [
		Canvas($, {
			left:0, width:40, top:0, height:40,
			behavior: Behavior({
				onCreate(canvas, $) {
					this.draw(canvas);
				},
				draw(canvas) {
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.beginPath();
					ctx.arc(20, 20, 14, 0, 2 * Math.PI);
					ctx.closePath();
					ctx.lineWidth = 6;
					ctx.strokeStyle = "black";
					ctx.stroke();
					ctx.lineWidth = 4;
					ctx.strokeStyle = "white";
					ctx.stroke();
				},
			})
		}),
		LightThumbnail($, {})
	],
}));

var hsvToColor = function(h, s, v, a) {
	h *= 360;
	var c = v * s;
	var hp = h / 60;
	var x = c * (1 - Math.abs((hp % 2) - 1));
	var r, g, b;
	if (hp < 1) {
		r = c; g = x; b = 0;
	}
	else if (hp < 2) {
		r = x; g = c; b = 0;
	}
	else if (hp < 3) {
		r = 0; g = c; b = x;
	}
	else if (hp < 4) {
		r = 0; g = x; b = c;
	}
	else if (hp < 5) {
		r = x; g = 0; b = c;
	}
	else {
		r = c; g = 0; b = x;
	}
	var m = v - c;
	r += m; g += m; b += m;
	r = Math.round(r * 255* 255/140);
	g = Math.round(g * 255* 255/140);
	b = Math.round(b * 255* 255/140);
	if (a != undefined)
		return "rgba(" + r + "," + g + "," + b + "," + a + ")"
	//trace("rgb(" + r + "," + g + "," + b + ")\n");
	return "rgb(" + r + "," + g + "," + b + ")"
}
