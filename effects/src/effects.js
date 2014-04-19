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
var imageURL = mergeURI(module.uri, "./assets/effect.png");

var MenuEffectItemBehavior = function(content, data, context) {
	CONTROL.ButtonBehavior.call(this, content, data, context);
}
MenuEffectItemBehavior.prototype = Object.create(CONTROL.ButtonBehavior.prototype, {
	onTap: { 
		value: function(content, id, x, y, ticks) {
			var layer = this.context.data.LAYER;
			var effect = this.data.effect;
			layer.effect = this.context.data.effect = this.data.effect;
			this.context.onBodyChanged();
		}
	},
	sync: { 
		value: function(container) {
			container.first.visible = this.context.data.effect == this.data.effect;
		}
	}
});
var MenuEffectItem = function(data, context) {
	Line.call(this, {left: 0, right: 0, width: 130, height: 44});
	this.active = true;
	this.behavior = new MenuEffectItemBehavior(this, data, context);
	var bullet = new Content(null, rightMenuBulletSkin);
	bullet.visible = false;
	this.add(bullet);
	var label = new Text({left: 0, right: 0}, null, sliderLabelStyle, data.title);
	this.add(label);
	var image = new Picture(null, imageURL);
	image.effect = data.effect;
	this.add(image);
	var content = new Content({width:5});
	this.add(content);
}
MenuEffectItem.prototype = Object.create(Line.prototype, {
});

var playFlag = false;

var doBuild = function(container) {
	var background = new Container({width: 280, height: 210}, new Skin("#F0F0F0"));
	container.add(background);
	var layer = new Layer({width: 280, height: 210}, false, true);
	layer.origin = {x: 140, y: 105};
	var titleStyle = new Style("64px Arial", "gray", "left", 5, 5);
	var label = new Label(null, null, titleStyle, "Effects");
	layer.add(label);
	container.add(layer);
	this.data.LAYER = layer;
	playFlag = false;
}

var doPlay = function(container) {
	var layer = container.last;
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

var EffectsBehavior = function() {
}
EffectsBehavior.prototype = Object.create(MainScreenBehavior.prototype, {
	onDescribe: { 
		value: function() {
			var colorize1 = new Effect;
			colorize1.colorize("red");
		
			var colorize2 = new Effect;
			colorize2.colorize("red", 0.5);
		
			var colorize3 = new Effect;
			colorize3.colorize("red", 0.25);
		
			var shadow1 = new Effect;
			shadow1.colorize("white");
			shadow1.outerShadow(null, 1, 2, 0, 2);
		
			var shadow2 = new Effect;
			shadow2.colorize("white");
			shadow2.innerShadow(null, 1, 2, 0, 2);
		
			var bevel1 = new Effect;
			bevel1.colorize("gray");
			bevel1.outerHilite(null, 1, 2, 0, 2);
			bevel1.outerShadow(null, 1, 2, 0, -2);
		
			var bevel2 = new Effect;
			bevel2.colorize("gray");
			bevel2.innerShadow(null, 1, 2, 0, -2);
			bevel2.innerHilite(null, 1, 2, 0, 2);
		
			var bevel3 = new Effect;
			bevel3.colorize("gray");
			bevel3.innerShadow(null, 1, 2, 0, 2);
			bevel3.innerHilite(null, 1, 2, 0, -2);
			bevel3.outerHilite(null, 1, 2, 0, -2);
			bevel3.outerShadow(null, 1, 2, 0, 2);
			
			var bevel4 = new Effect;
			bevel4.colorize("gray");
			bevel4.innerShadow(null, 1, 2, 0, -2);
			bevel4.innerHilite(null, 1, 2, 0, 2);
			bevel4.outerHilite(null, 1, 2, 0, 2);
			bevel4.outerShadow(null, 1, 2, 0, -2);
		
			var glow1 = new Effect;
			glow1.colorize("gray");	
			glow1.innerGlow("#FFFF00", 0.75);
		
			var glow2 = new Effect;
			glow2.colorize("gray");
			glow2.outerGlow("#00FFFF", 0.75);
		
			var glow3 = new Effect;
			glow3.colorize("gray");
			glow3.innerGlow("#FFFF00", 0.75);
			glow3.outerGlow("#00FFFF", 0.75);
		
			var blur1 = new Effect;
			blur1.gaussianBlur(5);
			
			var blur2 = new Effect;
			blur2.gaussianBlur(5, 0);
			
			var blur3 = new Effect;
			blur3.gaussianBlur(0, 5);
         
			var mask = new Effect;
			mask.mask(new Texture("./assets/mask.png"));
			
			return {
				Screen: MainScreen,
				build: doBuild,
				effect: null,
				menu: {
					items: [ 
						{ Item: MenuEffectItem, effect: null, title: "None" },
						{ Item: MenuEffectItem, effect: colorize1, title: "Colorize 100%" },
						{ Item: MenuEffectItem, effect: colorize2, title: "Colorize 50%" },
						{ Item: MenuEffectItem, effect: colorize3, title: "Colorize 25%" },
						{ Item: MenuEffectItem, effect: shadow1, title: "Drop Shadow" },
						{ Item: MenuEffectItem, effect: shadow2, title: "Inner Shadow" },
						{ Item: MenuEffectItem, effect: bevel1, title: "Outer Bevel" },
						{ Item: MenuEffectItem, effect: bevel2, title: "Inner Bevel" },
						{ Item: MenuEffectItem, effect: bevel3, title: "Pillow Emboss" },
						{ Item: MenuEffectItem, effect: bevel4, title: "Emboss" },
						{ Item: MenuEffectItem, effect: glow1, title: "Inner Glow" },
						{ Item: MenuEffectItem, effect: glow2, title: "Outer Glow" },
						{ Item: MenuEffectItem, effect: glow3, title: "Neon" },
						{ Item: MenuEffectItem, effect: blur1, title: "Blur XY" },
						{ Item: MenuEffectItem, effect: blur2, title: "Blur X" },
						{ Item: MenuEffectItem, effect: blur3, title: "Blur Y" },
						{ Item: MenuEffectItem, effect: mask, title: "Mask" },
						{ Item: MenuActionItem, action: doPlay, title: "Play" },
					],
				},
				title: "Effects Example",
			};
		}
	}
});
var handler = new Handler("/main");
handler.behavior = new EffectsBehavior;
Handler.put(handler);
