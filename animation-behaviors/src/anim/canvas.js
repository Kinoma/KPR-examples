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
// __________________________________________________________________________
/*
	CanvasBehavior options:
	
		duration = number of milliseconds																	default: 1000
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)						default: "quadEaseOut"
		originX = x origin																					default: 0
		originY = y origin																					default: 0
		fromScaleX = starting x scale																		default: 1
		toScaleX = ending x scale																			default: 1
		fromScaleY = starting y scale																		default: 1
		toScaleY = ending y scale																			default: 1
		fromRotation = starting rotation in degrees															default: 0
		toRotation = rotation in degrees																	default: 0
		fromOpacity = starting opacity,	0=transparent, 1=opaque												default: 1
		toOpacity = ending opacity																			default: 1
		allowRestart = if true then calling animate while already animating will restart the animation		default: false
		
	animations:
		
		animate(canvas, options)
		
	notes
	
		To use, create a subclass of the CanvasBehavior and override the draw(canvas, ctx) function to render your vector graphics.
		
		The drawing context will be translated to (originX, originY), which means your geometry must take that into mind. 
		For example if you wanted to draw a 100x100 pixel square centered on a 320x240 pixel screen and rotate and/or scale it about it's center, 
		you would set the xOrigin to 160 and the yOrigin 120 and then draw rectangle with top=-50, left=-50, bottom=50, right=50.
		
		The current scale, rotation, and opacity values will also be applied.
		
*/

import { AnimationBehavior } from "animation";

export class CanvasBehavior extends AnimationBehavior {
	onCreate(canvas, data, dictionary) {
		this.data = data;
		this.duration = 1000;
		this.easeType = "quadEaseOut";

		this.originX = 0;
		this.originY = 0;
		
		this.fromScaleX = 1;
		this.fromScaleY = 1;
		this.fromRotation = 0;
		this.fromOpacity = 1;

		this.toScaleX = 1;
		this.toScaleY = 1;
		this.toRotation = 0;
		this.toOpacity = 1;
			
		this.optionNames = "duration,easeType,originX,originY,fromScaleX,fromScaleY,fromRotation,fromOpacity,toScaleX,toScaleY,toRotation,toOpacity,allowRestart";
		this.overrideDefaults(canvas, this.optionNames, dictionary);
		
		this.state = "still";
	}
	onDisplaying(canvas) {
		var ctx = canvas.getContext("2d");
		
		ctx.save();
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		ctx.translate(this.originX, this.originY);
		
		ctx.scale(this.fromScaleX, this.fromScaleY);

		ctx.rotate(this.fromRotation * Math.PI/180);
		
		ctx.globalAlpha = this.fromOpacity;
		
		this.draw(canvas, ctx);

		ctx.restore();
	}
	overrideDefaults(canvas, names, dictionary) {
		super.overrideDefaults(canvas, names, dictionary);
		this.easeFunction = Math[this.easeType];
	}
	animate(canvas, options) {
		var restarted = false;
		if (this.state != "still") {
			if (this.allowRestart)
				restarted = true;
			else
				return;
		}
		this.state = "animating";
		if (undefined != options)
			this.overrideDefaults(canvas, this.optionNames, options);
		this.fraction = 0;
		canvas.time = 0;
		canvas.start();		
		
		if (! restarted) {
			return new Promise( function(resolve, reject) {
				canvas.behavior.animateResolve = resolve;
				canvas.behavior.animateReject = reject;
			});
		}
	}
	onTimeChanged(canvas) {
		var fraction = canvas.time / this.duration;
		if (fraction > 1)
			fraction = 1;
		fraction = this.easeFunction(fraction);

		var scaleX = this.fromScaleX + fraction * (this.toScaleX - this.fromScaleX);
		var scaleY = this.fromScaleY + fraction * (this.toScaleY - this.fromScaleY);

		var opacity = this.fromOpacity + fraction * (this.toOpacity - this.fromOpacity);

		var rotation = this.fromRotation + fraction * (this.toRotation - this.fromRotation);
						
		var ctx = canvas.getContext("2d");
		ctx.save();

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.translate(this.originX, this.originY);
		
		ctx.scale(scaleX, scaleY);

		ctx.rotate(rotation * Math.PI/180);
		
		ctx.globalAlpha = opacity;
		
		this.draw(canvas, ctx);

		ctx.restore();
		
		if (fraction == 1) {
			canvas.stop();
			this.state = "still";
			this.animateResolve();
			delete this.animateResolve;
		}
	}
	draw(canvas, ctx) {
		// create a subclass and override draw()
	}
};



