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
	CrossZoomBehavior options:
	
		duration = number of milliseconds													default: 1000
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)		default: "quadEaseOut"
		newScreen	the new screen container being zoomed in (and becoming current screen)	default: [none - required]
		backgroundSkin	a skin to use for the background of the Container					default: [none - not required, but often desired]
				
	animations:

		crossZoom(container, options)
		
	notes:
		Create a Container which uses the CrossZoomBehavior
		Place the first screen as a child of the Container
		Then you delegate crossZoom to the Container passing it the screen you wish to zoom to as the newScreen option.
		The new screen will most likely be one that you've just created an instance of at runtime.
		After the CrossZoom animation completes, the former screen will be removed as a child of the Container,
		which means it will be garbage collected (which is usually desired) unless you keep a reference to it.
		
		Example usage:
			
			var screen = new MainPageScreen(data);
			crossZoomContainer.delegate("crossZoom", { newScreen:screen });
			var nextScreen = new AnotherScreen(data);
			crossZoomContainer.delegate("crossZoom", { newScreen:nextScreen });
*/

import { AnimationBehavior } from "animation";

var lerp = function(from, to, fraction) { return from + fraction * (to - from); }
        	
export class CrossZoomBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.duration = 1000;
		this.easeType = "quadEaseOut";
		this.optionNames = "duration,easeType,newScreen";
		this.overrideDefaults(container, this.optionNames, dictionary);
		this.state = "still";
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.easeFunction = Math[this.easeType];
		if ("backgroundSkin" in dictionary)
			container.skin = dictionary.backgroundSkin;
	}
	crossZoom(container, options) {
		if (this.state != "still")
			return;
		this.state = "crossZooming";
		if (undefined != options)
			this.overrideDefaults(container, this.optionNames, options);

		var formerContent = this.formerContent = container.first;

		container.insert( this.newScreen, container.first );
		var currentContent = this.currentContent = this.newScreen;
	
		var formerLayer = this.formerLayer = new Layer({alpha: false});
		formerLayer.capture( formerContent );
		formerLayer.coordinates = formerContent.coordinates;
		container.replace( formerContent, formerLayer );
		formerLayer.origin = { x : formerLayer.width / 2, y : formerLayer.height / 2 };
		formerLayer.subPixel = true;

		var currentLayer = this.currentLayer = new Layer({alpha: false});
		currentLayer.capture( currentContent );
		currentLayer.coordinates = currentContent.coordinates;
		container.replace( currentContent, currentLayer );
		currentLayer.origin = { x : currentLayer.width / 2, y : currentLayer.height / 2 };
		currentLayer.subPixel = true;
		
		this.fromFormerScale = 1.0;
		this.toFormerScale = 2.0;
		this.fromCurrentScale = 0.5;
		this.toCurrentScale = 1.0;

		container.time = 0;
		container.duration = this.duration;
		container.start();	
		return new Promise( function(resolve, reject) {
			container.behavior.crossZoomResolve = resolve;
		});
	}
	onTimeChanged(container) {
		let fraction = this.easeFunction(container.fraction);

		var formerScale = lerp( this.fromFormerScale, this.toFormerScale, fraction );
		this.formerLayer.scale = { x : formerScale, y : formerScale }
		this.formerLayer.opacity = 1 - fraction
		var currentScale = lerp( this.fromCurrentScale, this.toCurrentScale, fraction );
		this.currentLayer.scale = { x : currentScale, y : currentScale }
		this.currentLayer.opacity = fraction
	}
	onFinished(container) {
		container.remove(this.currentLayer);
		container.remove(this.formerLayer);
		container.add(this.currentContent);	
		
		container.stop();
		this.state = "still";
		this.crossZoomResolve();
		delete this.crossZoomResolve;
	}
};



