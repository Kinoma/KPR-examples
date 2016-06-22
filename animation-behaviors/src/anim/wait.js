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
	WaitBehavior options:
	
		duration = number of milliseconds		default: 250
		
	animations:
		
		wait(container, options)
*/

import { AnimationBehavior } from "animation";

export class WaitBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.data = data;
		this.duration = 250;
		this.optionNames = "duration";
		this.overrideDefaults(container,this.optionNames, dictionary);
	}
	wait(container, options) {
		if (undefined != options)
			this.overrideDefaults(container, this.optionNames, options);
		container.time = 0;
		container.start();		
		return new Promise(function(resolve, reject) {
			container.behavior.waitResolve = resolve;
		});
	}
	onTimeChanged(container) {
		var fraction = container.time / this.duration;
		if (fraction > 1)
			fraction = 1;
		if (fraction == 1) {
			container.stop();
			this.waitResolve();
			delete this.waitResolve;
		}
	}
};

export var WaitContainer = Container.template($ => ({
	Behavior:WaitBehavior
}));
