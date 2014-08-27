/**
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
**/
var lorem = require("./lorem");

var textStyle = "normal"
var textSize = 20;
var textFont = "Arial";
var cssify = function() { return textStyle + " " + textSize + "px " + textFont; }
var margins = { left:10, right:10, top:0, bottom:10 };

var iconTexture = new Texture("./assets/icon.png");
var iconSkin = new Skin(iconTexture, {x:0 , y:0 , width:80 , height:80}, 0, 0, null, null, 'fit');

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
var textAlignmentTabTexture = new Texture("./assets/textAlignmentTab.png");
var textAlignmentTabSkin = new Skin(textAlignmentTabTexture, {x:10, y:5, width:25, height:25}, 25, 30);
var textFontTabTexture = new Texture("./assets/textFontTab.png");
var textFontTabSkin = new Skin(textFontTabTexture, {x:10, y:5, width:25, height:25}, 25, 30);
var textStyleTabTexture = new Texture("./assets/textStyleTab.png");
var textStyleTabSkin = new Skin(textStyleTabTexture, {x:10, y:5, width:25, height:25}, 25, 30);

var SpanBehavior = function(string) {
	Object.call(this);
	this.string = string.trim();
}
SpanBehavior.prototype = Object.create(Object.prototype, {
	onTouchBegan: { 
		value: function(content, id, x, y, ticks) {
			this.state = content.state;
			content.state = 3;
		}
	},
	onTouchCancelled: { 
		value: function(content, id) {
			content.state = this.state;
		}
	},
	onTouchEnded: { 
		value: function(content, id, x, y, ticks) {
			content.state = 2;
			content.invoke(new Message("/alert?message=" + encodeURIComponent(this.string) + "."));
		}
	}
});

var doBlocks = function(slide) {
	slide.empty();
	var text = new Text({left: 0, right: 0, top:0}, null, mainStyle);
	text.active = true;
	text.string = lorem.string;
	text.behavior = null;
	var scroller = new SCROLLER.VerticalScroller({});
	scroller.add(text);
	slide.add(scroller);
}

var doSpans = function(slide) {
	slide.empty();
	var text = new Text({left: 0, right: 0, top:0}, null, mainStyle);
	text.active = true;
	var split = lorem.string.split(".");
	var c = split.length;
	for (var i = 0; i < c; i++) {
		split[i] = { style: spansStyles[i % 3], string: split[i] + "." };
	}
	text.format([
		{ spans: split }
	]);
	text.behavior = null;
	var scroller = new SCROLLER.VerticalScroller({});
	scroller.add(text);
	slide.add(scroller);
}

var doLinks = function(slide) {
	slide.empty();
	var text = new Text({left: 0, right: 0, top:0}, null, mainStyle);
	text.active = true;
	var split = lorem.string.split(".");
	var c = split.length;
	for (var i = 0; i < c; i++) {
		split[i] = { style: behaviorsStyles[i % 2], behavior: new SpanBehavior(split[i]), string: split[i] + "." };
	}
	text.format([
		{ spans: split }
	]);
	text.behavior = null;
	var scroller = new SCROLLER.VerticalScroller({});
	scroller.add(text);
	slide.add(scroller);
}

var doStep = function(text) {
	var spans = [];
	var former = 0;
	for (var i = 0; i < 4; i++) {
		var content = contents[i];
		content.content.variant = i;
		var current = content.offset
		if (current > former)
			spans.push(lorem.string.substring(former, current));
		former = current;
		spans.push({ content: content.content, align: content.align });
	}
	spans.push(lorem.string.substring(former));
	text.format([
		{ spans: spans }
	]);
}

var doContents = function(slide) {
	slide.empty();
	var text = new Text({left: 0, right: 0, top:0}, null, mainStyle);
	text.active = true;
	contents[0].offset = 0;
	contents[1].offset = 60;
	contents[2].offset = 120;
	contents[3].offset = 180;
	text.behavior = {
		onFinished: function(text) {
			var length = lorem.string.length;
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
			doStep(text);
			if (offset) {
				max += 40;
				var bounds = {x:0, y:min, width:text.width, height:max - min};
				text.container.reveal(bounds);
			}
			text.time = 0;
			text.start();
		}
	};
	var scroller = new SCROLLER.VerticalScroller({});
	scroller.add(text);
	slide.add(scroller);
	text.duration = 10;
	text.start();
}

var getTextAlignment = function() {
	switch (mainStyle.horizontalAlignment) {
	case "left": return 0;
	case "center": return 1;
	case "right": return 2;
	case "justify": return 3;
	}
}
var setTextAlignment = function(selection) {
	switch (selection) {
	case 0: mainStyle.horizontalAlignment = "left"; break;
	case 1: mainStyle.horizontalAlignment = "center"; break;
	case 2: mainStyle.horizontalAlignment = "right"; break;
	case 3: mainStyle.horizontalAlignment = "justify"; break;
	}
}
var getTextFont = function() {
	switch (textFont) {
	case "Arial": return 0;
	case "Times New Roman": return 1;
	case "Courier New": return 2;
	case "Comic Sans MS": return 3;
	}
}
var setTextFont = function(selection) {
	switch (selection) {
	case 0: textFont = "Arial"; break;
	case 1: textFont = "Times New Roman"; break;
	case 2: textFont = "Courier New"; break;
	case 3: textFont = "Comic Sans MS"; break;
	}
	mainStyle.font = cssify();
}
var getTextSize = function() {
	return textSize;
}
var setTextSize = function(value) {
	textSize = Math.round(value);
	mainStyle.font = cssify();
}
var getTextStyle = function() {
	switch (textStyle) {
	case "normal": return 0;
	case "bold": return 1;
	case "italic": return 2;
	case "underline": return 3;
	}
}
var setTextStyle = function(selection) {
	switch (selection) {
	case 0: textStyle = "normal"; break;
	case 1: textStyle = "bold"; break;
	case 2: textStyle = "italic"; break;
	case 3: textStyle = "underline"; break;
	}
	mainStyle.font = cssify();
}

var TextBehavior = function() {
}
TextBehavior.prototype = Object.create(MainScreenBehavior.prototype, {
	onDescribe: { 
		value: function() {
			return {
				Screen: MainScreen,
				build: doBlocks,
				command: doBlocks,
				menu: {
					items: [
						{ Item: MenuCommandItem, command: doBlocks, title: "Blocks" },
						{ Item: MenuCommandItem, command: doSpans, title: "Spans" },
						{ Item: MenuCommandItem, command: doLinks, title: "Links" },
						{ Item: MenuCommandItem, command: doContents, title: "Contents" },
						{ Item: MenuSeparator },
						{ 
							Item: MenuTabsItem, skin: textFontTabSkin, title: "Font", selection: 0,
							getter: getTextFont,
							setter: setTextFont,
						},
						{ 
							Item: MenuTabsItem, skin: textStyleTabSkin, title: "Style", selection: 0,
							getter: getTextStyle,
							setter: setTextStyle,
						},
						{
							Item: MenuSlider, log: false, min: 8, max: 64, step: 1, title: "Size",
							getter: getTextSize,
							setter: setTextSize,
						},
						{ Item: MenuSeparator },
						{ 
							Item: MenuTabsItem, skin: textAlignmentTabSkin, title: "Alignment", selection: 0,
							getter: getTextAlignment,
							setter: setTextAlignment,
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 80, step: 1, title: "Indentation",
							getter: function() { return mainStyle.indentation ? mainStyle.indentation : 0; },
							setter: function(value) { mainStyle.indentation = value; },
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 80, step: 1, title: "Line Height",
							getter: function() { return mainStyle.lineHeight ? mainStyle.lineHeight : 0; },
							setter: function(value) { mainStyle.lineHeight = value; },
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 20, step: 1, title: "Line Count",
							getter: function() { return mainStyle.lineCount ? mainStyle.lineCount : 0; },
							setter: function(value) { mainStyle.lineCount = value; },
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 40, step: 1, title: "Margin Left",
							getter: function() { return margins.left; },
							setter: function(value) { margins.left = value; mainStyle.margins = margins },
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 40, step: 1, title: "Margin Right",
							getter: function() { return margins.right; },
							setter: function(value) { margins.right = value; mainStyle.margins = margins },
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 40, step: 1, title: "Margin Top",
							getter: function() { return margins.top; },
							setter: function(value) { margins.top = value; mainStyle.margins = margins },
						},
						{
							Item: MenuSlider, log: false, min: 0, max: 40, step: 1, title: "Margin Bottom",
							getter: function() { return margins.bottom; },
							setter: function(value) { margins.bottom = value; mainStyle.margins = margins },
						},
					],
					selection: 0,
				},
				title: "Text Example",
			};
		}
	}
});
var handler = new Handler("/main");
handler.behavior = new TextBehavior;
Handler.put(handler);


