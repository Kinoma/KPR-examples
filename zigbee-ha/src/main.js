//@program
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

var XBeeDemo = require("XBeeDemo");

var backgroundSkin = new Skin({fill: "#eee"});
var buttonSkin = new Skin({fill: "#ccf"});
var hiliteSkin = new Skin({fill: "#88c"});

var headerStyle = new Style({id: "headerStyle", font: "bold 18px", color: "#444", align: "center,middle"});
var buttonStyle = new Style({id: "buttonStyle", font: "bold 20px", color: "blue", align: "center,middle"});

var ButtonBehavior = Behavior.template({
	onCreate: (label) => {
		label.coordinates = {top:4, bottom:4, left:4, right:4, height:28};
		label.skin = buttonSkin;
		label.style = buttonStyle;
		label.active = true;
	},
	onTouchBegan: (label) => {
		label.skin = hiliteSkin;
	},
});

var appWin = new Column({
	top:0, left:0, bottom:0, right:0,
	skin:backgroundSkin,
	contents: [
		new Label({
			string: "ZigBee Demo",
			style:headerStyle,
			left:0, right:0, top:0, height:24, 
		}),
		new Label({ 
			string: "Toggle All",
			behavior: ButtonBehavior({
				onTouchEnded: (label) => {
					label.skin = buttonSkin;
					XBeeDemo.toggleAll();
				}
			})
		}),
		new Label({ 
			string: "Discovery",
			behavior: ButtonBehavior({
				onTouchEnded: (label) => {
					label.skin = buttonSkin;
					XBeeDemo.discovery();
				}
			})
		}),
		new Label({ 
			string: "Establish/Join Network",
			behavior: ButtonBehavior({
				onTouchEnded: (label) => {
					label.skin = buttonSkin;
					XBeeDemo.commission();
				}
			})
		}),
		new Label({ 
			string: "Permit Join/Leave",
			behavior: ButtonBehavior({
				onTouchEnded: (label) => {
					label.skin = buttonSkin;
					XBeeDemo.commission2();
				}
			})
		}),
		new Label({ 
			string: "Diagnostics",
			behavior: ButtonBehavior({
				onTouchEnded: (label) => {
					label.skin = buttonSkin;
					XBeeDemo.diagnostics();
				}
			})
		})
    ]
});
application.add(appWin);
XBeeDemo.start();