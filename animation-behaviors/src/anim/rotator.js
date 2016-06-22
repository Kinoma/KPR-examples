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
	RotatorBehavior options:
	
		duration = number of milliseconds															default: 250
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)				default: "quadEaseOut"
		degrees = number of degrees to rotate (positive -> clockwise, negate -> counterclockwise)	default: 360
		originX = the x coordinate to rotate about													default: center x coordinate in local bounds (container.width / 2)
		originY = the y coordinate to rotate about													default: center y coordinate in local bounds (container.height / 2)
	
	animations:
	
		rotateBy(container, options)
*/

import { AnimationBehavior } from "animation";

export class RotatorBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.duration = 250;
		this.easeType = "quadEaseOut";
		this.degrees = 360;
		this.originX = undefined;
		this.originY = undefined;
		this.optionNames = "duration,easeType,degrees,originX,originY";
		this.overrideDefaults(container, this.optionNames, dictionary);
		this.state = "still";
		this.layer = null;
		this.lastOriginX = undefined;
		this.lastOriginY = undefined;
		this.saveRotation = undefined;
	}
	onDisplaying(container) {
		if (undefined == container.first) {
			trace("RotaterBehavior expects a child content to rotate!\n");
			debugger;
		}
		let b = container.bounds;
		this.lastX = b.x;
		this.lastY = b.y;
		this.lastWidth = b.width;
		this.lastHeight = b.height;
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.easeFunction = Math[this.easeType];
	}
	rotateBy(container, options) {
		if (this.state != "still")
			return;
		if (undefined != options)
			this.overrideDefaults(container, this.optionNames, options);
		this.state = "rotatingBy";
		this.fraction = 0;
				
		let b = container.bounds;
		if (this.layer != null && (this.lastOriginX != this.originX || this.lastOriginY != this.originY 
		  || this.lastX != b.x || this.lastY != b.y || this.lastWidth != b.width || this.lastHeight != b.height)) {

			this.lastX = b.x;
			this.lastY = b.y;
			this.lastWidth = b.width;
			this.lastHeight = b.height;

			let c = container.coordinates;
			let sc = { top: c.top, left: c.left, bottom: c.bottom, right: c.right, width: c.width, height: c.height };

			this.saveRotation = this.layer.rotation;
			this.layer.detach();
			this.layer = null;
			
			container.coordinates = { top: sc.top, left: sc.left, bottom: sc.bottom, right: sc.right, width: sc.width, height: sc.height };
		}
		if (this.layer == null) {
			this.layer = new Layer({ alpha:true });
			this.layer.attach(container);
			if (this.saveRotation != undefined) {
				this.layer.rotation = this.saveRotation;
				this.saveRotation = undefined;
			}
			let originX = (this.originX != undefined) ? this.originX : this.layer.width / 2;
			let originY = (this.originY != undefined) ? this.originY : this.layer.height / 2;
			this.layer.origin = { x: originX, y: originY };
			this.lastOriginX = originX;
			this.lastOriginY = originY;
		}
		this.fromRotation = this.layer.rotation;
		this.toRotation = this.fromRotation + this.degrees;
		var content = container.first;
		container.time = 0;
		container.start();	
		return new Promise( function(resolve, reject) {
			container.behavior.rotatorResolve = resolve;
		});
	}
	onTimeChanged(container) {
		var content = container.first;
		var fraction = container.time / this.duration;
		if (fraction > 1)
			fraction = 1;
		fraction = this.easeFunction(fraction);
		switch (this.state) {
			case "rotatingBy":
				var degrees = this.fromRotation + fraction * (this.toRotation - this.fromRotation);
				this.layer.rotation = degrees;
			break
		}
		if (fraction == 1) {
			container.stop();
			this.state = "still";
			this.rotatorResolve();
			delete this.rotatorResolve;
		}
	}
};



