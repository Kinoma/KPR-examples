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

var soundBite = false;
var sampleRate = 8000;
exports.pins = {
    microphone: { type: "Audio", sampleRate: sampleRate, channels: 1, direction: "input" },
    speaker: { type: "Audio", sampleRate: sampleRate, channels: 1, direction: "output" }
};

exports.configure = function () {
	this.microphone.init();
	this.speaker.init();
	this.speaker.setVolume( 1 );	
}

exports.startRecording = function(){
	this.microphone.start();
	this.speaker.stop();
}

exports.stopRecording = function(){
	this.microphone.stop();	
	soundBite = new Object();
	soundBite.content = this.microphone.read();
	soundBite.duration = ( soundBite.content.length / 2 ) / sampleRate;
	return( soundBite.duration );
}

exports.playRecording = function(){
	if ( soundBite.content ){
		this.speaker.write( soundBite.content );	
		this.speaker.start();
	}
}

exports.stopPlay = function(){
	this.speaker.stop();
}

exports.close = function(){
	this.speaker.close();
	this.microphone.close();
}
