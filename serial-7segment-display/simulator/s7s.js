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

var displayFont = "75px Fira Mono";

// styles
var displayStyle = new Style({ font:displayFont, color: "#FFFF0000", horizontal:"center" });

// layouts
var S7SBehavior = function(column, data) {
	Behavior.call(this, column, data);
}
S7SBehavior.prototype = Object.create(Behavior.prototype, {
	onCreate: { value: function(column, data) {
        column.partContentsContainer.add(new S7SLine(data)); 
	}},
});

var S7SLine = Container.template(function($) { return {
	width: 260, height:100,
	behavior: Object.create(Behavior.prototype, {
		onCreate: { value: function(column, data) {
		}}
	}),
	contents: [
		Container($, {
			top: 18, bottom: 20,
			style: displayStyle,
			anchor: "DISPLAY",
			skin: new Skin( { fill: "black" } ),
			contents: [
				Label($, { anchor: "D0", left:10, width:62, string:"0" }),
				Label($, { anchor: "DECIMAL_1", left:54, width:25, string:".", visible:false }),
				Label($, { anchor: "D1", left:65, width:62, string:"0" }),
				Label($, { anchor: "DECIMAL_2", left:114, width:25, string:".", visible:false }),
				Label($, { anchor: "COLON", left:114, width:25, string: ":", visible:false }),
				Label($, { anchor: "D2", left:130, width:62, string:"0"  }),
				Label($, { anchor: "DECIMAL_3", left:182, width:25, string:".", visible:false }),
				Label($, { anchor: "D3", left:190, width:62, string:"0" }),
				Label($, { anchor: "DECIMAL_4", left:242, width:25, string:".", visible:false }),
			]
		})]
}});

// BLL
exports.pins = {
	display: {type: "Serial", baud: 9600}
};

exports.configure = function(configuration) {
	this.data = {
		id: 'COM-11441',
		behavior: S7SBehavior,
		header : { 
			label : this.id, 
			name : "7-Segment Display", 
			iconVariant : PinsSimulators.SENSOR_GUAGE 
		},
		cursor: 0,
	};
	this.container = shell.delegate("addSimulatorPart", this.data);
}
exports.close = function() {
}

exports.brightness = function(level) {
	var opacity = (Math.floor(255 * level) & 0xFF).toString(16);
	if (opacity.length < 2)
		opacity = '0' + opacity;
	var style = new Style({ font:displayFont, color: "#" + opacity + "FF0000", horizontal:"center" });
	this.data.DISPLAY.style = style;
}

exports.clear = function() {
	this.data.D0.string = "";
	this.data.D1.string = "";
	this.data.D2.string = "";
	this.data.D3.string = "";
	this.data.COLON.visible = false;
	this.data.DECIMAL_1.visible = false;
	this.data.DECIMAL_2.visible = false;
	this.data.DECIMAL_3.visible = false;
	this.data.DECIMAL_4.visible = false;
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.container);
}

exports.cursor = function(digit) {
	this.data.cursor = 0;
}

exports.writeDecimalControl = function(command) {
	this.data.COLON.visible = (command & this.COLON_BIT_MASK);
	this.data.DECIMAL_1.visible = (command & this.DECIMAL_1_BIT_MASK);
	this.data.DECIMAL_2.visible = (command & this.DECIMAL_2_BIT_MASK);
	this.data.DECIMAL_3.visible = (command & this.DECIMAL_3_BIT_MASK);
	this.data.DECIMAL_4.visible = (command & this.DECIMAL_4_BIT_MASK);
}

exports.writeString = function(string) {
	this.cursor(0);
	var length = string.length;
	if (length) {
		this.data.D0.string = string.charAt(0); --length;
	}
	if (length) {
		this.data.D1.string = string.charAt(1); --length;
	}
	if (length) {
		this.data.D2.string = string.charAt(2); --length;
	}
	if (length) {
		this.data.D3.string = string.charAt(3); --length;
	}
}

exports.DECIMAL_1_BIT_MASK = 0x01;
exports.DECIMAL_2_BIT_MASK = 0x02;
exports.DECIMAL_3_BIT_MASK = 0x04;
exports.DECIMAL_4_BIT_MASK = 0x08;
exports.COLON_BIT_MASK = 0x10;
exports.APOSTROPHE_BIT_MASK = 0x20;

exports.CURSOR_DIGIT_0 = 0;
exports.CURSOR_DIGIT_1 = 1;
exports.CURSOR_DIGIT_2 = 2;
exports.CURSOR_DIGIT_3 = 3;
