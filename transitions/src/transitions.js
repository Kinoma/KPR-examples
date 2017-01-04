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
/*
*
* Notes: 
*
* 1. These are not compatible with the MobileFramework pattern where options (duration, easeType, etc.) are passed as 
*	 a separate argument to container.run; options should be passed into the constructor of the transition, i.e.
* 	 	container.run( new Push({ direction : "right", duration : 400, easeType: "quadEaseIn" }), oldScreen, newScreen );
*
* 2. The following options can be customized:
*	 	duration: Specifies duration in milliseconds
*	 	direction: Specifies direction of transition
*	 		- Value may be "left", "right", "up", or "down" for Push, Flip, Reveal, and Hide
*	 		- Value may be "forward" or "back" for TimeTravel and ZoomAndSlide
*	 		- CrossFade does not use a direction
*	 	easeType: Specifies the math function used for pacing time. Values may be:
*			"backEaseIn", "backEaseInOut", "backEaseOut",
*			"bounceEaseIn", "bounceEaseInOut", "bounceEaseOut",
*			"circularEaseIn", "circularEaseInOut", "circularEaseOut",
*			"cubicEaseIn", "cubicEaseInOut", "cubicEaseOut",
* 			"exponentialEaseIn", "exponentialEaseInOut", "exponentialEaseOut",
*			"quadEaseIn", "quadEaseInOut", "quadEaseOut",
*			"quartEaseIn", "quartEaseInOut", "quartEaseOut",
*			"quintEaseIn", "quintEaseInOut", "quintEaseOut",
*			"sineEaseIn", "sineEaseInOut", "sineEaseOut"
* 
*/

export class ScreenTransition extends Transition {
	constructor(data) {
		let duration = ((data) && ("duration" in data)) ? data.duration: 500;
		super(duration);
		if ( undefined != data ) {        
	 		for (let option in data) this[option] = data[option];  
		}
	}
	onBegin(container, former, current) {
		this.currentLayer = new Layer({ alpha:false });
		this.currentLayer.attach(current);
		this.formerLayer = new Layer({ alpha:false });
		this.formerLayer.attach(former);
	}
	onEnd(container, former, current) {
		this.formerLayer.detach();
		this.currentLayer.detach();
		container.remove(former);
	}
	onStep(fraction) {
		if ((this.easeType) && (this.easeType != "linear")) fraction = Math[this.easeType]( fraction );
		this.onStepTransition( fraction );
	}
};

export class Push extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.insert( currentContent, container.last );
		super.onBegin(container, formerContent, currentContent);

		if (!this.direction) this.direction = "left";
		this.formerFromX = this.formerToX = this.currentFromX = this.currentToX = 0;
		this.formerFromY = this.formerToY = this.currentFromY = this.currentToY = 0;
		switch (this.direction) {
			case "left":
				this.formerFromX = 0;
				this.formerToX = -formerContent.width
				this.currentLayer.translation = { x : 320, y : 0 }
				this.currentFromX = 320
				this.currentToX = 0
				break;
			case "right":
				this.formerFromX = 0;
				this.formerToX = formerContent.width
				this.currentLayer.translation = { x : -320, y : 0 }
				this.currentFromX = -320
				this.currentToX = 0
				break;
			case "up": 
				this.formerFromY = 0;
				this.formerToY = -formerContent.height
				this.currentLayer.translation = { x : 0, y : 240 }
				this.currentFromY = 240
				this.currentToY = 0
				break;
			case "down":
				this.formerFromY = 0;
				this.formerToY = formerContent.height
				this.currentLayer.translation = { x : 0, y : -240 }
				this.currentFromY = -240
				this.currentToY = 0
				break;
		}
	}
	onStepTransition(fraction) {
		let formerX = lerp( this.formerFromX, this.formerToX, fraction );
		let formerY = lerp( this.formerFromY, this.formerToY, fraction );
		this.formerLayer.translation = { x : formerX, y : formerY }
		let currentX = lerp( this.currentFromX, this.currentToX, fraction );
		let currentY = lerp( this.currentFromY, this.currentToY, fraction );
		this.currentLayer.translation = { x : currentX, y : currentY }
	}
}
	
export class Flip extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.insert( currentContent, container.last );
		super.onBegin(container, formerContent, currentContent);
		let formerLayer = this.formerLayer;
		formerLayer.origin = { y: formerLayer.height / 2 };
		this.formerStarts = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		this.formerSteps = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		let currentLayer = this.currentLayer;
		currentLayer.origin = { y: currentLayer.height / 2 };
		this.currentStops = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		this.currentSteps = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		if (!this.direction) this.direction = "left";
		switch ( this.direction ) {
			case "left":
				this.formerStops = [
					{ x: 0.49, y: 0.1 },
					{ x: 0.51, y: -0.1 },
					{ x: 0.51, y: 1.1 },
					{ x: 0.49, y: 0.9 },
				];
				this.currentStarts = [
					{ x: 0.49, y: -0.1 },
					{ x: 0.51, y: 0.1 },
					{ x: 0.51, y: 0.9 },
					{ x: 0.49, y: 1.1 },
				];
				break;
			case "right":		
				this.formerStops = [
					{ x: 0.49, y: -0.1 },
					{ x: 0.51, y: 0.1 },
					{ x: 0.51, y: 0.9 },
					{ x: 0.49, y: 1.1 },
				];
				this.currentStarts = [
					{ x: 0.49, y: 0.1 },
					{ x: 0.51, y: -0.1 },
					{ x: 0.51, y: 1.1 },
					{ x: 0.49, y: 0.9 },
				];
				break;
			case "up":		
				this.currentStarts = [
					{ x: -0.2, y: 0.49 },
					{ x: 1.2, y: 0.49 },
					{ x: 0.8, y: 0.51 },
					{ x: 0.2, y: 0.51 },
				];
				this.formerStops = [
					{ x: 0.2, y: 0.49 },
					{ x: 0.8, y: 0.49 },
					{ x: 1.2, y: 0.51 },
					{ x: -0.2, y: 0.51 },
				];
				break;
			case "down":		
				this.formerStops = [
					{ x: -0.2, y: 0.49 },
					{ x: 1.2, y: 0.49 },
					{ x: 0.8, y: 0.51 },
					{ x: 0.2, y: 0.51 },
				];			
				this.currentStarts = [
					{ x: 0.2, y: 0.49 },
					{ x: 0.8, y: 0.49 },
					{ x: 1.2, y: 0.51 },
					{ x: -0.2, y: 0.51 },
				];
				break;
		}
	}
	onStepTransition(fraction) {
		if (fraction <= 0.5) {
			fraction *= 2;
			let layer = this.formerLayer;
			let starts = this.formerStarts;
			let stops = this.formerStops;
			let steps = this.formerSteps;
			for (let i = 0; i < 4; i++) {
				let start = starts[i];
				let stop = stops[i];
				let step = steps[i];
				step.x = (start.x * (1 - fraction)) + (stop.x * fraction);
				step.y = (start.y * (1 - fraction)) + (stop.y * fraction);
			}
			layer.opacity = 1;
			layer.corners = steps;
			this.currentLayer.opacity = 0;
		}
		else {
			fraction = 2 * (fraction - 0.5);
			let layer = this.currentLayer;
			let starts = this.currentStarts;
			let stops = this.currentStops;
			let steps = this.currentSteps;
			for (let i = 0; i < 4; i++) {
				let start = starts[i];
				let stop = stops[i];
				let step = steps[i];
				step.x = (start.x * (1 - fraction)) + (stop.x * fraction);
				step.y = (start.y * (1 - fraction)) + (stop.y * fraction);
			}
			layer.opacity = 1;
			layer.corners = steps;
			this.formerLayer.opacity = 0;
		}
	}
}


export class TimeTravel extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.insert( currentContent, container.last );
		super.onBegin(container, formerContent, currentContent);
		if (this.hasOwnProperty("xOrigin") && this.hasOwnProperty("yOrigin")) {
			this.formerLayer.origin = { x : this.xOrigin, y : this.yOrigin };
			this.currentLayer.origin = { x : this.xOrigin, y : this.yOrigin };
		}
		else {
			this.formerLayer.origin = { x : this.formerLayer.width / 2, y : this.formerLayer.height / 2 };
			this.currentLayer.origin = { x : this.currentLayer.width / 2, y : this.currentLayer.height / 2 };
		}
		if (!this.direction) this.direction = "forward";
		switch (this.direction) {
			case "forward":
				this.fromFormerScale = 1.0;
				this.toFormerScale = 2.0;
				this.fromCurrentScale = 0.5;
				this.toCurrentScale = 1.0;
				break;
			case "back":
				this.fromFormerScale = 1.0;
				this.toFormerScale = 0.5;
				this.fromCurrentScale = 2.0;
				this.toCurrentScale = 1.0;
				break;
		}
		this.onStepTransition( 0 );
	}
	onStepTransition(fraction) {
		let formerScale = lerp( this.fromFormerScale, this.toFormerScale, fraction );
		this.formerLayer.scale = { x : formerScale, y : formerScale }
		this.formerLayer.opacity = 1 - fraction
		let currentScale = lerp( this.fromCurrentScale, this.toCurrentScale, fraction );
		this.currentLayer.scale = { x : currentScale, y : currentScale }
		this.currentLayer.opacity = fraction
	}
}

export class CrossFade extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.add( currentContent );
		super.onBegin(container, formerContent, currentContent);
	}
	onStep(fraction) {
		this.currentLayer.opacity = Math.quadEaseOut(fraction);
	}
}

export class Reveal extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.add( currentContent );
		super.onBegin(container, formerContent, currentContent);
		this.currentFromX = this.currentToX = 0;
		this.currentFromY = this.currentToY = 0;
		
		this.effect = new Effect();
		if (!this.direction) this.direction = "left";
		switch (this.direction) {
			case "left":
				this.currentLayer.translation = { x : currentContent.width, y : 0 }
				this.currentFromX = currentContent.width
				break;
			case "right":
				this.currentLayer.translation = { x : -currentContent.width, y : 0 }
				this.currentFromX = -currentContent.width
				break;
			case "up":
				this.currentLayer.translation = { x : 0, y : currentContent.height }
				this.currentFromY = currentContent.height
				break;
			case "down":
				this.currentLayer.translation = { x : 0, y : -currentContent.height }
				this.currentFromY = -currentContent.height
				break;
		}
	}
	onStepTransition(fraction) {
		let currentX = lerp( this.currentFromX, this.currentToX, fraction );
		let currentY = lerp( this.currentFromY, this.currentToY, fraction );
		this.currentLayer.translation = { x : currentX, y : currentY }
		
		let effect = new Effect();
		effect.colorize("black", fraction / 2);
		this.formerLayer.effect = effect;
	}
}

export class Hide extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.insert( currentContent, container.last );
		super.onBegin(container, formerContent, currentContent);
		this.formerFromX = this.formerToX = 0;
		this.formerFromY = this.formerToY = 0;
		if (!this.direction) this.direction = "left";
		switch (this.direction) {
			case "left":
				this.formerToX = -formerContent.width
				break;
			case "right":
				this.formerToX = formerContent.width
				break;
			case "up":
				this.formerToY = -formerContent.height;
				break;
			case "down":
				this.formerToY = formerContent.height;
				break;
		}
	}
	onStepTransition(fraction) {
		let formerX = lerp( this.formerFromX, this.formerToX, fraction );
		let formerY = lerp( this.formerFromY, this.formerToY, fraction );
		this.formerLayer.translation = { x : formerX, y : formerY }

		let effect = new Effect();
		effect.colorize("black", 0.5 - (fraction / 2));
		this.currentLayer.effect = effect;
	}
}

export class ZoomAndSlide extends ScreenTransition {
	constructor(data) {
		super(data);
	}
	onBegin(container, formerContent, currentContent) {
		container.add( currentContent );
		super.onBegin(container, formerContent, currentContent);
		this.formerLayer.origin = { x : this.formerLayer.width / 2, y : this.formerLayer.height / 2 };
		this.currentLayer.origin = { x : this.currentLayer.width / 2, y : this.currentLayer.height / 2 };
		this.currentaFromX = currentContent.width
		this.formerFromY = this.formerToY = this.currentFromY = this.currentToY = 0;
		if (!this.direction) this.direction = "forward";
		switch (this.direction) {
			case "forward":
				this.fromFormerScale = 1.0;
				this.toFormerScale = 0.8;
				this.currentLayer.translation = { x : currentContent.width, y : 0 };
				this.currentFromX = currentContent.width;
				this.currentToX = 0;
				break;
			case "back":
				this.fromCurrentScale = 0.8;
				this.toCurrentScale = 1.0;
				this.formerLayer.translation = { x : 0, y : 0 };
				this.formerFromX = 0;
				this.formerToX = currentContent.width
				break;
		}
	}
	onStepTransition(fraction) {
		switch (this.direction) {
			case "forward":
				let formerScale = lerp( this.fromFormerScale, this.toFormerScale, fraction);
				this.formerLayer.scale = { x : formerScale, y : formerScale };
				let currentX = lerp( this.currentFromX, this.currentToX, fraction );
				this.currentLayer.translation = { x : currentX, y : 0 };
				break;
			case "back":
				let currentScale = lerp( this.fromCurrentScale, this.toCurrentScale, fraction);
				this.currentLayer.scale = { x : currentScale, y : currentScale };
				let formerX = lerp( this.formerFromX, this.formerToX, fraction );
				this.formerLayer.translation = { x : formerX, y : 0 };
				break;
		}
	}
}

let lerp = function(from, to, fraction) {
	return from + fraction * (to - from);
}

export default {
	ScreenTransition, Push, Flip, TimeTravel, CrossFade, Reveal, Hide, ZoomAndSlide
}