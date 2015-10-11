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
THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');

var blueSkin = new Skin ({fill: 'blue'});
var greySkin = new Skin({fill: '#999'});
var whiteSkin = new Skin({fill:'white'});

var whiteStyle = new Style ({ font:'20px', color:'white' });


var MyCheckBoxTemplate = BUTTONS.LabeledCheckbox.template(function($){ return{
	top:50, bottom:50, left:50, right:50,
	behavior: BUTTONS.LabeledCheckboxBehavior({
		onSelected: function(checkBox){
			MyStatusBar.statusLabel.string = checkBox.buttonLabel.string + ' checked';
		},
		onUnselected: function(checkBox){
			MyStatusBar.statusLabel.string = checkBox.buttonLabel.string + ' unchecked';
		}
	}),
}});

var MyStatusBar = new Container({
	top: 5, left: 10, right: 10, height: 35, skin: greySkin, 
	contents: [
		new Label({style: whiteStyle, name: 'statusLabel'})
	]
})

var MySimpleButtons = new Line({
	left: 20, right: 20, bottom: 5, height: 50, style: whiteStyle,
	contents: [
		new Container({left: 10, right: 10, skin: blueSkin, active: true,
			behavior : Behavior({
				onTouchEnded: function(container, id, x, y, ticks) {
					checkbox.forEach(checkTheBox);
					MyStatusBar.statusLabel.string = 'All Checked';
				}
			}),		
			contents: [
				new Label({string: 'Check All'})	        
	        ],
		}),
		new Container({left: 10, right: 10, skin: blueSkin, active: true,
			behavior : Behavior({
				onTouchEnded: function(container, id, x, y, ticks) {
					checkbox.forEach(unCheckTheBox);
					MyStatusBar.statusLabel.string = 'All Unchecked';
				}
			}),		
			contents: [
				new Label({string: 'Uncheck All'})	        
			]
		})
	]
});

var MainContainer = new Column({left:0, right:0, top:0, bottom:0, skin: whiteSkin});

function checkTheBox(element, index, array) {
    element.distribute("setSelected", true, false);
}
function unCheckTheBox(element, index, array) {
    element.distribute("setSelected", false, false);
}

var checkbox = [
	new MyCheckBoxTemplate({name:"Hello"}),
	new MyCheckBoxTemplate({name:"World"}),
	new MyCheckBoxTemplate({name:"Click Me"})
];


/* Application definition */
application.behavior = {
	onLaunch: function() { 
		MainContainer.add(MyStatusBar);
		
		for (var i = 0, c = checkbox.length; i < c; i++) 
			MainContainer.add(checkbox[i]);
		
		MainContainer.add(MySimpleButtons);
		application.add(MainContainer);
	}
}