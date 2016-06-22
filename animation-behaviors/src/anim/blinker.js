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
	BlinkerBehavior options:
	
		initialState = "shown" | "hidden"														default: "shown"
		blinkDuration = duration of single blink cycle in milliseconds							default: 250
		blinkCycles = number of times to blink													default: 3
	
	animations:
	
		blink(container, options);
*/

import { AnimationBehavior } from "animation";

export class BlinkerBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.data = data;
		this.initialState = "shown";
		this.blinkDuration = "250";
		this.blinkCycles = 3;
		this.optionNames = "initialState,blinkDuration,blinkCycles";
		this.overrideDefaults(container, this.optionNames, dictionary);
		this.trigFunction = (this.initialState == "shown") ? Math.cos : Math.sin;
	}
	onDisplaying(container) {
		if (undefined == container.first) {
			trace("BlinkBehavior expects a child content to blink!\n");
			debugger;
		}
	}
	blink(container, options) {
		if (undefined != options)
			this.overrideDefaults(container, this.optionNames, options);
		this.layer = new Layer({ alpha:true });
		this.layer.attach(container.first);
		if (this.state == "hidden")
			this.layer.opacity = 0;
		else
			this.layer.opacity = 1;
		this.fraction = 0;
		this.currentCycle = 1;
		container.time = 0;
		container.start();		
		
		return new Promise( function(resolve, reject) {
			container.behavior.blinkResolve = resolve;
		});
	}
	onTimeChanged(container) {
		var content = container.first;
		var fraction = container.time / this.blinkDuration;
		if (fraction > 1)
			fraction = 1;
		var radians = fraction * 2 * Math.PI;
		var result = this.trigFunction(radians);
		var opacity = (result / 2) + 0.5;
		this.layer.opacity = opacity;
		if (fraction == 1) {
			if (this.currentCycle == this.blinkCycles) {
				container.stop();
				this.layer.detach();
				this.blinkResolve();
				delete this.blinkResolve;
			}
			else {
				this.currentCycle++;
				container.time = 0;
			}
		}
	}
};

export var BlinkerContainer = Container.template($ => ({
	Behavior:BlinkerBehavior
}));
