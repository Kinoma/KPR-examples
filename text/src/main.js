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
var DIALOG = require("mobile/dialog");
var KEYBOARD = require("mobile/keyboard");
var SCROLLER = require("mobile/scroller");
var MODEL = require("mobile/model");
var LOREM = require("./lorem");

/*
	ASSETS
*/

var toolsTexture = new Texture("./assets/tools.png");
var toolsSkin = new Skin({ texture: toolsTexture,  x:0, y:0, width:32, height:32, states:32, variants:32 });
var menuSkin = new Skin({ texture: toolsTexture, x:64, y:0, width:32, height:32, states:32, 
	tiles: { left:4, right:0, top:0, bottom:0 }, 
});
var menuSeparatorSkin = new Skin({ fill:"gray" });
var marksTexture = new Texture("./assets/marks.png");
var marksSkin = new Skin({ texture: marksTexture,  x:0, y:0, width:30, height:30, states:30 });
var sliderBarSkin = new Skin({ texture: marksTexture, x:30, y:0, width:40, height:30, states:30, 
	tiles:{ left:10, right:10 }
});
var sliderThumbSkin = new Skin({ texture: marksTexture, x:70, y:0, width:20, height:30, states:30 });

var iconTexture = new Texture("./assets/icon.png");
var iconSkin = new Skin(iconTexture, {x:0 , y:0 , width:80 , height:80}, 0, 0, null, null, 'fit');
var textAlignmentTabTexture = new Texture("./assets/textAlignmentTab.png");
var textAlignmentTabSkin = new Skin({ texture: textAlignmentTabTexture, x:10, y:5, width:25, height:25, variants:25, states:30 });
var textFontTabTexture = new Texture("./assets/textFontTab.png");
var textFontTabSkin = new Skin({ texture: textFontTabTexture, x:10, y:5, width:25, height:25, variants:25, states:30 });
var textStyleTabTexture = new Texture("./assets/textStyleTab.png");
var textStyleTabSkin = new Skin({ texture: textStyleTabTexture, x:10, y:5, width:25, height:25, variants:25, states:30 });

var commandStyle = new Style({ font:"bold", size:20, horizontal:"left", color:["white","white","#acd473"] });
var sliderLabelStyle = new Style({ font:"bold", size:14, horizontal:"left", color:["white","white","#acd473"] });
var sliderValueStyle = new Style({ font:"bold", size:14, horizontal:"right", color:["white","white","#acd473"] });

/*
	MODEL
*/

var textStyle = "normal"
var textSize = 20;
var textFont = "Arial";
var cssify = function() { return textStyle + " " + textSize + "px " + textFont; }
var margins = { left:10, right:10, top:0, bottom:10 };
var mainStyle = new Style(cssify(), "black", "justify", margins.left, margins.right, 20, "top", margins.top, margins.bottom);
var spansStyles = [
	new Style("bold 80%", "#ee1c24"),
	new Style("italic", "#00a651"),
	new Style("120%", "#0054a6"),
];
var behaviorsStyles = [
	new Style(null, ["blue","black","purple","red"]),
	undefined
];
var contents = [
	{ content: new Content({width: 80, height: 80}, iconSkin), offset: 0, align: "left" },
	{ content: new Content({width: 40, height: 40}, iconSkin), offset: 10, align: "middle" },
	{ content: new Content({width: 30, height: 30}, iconSkin), offset: 20, align: "middle" },
	{ content: new Content({width: 60, height: 60}, iconSkin), offset: 30, align: "right" },
];

var SpanBehavior = function(string) {
	this.string = string.trim();
}
SpanBehavior.prototype = Object.create(Object.prototype, {
	onTouchBegan: { value: function(content, id, x, y, ticks) {
		this.state = content.state;
		content.state = 3;
	}},
	onTouchCancelled: { value: function(content, id) {
		content.state = this.state;
	}},
	onTouchEnded: { value: function(content, id, x, y, ticks) {
		content.state = 2;
		content.invoke(new Message("/alert?message=" + encodeURIComponent(this.string) + "."));
	}}
});

var TextBehavior = function() {
}
TextBehavior.prototype = Object.create(Object.prototype, {
	onTimeChanged: { value: function(text) {
		var length = LOREM.string.length;
		var min = 10000;
		var max = 0;
		var base = text.y;
		for (var i = 0; i < 4; i++) {
			var content = contents[i];
			content.offset += 2;
			if (content.offset >= length)
				content.offset = 0;
			var offset = content.content.offset;
			if (offset) {
				var y = offset.y;
				if (min > y)
					min = y;
				if (max < y)
					max = y;
			}
		}
		var spans = [];
		var former = 0;
		for (var i = 0; i < 4; i++) {
			var content = contents[i];
			content.content.variant = i;
			var current = content.offset
			if (current > former)
				spans.push(LOREM.string.substring(former, current));
			former = current;
			spans.push({ content: content.content, align: content.align });
		}
		spans.push(LOREM.string.substring(former));
		text.format([
			{ spans: spans }
		]);
		if (offset) {
			max += 40;
			var bounds = {x:0, y:min, width:text.width, height:max - min};
			text.container.reveal(bounds);
		}
	}}
});

var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	doBlocks: { value: function() {
		this.command = "doBlocks";
		var text = this.data.TEXT;
		text.stop();
		text.active = false;
		text.behavior = null;
		text.string = LOREM.string;
		application.distribute("onModelChanged");
	}},
	doContents: { value: function() {
		this.command = "doContents";
		var text = this.data.TEXT;
		text.active = false;
		text.behavior = new TextBehavior(text);
		text.start();
		application.distribute("onModelChanged");
	}},
	doLinks: { value: function() {
		this.command = "doLinks";
		var text = this.data.TEXT;
		text.stop();
		text.active = true;
		text.behavior = null;
		var split = LOREM.string.split(".");
		var c = split.length;
		for (var i = 0; i < c; i++) {
			split[i] = { style: behaviorsStyles[i % 2], behavior: new SpanBehavior(split[i]), string: split[i] + "." };
		}
		text.format([
			{ spans: split }
		]);
		application.distribute("onModelChanged");
	}},
	doSpans: { value: function() {
		this.command = "doSpans";
		var text = this.data.TEXT;
		var split = LOREM.string.split(".");
		var c = split.length;
		for (var i = 0; i < c; i++) {
			split[i] = { style: spansStyles[i % 3], string: split[i] + "." };
		}
		text.stop();
		text.active = false;
		text.behavior = null;
		text.format([
			{ spans: split }
		]);
		application.distribute("onModelChanged");
	}},
	onLaunch: { value: function() {
		var data = this.data = {};
		application.add(new Screen(data));
		this.doBlocks();
	}},
});

var model = application.behavior = new ApplicationBehavior(application);

/*
	SCREEN
*/

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	contents: [
		Container($, { left:0, right:0, top:0, bottom:0, skin:THEME.whiteSkin,
			contents: [
				SCROLLER.VerticalScroller($, {
					contents: [
						Text($, { anchor:"TEXT", left: 0, right: 0, top:0, style:mainStyle, interval:10 })
					]
				})
			]
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
		MenuCommand({ command: "doBlocks", title: "Blocks" }),
		MenuCommand({ command: "doSpans", title: "Spans" }),
		MenuCommand({ command: "doLinks", title: "Links" }),
		MenuCommand({ command: "doContents", title: "Contents" }),
		MenuSeparator($),
		MenuTabBar({ selection:0, skin:textFontTabSkin, title:"Font", 
			getter: function() { 
				switch (textFont) {
				case "Arial": return 0;
				case "Times New Roman": return 1;
				case "Courier New": return 2;
				case "Comic Sans MS": return 3;
				}
			},
			setter: function(value) { 
				switch (value) {
				case 0: textFont = "Arial"; break;
				case 1: textFont = "Times New Roman"; break;
				case 2: textFont = "Courier New"; break;
				case 3: textFont = "Comic Sans MS"; break;
				}
				mainStyle.font = cssify();
			},
		}),
		MenuTabBar({ selection:0, skin:textStyleTabSkin, title:"Style", 
			getter: function() { 
				switch (textStyle) {
				case "normal": return 0;
				case "bold": return 1;
				case "italic": return 2;
				case "underline": return 3;
				}
			},
			setter: function(value) { 
				switch (value) {
				case 0: textStyle = "normal"; break;
				case 1: textStyle = "bold"; break;
				case 2: textStyle = "italic"; break;
				case 3: textStyle = "underline"; break;
				}
				mainStyle.font = cssify();
			},
		}),
		MenuSlider({ log:false, min:8, max:64, step:1, title:"Size", 
			getter: function() { 
				return textSize;
			},
			setter: function(value) { 
				textSize = Math.round(value);
				mainStyle.font = cssify();
			},
		}),
		MenuSeparator($),
		MenuTabBar({ selection:0, skin:textAlignmentTabSkin, title:"Alignment", 
			getter: function() { 
				switch (mainStyle.horizontalAlignment) {
				case "left": return 0;
				case "center": return 1;
				case "right": return 2;
				case "justify": return 3;
				}
			},
			setter: function(value) { 
				switch (value) {
				case 0: mainStyle.horizontalAlignment = "left"; break;
				case 1: mainStyle.horizontalAlignment = "center"; break;
				case 2: mainStyle.horizontalAlignment = "right"; break;
				case 3: mainStyle.horizontalAlignment = "justify"; break;
				}
			},
		}),
		MenuSlider({ log:false, min:0, max:80, step:1, title:"Indentation",
			getter: function() { 
				return mainStyle.indentation ? mainStyle.indentation : 0; 
			},
			setter: function(value) { 
				mainStyle.indentation = value; 
			},
		}),
		MenuSlider({ log:false, min:0, max:80, step:1, title:"Line Height",
			getter: function() { 
				return mainStyle.lineHeight ? mainStyle.lineHeight : 0; 
			},
			setter: function(value) { 
				mainStyle.lineHeight = value; 
			},
		}),
		MenuSlider({ log:false, min:0, max:20, step:1, title:"Line Count",
			getter: function() { 
				return mainStyle.lineCount ? mainStyle.lineCount : 0; 
			},
			setter: function(value) { 
				mainStyle.lineCount = value; 
			},
		}),
		MenuSlider({ log:false, min:0, max:40, step:1, title:"Margin Left",
			getter: function() { 
				return margins.left; 
			},
			setter: function(value) { 
				margins.left = value; mainStyle.margins = margins 
			},
		}),
		MenuSlider({ log:false, min:0, max:40, step:1, title:"Margin Right",
			getter: function() { 
				return margins.right; 
			},
			setter: function(value) { 
				margins.right = value; mainStyle.margins = margins 
			},
		}),
		MenuSlider({ log:false, min:0, max:40, step:1, title:"Margin Top",
			getter: function() { 
				return margins.top; 
			},
			setter: function(value) { 
				margins.top = value; mainStyle.margins = margins 
			},
		}),
		MenuSlider({ log:false, min:0, max:40, step:1, title:"Margin Bottom",
			getter: function() { 
				return margins.bottom; 
			},
			setter: function(value) { 
				margins.bottom = value; mainStyle.margins = margins 
			},
		}),
	]
}});

var MenuCommand = Line.template(function($) { return {
	left:0, right:0, height:44, active:true,
	behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
		onModelChanged: { value: function(line) {
			line.first.visible = this.data.command == model.command;
		}},
		onTap: { value: function(line) {
			line.bubble(this.data.command)
		}},
	}),
	contents: [
		Content($, { skin: marksSkin, visible: false }),
		Label($, { left:0, right:0, style:commandStyle, string:$.title }),
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

var MenuTabBar = Container.template(function($) { return { 
	left:0, width:120, height:44, active:true,
	behavior: Object.create(Behavior.prototype, {
		onCreate: { value: function(container, data) {
			this.data = data;
		}},
		onModelChanged: { value: function(container, content) {
			var content = container.last.first;
			var index = 0;
			var selection = this.data.getter.call(model.data);
			while (content) {
				content.active = index != selection;
				content = content.next;
				index++;
			}
		}},
		onTabTap: { value: function(container, content) {
			this.data.setter.call(model.data, content.index);
			application.delegate(model.command);
		}},
	}),
	contents: [
		Label($, { left:10, right:0, top:0, height:19, style:sliderLabelStyle, string:$.title, }),
		Container($, { left:10, width:100, top:19, height:25, 
			behavior: Object.create(CONTROL.TabBarBehavior.prototype),
			contents: [
				Container($, { left:0, width:25, top:0, height:25, skin:$.skin, variant:0, active:true, behavior:new CONTROL.TabBehavior }),
				Container($, { left:25, width:25, top:0, height:25, skin:$.skin, variant:1, active:true, behavior:new CONTROL.TabBehavior }),
				Container($, { left:50, width:25, top:0, height:25, skin:$.skin, variant:2, active:true, behavior:new CONTROL.TabBehavior }),
				Container($, { left:75, width:25, top:0, height:25, skin:$.skin, variant:3, active:true, behavior:new CONTROL.TabBehavior }),
			]
		})
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

/*
	DIALOG
*/

Handler.bind("/alert", Object.create(MODEL.DialogBehavior.prototype, {
	onDescribe: { value: function(query, selection) {
		return {
			Dialog: DIALOG.Box,
			cancel: "Cancel",
			items: [
				{ Item: DIALOG.Comment,  string: query.message },
			],
			variant: 1,
		};
	}},
}));











