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

	// reset the camera
	try {
		sendCommand( this.serial, RESET, [ 0x0 ], 5 );
	}
	catch ( error ){
		return false; 
	}
	// wait after reset for device to reboot
    sensorUtils.mdelay( 500 );	
    
    // clear the buffer
    this.serial.read( "String" );	
	return true; 
}

//set the image compression from 0 to 100
exports.setCompression = function( value ) {
	if ( value >= 0 && value <= 100 ){
		try {
			sendCommand( this.serial, WRITE_DATA, [ 0x5, 0x1, 0x1, 0x12, 0x04, value ], 5);
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
	else if( parameters.w == 320 && parameters.h == 140 ){
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
		sendCommand( this.serial, WRITE_DATA, [0x05, 0x04, 0x01, 0x00, 0x19, size] , 5 ); 
	}
	catch( error ){
		return false; 
	}
	trace( "image size set to: " + parameters.w + " x " + parameters.h + "\n" );
	return true;
}

exports.capture = function() {
     var chunk = null;
     
	//send FBUF_CTRL to stop current frame updating
	try{
		sendCommand( this.serial, FBUF_CTRL, [0x1, STOPCURRENTFRAME], 5 );
	}
	catch( error ){
		return false; 
	}
	
	
	//send GET_FBUF_LEN to get image lengths in FBUF
	var len = getFrameBufferLength( this.serial );
	if( len > 0 ) {
	    var readlen = 64;
	    var bytesLeft = len;
        var buffer = null;
        
        chunk = new Chunk();
	    while( bytesLeft > 0 ){
	        var bytesToRead = Math.min( readlen, bytesLeft );
	        var frameptr = len - bytesLeft;
	        //send READ_FBUF to read image data
	        
			try{
				 buffer = sendCommand( this.serial, READ_FBUF, [0x0C, 0, 0x0A,
	                                0, 0, frameptr >> 8, frameptr & 0xFF,
	                                0, 0, 0, bytesToRead,
	                                0, 0], 5 + bytesToRead + 5 );
			}
			catch( error ){
				return false; 
			}
	        chunk.append( buffer.slice( 5, bytesToRead + 5 ) );
	        buffer.free()
	        bytesLeft -= bytesToRead;
	    }
	}
    //after receiving image, send FBUF_CTRL command to resume frame
	try{
		 sendCommand( this.serial, FBUF_CTRL, [ 0x1,0x03 ], 5 ); 
	}
	catch( error ){
		return false; 
	}
	return chunk;
}


exports.close = function(){
	this.serial.close();
}

function sendCommand(serial, cmd, args, responseLength){
    // Send the command
    serial.write(0x56, 0, cmd, args);

    var buffer = serial.read("Chunk", responseLength, 50);
    if (buffer.length < responseLength) {
    	trace("not enough bytes in response\n");    
        throw "not enough bytes in response\n";
    }

    // Check the response
    if( validateResponse( buffer, cmd ) == false )
       throw "Error sending command: " + cmd + "\n###    " + buffer + "\n";

    return buffer;
}

function validateResponse(buffer, cmd){
    return buffer != null && ( buffer.length >= 3 ) && buffer.peek( 0 ) == 0x76 && 
    	buffer.peek( 1 ) == 0 && buffer.peek( 2 ) == cmd && buffer.peek( 3 ) == 0;
}

function getFrameBufferLength( serial ){
	//get image lengths in frame buffer
    var buffer = sendCommand( serial, GET_FBUF_LEN, [0x1,0x0], 9 ); 
    var len = buffer.peek( 5 );
    len <<= 8;
    len |= buffer.peek( 6 );
    len <<= 8;
    len |= buffer.peek( 7 );
    len <<= 8;
    len |= buffer.peek( 8 );
    return len;
}
