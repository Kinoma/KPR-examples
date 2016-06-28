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
	mediumTextStyle,
	ClockScreen,
	MainPageScreen,
	blackSkin,
	whiteSkin
} from "containers";

class SequencerBehavior extends Behavior {
	onCreate(container, data, extra) {
		this.data = data;
	}
	onDisplayed(container) {
		var data = this.data;

		let coordinates = data.COORDINATES_WITH_LAYER;
		let blinker = data.BLINKER;
		let wait = data.WAIT;
		let slideInOut = data.SLIDE_IN_OUT;
		let rotator = data.ROTATOR;
		let clipper = data.CLIPPER;
		let fader = data.FADER;
		let mover = data.MOVER;
		let canvas = data.CANVAS;
		let canvasContainer = canvas.container;
		let crossZoom = data.CROSS_ZOOM;
		let mainScreenPage = data.MAIN_SCREEN_PAGE;
		
		// let's first build a long sequence of various animations
		
		wait.delegate("wait", { duration:1000 })
		.then(() => crossZoom.delegate("crossZoom", { newScreen:new ClockScreen(data), backgroundSkin:blackSkin }))
		.then(() => wait.delegate("wait"))
		.then(() => crossZoom.delegate("crossZoom", { newScreen:new MainPageScreen(data), backgroundSkin:whiteSkin }))
		.then(() => wait.delegate("wait"))
		.then(() => {
			crossZoom.container.remove(crossZoom);
			mainScreenPage.container.remove(mainScreenPage);
			canvasContainer.visible = true;
			wait.visible = false;
			return canvas.delegate("animate");
		})
		.then(() => {
			coordinates.visible = true;
			canvasContainer.visible = false;
			return coordinates.delegate("coordinatesTo", {left:20, top:20, width:120, height:90, duration:1000, opacity:1});
		})
		.then(() => coordinates.delegate("coordinatesTo", {left:20, top:20, width:120, height:90, duration:1000, opacity:1}))
		.then(() => coordinates.delegate("coordinatesTo", {left:0, top:0, width:320, height:240, duration:1000, opacity:1}))
		.then(() => coordinates.delegate("coordinatesTo", {left:-320, top:-240, width:960, height:720, duration:1500, opacity:0}))
		.then(() => coordinates.delegate("coordinatesTo", {left:160, top:120, width:0, height:0, duration:1, opacity:0}))
		.then(() => coordinates.delegate("coordinatesTo", {left:0, top:0, width:320, height:240, duration:1500, opacity:1}))
		.then(() => {
			blinker.visible = true;
			coordinates.visible = false;
			return blinker.delegate("blink", {blinkCycles:4, blinkDuration:700});
		})
		.then(() => {
			blinker.visible = false;
			wait.visible = true;
			return wait.delegate("wait");
		})
		.then(() => {
			wait.visible = false;
			slideInOut.visible = true;
			return slideInOut.delegate("slideIn");
		})
		.then(() => slideInOut.delegate("slideOut"))
		.then(() => slideInOut.delegate("slideIn", {slideInDirection:"right", slideInEaseType:"backEaseOut"}))
		.then(() => slideInOut.delegate("slideOut", {slideOutDirection:"down", slideOutEaseType:"elasticEaseIn"}))
		.then(() => {
			slideInOut.visible = false;
			rotator.visible = true;
			return rotator.delegate("rotateBy", {degrees:180, duration:1000})
		})

		.then(() => rotator.delegate("rotateBy", {degrees:-90, duration:500}))
		.then(() => rotator.delegate("rotateBy", {degrees:180, duration:1000}))
		.then(() => rotator.delegate("rotateBy", {degrees:-90, duration:500}))
		.then(() => rotator.delegate("rotateBy", {degrees:180, duration:1000}))
		.then(() => rotator.delegate("rotateBy", {degrees:30, duration:750, originX:75, originY:105}))
		.then(() => rotator.delegate("rotateBy", {degrees:-30, duration:750, originX:75, originY:105}))
		.then(() => rotator.delegate("rotateBy", {degrees:30, duration:750, originX:250, originY:100}))
		.then(() => rotator.delegate("rotateBy", {degrees:-30, duration:750, originX:250, originY:100}))
		.then(() => {
			rotator.visible = false;
			clipper.visible = true;
			return clipper.delegate("clipUp");
		})
		.then(() => clipper.delegate("unclipUp"))
		.then(() => clipper.delegate("clipDown"))
		.then(() => clipper.delegate("unclipDown"))
		.then(() => clipper.delegate("clipRight"))
		.then(() => clipper.delegate("unclipRight"))
		.then(() => clipper.delegate("clipLeft"))
		.then(() => {
			clipper.visible = false;
			fader.visible = true;
			return fader.delegate("show");
		})
		.then(() => fader.delegate("hide"))

		.then(() => {
			fader.visible = false;
			mover.visible = true;
			return mover.delegate("moveBy", {leftOffset:0, topOffset:100});
		})
		.then(() => mover.delegate("moveBy", {leftOffset:0, topOffset:-200}))
		.then(() => mover.delegate("moveBy", {leftOffset:80, topOffset:0, easeType:"elasticEaseIn"}))
		.then(() => mover.delegate("moveBy", {leftOffset:-170, topOffset:200, easeType:"quintEaseIn"}))
		.then(() => mover.delegate("moveBy", {leftOffset:170, topOffset:0, easeType:"elasticEaseIn"}))
		.then(() => mover.delegate("moveBy", {leftOffset:-80, topOffset:-100, easeType:"elasticEaseOut"}))
		
		// now let's reconfigure four of the containers and run four similar animation sequences for each in parallel
		
		.then(() => {
			rotator.visible = blinker.visible = slideInOut.visible = mover.visible = true;
			data.rotatorLabel.style = data.blinkerLabel.style = mediumTextStyle;
			data.slideInOutLabel.style = data.moverLabel.style = mediumTextStyle;
			
			rotator.coordinates = {left:160, top:0, width:160, height:120};
			blinker.coordinates = {left:0, top:0, width:160, height:120};
			slideInOut.coordinates = {left:0, top:120, width:160, height:120};
			mover.coordinates = {left:160, top:120, width:160, height:120};

			// and then run four similar animation sequences for each in parallel
		
			Promise.all([
				blinker.delegate("blink", {blinkCycles:4, blinkDuration:700}),

				rotator.delegate("rotateBy", {degrees:180, duration:1000, originX:160/2, originY:120/2})
				.then(() => rotator.delegate("rotateBy", {degrees:-90, duration:500}))
				.then(() => rotator.delegate("rotateBy", {degrees:180, duration:1000}))
				.then(() => rotator.delegate("rotateBy", {degrees:-90, duration:500}))
				.then(() => rotator.delegate("rotateBy", {degrees:180, duration:1000})),
	
				slideInOut.delegate("slideIn", {slideInEaseType:"quadEaseOut", slideOutEaseType:"quadEaseOut"})
				.then(() => slideInOut.delegate("slideOut"))
				.then(() => slideInOut.delegate("slideIn", {slideInDirection:"right"}))
				.then(() => slideInOut.delegate("slideOut", {slideOutDirection:"down"}))
				.then(() => slideInOut.delegate("slideIn", {slideOutDirection:"up"})),
		
				mover.delegate("moveBy", {leftOffset:0, topOffset:100/2})
				.then(() => mover.delegate("moveBy", {leftOffset:0, topOffset:-200/2}))
				.then(() => mover.delegate("moveBy", {leftOffset:80/2, topOffset:0, easeType:"elasticEaseIn"}))
				.then(() => mover.delegate("moveBy", {leftOffset:-170/2, topOffset:200/2, easeType:"quintEaseIn"}))
				.then(() => mover.delegate("moveBy", {leftOffset:170/2, topOffset:0, easeType:"elasticEaseIn"}))
				.then(() => mover.delegate("moveBy", {leftOffset:-80/2, topOffset:-100/2, easeType:"elasticEaseOut"}))
			])
			
			// finally run one last animation after all of the parallel sequences have finished
			
			.then(() => {
				blinker.visible = rotator.visible = slideInOut.visible = mover.visible = false;
				data.faderLabel.string = "That's all Folks!";
				fader.visible = true;
				data.faderLabel.style = mediumTextStyle;
				fader.delegate("show");
			})
		})
	}
}

export var SequencerContainer = Container.template($ => ({
	Behavior:SequencerBehavior
}));