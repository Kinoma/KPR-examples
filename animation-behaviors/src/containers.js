/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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

import { CoordinatesWithLayerBehavior } from "anim/coordinatesWithLayer";
import { SlideInOutBehavior } from "anim/slideInOut";
import { ClipperBehavior } from "anim/clipper";
import { WaitBehavior } from "anim/wait";
import { MoverBehavior } from "anim/mover";
import { BlinkerBehavior } from "anim/blinker";
import { FaderBehavior } from "anim/fader";
import { RotatorBehavior } from "anim/rotator";
import { CanvasBehavior } from "anim/canvas";
import { CrossZoomBehavior } from "anim/crossZoom";


var massiveTextStyle = new Style({ font:"100px", color:"black", horizontal:"center" });
var hugeTextStyle = new Style({ font:"60px", color:"black", horizontal:"center" });
export var mediumTextStyle = new Style({ font:"36px", color:"black", horizontal:"center" });

export var SampleCoordinatesWithLayerContainer = Container.template($ => ({
	Behavior:CoordinatesWithLayerBehavior,
	contents:[
		Label($, { anchor:"coordinatesLabel", left:0, top:0, right:0, bottom:0, string:"CoordinatesWithLayer", style:mediumTextStyle }),
	]
}));

export var SampleBlinkerContainer = Container.template($ => ({
	Behavior:BlinkerBehavior,
	contents:[
		Label($, { anchor:"blinkerLabel", left:0, top:0, right:0, bottom:0, string:"Blinker", style:hugeTextStyle }),
	]
}));

export var SampleWaitContainer = Container.template($ => ({
	visible:false,
	Behavior:WaitBehavior,
	contents:[
		Label($, { left:0, top:0, right:0, bottom:0, string:"Wait", style:hugeTextStyle }),
	]
}));

var overridden = 100;
export var SampleClipperContainer = Container.template($ => ({
	Behavior:ClipperBehavior,
	contents:[
		Label($, { left:0, top:0, right:0, bottom:0, string:"Clipper", style:massiveTextStyle}),
	]
}));

export var SampleFaderContainer = Container.template($ => ({
	Behavior:FaderBehavior,
	contents:[
		Label($, { anchor:"faderLabel", left:0, top:0, right:0, bottom:0, string:"Fader", style:massiveTextStyle }),
	]
}));

export var SampleMoverContainer = Container.template($ => ({
	Behavior:MoverBehavior,
	contents:[
		Label($, { anchor:"moverLabel", left:0, top:0, right:0, bottom:0, string:"Mover", style:hugeTextStyle }),
	]
}));

export var SampleRotatorContainer = Container.template($ => ({
	Behavior:RotatorBehavior,
	contents:[
		Label($, { anchor:"rotatorLabel", left:0, top:0, right:0, bottom:0, string:"Rotator", style:hugeTextStyle }),
	]
}));

export var SampleSlideInOutContainer = Container.template($ => ({
	Behavior:SlideInOutBehavior,
	contents:[
		Label($, { anchor:"slideInOutLabel", left:0, top:0, right:0, bottom:0, string:"SlideInOut", style:hugeTextStyle }),
	]
}));

export class SampleCanvasBehavior extends CanvasBehavior {
	draw(canvas, ctx) {
		var centerX = 0;
		var centerY = 0;
		var radius = 1;

		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'gray';
		ctx.fill();
	}
	onTouchBegan(canvas, id, x, y, ticks) {
		canvas.delegate("animate");						// to illustrate allowRestart = true
	}
};

export var SampleCanvasContainer = Container.template($ => ({
	contents:[
		Canvas($, { Behavior:SampleCanvasBehavior, anchor:"CANVAS", active:true, allowRestart:true, left:0, top:0, right:0, bottom:0, originX:260, originY:120-70, 
					toScaleX:280, toScaleY:280, fromOpacity:0.4, toOpacity:0.5, duration:2000 }),
		Label($, { left:30, string:"Canvas", style:mediumTextStyle }),
	]
}));

// - CrossZoomBehavior -

var whiteLargeClockStyle = new Style({ font:"90px", color:"white", horizontal:"center" });
var whiteMediumClockStyle = new Style({ font:"60px", color:"white", horizontal:"center" });
var whiteSmallClockStyle = new Style({ font:"40px", color:"white", horizontal:"center" });
export var blackSkin = new Skin({ fill:"black" });
export var whiteSkin = new Skin({ fill:"white" });

export var CrossZoomScreen = Container.template($ => ({
	skin:blackSkin,
	left:0, top:0, right:0, bottom:0,
	contents:[
		Label($, { top:30, string:"CrossZoom", style:whiteMediumClockStyle }),
	]
}));

export var ClockScreen = Container.template($ => ({
	skin:blackSkin,
	left:0, top:0, right:0, bottom:0,
	contents:[
		Label($, { top:30, string:"10:32", style:whiteLargeClockStyle }),
		Label($, { bottom:50, string:"Thursday, July 9", style:whiteSmallClockStyle }),
	]
}));

let mainPageSkin = new Skin({ texture: new Texture('./assets/cloud-mainpage.png'), width:320, height:240 });

export var MainPageScreen = Content.template($ => ({
	left:0, top:0, right:0, bottom:0, skin:mainPageSkin
}));

export var SampleCrossZoomContainer = Container.template($ => ({
	Behavior:CrossZoomBehavior,
	contents:[
		CrossZoomScreen($, { left:0, top:0, right:0, bottom:0 }),
	]
}));




