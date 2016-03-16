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

let blueSkin = new Skin({ fill:'blue' });
let redSkin = new Skin({ fill:'red' });

let labelStyle = new Style({ font:'bold 36px', color:'white', horizontal:'center', vertical:'middle' });

/* BEHAVIORS */

class MainScreenBehavior extends Behavior {
	onTouchBegan(container) {
		container.skin = redSkin;
	}
	onTouchEnded(container) {
		container.skin = blueSkin;
	}
};

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, active:true, skin:blueSkin, Behavior:MainScreenBehavior,
	contents: [
		Label($, { left:0, right:0, style:labelStyle, string:$ })
	]
}));

/* APPLICATION */

application.add(new MainScreen('Hello, KinomaJS'));
