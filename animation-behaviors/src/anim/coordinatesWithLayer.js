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
	CoordinatesWithLayerBehavior options:
	
		duration = number of milliseconds													default: 250
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)		default: "quadEaseOut"
		left = left coordinate																default: 100
		top = top coordinate																default: 100
		width = width																		default: 100
		height = height																		default: 100
		opacity = opacity																	default: 1
	
	animations:

		coordinatesTo(container, options)
		
	notes:
	
		Although coordinates are used to specify the position and scaling as a convenience, the underlying implementation uses a layer.
		This is useful for scaling things like text.
		The layer is not detached.
		
*/

import { AnimationBehavior } from "animation";

export class CoordinatesWithLayerBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.duration = 250;
		this.easeType = "quadEaseOut";
		this.left = 100;
		this.top = 100;
		this.width = 100;
		this.height = 100;
		this.opacity = 1;
		this.optionNames = "duration,easeType,left,top,width,height,opacity";
		this.overrideDefaults(container, this.optionNames, dictionary);
		this.state = "still";
		this.layer = null;
		var c = container.coordinates;
		this.anchorLeft = c.left;
		this.anchorTop = c.top;
		this.anchorWidth = c.width;
		this.anchorHeight = c.height;
	}
	onDisplaying(container) {
		if (undefined == container.first) {
			trace("CoordinatesWithLayerBehavior expects a child content which will have it's coordinates animated!\n");
			debugger;
		}
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.easeFunction = Math[this.easeType];
	}
	coordinatesTo(container, options) {
		if (this.state != "still")
			return;
		if (undefined != options)
			this.overrideDefaults(container, this.optionNames, options);
		this.state = "coordinatesTo";

		if (this.layer == null) {
			var c = container.coordinates;
			this.fromLeft = c.left;
			this.fromTop = c.top;
			this.fromWidth = c.width;
			this.fromHeight = c.height;
			this.layer = new Layer({ alpha:true });
			this.layer.attach(container.first);
		}
		else {		
			var layer = this.layer;
			this.fromLeft = this.anchorLeft + layer.translation.x;
			this.fromTop = this.anchorTop + layer.translation.y;
			this.fromWidth = this.anchorWidth * layer.scale.x;
			this.fromHeight = this.anchorHeight * layer.scale.y;
		}
		this.fromOpacity = this.layer.opacity;

		container.time = 0;
		container.duration = this.duration;
		container.start();	
		return new Promise( function(resolve, reject) {
			container.behavior.coordinatesToResolve = resolve;
		});
	}
	onTimeChanged(container) {
		var content = container.first;
		let fraction = this.easeFunction(container.fraction);
		switch (this.state) {
			case "coordinatesTo":
				var newLeft = this.fromLeft + fraction * (this.left - this.fromLeft);
				var newTop = this.fromTop + fraction * (this.top - this.fromTop);
				var newWidth = this.fromWidth + fraction * (this.width - this.fromWidth);
				var newHeight = this.fromHeight + fraction * (this.height - this.fromHeight);
				var xScale = newWidth / this.anchorWidth;
				var yScale = newHeight / this.anchorHeight;
				var xTranslation = newLeft - this.anchorLeft;
				var yTranslation = newTop - this.anchorTop;
				this.layer.scale = {x:xScale, y:yScale};
				this.layer.translation = {x:xTranslation, y:yTranslation};
				this.layer.opacity = this.fromOpacity + fraction * (this.opacity - this.fromOpacity);
			break
		}
	}
	onFinished(container) {
		container.stop();
		this.state = "still";
		this.coordinatesToResolve();
		delete this.coordinatesToResolve;
	}
	
};



