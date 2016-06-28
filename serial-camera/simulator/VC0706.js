//@module/*
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
*/var PinsSimulators = require('PinsSimulators');

var gWidth = 320, gHeight = 240;var gReady = false;var gCompression = 0;var gChunks = [];var gChunkIndex = 0;

exports.pins = {	serial: {type: "Serial", baud: 38400  }};
var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {		header : { 			label : "Camera", 			name : "Serial Camera", 			iconVariant : PinsSimulators.SENSOR_MODULE 		},		axes : [			new PinsSimulators.FloatAxisDescription(				{					ioType : "output",					valueLabel : "Compression",					valueID : "compression"				}			),			new PinsSimulators.FloatAxisDescription(				{					ioType : "output",					valueLabel : "Width",					valueID : "width"				}			),			new PinsSimulators.FloatAxisDescription(				{					ioType : "output",					valueLabel : "Height",					valueID : "height"				}			),		]	});	this.pinsSimulator.add(new ImageMaker());}var setCompression = exports.setCompression = function(value) {	this.pinsSimulator.delegate("setValue", "compression", value);	gCompression = value;}var setImageSize = exports.setImageSize = function(size) {	this.pinsSimulator.delegate("setValue", "width", size.w);	this.pinsSimulator.delegate("setValue", "height", size.h);	gWidth = size.w;	gHeight = size.h;}var capture = exports.capture = function() {	if (!gReady) return;	var chunk = gChunks[gChunkIndex];	if (++gChunkIndex == 3)		gChunkIndex = 0;	return chunk;}
var close = exports.close = function() {	shell.delegate("removeSimulatorPart", this.pinsSimulator);}

var photo1Texture = new Texture('./1.jpg', 1);var photo1Skin = new Skin({ texture: photo1Texture, width: 320, height: 240, aspect: "fit"});var photo2Texture = new Texture('./2.jpg', 1);var photo2Skin = new Skin({ texture: photo2Texture, width: 320, height: 240, aspect: "fit"});var photo3Texture = new Texture('./3.jpg', 1);var photo3Skin = new Skin({ texture: photo3Texture, width: 320, height: 240, aspect: "fit"});
Handler.bind("/capture-jpeg", Object.create(Behavior.prototype, {	onInvoke: { value: 		function(handler, message) {			var container;			if (0 == gChunks.length)				container = new Container({width: 320, height: 240, skin: photo1Skin});			else if (1 == gChunks.length)				container = new Container({width: 320, height: 240, skin: photo2Skin});			else if (2 == gChunks.length)				container = new Container({width: 320, height: 240, skin: photo3Skin});							shell.add(container);			var layer = new Layer(null, true, true);			layer.attach(container);			layer.setResponseJPEG(message);						layer.detach();			shell.remove(container);		},	},}));var ImageMaker = Content.template($ => ({
	behavior: Behavior({
		onCreate: function(content, data) {			this.index = 0;		},		onDisplayed: function(content, data) {			content.invoke( new Message("/capture-jpeg"), Message.CHUNK);		},		onComplete: function(content, message, chunk) {			Files.writeChunk(mergeURI(Files.documentsDirectory, this.index + ".jpg"), chunk);			gChunks.push(chunk);			++this.index;			if (3 == this.index)				gReady = true;			else				content.invoke(new Message("/capture-jpeg"), Message.CHUNK);		},
	})
}));