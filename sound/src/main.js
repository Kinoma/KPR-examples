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

/*
  Shutter sound from Sound-e-Scape Studios:
  http://www.soundescapestudios.com/Sound-e-Scape-Studios-policy.html
*/

/* ASSETS */

let blackSkin = new Skin({ fill:'black' });
let buttonSkin = new Skin({ fill:'blue' });

let buttonStyle = new Style({ font:'bold 24px', color:'white', horizontal:'center', vertical:'middle' });

/* BEHAVIORS */

class ButtonBehavior extends Behavior {
	onCreate(container, data) {
		this.sound = new Sound(mergeURI(application.url, 'assets/Shutter-02.wav'));
		Sound.volume = 1.0;
	}
	onTouchBegan(container) {
		this.sound.play();
		container.run(new ShutterOpenTransition);
		container.run(new ShutterCloseTransition);
	}
};

/* TRANSITIONS */

class ShutterTransition extends Transition {
	constructor() {
		super(100);
	}
}

class ShutterOpenTransition extends ShutterTransition {
	onBegin(container) {
		let mask = new Container({ left:0, right:0, top:0, bottom:0, skin:blackSkin });
		container.previous.add(mask);
		this.layer = new Layer;
		this.layer.attach(mask);
		this.layer.opacity = 0;
	}
	onEnd(container) {
		this.layer.detach();
	}
	onStep(fraction) {
		this.layer.opacity = fraction;
	}
};

class ShutterCloseTransition extends ShutterTransition {
	onBegin(container) {
		let mask = container.previous.last;
		this.layer = new Layer;
		this.layer.attach(mask);
	}
	onStep(fraction) {
		this.layer.opacity = 1 - fraction;
	}
	onEnd(container) {
		this.layer.detach();
		container.previous.remove(container.previous.last);
	}
};

/* TEMPLATES */

let MainScreen = Column.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blackSkin,
	contents: [
		Container($, { left:0, right:0, top:0, bottom:0,
			contents:[
				Picture($, { left:0, right:0, top:0, bottom:0, url:'./assets/delmar.jpg' }),
			]
		}),
		Container($, { left:0, right:0, height:40, active:true, skin:buttonSkin,
			Behavior:ButtonBehavior,
			contents:[
				Label($, {left:0, right:0, style:buttonStyle, string:'Tap here to play sound' })
			]
		})
	]
}));

/* APPLICATION */

application.add(new MainScreen);
