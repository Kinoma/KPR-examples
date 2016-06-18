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

class SequencerBehavior extends Behavior {
	onCreate(container, data, extra) {
		this.data = data;
	}
	onDisplayed(container) {
		var data = this.data;
		
		let blinker = data.BLINKER;
		let wait = data.WAIT;
		let slideInOut = data.SLIDE_IN_OUT;
		let rotator = data.ROTATOR;
		let clipper = data.CLIPPER;
		let fader = data.FADER;
		let mover = data.MOVER;
		
		blinker.delegate("blink", {blinkCycles:4, blinkDuration:700})	
		.then(() => {
			blinker.visible = false;
			wait.visible = true;
			return wait.delegate("wait")
		})
		.then(() => {
			wait.visible = false;
			slideInOut.visible = true;
			return slideInOut.delegate("slideIn")
		})
		.then(() => slideInOut.delegate("slideOut"))
		.then(() => slideInOut.delegate("slideIn", {slideInDirection:"right"}))
		.then(() => slideInOut.delegate("slideOut", {slideOutDirection:"down"}))
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

	}
}

export var SequencerContainer = Container.template($ => ({
	Behavior:SequencerBehavior
}));