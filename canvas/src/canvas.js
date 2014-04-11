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

var color = "rgb(0,0,0)";
var colorContent;
var components = {r:0, g:0, b:0};
var syncColor = function() {
	color = "rgb(" + components.r + "," + components.g + "," + components.b + ")";
	colorContent.skin = new Skin(color);
}
var getRed = function() { return components.r; }
var getGreen = function() { return components.g; }
var getBlue = function() { return components.b; }
var setRed = function(value) { components.r = Math.round(value); syncColor(); }
var setGreen = function(value) { components.g = Math.round(value); syncColor(); }
var setBlue = function(value) { components.b = Math.round(value); syncColor(); }

var lineWidth = 10;
var syncLineWidth = function() {
	colorContent.height = lineWidth;
}
var getLineWidth = function() { return lineWidth; }
var setLineWidth = function(value) { lineWidth = Math.round(value); syncLineWidth() }

var MenuColorItem = function(data, context) {
	Container.call(this, {left:0, right:0, height: 60});
	var colorBorder = new Container({width: 42, height: 42}, new Skin("black"))
	var colorContainer = new Container({width: 40, height: 40}, new Skin("white"))
	colorContent = new Content({width: 40, height: lineWidth}, new Skin(color));
	colorContainer.add(colorContent);
	this.add(colorBorder);
	this.add(colorContainer);
}
MenuColorItem.prototype = Object.create(Container.prototype, {
});

var CanvasDrawingBehavior = function() {
}
CanvasDrawingBehavior.prototype = Object.create(Object.prototype, {
	onFinished: { 
		value: function(canvas) {
			if (replayIndex >= replayStack.length) {
				var ctx = canvas.getContext("2d");
				ctx.fillStyle = "white"
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				replayIndex = 0;
			}
			else {
				replayStack[replayIndex].replay(canvas);
				replayIndex++;
			}
			canvas.time = 0;
			canvas.start();
		}
	},
	onTouchBegan: { 
		value: function(canvas, id, x, y, ticks) {
			if (replayFlag)
				return;
			this.position = canvas.position;
			x -= this.position.x;
			y -= this.position.y;
			var ctx = canvas.getContext("2d");
			ctx.lineWidth = lineWidth
			ctx.strokeStyle = color
			ctx.beginPath();
			ctx.moveTo(x, y);
			replayStack.push(new ReplayMove(x, y));
		}
	},
	onTouchMoved: { 
		value: function(canvas, id, x, y, ticks) {
			if (replayFlag)
				return;
			x -= this.position.x;
			y -= this.position.y;
			var ctx = canvas.getContext("2d");
			ctx.lineTo(x, y);
			ctx.stroke();
			replayStack.push(new ReplayLine(x, y));
		}
	}
});

var replayStack = [];
var replayIndex = 0;
var replayFlag = false;

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
	this.r = components.r;
	this.g = components.g;
	this.b = components.b;
	this.lineWidth = lineWidth;
	this.x = x;
	this.y = y;
}
ReplayMove.prototype.replay = function(canvas) {
	components.r = this.r;
	components.g = this.g;
	components.b = this.b;
	syncColor();
	lineWidth = this.lineWidth;
	syncLineWidth()
	var ctx = canvas.getContext("2d");
	ctx.lineWidth = lineWidth
	ctx.strokeStyle = color
	ctx.beginPath();
	ctx.moveTo(this.x, this.y);
	canvas.bubble("onBodyChanged");
}

var doErase = function() {
	var canvas = this.data.CANVAS;
	canvas.stop();
	replayStack.length = 0;
	this.data.menu.LIST.last.first.string = "Play";
	replayIndex = 0;
	replayFlag = false;
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white"
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var doPlay = function() {
	var canvas = this.data.CANVAS;
	if (replayFlag) {
		canvas.stop();
		while (replayIndex < replayStack.length) {
			replayStack[replayIndex].replay(canvas);
			replayIndex++;
		}
		replayFlag = false;
		replayIndex = 0;
		this.data.menu.LIST.last.first.string = "Play";
	}
	else {
		replayFlag = true;
		replayIndex = 0;
		this.data.menu.LIST.last.first.string = "Pause";
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "white"
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		canvas.duration = 10;
		canvas.start();
	}
}

var doBuild = function(container) {
	var canvas = new Canvas({left: 0, right: 0, top:0, bottom: 0})
	canvas.active = true;
	canvas.behavior = new CanvasDrawingBehavior;
	container.add(canvas);
	this.data.CANVAS = canvas;
	color = "rgb(0,0,0)";
	components = {r:0, g:0, b:0}
	lineWidth = 10;
	replayStack = [];
	replayIndex = 0;
	replayFlag = false;
	syncColor();
	syncLineWidth();
}

var CanvasBehavior = function() {
}
CanvasBehavior.prototype = Object.create(MainScreenBehavior.prototype, {
	onDescribe: { 
		value: function() {
			return {
				Screen: MainScreen,
				build: doBuild,
				menu: {
					items: [
						{ Item: MenuColorItem },
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 255,
							step: 1,
							title: "Red",
							getter: getRed,
							setter: setRed,
						},
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 255,
							step: 1,
							title: "Green",
							getter: getGreen,
							setter: setGreen,
						},
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 255,
							step: 1,
							title: "Blue",
							getter: getBlue,
							setter: setBlue,
						},
						{
							Item: MenuSlider,
							log: false,
							min: 1,
							max: 20,
							step: 1,
							title: "Size",
							getter: getLineWidth,
							setter: setLineWidth,
						},
						{ Item: MenuSeparator },
						{ Item: MenuActionItem, action: doErase, title: "Erase" },
						{ Item: MenuActionItem, action: doPlay, title: "Play" },
					],
					selection: -1,
				},
				title: "Canvas Example",
			};
		}
	}
});
var handler = new Handler("/main");
handler.behavior = new CanvasBehavior;
Handler.put(handler);
