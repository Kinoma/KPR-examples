//@program
/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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

/* ASSETS */

let clareBackgroundSkin = new Skin({ fill:'#8F8F8F' });

/* TEMPLATES */

let clare = Container.template($ => ({
	width:320, height:240, skin:clareBackgroundSkin,
	behavior: Behavior({
		onCreate(container, data) {
			this.scenePara = { left:0, top:0, right:container.width - 1, bottom:container.height - 1 };
			container.interval = 40;
		},
		onDisplaying(container) {
			container.start();
		},
		onTimeChanged(container) {
			container.distribute("onSync", this.scenePara);
		}
	}),
	contents: [
		Canvas($, {
			width:320, height:240, active:true,
			behavior:Behavior({
				drawFace(canvas, ctx, scenePara) {
					let x, y;

					this.dy = 0;															// We only scan horizontally
					if (!this.stare) {														// If scanning, ...
						if (this.RandomBernoulli(.01)) {									// With a probability of 1 in 100, refocus the eyes to some other point on the screen. TODO: don't jump
							x = (Math.random() + Math.random()) * scenePara.right  * .5;	// Triangular probability distribution, ...
							y = (Math.random() + Math.random()) * scenePara.bottom * .5;	// ... dropping to 0 at the edge
							this.dx = this.RandomGaussian(0., 3);							// Scan direction, noyt too fast.

						} else {															// Continue scanning in the same direction
							x 	= this.x + this.dx;
							y 	= this.y + this.dy;
						}
					}
					else {																	// If staring, lock the eyes on the vergence point of the touch.
						x = this.x;
						y = this.y;
					}

					// Randomly generate smile/surprise and blinking.
					if (this.RandomBernoulli(.002))	{ this.smile = 20; x = scenePara.right * .5; y = scenePara.bottom * .5; }
					else							this.smile *= this.smileAtten;
					if (this.RandomBernoulli(.05))	this.blink = 1;
					else							this.blink *= this.blinkAtten;

					// Don't look t things outside of the screen dimensions
					if (y <= scenePara.top ) {
						y = scenePara.top ;
					}
					if (y >= scenePara.bottom) {
						y = scenePara.bottom ;
					}
					if (x >= scenePara.right || x <= scenePara.left) {
						this.dx = -this.dx;
					}

					// clear canvas
					ctx.fillStyle = "#FFccaa77";
					ctx.fillRect(-10, -10, canvas.width+10, canvas.height+10);				// We deliberately overfill to avoid antialiasing of the borders (speed hack).


					// Draw eyes
					let projector = this.eyeRad / this.z;									// Project onto the eye surface
					let grad = this.grad;

					// Draw left eye
					grad.x1 = this.midEye - this.ipd * .5;									// center of left eye is used as the center of the gradient
					grad.y1 = this.eyeY;
					grad.x0 = (x - grad.x1) * projector + grad.x1;							// the focal center tracks the object
					grad.y0 = (y - grad.y1) * projector + grad.y1;
					if (this.magSaccades > 0) {
						grad.x0 += this.RandomGaussian(0, this.magSaccades);				// add saccades
						grad.y0 += this.RandomGaussian(0, this.magSaccades);
					}
					ctx.fillStyle = grad;
					ctx.beginPath();														// left eye shape
					ctx.moveTo(grad.x1 - this.eyeRad*1.1, grad.y1);
					ctx.quadraticCurveTo(grad.x1, grad.y1 - this.eyeRad*1.5*(1-this.blink), grad.x1 + this.eyeRad*1.1, grad.y1);
					ctx.quadraticCurveTo(grad.x1, grad.y1 + this.eyeRad*1.5*(1-this.blink), grad.x1 - this.eyeRad*1.1, grad.y1);
					ctx.closePath();
					ctx.fill();

					// Draw right eye
					grad.x1 = this.midEye + this.ipd * .5;									// center of right eye is used as the center of the gradient
					grad.y1 = this.eyeY;
					grad.x0 = (x - grad.x1) * projector + grad.x1;							// the focal center tracks the object
					grad.y0 = (y - grad.y1) * projector + grad.y1;
					if (this.magSaccades > 0) {
						grad.x0 += this.RandomGaussian(0, this.magSaccades);				// add saccades
						grad.y0 += this.RandomGaussian(0, this.magSaccades);
					}
					ctx.fillStyle = grad;
					ctx.beginPath();														// right eye shape
					ctx.moveTo(grad.x1 - this.eyeRad*1.1, grad.y1);
					ctx.quadraticCurveTo(grad.x1, grad.y1 - this.eyeRad*1.5*(1-this.blink), grad.x1 + this.eyeRad*1.1, grad.y1);
					ctx.quadraticCurveTo(grad.x1, grad.y1 + this.eyeRad*1.5*(1-this.blink), grad.x1 - this.eyeRad*1.1, grad.y1);
					ctx.closePath();
					ctx.fill();


					// Draw eyebrows
					ctx.strokeStyle = "#221111";
					ctx.lineJoin = "round";
					ctx.lineCap = "round";
					ctx.lineWidth = this.eyeRad * .2;
					ctx.beginPath();														// left eyebrow shape
					ctx.moveTo(this.midEye - this.ipd * .2, this.eyeY - this.eyeRad * .8 - this.smile);
					ctx.quadraticCurveTo(	this.midEye - this.eyeRad * 1.1, this.eyeY - this.eyeRad*1.5,
											this.midEye - this.eyeRad * 2.2, this.eyeY - this.eyeRad * .7 - this.smile);
					ctx.stroke();															// uniform width
					ctx.beginPath();														// right eyebrow shape
					ctx.moveTo(this.midEye + this.ipd * .2, this.eyeY - this.eyeRad * .8 - this.smile);
					ctx.quadraticCurveTo(	this.midEye + this.eyeRad * 1.1, this.eyeY - this.eyeRad*1.5,
											this.midEye + this.eyeRad * 2.2, this.eyeY - this.eyeRad * .7 - this.smile);
					ctx.stroke();															// uniform width


					// Draw mouth
					ctx.fillStyle = "#cc6666";
					ctx.beginPath();														// mouth shape
					ctx.moveTo(this.mouthX, this.mouthY-canvas.width*.02);					// center top of upper lip
					ctx.quadraticCurveTo(	this.mouthX-this.mouthWidth*.15,	this.mouthY-canvas.width*.06,
											this.mouthX-this.mouthWidth*.5,		this.mouthY - this.smile);		// upper left lip
					ctx.quadraticCurveTo(	this.mouthX,						this.mouthY+canvas.width*.16 + this.smile*2,
											this.mouthX+this.mouthWidth*.5,		this.mouthY - this.smile);		// bottom lip
					ctx.quadraticCurveTo(	this.mouthX+this.mouthWidth*.15,	this.mouthY-canvas.width*.06,
											this.mouthX,						this.mouthY-canvas.width*.02);	// upper right lip
					ctx.closePath();
					ctx.fill();


					// Draw hair
					ctx.fillStyle= "black";
					ctx.beginPath();
					ctx.moveTo(canvas.width*+.5, canvas.height*.1);							// Widow's peak
					ctx.quadraticCurveTo(	canvas.width*-.2, canvas.height*-.1,
											canvas.width*+.1, canvas.height*+.9);
					ctx.lineTo(canvas.width*-.5, canvas.height*+.5);						// Box top head is clipped out, but requires no tessellation (speed hack)
					ctx.lineTo(canvas.width*-.5, canvas.height*-.5);
					ctx.lineTo(canvas.width*1.5, canvas.height*-.5);
					ctx.lineTo(canvas.width*1.5, canvas.height*+.5);
					ctx.lineTo(canvas.width*+.9, canvas.height*+.9);
					ctx.quadraticCurveTo(	canvas.width*1.2, canvas.height*-.1,
											canvas.width*+.5, canvas.height*+.1);
					ctx.closePath();
					ctx.fill();


					// Save state
					this.x = x;
					this.y = y;
				},
				
				onCreate(canvas, data) {
					// Animation parameters
					this.x			= 80;
					this.y			= 40;
					this.scanDepth	= canvas.width * .5;									// Focus on this plane when scanning
					this.touchDepth	= canvas.width * .2;									// Focus on this plane when staring
					this.z			= this.scanDepth;										// Initially scan
					this.dx			= 4.5;
					this.dy			= 0;
					this.stare		= 0;													// Initially scan

					this.eyeY   = (canvas.height - 1) * .4;									// Vertical location of the eyes
					this.midEye = (canvas.width  - 1) * .5;									// Midpoint between eyes
					this.eyeRad = (canvas.width  - 1) * .15;								// Radius of each eye
					if (this.eyeRad > this.eyeY)
						this.eyeRad = this.eyeY;
					this.ipd = 2 * this.eyeRad + this.midEye * .2;							// Interpulilliary distance
					this.magSaccades = .7;													// Saccades make it seem less robotic; set to 0 for a smoother robot style.

					this.mouthX = (canvas.width  - 1) * .5;									// Horizontal mouth location
					this.mouthY = (canvas.height - 1) * .8;									// Vertical mouth location
					this.mouthWidth = canvas.width * .5;									// The width of the mouth

					var ctx = canvas.getContext("2d");
					this.grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.eyeRad);		// Allocate a radial gradient object for rendering the eyes
					this.grad.addColorStop(0.3,	"rgba(  0,   0,   0, 1)");
					this.grad.addColorStop(0.4,	"rgba(  0, 100,   0, 1)");
					this.grad.addColorStop(0.7,	"rgba( 55,  55,   0, 1)");
					this.grad.addColorStop(0.9,	"rgba(222, 222, 200, 1)");

					this.smile = 0;
					this.smileAtten = 0.97;
					this.blink = 0;
					this.blinkAtten = 0.5;
				},
				
				onSync(canvas, scenePara) {
					let ctx = canvas.getContext("2d");
					//ctx.clearRect(0, 0, canvas.width, canvas.height);						// Transparent black clear is fast, but we don't need it unless using GLCanvas
					this.drawFace(canvas, ctx, scenePara);
				},
				
				onTouchBegan(canvas, id, x, y) {
					this.stareAt(x - canvas.x, y - canvas.y);
				},
				
				onTouchEnded(canvas, id, x, y) {
					this.z = this.scanDepth;
					this.stare = 0;
				},
				
				onTouchMoved(canvas, id, x, y) {
					this.stareAt(x - canvas.x, y - canvas.y);
				},
				
				stareAt(x, y) {
					this.z = this.touchDepth;
					this.stare = 1;
					this.x = x;
					this.y = y;
					this.dx = 0;
				},
				
				RandomGaussian(mean, std) {										// Gaussian-like, truncated after sigma=6.
					let r = 0;
					for (i = 12; i-- > 0;)
						r += Math.random();													// Uniform [0,1]
					return (r - 6) * std + mean;											// Gaussian with the specified mean and standard deviation
				},

				RandomBernoulli(probability) {										// Weighted coin flip; for a fair coin, choose probability=0.5
					return (Math.random() < probability);
				}

			})
		})
	]
}));

/* APPLICATION */

application.add(new clare);
