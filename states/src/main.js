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

let blueSkin = new Skin({ fill:'blue' });
let buttonSkin = new Skin({ fill:['gray','white','#fcc'] });

let buttonStyle = new Style({ font:'bold 36px', left:8, right:8, top:8, bottom:8, align:'center,middle', color:['white','blue','red'] });

/* BEHAVIORS */

class ButtonBehavior extends Behavior {
	changeState(container, state) {
		container.state = state;
  		for (let child of container) {
  			child.state = state;
		}
	}
	onCreate(container) {
		this.changeState(container, 1);
	}
	onTouchBegan(container) {
		this.changeState(container, 2);
	}
	onTouchEnded(container) {
		this.changeState(container, 1);
	}
};

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blueSkin,
	contents: [
		Column($, {
			skin:buttonSkin, active:true, Behavior:ButtonBehavior,
			contents: [
				Label($, { style:buttonStyle, string:'Click me' })
			]
		}),
	]
}));

/* APPLICATION */

application.add( new MainScreen );
