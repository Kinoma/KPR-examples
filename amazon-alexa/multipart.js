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
export const CONTENT_TYPE = "content-type";
export const CONTENT_ID = "content-id";

export class Multipart {
	static createMultipart(headers, callback) {
		let type = (CONTENT_TYPE in headers) ? headers[CONTENT_TYPE] : null;
		if (type && (type.indexOf("multipart/related") >= 0))
			return new MultipartRelated(type, callback);
//		else
//			debugger
	}
	constructor(type, callback) {
		let split = type.split(";");
		let content = split.reduce((it, item) => {
			let offset = item.indexOf("=");
			if (offset > 0) {
				let key = item.substring(0, offset)
				let value = item.substring(offset + 1)
				it[key.trim()] = value.trim();
			}
			return it;
		}, {});
		this.boundary = "\r\n--" + content.boundary;
		this.data = new ArrayBuffer(2);
		let data = new Int8Array(this.data);
		data[0] = 0x0D;
		data[1] = 0x0A;
		this.parts = [];
		this.callback = callback;
	}
	findString(data, start, stop, offset = 0) {
		let dataLength = data.length;
		let boundary = this.boundary;
		let length = stop - start;
		let first = boundary.charCodeAt(start);
		let index = offset;
		while (((index = data.indexOf(first, index)) >= 0)
			&& (index + length < dataLength)) {
			let i;
			for (i = 1; i < length; i++) {
				if (data[index + i] != boundary.charCodeAt(start + i)) break;
			}
			if (i == length)
				return index;
			index += i;
		}
		return -1;
	}
	process(bytes, info=false) {
		if (!this.data) return; // multipart processing finished
		this.data = this.data.concat(bytes);
		let index;
		while ((index = this.processPart(info)) > 0) {
			this.data = this.data.slice(index);
		}
	}
	processPart(info) {
		let data = new Int8Array(this.data);
		let length = this.boundary.length;
		let parts = this.parts;
		let start;
		if ((start = this.findString(data, 0, length)) >= 0) {
			let offset = start + length;
			if (this.findString(data, 2, 4, offset) == offset) {
				// end of multipart
				this.data = null;
				return -1;
			}
			else if (this.findString(data, 0, 2, offset) == offset) {
				let index = this.findString(data, 0, length, offset + 2);
				if (index > 0) {
					let part = new Part(data.subarray(offset + 2, index));
					this.callback(this, part);
//					parts.push(part);
					return index;
				}
			}
		}
		return -1;
	}
}

class MultipartRelated extends Multipart {
	constructor(type, callback) {
		super(type, callback);
	}
}

class Part {
	constructor(buffer) {
		let length = (buffer.byteLength > 2048) ? 2048 : buffer.byteLength;
		let ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + length);
		let text = String.fromArrayBuffer(ab);
		let headers = this.headers = {};
		let start = 0, stop;
		while ((stop = text.indexOf("\r\n", start)) > start) {
			let offset = text.indexOf(":", start);
			let key = text.substring(start, offset)
			let value = text.substring(offset + 1, stop)
			headers[key.trim().toLowerCase()] = value.trim();
			start = stop + 2;
		}
		let type = (CONTENT_TYPE in headers) ? headers[CONTENT_TYPE] : null;
		let data = buffer.buffer.slice(buffer.byteOffset + start + 2, buffer.byteOffset + buffer.byteLength);
		if (type && (type.indexOf("application/json") >= 0)) {
			let string = String.fromArrayBuffer(data);
			this.json = JSON.parse(string);
		}
		else
			this.data = data;
	}
}
