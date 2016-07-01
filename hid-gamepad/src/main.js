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

let Pins = require("pins");
let gamepad = new HID.Gamepad();

/* =-====================================================================-= *//* =-=================== SKINS, STYLES, AND TEXTURES ====================-= *//* =-====================================================================-= */
let whiteSkin = new Skin( {fill: "white"});
let greySkin = new Skin( {fill: "#CCCCCC"});

let bigText = new Style({font:"bold 20px", color:"#333333"});


/* =-====================================================================-= *//* =-========================= UI TEMPLATES =============================-= *//* =-====================================================================-= */
let layer = new Layer({
	left: 0, right: 0, top: 0, bottom: 0
});
		
let mainContainer = new Column({
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin
});

let RowTemplate = Line.template($ => ({
	left:0, right: 0, top: 0, bottom: 0,
})); 


let MyButtonTemplate = Container.template($ => ({
	top:0, bottom:0, left:0, right:0, active: true, skin: whiteSkin,
	contents:[
    	Label($, {
    		left:0, right:0, height:20, 
    		string:$.button, style:bigText
    	})
	],
	Behavior: class extends Behavior {
		onCreate(content, data){
			this.data = data;
		}
		onTouchBegan(content){
			content.skin = greySkin;
			buttons[this.data.button] = true;
			gamepad.pressButtons(buttons);
		}
		onTouchEnded(content){
			content.skin = whiteSkin;
			buttons[this.data.button] = false;
			gamepad.pressButtons(buttons);
		}
	}
}));


/* =-====================================================================-= *//* =-======================= APPLICATION SET-UP =========================-= *//* =-====================================================================-= */
let leftx = 0;
let lefty = 0;
let rightx = 0;
let righty = 0;

let deadMin = -1000;
let deadMax = 1000;
let deadValue = 0;

let buttons = [];
for (var i = 0; i < 16; i++){
	buttons.push(false);
};

application.behavior = Behavior({
	onLaunch: function(application) {
		Pins.configure({
			joysticks: {
				require: "joysticks",
				pins: {
					leftpower: {pin: 52, type: "Power", voltage: 3.3},
					lefty: {pin: 53, type: "Analog"},
					leftx: {pin: 54, type: "Analog"},
					leftClick: {pin: 55, type: "Digital", direction: "input"},
					leftground: {pin: 56, type: "Ground"},
					rightpower: {pin: 60, type: "Power", voltage: 3.3},
					righty: {pin: 61, type: "Analog"},
					rightx: {pin: 62, type: "Analog"},
					rightClick: {pin: 63, type: "Digital", direction: "input"},
					rightground: {pin: 64, type: "Ground"},
				}
			}		
		}, success => {
			Pins.repeat("/joysticks/read", 33, function(result){
				result.rightx = (result.rightx * 65534) - 32767;
				result.righty = (result.righty * 65534) - 32767;
				result.leftx = (result.leftx * 65534) - 32767;
				result.lefty = (result.lefty * 65534) - 32767;
				if (result.rightx > deadMin && result.rightx < deadMax) result.rightx = deadValue;
				if (result.leftx > deadMin && result.leftx < deadMax) result.leftx = deadValue;
				if (result.righty > deadMin && result.righty < deadMax) result.righty = deadValue;
				if (result.lefty > deadMin && result.lefty < deadMax) result.lefty = deadValue;
				gamepad.sendPosition({x: result.rightx, y: result.righty}, {x: result.leftx, y: result.lefty});
				buttons[1] = !(result.leftClick);
				buttons[0] = !(result.rightClick);
				gamepad.pressButtons(buttons);
			});
		});
		layer.origin = {x: 160, y: 120};		layer.rotation = 180;		layer.add(mainContainer);				for (var i = 0; i < 4; i++){			let row = new RowTemplate();			mainContainer.add(row);			for (var j = 0; j < 4; j++){				row.add(new MyButtonTemplate({button: (j + (i * 4))}));			};		}
		
		application.add(layer);
	}
});