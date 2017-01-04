/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */

/*
*
* This is an updated version of the buttons.js module from the Controls library
* https://github.com/Kinoma/kinomajs/blob/master/kinoma/kpr/libraries/Controls/src/controls/buttons.js
*
*/
import { THEME } from 'theme';

export class ButtonBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		container.state = container.active ? 1 : 0;
	}
	onTouchBegan(container, id, x, y, ticks) {
 		this.changeState(container, 2);
	}
	onTouchCancelled(container, id, x, y, ticks) {
 		this.changeState(container, 1);
	}
	onTouchEnded(container, id, x, y, ticks) {
		this.changeState(container, 1);
		container.delegate("onTap");
 	}
	changeState(container, state) {
		container.state = state;
		if (false == ("length" in container))
			debugger
		if (container.length > 0) {
			var content = container.first;
			while (content) {
				content.state = state;
				content = content.next;
			}
		}
 	}
};
 
export var Button = Container.template($ => ({
	active: true, style: THEME.buttonStyle, skin: THEME.buttonSkin, Behavior: ButtonBehavior
}));

class ToggleButtonBehavior extends ButtonBehavior {
	onCreate(data) {
		this.selectedVariant = data.selectedVariant || 0;
		this.unselectedVariant = data.unselectedVariant || 0;
	}
	onTouchBegan(container, id, x, y, ticks) {
		ButtonBehavior.prototype.onTouchBegan.call(this, container, id, x, y, ticks);
		container.delegate("doToggle", false);	
	}
	doToggle(container, silent) {
		var button = container
		if (button.state != 0)
			button.variant = (button.variant == this.selectedVariant) ? this.unselectedVariant : this.selectedVariant
		if (! silent) {
			if (button.variant == this.selectedVariant) 
				container.delegate("onSelected");
			else
				container.delegate("onUnselected");	
		}	           
	}
	isSelected(container) {
		return container.variant == this.selectedVariant;
	}
	setSelected(container, selected, silent) {
		if (selected != container.delegate("isSelected"))
			container.delegate("doToggle", silent);
	}
};
	
class CheckboxBehavior extends ToggleButtonBehavior {
	onCreate(container) {
		super.onCreate({ selectedVariant: THEME.CHECKBOX_SELECTED, unselectedVariant: THEME.CHECKBOX_UNSELECTED })
	}
};

var Checkbox = Container.template($ => ({
	active: true, variant: THEME.CHECKBOX_UNSELECTED, skin: THEME.glyphSkin, Behavior: CheckboxBehavior
}));

export var LabeledCheckbox = Line.template($ => ({
	style: THEME.labeledButtonStyle,
	contents: [
		Checkbox( $, {
			name: "button", left: 0,
			Behavior : class extends CheckboxBehavior {
				onSelected(container) {
					container.container.delegate("onSelected");
				}
				onUnselected(container) {
					container.container.delegate("onUnselected");
				}
			}
		}),
		Label( $, {name: "buttonLabel", left: 0, string: $.name} )
	]
}));

class RadioButtonBehavior extends ToggleButtonBehavior {
	onTouchBegan(container, id, x, y, ticks) {
		this.ignoreTouchEnded = false;
		if (container.variant == this.selectedVariant)
			this.ignoreTouchEnded = true;
		else {
			ButtonBehavior.prototype.onTouchBegan.call(this, container, id, x, y, ticks);
			container.delegate("doToggle", false);	
		}		           
	}
	onTouchEnded(container, id, x, y, ticks) {
		if (! this.ignoreTouchEnded)
			ButtonBehavior.prototype.onTouchEnded.call(this, container, id, x, y, ticks);
	}
};

class RadioBehavior extends RadioButtonBehavior {
	onCreate(container) {
		super.onCreate({ selectedVariant: THEME.RADIO_SELECTED, unselectedVariant: THEME.RADIO_UNSELECTED });
	}
};
	
var Radio = Container.template($ => ({
	active: true, variant: THEME.RADIO_UNSELECTED, skin: THEME.glyphSkin, Behavior: RadioBehavior
}));

var LabeledRadio = Line.template($ => ({
	style: THEME.labeledButtonStyle,
	contents: [
		Radio( $, {
			name: "button", left: 0,
			Behavior : class extends RadioBehavior{
				onSelected(container) {
					var labeledRadio = container.container;
					var radioGroup = labeledRadio.container;
					labeledRadio.delegate("onSelected");
					radioGroup.delegate("onGroupButtonSelected", labeledRadio);     
				}
				onUnselected(container) {
					container.container.delegate("onUnselected");       
				}
			}
		}),
		Label( $, {name: "buttonLabel", left: 0, string: $.name} )
	]
}));

export class RadioGroupBehavior extends Behavior{
	onCreate(column, data) {
		this.data = data;
	}
	onDisplaying(column) {
		var data = this.data;
		var buttonStr = "buttonNames" in data ? data.buttonNames : "please add,buttonNames,and,selected,properties,to data";
		var buttonNames = buttonStr.split(",");
		var selectedName = "selected" in data ? data.selected : buttonNames[0];
		for (var i=0; i < buttonNames.length; i++) {
			var buttonName = buttonNames[i];
			var button = new LabeledRadio( { name : buttonName } );
			button.coordinates = { left : 0, top : undefined, right : undefined, bottom : undefined };
			column.add( button );
			if (buttonName == selectedName)
				button.button.delegate("doToggle", true);
		}
	}
	onGroupButtonSelected(column, labeledButton) {
		var aLabeledButton = column.first;
		while (aLabeledButton) {
			if (aLabeledButton === labeledButton)
				aLabeledButton.button.delegate("setSelected", true, true);
			else
				aLabeledButton.button.delegate("setSelected", false, true);
			aLabeledButton = aLabeledButton.next;
		}
		
		var buttonName = labeledButton.buttonLabel.string
		this.onRadioButtonSelected(buttonName);
		column.delegate("onRadioGroupButtonSelected", buttonName);
	}
};

export var RadioGroup = Column.template($ => ({
	active: true,
	Behavior: RadioGroupBehavior
}));
