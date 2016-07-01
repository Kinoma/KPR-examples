/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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
import HID from "HID";


/* =-====================================================================-= *//* =-=================== SKINS, STYLES, AND TEXTURES ====================-= *//* =-====================================================================-= */let whiteSkin = new Skin({ fill: "white" });let lightGraySkin = new Skin({ fill: "#AAAAAA" });

let bigText = new Style({ font: "bold 35px", color:"#333333" });let mouse = new HID.Mouse();let mouseState = [false, false, false];class ButtonBehavior extends Behavior {	onCreate(content, data){		this.data = data;	}	onTouchBegan(content){		mouseState[this.data.number] = true;		content.skin = lightGraySkin;		mouse.mouseDown(mouseState[0], mouseState[1], mouseState[2]);	}	onTouchEnded(content){		mouseState[this.data.number] = false;		content.skin = whiteSkin;
		mouse.mouseUp();	}}
class TouchPadBehavior extends Behavior {	onCreate(content, data){		this.x = -1;		this.y = -1;	}	onTouchBegan(content, id, x, y){		this.x = x;		this.y = y;	}	onTouchMoved(content, id, x, y){		var doMove = true;		if (this.x == -1 && this.y == -1) doMove = false;		var xDelta = x - this.x;		var yDelta = y - this.y;		xDelta *= 5;		yDelta *= 5;		this.x = x;		this.y = y;		if (doMove) mouse.move(xDelta, yDelta);	}	onTouchEnded(content){		this.x = -1;		this.y = -1;	}}


/* =-====================================================================-= *//* =-============================ UI ELEMENTS ===========================-= *//* =-====================================================================-= */var ButtonTemplate = Container.template($ => ({	top:0, bottom:0, left:0, right:0, active: true, skin: whiteSkin,	contents:[		Label($, {
			left:0, right:0, top: 0, bottom: 0, 
			string:$.text, style:bigText
		})	],	Behavior: ButtonBehavior }));
 var touchPad = new Content({	left: 0, right: 0, top: 0, height: 180, active: true,	skin: lightGraySkin,	behavior: new TouchPadBehavior,});var buttons = new Line({	left:0, right: 0, bottom: 0, top: 0, bottom: 0,
	contents: [
		ButtonTemplate({text: "Left", number:0}),
		ButtonTemplate({text: "Middle", number:2}),
		ButtonTemplate({text: "Right", number:1})
	]});
var mainContainer = new Column({	left: 0, right: 0, top: 0, bottom: 0,	skin: whiteSkin,
	contents: [
		touchPad,
		buttons
	]});
 
/* =-====================================================================-= *//* =-======================== APPLICATION SET-UP ========================-= *//* =-====================================================================-= */
application.behavior = Behavior({
	onLaunch: function(application) {
		application.add( mainContainer );
	}
});