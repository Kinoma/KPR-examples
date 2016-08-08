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
let Pins = require("pins");

/* =-====================================================================-= */
/* =-=================== SKINS, STYLES, AND TEXTURES ====================-= */
/* =-====================================================================-= */
let greenSkin = new Skin({ fill:"#7DBF2E" });

let whiteTextStyle = new Style ({ font: '18px', color: 'white', horizontal: 'center' });
let textStyle = new Style ({ font: '28px', align: 'center,middle', color: '#7DBF2E' });

let catOut = new Texture("assets/whiteCat.png");
let catIn = new Texture("assets/cat.png");
let house = new Texture("assets/house.png" );
let title = new Texture("assets/petdoorTitle.png" );
let horizontalThreePartTexture = new Texture('assets/3-part.png', 1);

let whiteBorderSkin = new Skin({
    fill: "white", 
    borders: { left:5, right:5, top:5, bottom:5 }, 
    stroke: "black"
});

let horizontalThreePartSkin = new Skin({ 
	width:60, height: 40, 
	texture: horizontalThreePartTexture, 
	tiles: { left:20, right:20 }, 
});

let titleSkin = new Skin({
    width:228,height:106,
    texture: title,
});

let houseSkin = new Skin({
    width:600, height:200,
    texture: house,
    aspect: "draw"
});

let CatInSkin = new Skin({
    width:100, height:106,
    texture: catIn,
    variants: 100
});

let CatOutSkin = new Skin({
    width:100, height:106,
    texture: catOut,
    variants: 100
});

/* =-====================================================================-= */
/* =-==================== MISCELLANEOUS FUNCTIONS =======================-= */
/* =-====================================================================-= */
function secondsToString(seconds) {
	let string, value;
	value = Math.floor(seconds / 3600);
	if (value) {
		string = value.toString() + ":";
		seconds %= 3600;
	}
	else
		string = "";
	value = Math.floor(seconds / 60);
	if (value < 10)
		string += "0";
	string += value.toString() + ":";
	seconds %= 60;
	value = Math.floor(seconds);
	if (value < 10)
		string += "0";
	string += value.toString();
	return string;
}

/* =-====================================================================-= */
/* =-========================= UI TEMPLATES =============================-= */
/* =-====================================================================-= */
let TimerLabel = Label.template($ => ({ 
	left:0, right:0, height: 40, 
	string: secondsToString(0), style: whiteTextStyle,
	behavior: Behavior({
		onCreate: function(label) {
			label.interval = 1000;
		},
		onTimeChanged: function(label) {
			label.string = secondsToString(Math.round(label.time/1000));
		},
		reset: function(label) {
			label.time = 0;
			label.string = secondsToString(0);
		},
		doorIn: function(label) {
			label.stop();
			this.reset(label);
		},
		doorOut: function(label) {
			label.start();
		},
	})
}));

let ExpandingLabel = Container.template($ => ({
	width: 40, top: 0, height: 40, skin: horizontalThreePartSkin,
	contents: [
		new Label({ 
			top: 5, style: textStyle, string: $.number,
			Behavior: class extends Behavior {
				onDisplaying(label) {
					let containerWidth = label.container.width;
					let stringWidth = label.style.measure(label.string).width;
					this.bordersWidth = containerWidth - stringWidth;
				}
				setString(label, string) {
					label.string = string;
					let stringWidth = label.style.measure(string).width;
					label.container.width = stringWidth + this.bordersWidth;
				}
				doorOut(label) {
					label.delegate("setString", Number(label.string)+1);
				}
			},
		}),
	]
}));

let CatGraphic = Content.template($ => ({ 
	left:0, right:0, top:0, bottom:$.bottom, 
	skin:$.skin, variant: !$.in,
	behavior: Behavior({
		doorIn: function(content) {
			content.variant = !($.in);
		},
		doorOut: function(content) {
			content.variant = $.in;
		}
	}),
}));	

let mainColumn = Column.template($ => ({
    left:0, right:0, top:0, bottom:0,
    skin: greenSkin,
    contents:[
        Line($, {left:0, right:0, top: 10, height: 106, skin: titleSkin}),
        Line($, {left:0, right:0, top:0, bottom:0, skin: houseSkin,
            contents:[
            	CatGraphic({ bottom:-100, skin:CatInSkin, in:1, }),
            	CatGraphic({ bottom:-130, skin:CatOutSkin, in:0, }), 
            ]
        }),
        Line($, {left:0, right:0, top:0, bottom:0, 
            contents:[
        		Column($, {left:0, right:0, top:0, bottom:0,
	        		contents: [
	            		Label($, {height: 40, string: "outings", style: whiteTextStyle}),
	            		ExpandingLabel({number:0})
					],
				}),
				Column($, {left: 0, right: 0, top:0, bottom:0,
		    		contents: [
		        		Label($, {left:0, right:0, height: 40, string: "time out", style: whiteTextStyle}),
						TimerLabel(),
					],
				}),
            ]
        }),
    ]
}));

let transparentOverlay = new Label({
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({ fill: "#90000000" }),
	style: whiteTextStyle, string: "Connection lost"
});

	
/* =-====================================================================-= */
/* =-======================= APPLICATION SET-UP =========================-= */
/* =-====================================================================-= */								
application.behavior = Behavior({
	onLaunch: function(application) {
		var wsPins = this.wsPins = undefined;
		application.add(new mainColumn());
		application.add(transparentOverlay);
		Pins.discover(function(connectionDesc) {
			trace("Found: " + JSON.stringify(connectionDesc) + "\n");
			if (connectionDesc.name == "element-catdoor") {
				application.remove(transparentOverlay);
				wsPins = Pins.connect(connectionDesc);
				let catIn = true;	
			   	wsPins.repeat('/catdoor/checkCatStatus', 200, result => {
			    	if ((result) && (!catIn)) {
			    		catIn = true;
			    		application.distribute("doorIn")
			    	} else if ((!result) && (catIn)) {
			    		catIn = false;
			    		application.distribute("doorOut");
			    	}
				});	
			}
		}, function(connectionDesc) {
			trace("Lost connection to "+connectionDesc.name+"\n")
			if (connectionDesc.name == "element-catdoor") {
				application.add(transparentOverlay);
				this.wsPins = undefined;
			}
		}); 
	}
})


