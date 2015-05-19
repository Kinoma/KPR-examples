//@program
/*
 *     Copyright (C) 2002-2015 Kinoma, Inc.
 *
 *     All rights reserved.
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
var setLittleEndian32 = function(chunk, index, value) {
	chunk[index+0] = (value & 0x000000ff);
	chunk[index+1] = (value & 0x0000ff00) >> 8;
	chunk[index+2] = (value & 0x00ff0000) >> 16;
	chunk[index+3] = (value & 0xff000000) >> 24;
}

var setLittleEndian16 = function(chunk, index, value) {
	chunk[index+0] = (value & 0x000000ff);
	chunk[index+1] = (value & 0x0000ff00) >> 8;
}

var buildBMP32 = function(chunk, width, height) {
	var bmpSize = 14 + 40;
	var bmp = new Chunk(bmpSize);
	
	// file header
	bmp[0] = 0x42;							// imageFileType
	bmp[1] = 0x4D;
	setLittleEndian32(bmp, 2, bmpSize + chunk.length);		// fileSize
	setLittleEndian16(bmp, 6, 0);			// reserved1
	setLittleEndian16(bmp, 8, 0);			// reserved2
	setLittleEndian32(bmp, 10, bmpSize);	// imageDataOffset

	// now comes the BITMAPINFOHEADER
	setLittleEndian32(bmp, 14, 40);			// biSize
	setLittleEndian32(bmp, 18, width);		// biWidth
	setLittleEndian32(bmp, 22, height);		// biHeight
	setLittleEndian16(bmp, 26, 1);			// biPlanes
	setLittleEndian16(bmp, 28, 32);			// biBitCount
	setLittleEndian32(bmp, 30, 0);			// biCompression
	setLittleEndian32(bmp, 34, 0);			// biSizeImage
	setLittleEndian32(bmp, 38, 0);			// biXPelsPerMeter
	setLittleEndian32(bmp, 42, 0);			// biYPelsPerMeter
	setLittleEndian32(bmp, 46, 0);			// biClrUsed
	setLittleEndian32(bmp, 50, 0);			// biClrImportant
	
	// finally the pixels
	bmp.append(chunk);
	
	return bmp;
}

