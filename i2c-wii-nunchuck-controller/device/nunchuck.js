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
	// Define the types of pins used by this BLL
	power: { type: "Power", voltage: 3.3 },
	ground: { type: "Ground"},
	nunchuck: { type: "I2C", address: 0x52 }
}

exports.configure = function() {
	this.nunchuck.init();
	//initialize 
	this.nunchuck.writeByteDataSMB(0xF0,0x55);
	this.nunchuck.writeByteDataSMB(0xFB,0x00);
}

exports.read = function(){
	//read message
	this.nunchuck.writeByteDataSMB(0x00,0x00);
	//read 6-byte Block
	this.buffer = this.nunchuck.readBlock(6,"Array");
	// x,y: joystick position, c,z: buttons, ax,ay,az: accelerometer values
	return { x: this.buffer[0], y: this.buffer[1], c: (this.buffer[5] & 1), z: (this.buffer[5]& 2),
	ax: (this.buffer[2]<<2)+((this.buffer[5]>>(2))&3), ay: (this.buffer[3]<<2)+((this.buffer[5]>>(4))&3),
	az: (this.buffer[4]<<2)+((this.buffer[5]>>(6))&3) };

}

exports.close = function() {
	this.nunchuck.close();
}
