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

//based on data sheet for interfacing with VC0706 Camera: http://www.adafruit.com/datasheets/VC0706protocol.pdf

var RESET = 0x26;
var GEN_VERSION = 0x11;
var READ_FBUF = 0x32;
var GET_FBUF_LEN = 0x34;
var FBUF_CTRL = 0x36;
var DOWNSIZE_CTRL = 0x54;
var DOWNSIZE_STATUS = 0x55;
var READ_DATA = 0x30;
var WRITE_DATA = 0x31;
var COMM_MOTION_CTRL = 0x37;
var COMM_MOTION_STATUS = 0x38;
var COMM_MOTION_DETECTED = 0x39;
var MOTION_CTRL = 0x42;
var MOTION_STATUS = 0x43;
var TVOUT_CTRL = 0x44;
var OSD_ADD_CHAR = 0x45;

var STOPCURRENTFRAME = 0x0;
var STOPNEXTFRAME = 0x01;
var RESUMEFRAME = 0x02;
var STEPFRAME = 0x03;

var SIZE_640x480 = 0x00;
var SIZE_320x240 = 0x11;
var SIZE_160x120 = 0x22;

var MOTIONCONTROL = 0x0;
var UARTMOTION = 0x1;
var ACTIVATEMOTION = 0x2;

var SET_ZOOM = 0x52;

exports.pins = {
	serial: {type: "Serial", baud: 38400  }
};

exports.configure = function(){
	// initialize the serial port
	this.serial.init();
	this.byteRemaining = 0;

	// reset the camera
	try {
		this.sendCommand( this.serial, RESET, [ 0x0 ], 5 );
	}
	catch ( error ){
		trace("configure exception\n");
		return false; 
	}
	// wait after reset for device to reboot
    sensorUtils.mdelay( 500 );	
    // clear the buffer
    var s = this.serial.read(undefined);
    trace(s.byteLength + "\n");	

	return true; 
}

exports.reset = function(){
	try {
		this.sendCommand( this.serial, RESET, [ 0x0 ], 5 );
	}
	catch ( error ){
		trace("configure exception\n");
		return false; 
	}
	// wait after reset for device to reboot
    sensorUtils.mdelay( 500 );	
    // clear the buffer
    var s = this.serial.read(undefined);
    trace(s.byteLength + "\n");	

	return true; 
}

//set the image compression from 0 to 100
exports.setCompression = function( value ) {
	if ( value >= 0 && value <= 100 ){
		try {
			this.sendCommand( this.serial, WRITE_DATA, [ 0x5, 0x1, 0x1, 0x12, 0x04, value ], 5);
		}
		catch ( error ){
			return false; 
		}
		trace( "compression set to: " + value + "\n" );
	}
	else {
		trace ( "Error setting compression to: " + value + "\n Compression must be between 0 and 100. \n" ) ;
	}
	return true; 
}

exports.setImageSize = function( parameters ) {
	var size;
	if( parameters.w == 160 && parameters.h == 120 ){
		size = SIZE_160x120;
	}
	else if( parameters.w == 320 && parameters.h == 240 ){
		size = SIZE_320x240;
	}
	else if( parameters.w == 640 && parameters.h == 480 ){
		size = SIZE_640x480;
	}
	else {
		trace ( "Error setting size to: " + parameters.w + " x " + parameters.h + 
			"; only valid inputs are 160 x 120, 320 x 240, 640 x 480 \n" ) ;
		return;
	}
	try{
		this.sendCommand( this.serial, WRITE_DATA, [0x05, 0x04, 0x01, 0x00, 0x19, size] , 5 ); 
	}
	catch( error ){
		return false; 
	}
	trace( "image size set to: " + parameters.w + " x " + parameters.h + "\n" );
	return true;
}

/*
	This function reads the partial data of the picture frame.
	App should control how many bytes are already read.
	size 	- bytes that needs to be read. If there are no enough bytes left, return the remainning bytes. 
	return 	- ArrayBuffer with bytes of picture data.
*/
exports.read = function(size){
	//send GET_FBUF_LEN to get image lengths in FBUF
	var chunk = undefined;
	size = size < this.byteRemaining ? size: this.byteRemaining;
	if( this.byteRemaining > 0 ) {
	    var readlen = 128;
	    var bytesLeft = size;
        var buffer = null;
        
        chunk = new ArrayBuffer(0);//Chunk();
	    while( bytesLeft > 0 ){
	        var bytesToRead = Math.min( readlen, bytesLeft );
	        var frameptr = this.frameSize - this.byteRemaining;
	        
	        //send READ_FBUF to read image data
	        
			try{
				 buffer = this.sendCommand( this.serial, READ_FBUF, [0x0C, 0, 0x0A,
	                                0, 0, frameptr >> 8, frameptr & 0xFF,
	                                0, 0, 0, bytesToRead,
	                                0, 0], 5 + bytesToRead + 5 );
			}
			catch( error ){
				return false; 
			}

	        if (buffer)
	        	chunk = chunk.concat( buffer.slice( 5, bytesToRead + 5 ) );
	        bytesLeft -= bytesToRead;
	        this.byteRemaining -= bytesToRead;
	    }
	}
    //after receiving image, send FBUF_CTRL command to resume frame
	try{
		if(this.byteRemaining == 0)
		 	this.sendCommand( this.serial, FBUF_CTRL, [ 0x1,0x03 ], 5 ); 
	}
	catch( error ){
		return undefined;
	}	
	return chunk;
}

/* 
	This function returns the length of the frame.
	Use the read() function to retrieve the actual picture frame data.
*/
exports.capture = function() {
	trace("capture\n");
    //send FBUF_CTRL to stop current frame updating
	try{
		this.sendCommand( this.serial, FBUF_CTRL, [0x1, STOPCURRENTFRAME], 5 );
		this.byteRemaining = this.getFrameBufferLength( this.serial );
		this.frameSize = this.byteRemaining;
		return this.byteRemaining;

	}
	catch( error ){
		return 0; 
	}
}


exports.close = function(){
	this.serial.close();
}

exports.sendCommand = function(serial, cmd, args, responseLength){
    // Send the command
    var n = serial.write(0x56, 0, cmd, args);
    var buffer = serial.read(undefined, responseLength, 50);
    if(!buffer || (buffer && (buffer.byteLength < responseLength) )){
        throw "not enough bytes in response\n";	
    }
    
    // Check the response
    if( this.validateResponse( buffer, cmd ) == false )
    	 throw new Error("Error sending command: " + cmd + "\n###    " + buffer);

    return buffer;
}

exports.validateResponse = function(buffer, cmd){
    var buffer = new Uint8Array(buffer);
    return buffer != null && ( buffer.length >= 3 ) && buffer[0] == 0x76 && 
    	buffer[1] == 0 && buffer[2] == cmd && buffer[3] == 0;
}

exports.getFrameBufferLength = function( serial ){
	//get image lengths in frame buffer
    var buffer = new Uint8Array(this.sendCommand( serial, GET_FBUF_LEN, [0x1,0x0], 9 )); 
    var len = buffer[5];
    len <<= 8;
    len |= buffer[6];
    len <<= 8;
    len |= buffer[7];
    len <<= 8;
    len |= buffer[8];
    return len;
}