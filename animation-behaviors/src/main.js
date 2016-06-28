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

import {
	SampleCoordinatesWithLayerContainer,
	SampleBlinkerContainer,
	SampleWaitContainer,
	SampleClipperContainer,
	SampleFaderContainer,
	SampleMoverContainer,
	SampleRotatorContainer,
	SampleSlideInOutContainer,
	SampleCanvasContainer,
	
	CrossZoomScreen,
	ClockScreen,
	MainPageScreen,
	SampleCrossZoomContainer,
	
	whiteSkin
} from "containers";


import { 
	SequencerContainer,
} from "sequencer";


class AnimationScreenBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
	}
};

var AnimationScreen = Container.template($ => ({
	left:0, top:0, right:0, bottom:0, skin:whiteSkin,
	behavior:AnimationScreenBehavior,
	contents: [
		MainPageScreen($, { anchor:"MAIN_SCREEN_PAGE", left:0, top:0, right:0, bottom:0 }),
		SampleWaitContainer($, { anchor:"WAIT", left:0, top:0, right:0, bottom:0, duration:1800 }),
		SampleCrossZoomContainer($, { anchor:"CROSS_ZOOM", left:0, top:0, right:0, bottom:0 }),
		SampleCanvasContainer($, { left:0, top:70, width:320, height:100, visible:false }),	// note the canvas is nested, see the SampleCanvasContainer template for options
		SampleCoordinatesWithLayerContainer($, { anchor:"COORDINATES_WITH_LAYER", left:0, top:0, width:320, height:240, visible:false, duration:2000 }),
		SampleBlinkerContainer($, { anchor:"BLINKER", left:0, top:0, right:0, visible:false, bottom:0, blinkCycles:1, visible:false, blinkDuration:600 }),
		SampleSlideInOutContainer($, { anchor:"SLIDE_IN_OUT", left:0, top:0, width:320, height:240, slideInDuration:1500, slideOutDuration:1500, slideOutDirection:"right" }),
		SampleRotatorContainer($, { anchor:"ROTATOR", left:0, top:0, width:320, height:240, visible:false, duration:1500 }),
		SampleClipperContainer($, { anchor:"CLIPPER", left:0, top:0, width:320, height:240, visible:false, clipDuration:800 }),
		SampleFaderContainer($, { anchor:"FADER", left:0, top:0, width:320, height:240, duration:3000 }),
		SampleMoverContainer($, { anchor:"MOVER", left:0, top:0, width:320, height:240, visible:false, duration:1500, easeType:"bounceEaseOut" }),
		SequencerContainer($, { anchor:"SEQUENCER", left:0, top:0, right:0, bottom:0 }),
	]
}));

class ApplicationBehavior extends Behavior {
	onLaunch(application) {
		var screenData = {};
		var screen = new AnimationScreen(screenData);
		application.add(screen);
	}
};

application.behavior = new ApplicationBehavior(application);
