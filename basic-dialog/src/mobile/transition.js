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
export class HeaderFooterShowHideTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
	onBegin(application, header, footer, flag) {
		this.flag = flag;
		this.layer0 = new Layer({alpha: true});
		this.layer1 = new Layer({alpha: true});
		if (flag) {
			header.active = true;
			header.visible = true;
			footer.active = true;
			footer.visible = true;
		}
		this.layer0.attach(header);
		this.layer1.attach(footer);
	}
	onEnd(application, header, footer, flag) {
		this.layer0.detach();
		this.layer1.detach();
		if (!flag) {
			header.active = false;
			header.visible = false;
			footer.active = false;
			footer.visible = false;
		}
	}
	onStep(fraction) {
		var flag = this.flag;
		var header = this.layer0;
		var footer = this.layer1;
		header.translation = { y: (0 - header.height) * (flag ? (1 - fraction) : fraction ) };
		footer.translation = { y: footer.height * (flag ? (1 - fraction) : fraction ) };
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
		var layer = this.layer = new Layer({alpha: true});
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

export class DialogCloseTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 300;
		super(duration);
	}
	onBegin(container, content) {
		this.canceller = content;
		var layer = this.layer = new Layer({alpha: true});
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

export class MenuOpenTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 250;
		super(duration);
	}
	onBegin(container, content, button) {
		container.add(content);
		this.canceller = content;
		var layer = this.layer = new Layer({alpha: true});
		layer.attach(content.first);
		if (!button)
			button = container;
		this.translation = { 
			x: button.x + (button.width / 2) - layer.x, 
			y: button.y + (button.height / 2) - layer.y, 
		}; 
	}
	onEnd(container, content) {
		this.layer.detach();
	}
	onStep(fraction) {
		this.layer.scale = { x: fraction, y: fraction };
		this.layer.translation = { x: this.translation.x * (1 - fraction), y: this.translation.y * (1 - Math.quadEaseIn(fraction)) };
		this.canceller.state = fraction;
	}
}

export class MenuCloseTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 250;
		super(duration);
	}
	onBegin(container, content, button) {
		this.canceller = content;
		var layer = this.layer = new Layer({alpha: true});
		layer.attach(content.first);
		layer.opacity = 1;
		if (!button)
			button = container;
		this.translation = { 
			x: button.x + (button.width / 2) - layer.x, 
			y: button.y + (button.height / 2) - layer.y, 
		}; 
	}
	onEnd(container, content) {
		this.layer.detach();
		container.remove(content);
	}
	onStep(fraction) {
		fraction = Math.quadEaseOut(fraction);
		this.layer.scale = { x: 1 - fraction, y: 1 - fraction };
		this.layer.translation = { x: this.translation.x * fraction, y: this.translation.y * fraction };
		this.canceller.state = 1 - fraction;
	}
}

export class ScreenTransition extends Transition {
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
			var formerLayer = this.formerLayer = new Layer({alpha: true});
			formerLayer.attach(formerData.BODY);
			var currentLayer = this.currentLayer = new Layer({alpha: true});
			currentLayer.attach(currentData.BODY);
			if ("HEADER" in formerData) {
				formerData.HEADER.active = false;

				var formerHeader = this.formerHeader = new Layer({alpha: true});
				formerHeader.capture(formerScreen, 0, 0, formerData.HEADER.width, formerData.HEADER.height);
				application.add(formerHeader);
				
				this.realFormerHeader = formerData.HEADER;
				formerData.HEADER.visible = false;
			}
			if ("HEADER" in currentData) {
				currentData.HEADER.active = false;	

				var currentHeader = this.currentHeader = new Layer({alpha: true});
				currentHeader.capture(currentScreen, 0, 0, currentData.HEADER.width, currentData.HEADER.height);
				application.add(currentHeader);	
				
				this.realCurrentHeader = currentData.HEADER;
				currentData.HEADER.visible = false;			
			}
			if ("FOOTER" in currentData) {
				var currentFooter = this.currentFooter = new Layer({alpha: true});
				currentFooter.attach(currentData.FOOTER);
			}
			else if ("FOOTER" in formerData) {
				var formerFooter = this.formerFooter = new Layer({alpha: true});
				formerFooter.attach(formerData.FOOTER);
			}
		}
		else {
			var formerLayer = this.formerLayer = new Layer({alpha: true});
			formerLayer.attach(formerScreen);
			var currentLayer = this.currentLayer = new Layer({alpha: true});
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

export class TabScreenSwapTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 250;
		super(duration);
	}
	onBegin(container, formerBody, currentBody, formerHeader, currentHeader) {
		this.height = application.height;
		container.insert(currentBody, formerBody.next);
		container.add(currentHeader);
		var layer0 = this.layer0 = new Layer({alpha: true});
		layer0.attach(currentBody);
		var layer1 = this.layer1 = new Layer({alpha: true});
		layer1.attach(currentHeader);
	}
	onEnd(container, formerBody, currentBody, formerHeader, currentHeader) {
		this.layer1.detach();
		this.layer0.detach();
		container.remove(formerHeader);
		container.remove(formerBody);
	}
	onStep(fraction) {
		fraction = Math.pow(fraction, 2);
		this.layer0.translation = {y: this.height * (1 - fraction)};
		this.layer1.opacity = fraction;
	}
}

export class TabListSwapTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 250;
		super(duration);
	}
	onBegin(container, content, by) {
		var scroller = container.container;
		var temporary = new Container({left: 0, right: 0, top: scroller.height, height: scroller.height}, THEME.blackSkin);
		if (content.y < scroller.y)
			by.coordinates = {left: 0, right: 0, top: content.y - scroller.y}
		temporary.add(by);
		scroller.add(temporary);
		this.layer1 = new Layer({alpha: true});
		this.layer1.attach(temporary);
		this.delta = Math.max(content.y - this.layer1.y, 0 - this.layer1.height);
	}
	onEnd(container, content, by) {
		var scroller = container.container;
		var temporary = this.layer1.detach();
		scroller.remove(temporary);
		temporary.remove(by);
		by.coordinates = {left: 0, right: 0, top: 0}
		container.replace(content, by);
	}
	onStep(fraction) {
		fraction = Math.pow(fraction, 2);
		this.layer1.translation = {y: this.delta * fraction};
	}
}

export default {
	HeaderFooterShowHideTransition,
	DialogOpenTransition,
	DialogCloseTransition,
	MenuOpenTransition,
	MenuCloseTransition,
	ScreenTransition,
	ScreenCloseTransition,
	ScreenPreviousTransition,
	ScreenNextTransition,
	ScreenOpenTransition,
	TabScreenSwapTransition,
	TabListSwapTransition
};