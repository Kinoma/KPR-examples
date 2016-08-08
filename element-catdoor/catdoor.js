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
const CAT_IN = 1;
const CAT_OUT = 0;

let currState = CAT_OUT;

exports.pins = {
	switchOut: { type: "Digital" },
	switchIn: { type: "Digital" },
	light: { type: "Digital" },
}

exports.configure = function() {
	this.switchOut.init();
	this.switchIn.init();
	this.light.init();
}

exports.updateStatus = function() {
	if ( this.switchOut.read() ) {
		currState = CAT_OUT;
		this.light.write( 1 );
	} else if ( this.switchIn.read() ) {
		currState = CAT_IN;
		this.light.write( 0 );
	}
}

exports.checkCatStatus = function() {
	return currState;
}

exports.close = function() {
	this.switchOut.close();
	this.switchIn.close();
	this.light.close();
}
