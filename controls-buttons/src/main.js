//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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



var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');

var background = Container( {}, { left: 0, right: 0, top: 0, bottom: 0, skin: THEME.whiteSkin } );

var myButton = BUTTONS.Button( {}, { 
	left: 10, top: 10, width: 60, height: 30,
	behavior : BUTTONS.ButtonBehavior({
		onTap : function(container) {
			trace("Button was tapped.\n");
		}
	})
});
	
var myCheckbox = BUTTONS.Checkbox( {}, { 
	left: 100, top: 10, width: 30, height: 30,
	behavior: BUTTONS.CheckboxBehavior({
		onSelected: function(button) {
			trace("Checkbox was selected.\n");
		},
		onUnselected: function(button) {
			trace("Checkbox was unselected.\n");
		}
	})
});

var myRadio = BUTTONS.Radio( {}, { 
	left: 150, top: 10, width: 30, height: 30,
	behavior: BUTTONS.RadioBehavior({
		onSelected: function(button) {
			trace("Radio was selected.\n");
		},
		onUnselected: function(button) {
			trace("Radio was unselected.\n");
		}
	})
});

var myLabeledButton = BUTTONS.LabeledButton( { name : "Button" }, { 
	width: 90, right: 10, top: 10, height: 30,
	behavior: BUTTONS.LabeledButtonBehavior({
		onTap: function(button) {
			trace("Button was tapped.\n");
		}
	})
});

var myLabeledCheckbox = BUTTONS.LabeledCheckbox( { name : "Checkbox" }, { 
	left: 10, top: 50, width: 90, height: 30,
	behavior: BUTTONS.LabeledCheckboxBehavior({
		onSelected: function(button) {
			trace("LabeledCheckbox was selected.\n");
		},
		onUnselected: function(button) {
			trace("LabeledCheckbox was unselected.\n");
		}
	})
});

var myLabeledRadio = BUTTONS.LabeledRadio( { name : "Radio" }, { 
	left: 8, top: 80,
	behavior: BUTTONS.LabeledRadioBehavior({
		onSelected: function(button) {
			trace("LabeledRadio was selected.\n");
		},
		onUnselected: function(button) {
			trace("LabeledRadio was unselected.\n");
		}
	})
});

var myRadioGroup = BUTTONS.RadioGroup( { buttonNames : "Red,Yellow ,Green,Blue,Purple,Orange", selected : "Green" }, { 
	top: 50, right: 20, width: 120,
	behavior: BUTTONS.RadioGroupBehavior({
		onRadioGroupButtonSelected: function(group, buttonName) {
			trace("Radio button named " + buttonName + " was selected \n");
		}
	})
});


application.add( background );

application.add( myButton );
application.add( myCheckbox );
application.add( myRadio );
application.add( myLabeledButton );
application.add( myLabeledCheckbox );
application.add( myLabeledRadio );
application.add( myRadioGroup );
