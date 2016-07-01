//@module
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

exports.pins = {
    leftx: {type: "Analog"},
    lefty: {type: "Analog"},
    leftClick: {type: "Digital", direction:"input"},
    rightx: {type: "Analog"},
    righty: {type: "Analog"},
    rightClick: {type: "Digital", direction:"input"}
};

exports.configure = function () {
	this.leftx.init();
	this.lefty.init();
	this.leftClick.init();
	this.rightx.init();
	this.righty.init();
	this.rightClick.init();
}

exports.close = function() {
	this.leftx.close();
	this.lefty.close();
	this.leftClick.close();
	this.rightx.close();
	this.righty.close();
	this.rightClick.close();
}

exports.read = function () {
	var r = {};
	
	r.leftx = this.leftx.read();
	r.lefty = this.lefty.read();
	r.leftClick = this.leftClick.read();
	r.rightx = this.rightx.read();
	r.righty = this.righty.read();
	r.rightClick = this.rightClick.read();
	
    return r;
}

