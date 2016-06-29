/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */

import Pins from "pins";
import System from "system";
import Files from "files";
import File from "file";

const bucket = "element-photo-door";
const config = { region:"us-west-2", signatureVersion:"s3", systemClockOffset:0 };
import credentials from "credentials";

let AWS = require("aws");
let S3 = require("amz").S3;

AWS.config = config;
const MAX_LIST_ITEMS = 5;
const savePictureList = false;	// use this as an option to save pictures that are not uploaded yet

var app = {
	on: 0,
	enable: true,
	pictureSize: 0,
	directory: "/k3/",
	pictures: [],
	intv: undefined,
	onLaunch(){
		Pins.configure({
			camera: {
				require: "VC0706",
				pins: {
					power: {pin: 9, type: "Power"},
					ground: {pin: 10, type: "Ground"},
					serial: { rx: 12, tx: 11}, 	
				}
			},
			mb: {
				require: "MB1010",
				pins: {
					range:{pin: 4},
					ground: {pin: 8, type: "Ground"},
					power: {pin: 7, type: "Power"},
				}
			},
			led: {
				require: "Digital",
				pins:{
					ground:{pin: 3, type: "Ground"},
					digital: {pin: 2, direction: "output"}
				}
			}
		}, result=> {
			this.loadPictureListFromFlash();
			this.setImageSize(1);// resolution: 320 x 240
			Pins.repeat("/mb/read", 300, result=>{
				if(result < 30){
					if(this.on == 0){
						Pins.invoke("/led/write", 1, ()=>this.on = 1);
						this.onMotionDetected();
					}
				}
				else{
					if(this.on == 1)
						Pins.invoke("/led/write", 0, ()=>this.on=0);
				}
			});
			// upload in background
			this.intv = setInterval(()=>{
				for(let i = this.pictures.length - 1; i >= 0; i--){
					this.sendPicture(this.pictures[i]);
				}
			}, 60000);
		});
	},	
	setImageSize(n){
		switch(n){
			case 0:
				Pins.invoke("/camera/setImageSize", {w: 160, h: 120}, function(){
				});
				break;
			case 1: 
				Pins.invoke("/camera/setImageSize", {w: 320, h: 240}, function(){
				});
				break;
			case 2:
				Pins.invoke("/camera/setImageSize", {w: 640, h: 480}, function(){
				});
				break;
			default:
				trace("invalid parameter\n");
				break;
		}
	},
	resetCamera(){
		Pins.invoke("/camera/reset", result => {
			trace("reset done\n");
		});
	},
	onUploadComplete(fn, success){
		if(success){
			this.deletePicture(fn);
			this.removePictureFromList(fn);
		}
		this.savePictureListToFlash(); // save picture list
	},
	removePictureFromList(fn){
		let idx = this.pictures.indexOf(fn);
		if(idx != -1) {
			this.pictures.splice(idx, 1);
			return true;
		}
		return false;
	},
	deletePicture(fn){ // delete the file from flash, 
		try{
			trace("deletePicture: " + fn + '\n');
			Files.deleteFile(this.directory + fn);
			return true;
		}
		catch(error){
			return false;
		}
	},
	sendPicture(fn){
		if (!fn) return;
		let name = fn;
		let content = new File(this.directory + fn, 0);
		trace("File size: " + content.length + "\n");
		let data = {
			bucket: bucket,
			config: config,
			credentials: credentials
		}
		let request = { headers:{ "Content-Length":content.length, "Connection": "close" }, method:"PUT", path:`/${data.bucket}/${name}` };
		let message = S3.createMessage(data, request, undefined, true);
		message.onHeaders = ()=>{
			trace("onHeaders\n");
			content.close();
			this.onUploadComplete(fn, true);
		};
		message.onTransferComplete = success => {
			trace("onTransferComplete: " + success + '\n');	
			content.close();
			this.onUploadComplete(fn, success);
		};
		trace("sendPicture: " + fn + "\n");
		try{
			message.start(content);		
		}
		catch(error){
			content.close();
			trace("sendPicture: error\n");
		}
	},
	readPicture(n){
		let done = false;
		var buffer = undefined;
		Pins.invoke("/camera/read", n, result=>{
			buffer = result;
			done = true;
		});	
		while(!done ){
		}
		return buffer;	
	},
	savePicture(){
		if (!this.pictureSize) return;
		let File = require("file");
		let name = Date.now();
		let path = this.directory + name;
		let f = new File(path,1);
		trace(path + "\n");
		let t = Date.now();

		while(this.pictureSize){
			let ab = this.readPicture(64*30);
			if(ab){
				try{
					f.write(ab);
					this.pictureSize -= ab.byteLength;
					ab = undefined;	
				}
				catch(error){
					trace("save picture to file write error\n");
					f.close();
					// remove file
					Files.deleteFile(path);
					return;
				}
			}
			else break;
		}
		f.close();
		trace("UART transmit: " + ((Date.now() - t)/1000).toFixed(2) + " seconds\n");
		while(this.pictures.length >= MAX_LIST_ITEMS){
			this.deletePicture(this.pictures[0]);
			this.removePictureFromList(this.pictures[0]);
		}
		this.pictures.push(name);
		this.savePictureListToFlash(); // save list
		return name;
	},
	capture(){
		this.enable = false;
		Pins.invoke("/camera/capture",result =>{
			this.pictureSize = result;
			trace("pic size: " + result + "\n");
			let fn = this.savePicture();
			this.enable = true;
			if (fn) this.sendPicture(fn);
		});
	},
	onMotionDetected(){
		trace("onMotionDetected\n");
		if(this.enable){
			this.capture();
		}
	},
	enableCapture(v){
		if(v) this.enable = true;
		else this.enable = false;
	},
	loadPictureListFromFlash(){
		if(!savePictureList) return;
		try{
			let s = String.fromArrayBuffer(Files.read(this.directory + "pictures.txt"));
			let arr = JSON.parse(s);
			for (let i = 0; i < arr.length; i++){
				let info = Files.getInfo(this.directory + arr[i]);
				if(info.type == Files.fileType){
					if(this.pictures.length < MAX_LIST_ITEMS) {
						this.pictures.push(arr[i]);; // only need 5 pictures
					}
					else 
						this.deletePicture(arr[i]); // clean extra files
				}
			}
			this.savePictureListToFlash(); // update pictures
		}
		catch(error){
			trace("error#: loadPictureListFromFlash\n ");
		}
	},
	savePictureListToFlash(){
		if(!savePictureList) return;
		try{
			let f = new File(this.directory + "pictures.txt", 1);
			f.write(JSON.stringify(this.pictures));
			f.close();	
		}
		catch(error){
			trace("error#: savePictureListToFlash\n ")
		}
	},
	onQuit(){
		if(!savePictureList){
			// clean up
			while(this.pictures.length){
				let fn = this.pictures[this.pictures.length - 1];
				this.removePictureFromList(fn);
				this.deletePicture(fn); 
			}
		}
		else
			this.savePictureListToFlash();
		this.pictures = undefined;
		if(this.intv){
			clearInterval(this.intv);
			this.intv = undefined;
		}
	}
};

export default app;
