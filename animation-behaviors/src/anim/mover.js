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
	MoverBehavior options:
	
		duration = number of milliseconds													default: 250
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)		default: "quadEaseOut"
		leftOffset = number of pixels to move horizontally									default: 100
		topOffset = number of pixels to move vertically										default: 100
	
	animations:
		
		moveBy(container, options)
		
	Notes: 
	
		coordinates should include left, top
*/

import { AnimationBehavior } from "animation";

export class MoverBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.data = data;
		this.duration = "250";
		this.easeType = "quadEaseOut";
		this.leftOffset = 100;
		this.topOffset = 100;
		this.optionNames = "duration,easeType,leftOffset,topOffset";
		this.overrideDefaults(container, this.optionNames, dictionary);
	}
	onDisplaying(container) {
		this.containerLeftAnchor = container.coordinates.left;
		this.containerTopAnchor = container.coordinates.top;
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.easeFunction = Math[this.easeType];
	}
	moveBy(container, options) {
		if (undefined != options)
			this.overrideDefaults(container, this.optionNames, options);
		this.fraction = 0;
		this.fromContainerLeft = container.coordinates.left;
		this.toContainerLeft = this.fromContainerLeft + this.leftOffset;
		this.fromContainerTop = container.coordinates.top;
		this.toContainerTop = this.fromContainerTop + this.topOffset;
		
		container.time = 0;
		container.start();		
		
		return new Promise( function(resolve, reject) {
			container.behavior.moveByResolve = resolve;
		});
	}
	onTimeChanged(container) {
		var fraction = container.time / this.duration;
		if (fraction > 1)
			fraction = 1;
		fraction = this.easeFunction(fraction);

		var containerLeft = this.fromContainerLeft + Math.round(fraction * (this.toContainerLeft - this.fromContainerLeft));
		var containerTop = this.fromContainerTop + Math.round(fraction * (this.toContainerTop - this.fromContainerTop));

		this.setCoordinates(container, containerLeft, containerTop);
							
		if (fraction == 1) {
			container.stop();
			this.moveByResolve();
			delete this.moveByResolve;
		}
	}
	setCoordinates(container, newLeft, newTop) {
		var c = container.coordinates;
		var b = container.bounds;
		container.coordinates = { left:newLeft, top:newTop, width:b.width, height:b.height, right:undefined, bottom:undefined };
	}
	reset(container) {
		var b = container.bounds;
		container.coordinates = { left:this.containerLeftAnchor, top:this.containerTopAnchor, width:b.width, height:b.height, right:undefined, bottom:undefined };
	}
};

export var MoverContainer = Container.template($ => ({
	Behavior:MoverBehavior
}));


