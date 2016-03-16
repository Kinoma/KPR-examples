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

let footerSkin = new Skin({ fill:"#203a6e" });
let toggleSwitchBackgroundTexture = new Texture("./assets/switchBackground.png");
let toggleSwitchForegroundTexture = new Texture("./assets/switchForeground.png");

let labelStyle = new Style({ font:"bold 72px", color:"white", horizontal:"center", vertical:"middle" });
	
/* BEHAVIORS */

class ToggleSwitchBehavior extends Behavior {
	constrain(port, offset) {
		if (offset < 0)
			offset = 0;
		else if (offset > this.size)
			offset = this.size;
		return offset;
	}
	onCreate(port, data) {
		this.data = data;
		this.onOff = this.data.onOff;
		this.switchForeground = toggleSwitchForegroundTexture;
		this.switchBackground = toggleSwitchBackgroundTexture;
		
		this.size = this.switchBackground.width - this.switchForeground.width;
		this.offset = ("off" == this.onOff ? this.size : 0);
		this.touched = false;
		this.capturing = false;
		this.touchMovedOffset = 15;
	}
	onDraw(port, x, y, width, height) {
		port.pushClip();
		port.intersectClip(x + 6, y + 6, width - 12, height - 12);
		port.drawImage(this.switchBackground, x - this.offset, y, width + this.size, height, 
			0, this.touched ? 40 : 0, width + this.size, height);
		port.popClip();
		port.drawImage(this.switchForeground, x, y, width, height);
	}
	onFinished(port) {
		this.touched = false;
		this.capturing = false;
		
		if (this.offset == 0)
			this.onOff = "on";
		else
			this.onOff = "off";
			
		this.onSwitchChanged(port, this.onOff);
	}
	onSwitchChanged(port, onOff) {
		debugger
	}
	onTimeChanged(port) {
		let fraction = port.fraction;
		this.offset = this.anchor + Math.round(this.delta * fraction);
		port.invalidate();
	}
	onTouchBegan(port, id, x, y, ticks) {
		if (port.running) {
			port.stop();
			port.time = port.duration;
		}
		this.anchor = x;
		this.delta = this.offset + x;
		this.touched = true;
		port.invalidate();
	}
	onTouchCancelled(port, id, x, y, ticks) {
		this.touched = false;
	}
	onTouchEnded(port, id, x, y, ticks) {
		let offset = this.offset;
		let size = this.size;
		let delta = size >> 1;
		this.anchor = offset;
		if (this.capturing) {
			if (offset < delta)
				delta = 0 - offset;
			else 
				delta = size - offset;
		}
		else {
			if (offset == 0)
				delta = size;
			else
				delta = 0 - size;
		}
		if (delta) {
			this.delta = delta;
			port.duration = 100 * Math.abs(delta) / size;
			port.time = 0;
			port.start();
		}
		else
			this.onFinished(port);
		port.invalidate();
	}
	onTouchMoved(port, id, x, y, ticks) {
		if (this.capturing)
			this.offset = this.constrain(port, this.delta - x);
		else if (Math.abs(x - this.anchor) >= this.touchMovedOffset) {
			port.captureTouch(id, x, y, ticks);
			this.capturing = true;
			this.offset = this.constrain(port, this.delta - x);
		}
		port.invalidate();
	}
}

/* LAYOUTS */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	contents: [
		Port($, {
			left:0, right:0, top:0, bottom:60, style:labelStyle,
			Behavior: class extends Behavior {
				onCreate(port, data) {
					this.data = data;
				}
				onDraw(port, x, y, width, height) {
					port.fillColor( "black", x, y, width, height );
					port.drawLabel( "off" == this.data.onOff ? "Off" : "On" , x, y, width, height );
				}
				onSwitchChanged(port, onOff) {
					port.invalidate();
				}
			}
		}),
		Container($, {
			left:0, right:0, bottom:0, height:60, skin:footerSkin,
			contents: [
				Port($, {
					width:toggleSwitchForegroundTexture.width, height:toggleSwitchForegroundTexture.height, active:true,
					Behavior: class extends ToggleSwitchBehavior {
						onSwitchChanged(port, onOff) {
							this.data.onOff = onOff;
							port.container.previous.invalidate();
						}
					}
				})
			]
		})
	]
}));

/* APPLICATION */

application.add(new MainScreen({ onOff:"off" }));
