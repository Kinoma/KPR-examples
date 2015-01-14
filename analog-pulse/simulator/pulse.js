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
var SLIDERS = require ("controls/sliders");
var PinsSimulators = require ("PinsSimulators");

var PulseBehavior = function(column, data) {
	Behavior.call(this, column, data);
}
PulseBehavior.prototype = Object.create(Behavior.prototype, {
	onCreate: { value: function(column, data) {
        column.partContentsContainer.add(new PulseLine(data)); 
	}},
});
var PulseLine = Container.template(function($) { return {
	left:0, right:0, height:40,
	contents: [
		Canvas($, {
			width:200, top:0, height:40, active:true,
			behavior: Object.create(SLIDERS.SliderBehavior.prototype, {
				onTouchBegan: { value: function(canvas, id, x, y, ticks) {
					canvas.captureTouch(id, x, y, ticks);
					this.onTouchMoved(canvas, id, x, y, ticks);
				}},
				onTouchEnded: { value: function(canvas, id, x, y, ticks) {
				}},
				onTouchMoved: { value: function(canvas, id, x, y, ticks) {
					var size = canvas.width;
					var offset = (x - canvas.x);
					this.setOffset(canvas, size, offset);
					this.data.changed = true;
					this.onValueChanged(canvas);
				}},
				onValueChanged: { value: function(canvas) {
					var active = canvas.active;
			
					var knobWidth = 6;
					var halfKnobWidth = knobWidth / 2;
					var knobHeight = 20;
					var inset = 8;
					var width = canvas.width - (2 * inset);
					var offset = this.getOffset(canvas, width);
			
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = active ? "#458ccb" : "#515153";
					ctx.strokeStyle = active ? "#458ccb" : "#515153";
					var sliderBarHeight = 4;
					var sliderBarTop = (canvas.height / 2) - (sliderBarHeight / 2);
					ctx.strokeRect(0, sliderBarTop, canvas.width, sliderBarHeight);
					ctx.fillRect(inset + offset + halfKnobWidth, sliderBarTop, canvas.width - offset + halfKnobWidth, sliderBarHeight);

					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(inset + offset - knobWidth / 2, 10, knobWidth, knobHeight - 1);
					ctx.strokeRect(inset + offset - knobWidth / 2, 10, knobWidth, knobHeight - 1);
				}},
			}),
		}),
	],
}});

exports.pins = {
    sensor: {type: "A2D"}
}

exports.configure = function(configuration) {
	this.data = {
		id: 'PULSE',
		behavior: PulseBehavior,
		header : { 
			label : this.id, 
			name : "PULSE", 
			iconVariant : PinsSimulators.SENSOR_KNOB 
		},
		min: 0,
		max: 200,
		value: 90,
		changed: true,
	};
	this.container = shell.delegate("addSimulatorPart", this.data);
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.container);
}

exports.beat = function() {
	var data = this.data;
	if (data.changed) {
		data.changed = false;
		return { BPM: data.value };
	}
}
