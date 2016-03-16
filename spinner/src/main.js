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

let textStyle = new Style({ color:'white', font:'bold 18px', horizontal:'center', vertical:'middle', left:5, right:5, bottom:5 });

/* BEHAVIORS */

class BusyPictureBehavior extends Behavior {
	onCreate(picture, data) {
		this.bump = data.speed * 20;
		if (0 == this.bump)
			this.bump = 1;
	}
	onLoaded(picture) {
		picture.origin = { x:picture.width>>1, y:picture.height>>1 };
		picture.scale = { x:0.5, y:0.5 };
		picture.rotation = 0;
		picture.start();
	}
	onTimeChanged(picture) {
		let rotation = picture.rotation;
		rotation -= this.bump;
		if (rotation < 0) rotation = 360;
		picture.rotation = rotation;
	}
};

/* TEMPLATES */

let BusyPicture = Picture.template($ => ({
	url:'./assets/waiting.png', Behavior:BusyPictureBehavior
}));

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blackSkin,
	contents:[
		BusyPicture($),
		Text($, { left:0, right:0, bottom:0, style:textStyle, string:$.instructions })
	]
}));

/* APPLICATION */

let data = {
	speed:0.1,
	instructions:'Adjust the speed by changing the speed property value. The speed property value range is 0 to 1.'
};
application.add(new MainScreen(data));
