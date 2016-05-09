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

var writeUInt16LE = function(buffer, offset, value) {
	buffer[offset] = value & 0xFF;
	buffer[offset + 1] = (value >>> 8);
};

var writeUInt32LE = function(buffer, offset, value) {
	buffer[offset + 3] = (value >>> 24);
	buffer[offset + 2] = (value >>> 16);
	buffer[offset + 1] = (value >>> 8);
	buffer[offset] = value & 0xFF;
};

export var buildWAVE = function(soundBite, rate, channels) {
	let fileSize = 44 + soundBite.byteLength;
	let chunkSize = fileSize - 8;
	let numSamples = soundBite.byteLength / 2;
	let sampleRate = rate;
	let numChannels = channels;
	let bitsPerSample = 16;
	let buffer = new ArrayBuffer(44);
	let header = new Uint8Array(buffer);
	header[0] = 0x52; header[1] = 0x49; header[2] = 0x46; header[3] = 0x46;		// "RIFF"
	writeUInt32LE(header, 4, chunkSize);										// Chunk Size
	header[8] = 0x57; header[9] = 0x41; header[10] = 0x56; header[11] = 0x45;	// "WAVE"
	header[12] = 0x66; header[13] = 0x6d; header[14] = 0x74; header[15] = 0x20;	// Sub-chunk 1 ID - "fmt "
	writeUInt32LE(header, 16, 16);												// Sub-chunk 1 size
	writeUInt16LE(header, 20, 1);												// Audio format
	writeUInt16LE(header, 22, numChannels);										// Channels
	writeUInt32LE(header, 24, sampleRate);										// Sample rate
	writeUInt32LE(header, 28, sampleRate * numChannels * (bitsPerSample/8));	// Byte rate = SampleRate * NumChannels * BitsPerSample/8
	writeUInt16LE(header, 32, numChannels * (bitsPerSample/8));					// Block align = NumChannels * BitsPerSample/8
	writeUInt16LE(header, 34, bitsPerSample);									// bits per sample
	header[36] = 0x64; header[37] = 0x61; header[38] = 0x74; header[39] = 0x61;	// Sub-chunk 2 ID
	writeUInt32LE(header, 40, numSamples * numChannels * (bitsPerSample/8));	// Sub-chunk 2 size = NumSamples * NumChannels * BitsPerSample/8
  
  	let soundLength = soundBite.byteLength || soundBite.length; //added this for Create compatibility
	let buffer2 = new ArrayBuffer(header.byteLength + soundLength);
	let wave = new Uint8Array(buffer2);
	wave.set(header, 0);
	wave.set(new Uint8Array(soundBite), header.byteLength);
	return wave.buffer;
}
							