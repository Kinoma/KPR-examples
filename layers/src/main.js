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
var BALLS = require("./balls");

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
var menuSeparatorSkin = new Skin({ fill:"gray" });
var sliderBarSkin = new Skin({ texture: marksTexture, x:30, y:0, width:40, height:30, states:30, 
	tiles:{ left:10, right:10 }
});
var sliderThumbSkin = new Skin({ texture: marksTexture, x:70, y:0, width:20, height:30, states:30 });

var commandStyle = new Style({ font:"bold", size:20, horizontal:"center", color:["white","white","#acd473"] });
var sliderLabelStyle = new Style({ font:"bold", size:14, horizontal:"left", color:["white","white","#acd473"] });
var sliderValueStyle = new Style({ font:"bold", size:14, horizontal:"right", color:["white","white","#acd473"] });
var titleStyle = new Style({ font:"bold", size:64, color:"gray" });

/*
	MODEL
*/

var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	doPlay: { value: function(application) {
		var layer = this.data.LAYER;
		if (this.playing) {
			BALLS.unbuild(layer);
			this.playing = false;
		}
		else {
			BALLS.build(layer);
			this.playing = true;
		}
		application.distribute("onModelChanged");
	}},
	doReset: { value: function(application, effect) {
		var layer = this.data.LAYER;
		layer.opacity = 1;
		layer.origin = {x: 140, y: 105};
		layer.scale = {x: 1, y: 1};
		layer.rotation = 0;
		layer.skew = {x: 0, y: 0};
		layer.translation = {x: 0, y: 0};
		layer.corners = this.data.corners = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		application.distribute("onModelChanged");
	}},
	onLaunch: { value: function() {
		var data = this.data = { 
			corners: [
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: 1, y: 1 },
				{ x: 0, y: 1 },
			],
			title: "Layer",
		};
		this.playing = false;
		
		application.add(new Screen(data));
	}},
});

var model = application.behavior = new ApplicationBehavior(application);

/*
	SCREEN
*/

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, active:true,
	contents: [
		Container($, { left:0, right:0, top:0, bottom:0, skin:new Skin({ fill:"#FFFFFF" }),
			contents: [
				Layer($, { anchor:"LAYER", width:280, height:210, alpha: true,
					contents: [
						Container($, { width:280, height:210, skin:new Skin({ fill:"#F0F0F0" }),
							contents: [
								Label($, { style:titleStyle, string: $.title }),
							],
						})
					],
				}),
			],
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
		MenuSlider({ log: false, min: 0, max: 100, step: 1, title: "Opacity",
			getter: function() { return this.LAYER.opacity * 100 },
			setter: function(value) { this.LAYER.opacity = value / 100; },
		}),
		MenuSlider({ log: false, min: 0, max: 280, step: 1, title: "Origin X",
			getter: function() { return this.LAYER.origin.x },
			setter: function(value) { this.LAYER.origin = { x: value }; },
		}),
		MenuSlider({ log: false, min: 0, max: 210, step: 1, title: "Origin Y",
			getter: function() { return this.LAYER.origin.y },
			setter: function(value) { this.LAYER.origin = { y: value }; },
		}),
		MenuSlider({ log: true, min: 10, max: 1000, step: 10, title: "Scale X ",
			getter: function() { return 100 * this.LAYER.scale.x },
			setter: function(value) { this.LAYER.scale = { x: value / 100 }; },
		}),
		MenuSlider({ log: true, min: 10, max: 1000, step: 10, title: "Scale Y",
			getter: function() { return 100 * this.LAYER.scale.y },
			setter: function(value) { this.LAYER.scale = { y: value / 100 }; },
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "Rotate",
			getter: function() { return this.LAYER.rotation },
			setter: function(value) { this.LAYER.rotation = value ; },
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "Skew X",
			getter: function() { return this.LAYER.skew.x },
			setter: function(value) { this.LAYER.skew = { x: value }; },
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "Skew Y",
			getter: function() { return this.LAYER.skew.y },
			setter: function(value) { this.LAYER.skew = { y: value }; },
		}),
		MenuSlider({ log: false, min: -100, max: 100, step: 1, title: "Translate X",
			getter: function() { return this.LAYER.translation.x },
			setter: function(value) { this.LAYER.translation = { x: value }; },
		}),
		MenuSlider({ log: false, min: -100, max: 100, step: 1, title: "Translate Y",
			getter: function() { return this.LAYER.translation.y },
			setter: function(value) { this.LAYER.translation = { y: value }; },
		}),
		MenuSeparator($),
		MenuSlider({ log: false, min: -50, max: 49.5, step: 1, title: "Top Left X",
			getter: function() { return this.corners[0].x * 100 },
			setter: function(value) { this.corners[0].x = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: -50, max: 49.5, step: 1, title: "Top Left Y",
			getter: function() { return this.corners[0].y * 100 },
			setter: function(value) { this.corners[0].y = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: 50.4, max: 150, step: 1, title: "Top Right X ",
			getter: function() { return this.corners[1].x * 100 },
			setter: function(value) { this.corners[1].x = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: -50, max: 49.5, step: 1, title: "Top Right Y",
			getter: function() { return this.corners[1].y * 100 },
			setter: function(value) { this.corners[1].y = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: 50.4, max: 150, step: 1, title: "Bot. Right X",
			getter: function() { return this.corners[2].x * 100 },
			setter: function(value) { this.corners[2].x = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: 50.4, max: 150, step: 1, title: "Bot. Right Y",
			getter: function() { return this.corners[2].y * 100 },
			setter: function(value) { this.corners[2].y = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: -50, max: 49.5, step: 1, title: "Bot. Left X",
			getter: function() { return this.corners[3].x * 100 },
			setter: function(value) { this.corners[3].x = value / 100; this.LAYER.corners = this.corners; },
		}),
		MenuSlider({ log: false, min: 50.4, max: 150, step: 1, title: "Bot. Left Y",
			getter: function() { return this.corners[3].y * 100 },
			setter: function(value) { this.corners[3].y = value / 100; this.LAYER.corners = this.corners; },
		}),
		Line($, {
			left:0, right:0, height:44, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onTap: { value: function(line) {
					line.bubble("doReset")
				}},
			}),
			contents: [
				Label($, { left:0, right:0, style:commandStyle, string:"Reset" }),
			]
		}),
		Line($, {
			left:0, right:0, height:44, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onModelChanged: { value: function(line) {
					line.first.string = model.playing ? "Pause" : "Play";
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












