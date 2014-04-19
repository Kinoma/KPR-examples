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
var balls = require("./balls");

var playFlag = false;

var doBuild = function(container) {
	var layer = new Layer({width: 280, height: 210});
	layer.origin = {x: 140, y: 105};
	var background = new Container({width: 280, height: 210}, new Skin("#F0F0F0"));
	layer.add(background);
	var titleStyle = new Style("64px Arial", "gray", "left", 5, 5);
	var label = new Label(null, null, titleStyle, "Layers");
	layer.add(label);
	container.add(layer);
	this.data.LAYER = layer;
	this.data.corners = [
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: 1 },
		{ x: 0, y: 1 },
	];
	playFlag = false;
}

var doChangeCorners = function(container) {
	var layer = container.first;
	layer.corners = this.data.corners;
}

var doPlay = function(container) {
	var layer = container.first;
	if (playFlag) {
		balls.unbuild(layer);
		this.data.menu.LIST.last.first.string = "Play";
		playFlag = false;
	}
	else {
		playFlag = true;
		this.data.menu.LIST.last.first.string = "Pause";
		balls.build(layer);
	}
}

var doReset = function(container) {
	var layer = container.first;
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
}

var LayersBehavior = function() {
}
LayersBehavior.prototype = Object.create(MainScreenBehavior.prototype, {
	onDescribe: { 
		value: function() {
			return {
				Screen: MainScreen,
				build: doBuild,
				menu: {
					items: [
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 100,
							step: 1,
							title: "Opacity",
							getter: function() { return this.context.data.LAYER.opacity * 100 },
							setter: function(value) { this.context.data.LAYER.opacity = value / 100; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 280,
							step: 1,
							title: "Origin X",
							getter: function() { return this.context.data.LAYER.origin.x },
							setter: function(value) { this.context.data.LAYER.origin = { x: value }; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 210,
							step: 1,
							title: "Origin Y",
							getter: function() { return this.context.data.LAYER.origin.y },
							setter: function(value) { this.context.data.LAYER.origin = { y: value }; },
						},
						{
							Item: MenuSlider,
							log: true,
							min: 10,
							max: 1000,
							step: 10,
							title: "Scale X ",
							getter: function() { return 100 * this.context.data.LAYER.scale.x },
							setter: function(value) { this.context.data.LAYER.scale = { x: value / 100 }; },
						},
						{
							Item: MenuSlider,
							log: true,
							min: 10,
							max: 1000,
							step: 10,
							title: "Scale Y",
							getter: function() { return 100 * this.context.data.LAYER.scale.y },
							setter: function(value) { this.context.data.LAYER.scale = { y: value / 100 }; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "Rotate",
							getter: function() { return this.context.data.LAYER.rotation },
							setter: function(value) { this.context.data.LAYER.rotation = value ; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "Skew X",
							getter: function() { return this.context.data.LAYER.skew.x },
							setter: function(value) { this.context.data.LAYER.skew = { x: value }; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "Skew Y",
							getter: function() { return this.context.data.LAYER.skew.y },
							setter: function(value) { this.context.data.LAYER.skew = { y: value }; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -100,
							max: 100,
							step: 1,
							title: "Translate X",
							getter: function() { return this.context.data.LAYER.translation.x },
							setter: function(value) { this.context.data.LAYER.translation = { x: value }; },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -100,
							max: 100,
							step: 1,
							title: "Translate Y",
							getter: function() { return this.context.data.LAYER.translation.y },
							setter: function(value) { this.context.data.LAYER.translation = { y: value }; },
						},
						{ Item: MenuSeparator },
						{
							Item: MenuSlider,
							log: false,
							min: -50,
							max: 49.5,
							step: 1,
							title: "Top Left X",
							getter: function() { return this.context.data.corners[0].x * 100 },
							setter: function(value) { this.context.data.corners[0].x = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -50,
							max: 49.5,
							step: 1,
							title: "Top Left Y",
							getter: function() { return this.context.data.corners[0].y * 100 },
							setter: function(value) { this.context.data.corners[0].y = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 50.4,
							max: 150,
							step: 1,
							title: "Top Right X ",
							getter: function() { return this.context.data.corners[1].x * 100 },
							setter: function(value) { this.context.data.corners[1].x = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -50,
							max: 49.5,
							step: 1,
							title: "Top Right Y",
							getter: function() { return this.context.data.corners[1].y * 100 },
							setter: function(value) { this.context.data.corners[1].y = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 50.4,
							max: 150,
							step: 1,
							title: "Bot. Right X",
							getter: function() { return this.context.data.corners[2].x * 100 },
							setter: function(value) { this.context.data.corners[2].x = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 50.4,
							max: 150,
							step: 1,
							title: "Bot. Right Y",
							getter: function() { return this.context.data.corners[2].y * 100 },
							setter: function(value) { this.context.data.corners[2].y = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -50,
							max: 49.5,
							step: 1,
							title: "Bot. Left X",
							getter: function() { return this.context.data.corners[3].x * 100 },
							setter: function(value) { this.context.data.corners[3].x = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 50.4,
							max: 150,
							step: 1,
							title: "Bot. Left Y",
							getter: function() { return this.context.data.corners[3].y * 100 },
							setter: function(value) { this.context.data.corners[3].y = value / 100; doChangeCorners.call(this.context, this.context.data.BODY); },
						},
						{ Item: MenuActionItem, action: doReset, title: "Reset" },
						{ Item: MenuActionItem, action: doPlay, title: "Play" },
					],
					selection: -1,
				},
				title: "Layers Example",
			};
		}
	}
});
var handler = new Handler("/main");
handler.behavior = new LayersBehavior;
Handler.put(handler);
