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
			this.value = $.value;
		}},
		onTap: { value: function(container) {
			this.data.value = this.value;
		}},
	}),
	contents: [
		Label($, { top:0, bottom:0, style:buttonStyle, string:$.string }),
	]
}});

var OrientationLine = Container.template(function($) { return {
	left:0, right:0, height:260,
	contents: [
		Label($, { left:0, right:0, top:0, height:30, style:THEME.labeledButtonStyle, string:"Touch" }),
		Container(null, {
			left:0, right:0, top:30, height:110,
			contents: [
				OrientationButton({ data:$, string:"Top", value: "touch top" }, { top:0 }),
				OrientationButton({ data:$, string:"Left", value: "touch left" }, { left:0 }),
				OrientationButton({ data:$, string:"Center", value: "touch center" }, { }),
				OrientationButton({ data:$, string:"Bottom", value: "touch bottom" }, { bottom:0 }),
				OrientationButton({ data:$, string:"Right", value: "touch right" }, { right:0 }),
			],
		}),
		Label($, { left:0, right:0, top:150, height:30, style:THEME.labeledButtonStyle, string:"Swipe" }),
		Container(null, {
			left:0, right:0, top:180, height:70,
			contents: [
				OrientationButton({ data:$, string:"Up", value: "swipe up" }, { top:0 }),
				OrientationButton({ data:$, string:"Left", value: "swipe to left" }, { left:0 }),
				OrientationButton({ data:$, string:"Down", value: "swipe down" }, { bottom:0 }),
				OrientationButton({ data:$, string:"Right", value: "swipe to right" }, { right:0 }),
			],
		}),
	],
}});

exports.pins = {
    ts: {type: "Digital", direction: "input"},
    reset: {type: "Digital", direction: "output"},
    data: {type: "I2C", address: 0x42},
}
exports.configure = function(configuration) {
	this.data = {
		id: 'HOVER',
		behavior: OrientationBehavior,
		header : { 
			label : this.id, 
			name : "HOVER", 
			iconVariant : PinsSimulators.SENSOR_KNOB 
		},
		value: undefined
	};
	this.container = shell.delegate("addSimulatorPart", this.data);
}
exports.close = function() {
	shell.delegate("removeSimulatorPart", this.container);
}
exports.read = function() {
	var value = this.data.value;
	this.data.value = undefined;
	return value;
}
