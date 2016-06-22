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
	ClipperBehavior options:
	
		initialState = "shown" | "clippedLeft" | "clippedRight"	| "clippedUp"	| "clippedDown"		default: "shown"
		clipDuration = number of milliseconds														default: 250
		easeType = "quadEaseOut" | "quadEaseIn" | (any of the Math.easeType functions)				default: "quadEaseOut"
	
	animations:
	
		clipLeft(container, options)
		unclipLeft(container, options)
		clipRight(container, options)
		unclipRight(container, options)
		clipUp(container, options)
		unclipUp(container, options)
		clipDown(container, options)
		unclipDown(container, options)
		
	Notes:
		Expects the containers coordinates to be {left:aNumber, top:aNumber, width:aNumber, height:aNumber}
		Use the width of the shown state, if initialState is clippedLeft or clippedRight the behavior will
		take care of changing the initially displayed coordinates
		Expects a child container, and the child containers coordinates will be set to {left:0, top:0, width:width of container, height:height of container}
		The child container may optionally contain any contents
*/

import { AnimationBehavior } from "animation";

export class ClipperBehavior extends AnimationBehavior {
	onCreate(container, data, dictionary) {
		this.data = data;
		this.initialState = "shown";
		this.clipDuration = 250;
		this.easeType = "quadEaseOut";
		this.optionNames = "initialState,clipDuration,easeType";
		this.overrideDefaults(container, this.optionNames, dictionary);
		container.clip = true;
		this.state = this.initialState;
	}
	onDisplaying(container) {
		if (undefined == container.first) {
			trace("ClipperBehavior expects a child content to clip!\n");
			debugger;
		}
		this.updateAnchors(container);
	}
	overrideDefaults(container, names, dictionary) {
		super.overrideDefaults(container, names, dictionary);
		this.easeFunction = Math[this.easeType];
	}
	updateAnchors(container) {
		this.containerLeftAnchor = container.coordinates.left;
		this.containerTopAnchor = container.coordinates.top;
		this.containerWidthAnchor = container.coordinates.width;
		this.contentLeftAnchor = container.first.coordinates.left;
		this.contentTopAnchor = container.first.coordinates.top;
		this.initializeCoordinates(container);
	}
	initializeCoordinates(container) {
		var c = container.coordinates;
		var content = container.first;
		var cc = content.coordinates;
		switch(this.initialState) {
			case "shown":
				content.coordinates = { left:0, top:0, width:c.width, height:c.height };
			break
			case "clippedLeft":
				container.coordinates = { left:c.left-c.width, top:c.top, width:c.width, height:c.height };
				content.coordinates = { left:cc.left+c.width, top:cc.top, width:c.width, height:c.height };
			break
			case "clippedRight":
				container.coordinates = { left:c.left+c.width, top:c.top, width:c.width, height:c.height };
				content.coordinates = { left:cc.left-c.width, top:cc.top, width:c.width, height:c.height };
			break
			case "clippedUp":
				container.coordinates = { left:c.left, top:c.top-c.height, width:c.width, height:c.height };
				content.coordinates = { left:cc.left, top:cc.top+c.height, width:c.width, height:c.height };
			break
			case "clippedDown":
				container.coordinates = { left:c.left, top:c.top+c.height, width:c.width, height:c.height };
				content.coordinates = { left:cc.left, top:cc.top-c.height, width:c.width, height:c.height };
			break
		}
	}
	clipLeft(container, options) {
		if (this.state == "shown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "clippingLeft";
			this.fraction = 0;
			this.fromContainerLeft = this.containerLeftAnchor;
			this.toContainerLeft = this.fromContainerLeft - container.width;
			this.fromContentLeft = this.contentLeftAnchor;
			this.toContentLeft = this.fromContentLeft + container.width;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.clipLeftResolve = resolve;
		});
	}
	unclipLeft(container, options) {
		if (this.state == "clippedLeft") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "unclippingLeft";
			this.fraction = 0;
			this.fromContainerLeft = container.coordinates.left;
			this.toContainerLeft = this.containerLeftAnchor;
			this.fromContentLeft = container.first.coordinates.left;
			this.toContentLeft = this.contentLeftAnchor;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.unclipLeftResolve = resolve;
		});
	}
	clipRight(container, options) {
		if (this.state == "shown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "clippingRight";
			this.fraction = 0;
			this.fromContainerLeft = this.containerLeftAnchor;
			this.toContainerLeft = this.fromContainerLeft + container.width;
			this.fromContentLeft = this.contentLeftAnchor;
			this.toContentLeft = this.fromContentLeft - container.width;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.clipRightResolve = resolve;
		});
	}
	unclipRight(container, options) {
		if (this.state == "clippedRight") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "unclippingRight";
			this.fraction = 0;
			this.fromContainerLeft = container.coordinates.left;
			this.toContainerLeft = this.containerLeftAnchor;
			this.fromContentLeft = container.first.coordinates.left;
			this.toContentLeft = this.contentLeftAnchor;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.unclipRightResolve = resolve;
		});
	}
	clipUp(container, options) {
		if (this.state == "shown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "clippingUp";
			this.fraction = 0;
			this.fromContainerTop = this.containerTopAnchor;
			this.toContainerTop = this.fromContainerTop - container.height;
			this.fromContentTop = this.contentTopAnchor;
			this.toContentTop = this.fromContentTop + container.height;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.clipUpResolve = resolve;
		});
	}
	unclipUp(container, options) {
		if (this.state == "clippedUp") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "unclippingUp";
			this.fraction = 0;
			this.fromContainerTop = container.coordinates.top;
			this.toContainerTop = this.containerTopAnchor;
			this.fromContentTop = container.first.coordinates.top;
			this.toContentTop = this.contentTopAnchor;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.unclipUpResolve = resolve;
		});
	}
	clipDown(container, options) {
		if (this.state == "shown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "clippingDown";
			this.fraction = 0;
			this.fromContainerTop = this.containerTopAnchor;
			this.toContainerTop = this.fromContainerTop + container.height;
			this.fromContentTop = this.contentTopAnchor;
			this.toContentTop = this.fromContentTop - container.height;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.clipDownResolve = resolve;
		});
	}
	unclipDown(container, options) {
		if (this.state == "clippedDown") {
			if (undefined != options)
				this.overrideDefaults(container, this.optionNames, options);
			this.state = "unclippingDown";
			this.fraction = 0;
			this.fromContainerTop = container.coordinates.top;
			this.toContainerTop = this.containerTopAnchor;
			this.fromContentTop = container.first.coordinates.top;
			this.toContentTop = this.contentTopAnchor;
			container.time = 0;
			container.start();		
		}
		return new Promise( function(resolve, reject) {
			container.behavior.unclipDownResolve = resolve;
		});
	}
	onTimeChanged(container) {
		switch (this.state) {
			case "clippingLeft":
			case "unclippingLeft":
			case "clippingRight":
			case "unclippingRight":
				var fraction = container.time / this.clipDuration;
				if (fraction > 1)
					fraction = 1;
				fraction = this.easeFunction(fraction);

				var containerLeft = this.fromContainerLeft + Math.round(fraction * (this.toContainerLeft - this.fromContainerLeft));
				this.setCoordinatesLeft(container, container, containerLeft);
				var contentLeft = this.fromContentLeft + Math.round(fraction * (this.toContentLeft - this.fromContentLeft));
				this.setCoordinatesLeft(container, container.first, contentLeft);
										
				if (fraction == 1) {
					container.stop();
					switch (this.state) {
						case "clippingLeft":
							this.state = "clippedLeft";
							this.clipLeftResolve();
							delete this.clipLeftResolve;
						break
						case "unclippingLeft":
							this.state = "shown";
							this.unclipLeftResolve();
							delete this.unclipLeftResolve;
						break
						case "clippingRight":
							this.state = "clippedRight";
							this.clipRightResolve();
							delete this.clipRightResolve;
						break
						case "unclippingRight":
							this.state = "shown";
							this.unclipRightResolve();
							delete this.unclipRightResolve;
						break
					}
				}
			break;
			case "clippingUp":
			case "unclippingUp":
			case "clippingDown":
			case "unclippingDown":
				var fraction = container.time / this.clipDuration;
				if (fraction > 1)
					fraction = 1;
				fraction = this.easeFunction(fraction);

				var containerTop = this.fromContainerTop + Math.round(fraction * (this.toContainerTop - this.fromContainerTop));
				this.setCoordinatesTop(container, container, containerTop);
				var contentTop = this.fromContentTop + Math.round(fraction * (this.toContentTop - this.fromContentTop));
				this.setCoordinatesTop(container, container.first, contentTop);
										
				if (fraction == 1) {
					container.stop();
					switch (this.state) {
						case "clippingUp":
							this.state = "clippedUp";
							this.clipUpResolve();
							delete this.clipUpResolve;
						break
						case "unclippingUp":
							this.state = "shown";
							this.unclipUpResolve();
							delete this.unclipUpResolve;
						break
						case "clippingDown":
							this.state = "clippedDown";
							this.clipDownResolve();
							delete this.clipDownResolve;
						break
						case "unclippingDown":
							this.state = "shown";
							this.unclipDownResolve();
							delete this.unclipDownResolve;
						break
					}
				}
			break;			
		}
	}
	setCoordinatesLeft(container, target, newLeft) {
		var c = target.coordinates;
		target.coordinates = { left:newLeft, top:c.top, width:c.width, height:c.height };
	}
	setCoordinatesTop(container, target, newTop) {
		var c = target.coordinates;
		target.coordinates = { left:c.left, top:newTop, width:c.width, height:c.height };
	}
};



