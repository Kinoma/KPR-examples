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
	FaderBehavior options:
	
		initialState = "shown" | "hidden"													default: "hidden"
		duration = number of milliseconds													default: 250
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)		default: "quadEaseOut"
		
	animations:
		
		show(container, options)
		hide(container, options)
*/

import { AnimationBehavior } from "animation";

export class FaderBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.data = data;
		this.initialState = "hidden";
		this.duration = 250;
		this.easeType = "quadEaseOut";
		this.optionNames = "initialState,duration,easeType";
		this.overrideDefaults(container, this.optionNames, dictionary);
		this.state = this.initialState;
	}
	onDisplaying(container) {
		if (undefined == container.first) {
			trace("FadeBehavior expects a child content to show/hide!\n");
			debugger;
		}
		if (this.state == "hidden")
			container.first.visible = false;
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.easeFunction = Math[this.easeType];
	}
	show(container, options) {
		if (this.state == "hidden") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "showing";
			container.first.visible = true;
			this.fraction = 0;
			var content = container.first;
			this.layer = new Layer({ alpha:true });
			this.layer.attach(content);
			this.layer.opacity = 0;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.showResolve = resolve;
		});
	}
	hide(container, options) {
		if (this.state == "shown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "hiding";
			this.fraction = 0;
			var content = container.first;
			this.layer = new Layer({ alpha:true });
			this.layer.attach(content);
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
				var fraction = container.time / this.duration;
				if (fraction > 1)
					fraction = 1;
				fraction = this.easeFunction(fraction);
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
				var fraction = container.time / this.duration;
				if (fraction > 1)
					fraction = 1;
				fraction = this.easeFunction(fraction);
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

export var FaderContainer = Container.template($ => ({
	Behavior:FaderBehavior
}));


