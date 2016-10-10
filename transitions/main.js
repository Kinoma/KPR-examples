/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
import TRANSITION from 'transitions';

/* Skins and styles */let blackSkin = new Skin({ fill: 'black' });let blueSkin = new Skin({ fill: 'blue' });let yellowSkin = new Skin({ fill: 'yellow' });let whiteSkin = new Skin({ fill: 'white' });

let hugeLabelStyle = new Style({ color: 'black', font: 'bold 125px', horizontal: 'center', vertical: 'middle' });let buttonStyle = new Style({ color: 'black', font: 'bold 18px', horizontal: 'center', vertical: 'middle' });

/* UI templates */
class MainScreenBehavior extends Behavior {	onCreate(container, data) {		this.AtoB = true;		this.numTransitions = 17;		this.index = 0;	}	onTriggerTransition(container) {		let toScreen = this.AtoB ? new ScreenB() : new ScreenA();		this.AtoB = !this.AtoB;		switch ( this.index ) {			case 0:				container.run( new TRANSITION.CrossFade({ duration : 900 }), container.last, toScreen );				break;			case 1:				container.run( new TRANSITION.Push({ direction : "right", duration : 400 }), container.last, toScreen );				break;			case 2:				container.run( new TRANSITION.Push({ direction : "left", duration : 400 }), container.last, toScreen );				break;			case 3:				container.run( new TRANSITION.Push({ direction : "up", easeType : "bounceEaseOut", duration : 600 }), container.last, toScreen );				break;			case 4:				container.run( new TRANSITION.Push({ direction : "down", easeType : "backEaseIn", duration : 600 }), container.last, toScreen );				break;			case 5:				container.run( new TRANSITION.Flip({ direction : "left" }), container.last, toScreen );				break;			case 6:				container.run( new TRANSITION.Flip({ direction : "right" }), container.last, toScreen );				break;			case 7:				container.run( new TRANSITION.Flip({ direction : "up", easeType : "sineEaseOut", duration : 750 }), container.last, toScreen );				break;			case 8:				container.run( new TRANSITION.Flip({ direction : "down", easeType : "sineEaseOut", duration : 750 }), container.last, toScreen );				break;			case 9:				container.run( new TRANSITION.TimeTravel({ direction : "forward", easeType : "sineEaseIn", duration : 1000 }), container.last, toScreen );				break;			case 10:				container.run( new TRANSITION.TimeTravel({ direction : "back", easeType : "sineEaseOut", duration : 1000 }), container.last, toScreen );				break;
            case 11:
                container.run( new TRANSITION.Reveal({ direction: "left", easeType: "sineEaseOut", duration: 800 }), container.last, toScreen );                break;
            case 12:
                container.run( new TRANSITION.Reveal({ direction: "right", duration: 800 }), container.last, toScreen );                break;
            case 13:
                container.run( new TRANSITION.Hide({ direction: "up", easeType: "sineEaseOut",duration: 800 }), container.last, toScreen );                break;
            case 14:
                container.run( new TRANSITION.Hide({ direction: "right", easeType: "backEaseIn", duration: 800 }), container.last, toScreen );                break;
            case 15:
                container.run( new TRANSITION.ZoomAndSlide({ direction: "forward", duration: 500 }), container.last, toScreen );                break;
            case 16:
                container.run( new TRANSITION.ZoomAndSlide({ direction: "back", easeType: "bounceEaseOut", duration: 700 }), container.last, toScreen );                break;		}		this.index++		if ( this.index >= this.numTransitions ) this.index = 0;	}}

let MainScreen = Container.template($ =>({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, skin: blackSkin, 
	Behavior: MainScreenBehavior, 
	contents: [		Container($, { 
			left: 0, right: 0, height: 40, bottom: 0, 
			active: true, skin: whiteSkin, 
			Behavior: class extends Behavior {
				onTouchBegan(container, id, x, y, ticks) {					container.bubble( "onTriggerTransition" );				}
			}, 
			contents: [				Label($, { left: 0, right: 0, top: 0, bottom: 0, style: buttonStyle, string: 'Tap here to run next transition' }),			] 
		})	]
}));let ScreenA = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 40, skin: blueSkin, 
	contents: [		Label($, { left: 0, right: 0, style: hugeLabelStyle, string: 'A', }),	]
}));let ScreenB = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 40, skin: yellowSkin, 
	contents: [		Label($, { left: 0, right: 0, style: hugeLabelStyle, string: 'B', }),	] 
}));	
/* Application set-up */
let mainScreen = new MainScreen({});let screenA = new ScreenA();let screenB = new ScreenB();

class AppBehavior extends Behavior {
	onLaunch(application) {
		application.add( mainScreen );		mainScreen.add( screenA );
	}
}	
application.behavior = new AppBehavior();	