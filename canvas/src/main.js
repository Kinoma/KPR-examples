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

var THEME = require("themes/sample/theme");
var CONTROL = require("mobile/control");
var SCROLLER = require("mobile/scroller");
var MODEL = require("mobile/model");

/*
	ASSETS
*/

var toolsTexture = new Texture("./assets/tools.png");
var toolsSkin = new Skin({ texture: toolsTexture,  x:0, y:0, width:32, height:32, states:32, variants:32 });
var menuSkin = new Skin({ texture: toolsTexture, x:64, y:0, width:32, height:32, states:32, 
	tiles: { left:4, right:0, top:0, bottom:0 }, 
});
var marksTexture = new Texture("./assets/marks.png");
var marksSkin = new Skin({ texture: marksTexture,  x:0, y:0, width:30, height:30, states:30 });
var sliderBarSkin = new Skin({ texture: marksTexture, x:30, y:0, width:40, height:30, states:30, 
	tiles:{ left:10, right:10 }
});
var sliderThumbSkin = new Skin({ texture: marksTexture, x:70, y:0, width:20, height:30, states:30 });

var commandStyle = new Style({ font:"bold", size:20, horizontal:"center", color:["white","white","#acd473"] });
var sliderLabelStyle = new Style({ font:"bold", size:14, horizontal:"left", color:["white","white","#acd473"] });
var sliderValueStyle = new Style({ font:"bold", size:14, horizontal:"right", color:["white","white","#acd473"] });

/*
	MODEL
*/

var ReplayLine = function(x, y) {
	this.x = x;
	this.y = y;
}
ReplayLine.prototype.replay = function(canvas) {
	var ctx = canvas.getContext("2d");
	ctx.lineTo(this.x, this.y);
	ctx.stroke();
}
var ReplayMove = function(x, y) {
	var data = model.data;
	var components = data.components;
	this.r = components.r;
	this.g = components.g;
	this.b = components.b;
	this.thickness = data.thickness;
	this.x = x;
	this.y = y;
}
ReplayMove.prototype.replay = function(canvas) {
	var data = model.data;
	var components = data.components;
	components.r = this.r;
	components.g = this.g;
	components.b = this.b;
	model.onColorChanged();
	data.thickness = this.thickness;
	model.onThicknessChanged()
	application.distribute("onModelChanged")
	var ctx = canvas.getContext("2d");
	ctx.lineWidth = data.thickness
	ctx.strokeStyle = data.color
	ctx.beginPath();
	ctx.moveTo(this.x, this.y);
}

var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	doErase: { value: function(application) {
		var canvas = this.data.CANVAS;
		canvas.stop();
		this.replayStack.length = 0;
		this.replayIndex = 0;
		this.replayFlag = false;
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "white"
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		application.distribute("onModelChanged");
	}},
	doPlay: { value: function(application) {
		var canvas = this.data.CANVAS;
		if (this.replayFlag) {
			canvas.stop();
			var replayStack = this.replayStack;
			var c = replayStack.length;
			var i = this.replayIndex;
			while (i < c) {
				replayStack[i].replay(canvas);
				i++;
			}
			this.replayFlag = false;
			this.replayIndex = 0;
		}
		else {
			this.replayFlag = true;
			this.replayIndex = 0;
			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "white"
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			canvas.duration = 10;
			canvas.start();
		}
		application.distribute("onModelChanged");
	}},
	onColorChanged: { value: function() {
		var data = this.data;
		var components = data.components;
		data.color = "rgb(" + components.r + "," + components.g + "," + components.b + ")";
		data.COLOR.skin = new Skin(data.color);
	}},
	onLaunch: { value: function() {
		var data = this.data = { 
			color: "black",
			components: {r:0, g:0, b:0},
			thickness: 10,
		};
		this.replayStack = [];
		this.replayIndex = 0;
		this.replayFlag = false;
		application.add(new Screen(data));
	}},
	onThicknessChanged: { value: function() {
		var data = this.data;
		data.COLOR.height = data.thickness;
	}},
});

var model = application.behavior = new ApplicationBehavior(application);

/*
	SCREEN
*/

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, active:true,
	contents: [
		Canvas($, { anchor:"CANVAS", left:0, right:0, top:0, bottom:0, active:true,
			behavior: Object.create(Behavior.prototype, {
				onDisplaying: { value: function(canvas) {
					var ctx = canvas.getContext("2d");
					ctx.fillStyle = "white"
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}},
				onFinished: { value: function(canvas) {
					if (model.replayIndex >= model.replayStack.length) {
						var ctx = canvas.getContext("2d");
						ctx.fillStyle = "white"
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						model.replayIndex = 0;
					}
					else {
						model.replayStack[model.replayIndex].replay(canvas);
						model.replayIndex++;
					}
					canvas.time = 0;
					canvas.start();
				}},
				onTouchBegan: { value: function(canvas, id, x, y, ticks) {
					if (model.replayFlag)
						return;
					this.position = canvas.position;
					x -= this.position.x;
					y -= this.position.y;
					var ctx = canvas.getContext("2d");
					ctx.lineWidth = model.data.thickness
					ctx.strokeStyle = model.data.color
					ctx.beginPath();
					ctx.moveTo(x, y);
					model.replayStack.push(new ReplayMove(x, y));
				}},
				onTouchMoved: { value: function(canvas, id, x, y, ticks) {
					if (model.replayFlag)
						return;
					x -= this.position.x;
					y -= this.position.y;
					var ctx = canvas.getContext("2d");
					ctx.lineTo(x, y);
					ctx.stroke();
					model.replayStack.push(new ReplayLine(x, y));
				}},
			}),
		}),
		Container($, { left:0, top:0, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onTap: { value: function(container) {
					application.invoke(new Message("xkpr://shell/close?id=" + application.id));
				}},
			}),
			contents: [
				Content($, { skin:toolsSkin, variant:0 }),
			]
		}),
		Container($, { width:32, right:4, height:32, top:0, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onDisplayed: { value: function(container) {
					this.menuVisible = false;
					this.onTap(container);
				}},
				onTap: { value: function(container) {
					if (this.menuVisible)
						container.container.run(new MenuTransition, container, container.last.width - 4);
					else
						container.container.run(new MenuTransition, container, 4 - container.last.width);
					this.menuVisible = !this.menuVisible;
				}},
			}),
			contents: [
				Content($, { skin:toolsSkin, variant:1 }),
				Layout($, { left:32, top:0, skin:menuSkin,
					behavior: Object.create(Behavior.prototype, {
						onMeasureHorizontally: { value: function(layout) {
							var size = layout.first.first.measure();
							return size.width + 4;
						}},
						onMeasureVertically: { value: function(layout) {
							var size = layout.first.first.measure();
							return Math.min(size.height + 4, application.height);
						}},
					}),
					contents: [
						SCROLLER.VerticalScroller($, { left:4, clip:true, 
						contents:[ 
							Menu($),
							SCROLLER.TopScrollerShadow($),
							SCROLLER.BottomScrollerShadow($),
						]}),
					]
				}),
			]
		}),
	],
}});

var Menu = Column.template(function($) { return {
	left:0, top:0,
	contents: [
		Container($, { left:0, right:0, height:60,
			contents: [
				Container($, { width:42, height: 42, skin: new Skin({ fill:"black" }),
					contents: [
						Container($, { width:40, height: 40, skin: new Skin({ fill:"white" }),
							contents: [
								Content($, { anchor:"COLOR", width:40, height:$.thickness, skin: new Skin({ fill:$.color }) }),
							],
						}),
					],
				}),
			],
		}),
		MenuSlider({ log: false, min: 0, max: 255, step: 1, title: "Red",
			getter: function() { return this.components.r; },
			setter: function(value) { this.components.r = Math.round(value); model.onColorChanged(); },
		}),
		MenuSlider({ log: false, min: 0, max: 255, step: 1, title: "Green",
			getter: function() { return this.components.g; },
			setter: function(value) { this.components.g = Math.round(value); model.onColorChanged(); },
		}),
		MenuSlider({ log: false, min: 0, max: 255, step: 1, title: "Blue",
			getter: function() { return this.components.b; },
			setter: function(value) { this.components.b = Math.round(value); model.onColorChanged(); },
		}),
		MenuSlider({ log: false, min: 1, max: 20, step: 1, title: "Size",
			getter: function() { return this.thickness; },
			setter: function(value) { this.thickness = Math.round(value); model.onThicknessChanged(); },
		}),
		Line($, {
			left:0, right:0, height:44, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onTap: { value: function(line) {
					line.bubble("doErase")
				}},
			}),
			contents: [
				Label($, { left:0, right:0, style:commandStyle, string:"Erase" }),
			]
		}),
		Line($, {
			left:0, right:0, height:44, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onModelChanged: { value: function(line) {
					line.first.string = model.replayFlag ? "Pause" : "Play";
				}},
				onTap: { value: function(line) {
					line.bubble("doPlay")
				}},
			}),
			contents: [
				Label($, { left:0, right:0, style:commandStyle, string:"Play" }),
			]
		}),
	]
}});

var MenuSeparator = Line.template(function($) { return { 
	left:0, right:0, active:true,
	contents: [
		Content($, { left:3, right:3, height:1, skin:menuSeparatorSkin }),
	]
}});

var MenuSlider = Container.template(function($) { return { 
	left:0, width:120, height:44, active:true,
	behavior: Object.create(Behavior.prototype, {
		changeState: { value: function(container, state) {
			var content = container.first;
			while (content) {
				content.state = state;
				content = content.next;
			}
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
		}},
		onDisplaying: { value: function(container) {
			this.onModelChanged(container);
		}},
		onFinished: { value: function(container, ticks) {
			var touch = this.touch;
			container.captureTouch(touch.id, touch.x, touch.y, ticks);
			touch.captured = true;
			this.onTouchMoved(container, touch.id, touch.x, touch.y, ticks);
		}},
		onTouchBegan: { value: function(container, id, x, y, ticks) {
			this.touch = { captured: false, id: id, x: x, y: y };
			container.duration = 250;
			container.time = 0;
			container.start();
			this.changeState(container, 2);
		}},
		onTouchCancelled: { value: function(container, id, x, y, ticks) {
			container.stop();
			this.changeState(container, 1);
		}},
		onTouchEnded: { value: function(container, id, x, y, ticks) {
			var touch = this.touch;
			if ((!touch.captured)) {
				container.stop();
				touch.captured = true;
				this.onTouchMoved(container, id, x, y, ticks);
			}
			this.changeState(container, 1);
		}},
		onTouchMoved: { value: function(container, id, x, y, ticks) {
			var touch = this.touch;
			if ((!touch.captured) && (Math.abs(x - touch.x) > 8)) {
				container.stop();
				container.captureTouch(id, x, y, ticks);
				touch.captured = true;
			}
			if (touch.captured) {
				var thumb = container.last;
				var bar = thumb.previous;
				var value = this.offsetToValue(x - bar.x - (thumb.width >> 1), bar.width - thumb.width);
				this.data.setter.call(model.data, value);
				this.onModelChanged(container);
			}
		}},
		offsetToValue: { value: function(offset, size) {
			var data = this.data;
			var result;
			if (data.log) {
			  var minv = Math.log(data.min);
			  var maxv = Math.log(data.max);
			  result = Math.exp(minv + (offset * (maxv - minv) / size));
			}
			else
				result = data.min + ((offset * (data.max - data.min)) / size);
			if (result < data.min)
				result = data.min;
			else if (result > data.max)
				result = data.max;
			return result;
		}},
		onModelChanged: { value: function(container) {
			var thumb = container.last;
			var bar = thumb.previous;
			var data = this.data;
			var value = data.getter.call(model.data);
			thumb.x = bar.x + this.valueToOffset(value, bar.width - thumb.width);
			if (data.step >= 1.0)
				container.first.next.string = Math.round(value).toString();
			else {
				var numStr = value.toString();
				var index = numStr.lastIndexOf(".");
				if (index >= 0)
					numStr = numStr.slice(0, index + 2);
				container.first.next.string = numStr;
			}
		}},
		valueToOffset: { value: function(value, size) {
			var data = this.data;
			var result;
			if (data.log) {
				var minv = Math.log(data.min);
				var maxv = Math.log(data.max);
				result = Math.round(((Math.log(value) - minv) * size) / (maxv - minv));
			}
			else
				result = Math.round(((value - data.min) * size) / (data.max - data.min));
			return result;
		}},
	}),
	contents: [
		Label($, { left:10, right:0, top:4, height:20, style:sliderLabelStyle, string:$.title, }),
		Label($, { left:0, right:10, top:4, height:20, style:sliderValueStyle, }),
		Content($, { left:0, right:0, top:18, skin:sliderBarSkin, }),
		Content($, { left:10, top:18, skin:sliderThumbSkin, }),
	]
}});

/*
	TRANSITIONS
*/

var MenuTransition = function() {
	Transition.call(this, 250);
}
MenuTransition.prototype = Object.create(Transition.prototype, {
	onBegin: { value: function(screen, container, delta) {
		var toolLayer = this.toolLayer = new Layer({ alpha:true });
		toolLayer.attach(container.first);
		var menuLayer = this.menuLayer = new Layer({ alpha:true });
		menuLayer.attach(container.last);
		this.delta = delta;
	}},
	onEnd: { value: function(screen, container, delta) {
		this.menuLayer.detach();
		this.toolLayer.detach();
		container.moveBy(delta, 0);
	}},
	onStep: { value: function(fraction) {
		fraction = Math.quadEaseOut(fraction);
		this.menuLayer.translation = this.toolLayer.translation = { x: this.delta * fraction };
	}}
});












