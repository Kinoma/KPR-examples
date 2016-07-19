/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
 
export class OpenMenuTransition extends Transition {	constructor(duration) {		if (!duration) duration = 300;		super(duration);	}	onBegin(container,from,to) {		container.add(to);		this.width = application.width;		this.layer = new Layer();		this.layer.attach(to);	}	onEnd(container,from,to) {		this.layer.detach();		container.remove(from);	}	onStep(fraction) {		fraction = Math.quadEaseOut(fraction);		this.layer.translation = {x:  -this.width + this.width* fraction};		this.layer.opacity = fraction;	}}
export class CloseMenuTransition extends Transition {	constructor(duration) {		if (!duration) duration = 300;		super(duration);	}	onBegin(container,to) {		application.insert(to,application.first);		this.width = application.width;		this.layer = new Layer();		this.layer.attach(application.first.next);	}	onEnd(container,to) {		this.layer.detach();		container.remove(application.first.next);	}	onStep(fraction) {		fraction = Math.quadEaseOut(fraction);		this.layer.translation = {x: - this.width*fraction};		this.layer.opacity = 1 - fraction;	}}

export class DialogCloseTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 300;
		super(duration);
	}
	onBegin(container, content) {
		this.canceller = content;
		var layer = this.layer = new Layer({alpha: false});
		layer.attach(content.first);
		layer.origin = { x: layer.width / 2 };
		this.starts = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		this.stops = [
			{ x: -0.2, y: 0.49 },
			{ x: 1.2, y: 0.49 },
			{ x: 0.8, y: 0.51 },
			{ x: 0.2, y: 0.51 },
		];
		this.steps = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
	}
	onEnd(container, content) {
		this.layer.detach();
		container.remove(content);
	}
	onStep(fraction) {
		fraction = Math.quadEaseIn(fraction);
		var starts = this.starts;
		var stops = this.stops;
		var steps = this.steps;
		for (var i = 0; i < 4; i++) {
			var start = this.starts[i];
			var stop = this.stops[i];
			var step = this.steps[i];
			step.x = (start.x * (1 - fraction)) + (stop.x * fraction);
			step.y = (start.y * (1 - fraction)) + (stop.y * fraction);
		}
		this.layer.corners = steps;
		this.canceller.state = 1 - fraction;
	}
}

class ScreenTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 500;
		super(duration);
	}
	onBegin(container, formerScreen, currentScreen, formerData, currentData) {
		container.add(currentScreen);
		this.formerHeader = null;
		this.currentHeader = null;
		this.formerFooter = null;
		this.currentFooter = null;
		if (("BODY" in formerData) && ("BODY" in currentData)) {
			var formerLayer = this.formerLayer = new Layer({alpha: false});
			formerLayer.attach(formerData.BODY);
			var currentLayer = this.currentLayer = new Layer({alpha: false});
			currentLayer.attach(currentData.BODY);
			if ("HEADER" in formerData) {
				formerData.HEADER.active = false;

				var formerHeader = this.formerHeader = new Layer({alpha: false});
				formerHeader.capture(formerScreen, 0, 0, formerData.HEADER.width, formerData.HEADER.height);
				application.add(formerHeader);
				
				this.realFormerHeader = formerData.HEADER;
				formerData.HEADER.visible = false;
			}
			if ("HEADER" in currentData) {
				currentData.HEADER.active = false;	

				var currentHeader = this.currentHeader = new Layer({alpha: false});
				currentHeader.capture(currentScreen, 0, 0, currentData.HEADER.width, currentData.HEADER.height);
				application.add(currentHeader);	
				
				this.realCurrentHeader = currentData.HEADER;
				currentData.HEADER.visible = false;			
			}
			if ("FOOTER" in currentData) {
				var currentFooter = this.currentFooter = new Layer({alpha: false});
				currentFooter.attach(currentData.FOOTER);
			}
			else if ("FOOTER" in formerData) {
				var formerFooter = this.formerFooter = new Layer({alpha: false});
				formerFooter.attach(formerData.FOOTER);
			}
		}
		else {
			var formerLayer = this.formerLayer = new Layer({alpha: false});
			formerLayer.attach(formerScreen);
			var currentLayer = this.currentLayer = new Layer({alpha: false});
			currentLayer.attach(currentScreen);
		}
		this.width = container.width;
	}
	onEnd(container, formerScreen, currentScreen) {
		if (this.currentFooter)
			this.currentFooter.detach();
		if (this.formerFooter)
			this.formerFooter.detach();
		if (this.currentHeader) {
			this.currentHeader.container.remove(this.currentHeader);
			this.realCurrentHeader.visible = true;
			this.realCurrentHeader.active = true;
		}
		if (this.formerHeader) {
			this.formerHeader.container.remove(this.formerHeader);
			this.realFormerHeader.visible = true;
			this.realFormerHeader.active = true;
		}
		this.currentLayer.detach();
		this.formerLayer.detach();
		container.remove(formerScreen);
	}
}

export class ScreenCloseTransition extends ScreenTransition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
	onStep(fraction) {
		fraction = 1 - Math.pow(1 - fraction, 2);
		var width = this.width;
		this.formerLayer.translation = {x: width * fraction};
		this.currentLayer.translation = {x: (0 - width) * (1 - fraction)};
		if (this.currentHeader)
			this.currentHeader.opacity = fraction;
		if (this.formerHeader)
			this.formerHeader.opacity = 1 - fraction;
		if (this.currentFooter)
			this.currentFooter.opacity = fraction;
		if (this.formerFooter)
			this.formerFooter.opacity = 1 - fraction;
	}
}

export class ScreenPreviousTransition extends ScreenTransition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
}

export class ScreenNextTransition extends ScreenTransition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
}

export class ScreenOpenTransition extends ScreenTransition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
	onStep(fraction) {
		fraction = 1 - Math.pow(1 - fraction, 2);
		var width = this.width;
		this.formerLayer.translation = {x: (0 - width) * fraction};
		this.currentLayer.translation = {x: width * (1 - fraction)};
		if (this.currentHeader)
			this.currentHeader.opacity = fraction;
		if (this.formerHeader)
			this.formerHeader.opacity = 1 - fraction;
		if (this.currentFooter)
			this.currentFooter.opacity = fraction;
		if (this.formerFooter)
			this.formerFooter.opacity = 1 - fraction;
	}
}

export class DialogOpenTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 300;
		super(duration);
	}
	onBegin(container, content) {
		container.add(content);
		this.canceller = content;
		var layer = this.layer = new Layer({alpha: false});
		layer.attach(content.first);
		layer.origin = { x: layer.width / 2 };
		this.starts = [
			{ x: 0.2, y: 0.49 },
			{ x: 0.8, y: 0.49 },
			{ x: 1.2, y: 0.51 },
			{ x: -0.2, y: 0.51 },
		];
		this.stops = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		this.steps = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
	}
	onEnd(container, content) {
		this.layer.detach();
		content.distribute(application.behavior._onScreenBegan);
	}
	onStep(fraction) {
		fraction = Math.quadEaseOut(fraction);
		var starts = this.starts;
		var stops = this.stops;
		var steps = this.steps;
		for (var i = 0; i < 4; i++) {
			var start = this.starts[i];
			var stop = this.stops[i];
			var step = this.steps[i];
			step.x = (start.x * (1 - fraction)) + (stop.x * fraction);
			step.y = (start.y * (1 - fraction)) + (stop.y * fraction);
		}
		this.layer.corners = steps;
		this.canceller.state = fraction;
	}
}