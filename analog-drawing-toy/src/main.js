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
let Pins = require("pins");

/* BEHAVIORS */

class CanvasBehavior extends Behavior {
	doClear(canvas) {
		let ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		this.newPoint = true;
	}
	doLineTo(canvas, x, y) {
		let ctx = canvas.getContext("2d");
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
        ctx.lineTo(x * canvas.width, y * canvas.height); 
		ctx.stroke();
	}
	doMoveTo(canvas, x, y) {
    	let ctx = canvas.getContext("2d");
        ctx.moveTo(x * canvas.width, y * canvas.height); 
        ctx.beginPath();
        this.newPoint = false; 
	}
	onAccelerometerRead(canvas, value) {
        if ( !this.lastX ) {
			this.lastX = value.x;
        	this.lastY = value.y;
        	this.lastZ = value.z;
        }
        else if ( ( Math.abs( value.x - this.lastX ) > this.threshold ) && 
        	( Math.abs( value.y - this.lastY ) > this.threshold )  &&
        	( Math.abs( value.z - this.lastZ ) > this.threshold ) )  {
        		this.doClear(canvas);
        }
        this.lastX = value.x;
        this.lastY = value.y;
        this.lastZ = value.z;
	}
	onDisplaying(canvas) {
		this.newPoint = true;
		this.lastX = false;
		this.threshold = .001; 
		this.doClear(canvas);
		
		Pins.configure({
            potentiometers: {
                require: "potentiometers",
                pins: {
          xPos: { pin: 64 },
          yPos: { pin: 53 },
          xground: { pin: 65, type: "Ground" },
                xpower: { pin: 63, type: "Power", voltage: 3.3 },
          yground: { pin: 54, type: "Ground" },
                ypower: { pin: 52, type: "Power", voltage: 3.3 },
                }
            },
            accelerometer: {
                require: "accelerometer",
                pins: {
                    x: { pin: 57 },
          y: { pin: 58 },
          z: { pin: 56 },
                }
            }
		}, success => this.onPinsConfigured(canvas, success));
	}
	onPinsConfigured(canvas, success) {
		if (success) {
			Pins.repeat("/potentiometers/read", 70, value => this.onPotentiometersRead(canvas, value));
			Pins.repeat("/accelerometer/read", 70, value => this.onAccelerometerRead(canvas, value));
	
			Pins.share("ws", {zeroconf: true, name: "analog-drawing-toy"});
		}
		else
			trace("failed to configure pins\n");
	}
	onPotentiometersRead(canvas, value) {
        if (this.newPoint)
        	this.doMoveTo(canvas, value.xPos, value.yPos);
        else
        	this.doLineTo(canvas, value.xPos, 1 - value.yPos);
	}
};

/* TEMPLATES */

let MainScreen = Canvas.template($ => ({
	left:0, right:0, top:0, bottom:0, Behavior:CanvasBehavior
}));

/* APPLICATION */

application.add(new MainScreen);
