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

import { SlideInOutBehavior } from "anim/slideInOut";
import { ClipperBehavior } from "anim/clipper";
import { WaitBehavior } from "anim/wait";
import { MoverBehavior } from "anim/mover";
import { BlinkerBehavior } from "anim/blinker";
import { FaderBehavior } from "anim/fader";
import { RotatorBehavior } from "anim/rotator";


var hugeTextStyle = new Style({ font:"bold", size:60, color:"black", horizontal:"center" });

export var SampleBlinkerContainer = Container.template($ => ({
	Behavior:BlinkerBehavior,
	contents:[
		Container($, {
			left:0, top:0, right:0, bottom:0,
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"Blinker", style:hugeTextStyle }),
			]
		}),
	]
}));

export var SampleWaitContainer = Container.template($ => ({
	visible:false,
	Behavior:WaitBehavior,
	contents:[
		Container($, {
			left:0, top:0, right:0, bottom:0,
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"Wait", style:hugeTextStyle }),
			]
		}),
	]
}));

var overridden = 100;
export var SampleClipperContainer = Container.template($ => ({
	Behavior:ClipperBehavior,
	contents:[
		Container($, {
			left:0, top:0, width:overridden, height:overridden,	
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"Clipper", style:hugeTextStyle}),
			]
		}),
	]
}));

export var SampleFaderContainer = Container.template($ => ({
	Behavior:FaderBehavior,
	contents:[
		Container($, {
			left:0, top:0, right:0, bottom:0,
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"Fader", style:hugeTextStyle }),
			]
		}),
	]
}));

export var SampleMoverContainer = Container.template($ => ({
	Behavior:MoverBehavior,
	contents:[
		Container($, {
			left:0, top:0, right:0, bottom:0,
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"Mover", style:hugeTextStyle }),
			]
		}),
	]
}));

export var SampleRotatorContainer = Container.template($ => ({
	Behavior:RotatorBehavior,
	contents:[
		Container($, {
			left:0, top:0, right:0, bottom:0,
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"Rotator", style:hugeTextStyle }),
			]
		}),
	]
}));

export var SampleSlideInOutContainer = Container.template($ => ({
	Behavior:SlideInOutBehavior,
	contents:[
		Container($, {
			left:0, top:0, right:0, bottom:0,
			contents:[
				Label($, { left:0, top:0, right:0, bottom:0, string:"SlideInOut", style:hugeTextStyle }),
			]
		}),
	]
}));



