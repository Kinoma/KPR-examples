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

let blackSkin = new Skin({ fill:'black' });
let spriteSkin = new Skin({ 
	texture: new Texture('./assets/balls.png'), 
	x:0, y:0, width:30, height:30, 
	variants:30 
});

/* BEHAVIORS */

class SpriteCellBehavior extends Behavior {
	onCreate(container, data) {
		this.frames = data.frames;
		container.interval = data.interval;
	}
	onDisplayed(container) {
		container.start();
	}
	onTimeChanged(container) {
		container.variant = (container.variant + 1) % this.frames;
	}
};

/* TEMPLATES */

let SpriteCell = Content.template($ => ({
	width:$.skin.width, height:$.skin.height, skin:$.skin, Behavior:SpriteCellBehavior
}));

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blackSkin,
	contents: [
		SpriteCell($)
	]
}));

/* APPLICATION */

let data = {
	skin:spriteSkin,	// Sprite image strip
	frames:4,			// Number of frames in sprite strip
	interval:100		// Display each frame for 100 ms
}
application.add(new MainScreen(data));
