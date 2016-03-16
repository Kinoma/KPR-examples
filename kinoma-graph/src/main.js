/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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

/* ASSETS */

let backgroundSkin = new Skin({ fill:'#DDD' });

/* BEHAVIORS */

class SliderBehavior extends Behavior {
	getMax(canvas) {
		return this.data.max;
	}
	getMin(canvas) {
		return this.data.min;
	}
	getOffset(canvas, size) {
		let min = this.getMin(canvas);
		let max = this.getMax(canvas);
		let value = this.getValue(canvas);
		return Math.round(((value - min) * size) / (max - min));
	}
	getValue(canvas) {
		return this.data.value;
	}
	onCreate(canvas, data) {
		this.data = data;
		this.tracking = false;
	}
	onDisplaying(canvas) {
		this.onValueChanged(canvas);
	}
	onTouchBegan(canvas, id, x, y, ticks) {
		canvas.captureTouch(id, x, y, ticks);
		this.tracking = true;
		this.onTouchMoved(canvas, id, x, y, ticks);
	}
	onTouchEnded(canvas, id, x, y, ticks) {
		this.tracking = false;
	}
	onTouchMoved(canvas, id, x, y, ticks) {
		let size = (canvas.width - canvas.height);
		let offset = (x - (canvas.height >> 1) - canvas.x);
		this.setOffset(canvas, size, offset);
		this.onValueChanged(canvas);
	}
	onValueChanged(canvas) {
		let ctx = canvas.getContext("2d");
		let width = canvas.width;
		let height = canvas.height;
		let size = (width - height);
		let x = height >> 1;
		let y = height >> 1;
		let delta = height >> 2;
		
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(width - x, y);
		ctx.stroke();
		x = x + this.getOffset(canvas, size);
		y = height >> 1;
		
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x - delta, y + delta);
		ctx.lineTo(x + delta, y + delta);
		ctx.closePath();
		ctx.fill();
		
		ctx.font = "20px Fira Sans";
		size = ctx.measureText(this.data.label);
		ctx.fillText(this.data.label, (width - size.width) >> 1, y - 4);
	}
	setOffset(canvas, size, offset) {
		let min = this.getMin(canvas);
		let max = this.getMax(canvas);
		let value = min + ((offset * (max - min)) / size);
		if (value < min) value = min;
		else if (value > max) value = max;
		this.setValue(canvas, value);
	}
	setValue(canvas, value) {
		this.data.value = value;
		canvas.container.container.distribute("onChanged");
	}
};

/* TEMPLATES */

let KinomaGraphScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Canvas($, {
			left:0, right:0, top:0, bottom:40, active:true,
			Behavior: class extends Behavior {
				computeRadianStep(step) {
					let count = Math.round(360 / step);
					if (count & 1) count++;
					step = 360 / count;
					if (step < 1) step = 1;
					return step * Math.PI / 180;
				}
				draw(canvas) {
					let ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					let dark = "#DDD"
					let lite = "white"
					let centerX = canvas.width / 2;
					let centerY = canvas.height / 2;
					let radius = this.big.length + this.small.length + 10;
					let step = this.big.step;
					let limit = 2 * Math.PI;
					let flag = true;
					ctx.fillStyle = lite;
					ctx.beginPath();
					ctx.arc(centerX, centerY, radius, 0, 360);
					ctx.fill();
					ctx.lineWidth = 10;
					for (let angle = 0; angle < limit; angle += step) {
						ctx.strokeStyle = flag ? dark : lite;
						flag = !flag;
						ctx.beginPath();
						ctx.arc(centerX, centerY, radius, angle, angle + step);
						ctx.stroke();
					}
					let angle = this.big.angle;
					centerX += this.big.length * Math.cos(angle);
					centerY += this.big.length * Math.sin(angle);
					radius = this.small.length;
					step = this.small.step;
					let currentX = centerX + this.small.length * Math.cos(this.small.angle);
					let currentY = centerY + this.small.length * Math.sin(this.small.angle);
					if (this.data.playing)
						canvas.next.delegate("draw", currentX, currentY, angle);
					angle += this.small.angle;
					limit += angle;
					flag = true;
					ctx.fillStyle = dark;
					ctx.beginPath();
					ctx.arc(centerX, centerY, radius, 0, 360);
					ctx.fill();
					ctx.lineWidth = 10;
					for (; angle < limit; angle += step) {
						ctx.strokeStyle = flag ? dark : lite;
						flag = !flag;
						ctx.beginPath();
						ctx.arc(centerX, centerY, radius, angle, angle + step);
						ctx.stroke();
					}
					ctx.lineWidth = 5;
					ctx.strokeStyle = "#E0E0E0";
					ctx.beginPath();
					ctx.moveTo(canvas.width / 2, canvas.height / 2);
					ctx.lineTo(centerX, centerY);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(centerX, centerY);
					ctx.lineTo(currentX, currentY);
					ctx.stroke();
				}
				onCreate(canvas, data) {
					canvas.interval = 25;
					this.data = data;
					this.big = { angle: 0 };
					this.small = { angle: 0 };
				}
				onChanged(canvas) {
					let size = (Math.min(canvas.width, canvas.height) >> 1) - 20;
					let step = this.data.step.value;
					let small = this.small.length = size * this.data.radius.value;
					let big = this.big.length = size - small;
					this.big.step = this.computeRadianStep(step);
					this.small.step = this.computeRadianStep((step * (big + small)) / small);
					if (this.data.playing)
						canvas.start();
					else
						canvas.stop();
					this.draw(canvas);
				}
				onDisplaying(canvas) {
					this.onChanged(canvas);
				}
				onTimeChanged(canvas) {
					this.big.angle += this.big.step;
					this.small.angle -= this.small.step;
					this.draw(canvas);
				}
			}
		}),
		Canvas($, {
			left:0, right:0, top:0, bottom:40, active:true,
			Behavior: class extends Behavior {
				draw(canvas, x, y, angle) {
					if (this.first)
						this.first = false;
					else {
						let ctx = canvas.getContext("2d");
						ctx.strokeStyle = "hsl(" + (Math.round(angle * 180 / Math.PI) % 360) + ",100%,50%)";
						ctx.beginPath();
						ctx.moveTo(this.x, this.y);
						ctx.lineTo(x, y);
						ctx.stroke();
					}
					this.x = x; 
					this.y = y;	
				}
				erase(canvas) {
					let ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					this.first = true;
				}
				onChanged(canvas) {
					this.erase(canvas);
				}
				onDisplaying(canvas) {
					this.erase(canvas);
				}
			}
		}),
		Line($, {
			left:0, right:0, height:40, bottom:0,
			contents: [
				Canvas($.radius, { left:0, right:0, top:0, bottom:0, active:true, Behavior:SliderBehavior }),
				Canvas($, { width:40, top:0, bottom:0, active:true,
					Behavior: class extends Behavior {
						draw(canvas) {
							let ctx = canvas.getContext("2d");
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx.fillStyle = this.tracking ? "aqua" : "black";
							if (this.data.playing) {
								ctx.fillRect(7, 5, 10, 30);
								ctx.fillRect(23, 5, 10, 30);
							}
							else {
								ctx.beginPath();
								ctx.moveTo(35, 20);
								ctx.lineTo(5, 5);
								ctx.lineTo(5, 35);
								ctx.closePath();
								ctx.fill();
							}
						}
						onCreate(canvas, data) {
							this.data = data;
							this.tracking = false;
						}
						onDisplaying(canvas, data) {
							this.draw(canvas);
						}
						onTouchBegan(canvas, id, x, y, ticks) {
							canvas.captureTouch(id, x, y, ticks);
							this.tracking = true;
							this.draw(canvas);
						}
						onTouchEnded(canvas, id, x, y, ticks) {
							this.tracking = false;
							this.data.playing = !this.data.playing;
							this.draw(canvas);
							canvas.container.container.distribute("onChanged");
						}
					}
				}),
				Canvas($.step, { left:0, right:0, top:0, bottom:0, active:true, Behavior:SliderBehavior }),
			]
		})
	]
}));

/* APPLICATION */

let data = {
	playing: false,
	radius: { label:'Radius', min:0.1, max:0.9, value:0.25 },
	step: { label:'Steps', min:1, max:10, value:4 }
};
application.add(new KinomaGraphScreen(data));
