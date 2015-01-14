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

var THEME = require ("themes/flat/theme");
var CONTROL = require ("mobile/control");
var PinsSimulators = require ("PinsSimulators");
var buttonStyle = new Style({ font:"bold 20px", color:["white","white","black"], horizontal:"center" });
var OrientationBehavior = function(column, data) {
	Behavior.call(this, column, data);
}
OrientationBehavior.prototype = Object.create(Behavior.prototype, {
	onCreate: { value: function(column, data) {
        column.partContentsContainer.add(new OrientationLine(data)); 
	}},
});
var OrientationButton = Container.template(function($) { return {
	width:80, height:30, active:true, skin:THEME.buttonSkin,
	behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
		onCreate: { value: function(container, $) {
			CONTROL.ButtonBehavior.prototype.onCreate.call(this, container, $.data);
			this.value = this.data.keys[$.value];
		}},
		onTouchBegan: { value: function(container, id, x, y, ticks) {
			CONTROL.ButtonBehavior.prototype.onTouchBegan.call(this, container, id, x, y, ticks);
            this.data.down = [this.value];
		}},
		onTouchCancelled: { value: function(container, id, x, y, ticks) {
			CONTROL.ButtonBehavior.prototype.onTouchCancelled.call(this, container, id, x, y, ticks);
            this.data.up = [this.value];
		}},
		onTouchEnded: { value: function(container, id, x, y, ticks) {
			CONTROL.ButtonBehavior.prototype.onTouchEnded.call(this, container, id, x, y, ticks);
            this.data.up = [this.value];
		}}
	}),
	contents: [
		Label($, { top:0, bottom:0, style:buttonStyle, string:$.string }),
	]
}});

var OrientationLine = Container.template(function($) { return {
	left:0, right:0, height:150,
	contents: [
		Container(null, {
			left:0, right:0, top:30, height:110,
			contents: [
				OrientationButton({ data:$, string:"1", value: 0 }, { top: 0, left: 0 }),
				OrientationButton({ data:$, string:"2", value: 1 }, { top: 0 }),
				OrientationButton({ data:$, string:"3", value: 2 }, { top: 0, right: 0 }),
				OrientationButton({ data:$, string:"4", value: 3 }, { left: 0 }),
				OrientationButton({ data:$, string:"5", value: 4 }, { }),
				OrientationButton({ data:$, string:"6", value: 5 }, { right: 0 }),
				OrientationButton({ data:$, string:"7", value: 6 }, { bottom: 0, left: 0 }),
				OrientationButton({ data:$, string:"8", value: 7 }, { bottom: 0 }),
				OrientationButton({ data:$, string:"9", value: 8 }, { bottom: 0, right: 0 }),
			]
		})
	],
}});

exports.pins = {
    data: {type: "I2C", address: 0x5A, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9']}
}
exports.configure = function(configuration) {
	this.data = {
		id: 'HOVER',
		behavior: OrientationBehavior,
		header : { 
			label : this.id, 
			name : "TOUCH",
			iconVariant : PinsSimulators.SENSOR_KNOB 
		},
        keys: configuration.pins.data.keys,
		up: [],
		down: []
	};

	this.container = shell.delegate("addSimulatorPart", this.data);
}
exports.close = function() {
	shell.delegate("removeSimulatorPart", this.container);
}
exports.read = function() {
    var result = {up: this.data.up, down: this.data.down};
    this.data.up = [];
    this.data.down = [];
    return result;
}
