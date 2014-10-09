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
var marksSkin = new Skin({ texture: marksTexture,  x:0, y:0, width:30, height:30, states:30, });

var commandStyle = new Style({ font:"bold", size:20, horizontal:"center", color:["white","white","#acd473"] });
var effectStyle = new Style({ font:"bold", size:14, horizontal:"left", color:["white","white","#acd473"] });
var titleStyle = new Style({ font:"bold", size:64, color:"gray" });

var imageURL = mergeURI(application.url, "./assets/effect.png");

/*
	MODEL
*/

var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	doEffect: { value: function(application, effect) {
		this.effect = this.data.LAYER.effect = effect;
		application.distribute("onModelChanged");
	}},
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
	onLaunch: { value: function() {
		var data = this.data = { 
			title: "Effects",
		};
		
		data.colorize1 = new Effect;
		data.colorize1.colorize("red");
		
		data.colorize2 = new Effect;
		data.colorize2.colorize("red", 0.5);
		
		data.colorize3 = new Effect;
		data.colorize3.colorize("red", 0.25);
		
		data.shadow1 = new Effect;
		data.shadow1.colorize("white");
		data.shadow1.outerShadow(null, 1, 2, 0, 2);
		
		data.shadow2 = new Effect;
		data.shadow2.colorize("white");
		data.shadow2.innerShadow(null, 1, 2, 0, 2);
		
		data.bevel1 = new Effect;
		data.bevel1.colorize("gray");
		data.bevel1.outerHilite(null, 1, 2, 0, 2);
		data.bevel1.outerShadow(null, 1, 2, 0, -2);
		
		data.bevel2 = new Effect;
		data.bevel2.colorize("gray");
		data.bevel2.innerShadow(null, 1, 2, 0, -2);
		data.bevel2.innerHilite(null, 1, 2, 0, 2);
		
		data.bevel3 = new Effect;
		data.bevel3.colorize("gray");
		data.bevel3.innerShadow(null, 1, 2, 0, 2);
		data.bevel3.innerHilite(null, 1, 2, 0, -2);
		data.bevel3.outerHilite(null, 1, 2, 0, -2);
		data.bevel3.outerShadow(null, 1, 2, 0, 2);

		data.bevel4 = new Effect;
		data.bevel4.colorize("gray");
		data.bevel4.innerShadow(null, 1, 2, 0, -2);
		data.bevel4.innerHilite(null, 1, 2, 0, 2);
		data.bevel4.outerHilite(null, 1, 2, 0, 2);
		data.bevel4.outerShadow(null, 1, 2, 0, -2);
		
		data.glow1 = new Effect;
		data.glow1.colorize("gray");	
		data.glow1.innerGlow("#FFFF00", 0.75);
		
		data.glow2 = new Effect;
		data.glow2.colorize("gray");
		data.glow2.outerGlow("#00FFFF", 0.75);
		
		data.glow3 = new Effect;
		data.glow3.colorize("gray");
		data.glow3.innerGlow("#FFFF00", 0.75);
		data.glow3.outerGlow("#00FFFF", 0.75);
		
		data.blur1 = new Effect;
		data.blur1.gaussianBlur(5);

		data.blur2 = new Effect;
		data.blur2.gaussianBlur(5, 0);

		data.blur3 = new Effect;
		data.blur3.gaussianBlur(0, 5);
         
		data.mask = new Effect;
		data.mask.mask(new Texture("./assets/mask.png"));
		
		this.effect = null;
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
				Container($, { width:280, height:210, skin:new Skin({ fill:"#F0F0F0" }),
					contents: [
						Layer($, { anchor:"LAYER", width:280, height:210, alpha: true,
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
		MenuEffect({ effect: null, title: "None" }),
		MenuEffect({ effect: $.colorize1, title: "Colorize 100%" }),
		MenuEffect({ effect: $.colorize2, title: "Colorize 50%" }),
		MenuEffect({ effect: $.colorize3, title: "Colorize 25%" }),
		MenuEffect({ effect: $.shadow1, title: "Drop Shadow" }),
		MenuEffect({ effect: $.shadow2, title: "Inner Shadow" }),
		MenuEffect({ effect: $.bevel1, title: "Outer Bevel" }),
		MenuEffect({ effect: $.bevel2, title: "Inner Bevel" }),
		MenuEffect({ effect: $.bevel3, title: "Pillow Emboss" }),
		MenuEffect({ effect: $.bevel4, title: "Emboss" }),
		MenuEffect({ effect: $.glow1, title: "Inner Glow" }),
		MenuEffect({ effect: $.glow2, title: "Outer Glow" }),
		MenuEffect({ effect: $.glow3, title: "Neon" }),
		MenuEffect({ effect: $.blur1, title: "Blur XY" }),
		MenuEffect({ effect: $.blur2, title: "Blur X" }),
		MenuEffect({ effect: $.blur3, title: "Blur Y" }),
		MenuEffect({ effect: $.mask, title: "Mask" }),
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

var MenuEffect = Line.template(function($) { return {
	left:0, width:130, height:44, active:true,
	behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
		onModelChanged: { value: function(line) {
			line.first.visible = this.data.effect == model.effect;
		}},
		onTap: { value: function(line) {
			line.bubble("doEffect", this.data.effect)
		}},
	}),
	contents: [
		Content($, { skin: marksSkin, visible: $.effect == model.effect }),
		Text($, { left:0, right:0, style:effectStyle, string:$.title }),
		Picture($, { url:imageURL, effect:$.effect }),
		Content($, { width:5 }),
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












