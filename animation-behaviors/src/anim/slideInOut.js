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
	SlideInOutBehavior options
	
		initialState = "shown" | "hidden"															default: "hidden"
		slideInDirection = "left" | "right" | "up" | "down" | "none"								default: "down"
		fadeOnSlideIn = true | false																default: true
		slideInDuration = number of milliseconds													default: 250
		slideInEaseType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)		default: "quadEaseOut"
		slideOutDirection = "left" | "right" | "up" | "down" | "none"								default: "down"
		fadeOnSlideOut = true | false																default: true
		slideOutDuration = number of milliseconds													default: 250
		slideOutEaseTyoe = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)		default: "quadEaseOut"
	
	animations:
		
		slideIn(container, options)
		slideOut(container, options)
		
	notes:
	
		durations are ignored if fade is false and slide is "none"
		if either fade is true, the contents are captured in a layer
*/

import { AnimationBehavior } from "animation";

export class SlideInOutBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.data = data;
		this.initialState = "hidden";
		this.slideInDirection = "down";
		this.fadeOnSlideIn = true;
		this.slideInDuration = 250;
		this.slideInEaseType = "quadEaseOut";
		this.slideOutDirection = "down";
		this.fadeOnSlideOut = true;
		this.slideOutDuration = 250;
		this.slideOutEaseType = "quadEaseOut";
		this.optionNames = "initialState,slideInDirection,fadeOnSlideIn,slideInDuration,slideInEaseType,slideOutDirection,fadeOnSlideOut,slideOutDuration,slideOutEaseType";
		this.overrideDefaults(container, this.optionNames, dictionary);
		container.clip = true;
		this.state = this.initialState;
	}
	onDisplaying(container) {
		if (undefined == container.first) {
			trace("SlideInOutBehavior expects a child content to slideIn/slideOut!\n");
			debugger;
		}
		if (this.state == "hidden")
			container.first.visible = false;
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.showEaseFunction = Math[this.slideInEaseType];
		this.hideEaseFunction = Math[this.slideOutEaseType];
	}
	slideIn(container, options) {
		if (this.state == "hidden") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "showing";
			container.first.visible = true;
			this.fraction = 0;
			var content = container.first;
			this.layer = new Layer({ alpha:true });
			if (this.fadeOnSlideIn)
				this.layer.opacity = 0;
			this.layer.attach(content);
			this.fromX = this.toX = this.fromY = this.toY = 0;
			switch(this.slideInDirection) {
				case "left":
					this.fromX = container.width;
				break
				case "right":
					this.fromX = -container.width;
				break
				case "up":
					this.fromY = container.height;
				break
				case "down":
					this.fromY = - container.height;
				break
			}
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.showResolve = resolve;
		});
	}
	slideOut(container, options) {
		if (this.state == "shown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "hiding";
			this.fraction = 0;
			var content = container.first;
			this.layer = new Layer({ alpha:true });
			this.layer.attach(content);
			this.fromX = this.toX = this.fromY = this.toY = 0;
			switch(this.slideOutDirection) {
				case "left":
					this.toX = - container.width;
				break
				case "right":
					this.toX = container.width;
				break
				case "up":
					this.toY = - container.height;
				break
				case "down":
					this.toY = container.height;
				break
			}
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.hideResolve = resolve;
		});
	}
	onTimeChanged(container) {
		var content = container.first;
		switch (this.state) {
			case "showing":
				var fraction = container.time / this.slideInDuration;
				if (fraction > 1)
					fraction = 1;
				fraction = this.showEaseFunction(fraction);
				var y = this.fromY + fraction * (this.toY - this.fromY);
				var x = this.fromX + fraction * (this.toX - this.fromX);
				this.layer.translation = { x:x, y:y };
				if (this.fadeOnSlideIn)
					this.layer.opacity = fraction;
				if (fraction == 1) {
					container.stop();
					this.layer.detach();
					this.state = "shown";
					this.showResolve();
					delete this.showResolve;
				}
			break;
			case "hiding":
				var fraction = container.time / this.slideOutDuration;
				if (fraction > 1)
					fraction = 1;
				fraction = this.hideEaseFunction(fraction);
				var y = this.fromY + fraction * (this.toY - this.fromY);
				var x = this.fromX + fraction * (this.toX - this.fromX);
				this.layer.translation = { x:x, y:y };
				if (this.fadeOnSlideOut)
					this.layer.opacity = 1 - fraction;
				if (fraction == 1) {
					container.stop();
					this.layer.detach();
					this.state = "hidden";
					container.first.visible = false;
					this.hideResolve();
					delete this.hideResolve;
				}			
			break;
		}
	}
};



