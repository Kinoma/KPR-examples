/*  Copyright 2011-2016 Marvell Semiconductor, Inc.  Licensed under the Apache License, Version 2.0 (the "License");  you may not use this file except in compliance with the License.  You may obtain a copy of the License at      http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and  limitations under the License.*/let BUCKET_KEY = "YOUR_BUCKET_KEY_HERE";let ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";
let INTERVAL = 3000;

import HTTPClientRequest from "HTTPClient";import Pins from "pins";let INITIALSTATE_API_URI = `https://groker.initialstate.com/api/events?accessKey=${ACCESS_KEY}&bucketKey=${BUCKET_KEY}`;var main = {	onLaunch() {		if ((BUCKET_KEY != "YOUR_BUCKET_KEY_HERE") && (ACCESS_KEY != "YOUR_ACCESS_KEY_HERE")) {
			Pins.configure({			    photoresistor: {			        require: "Analog",			        pins: {			            power: { pin: 1, type: "Power" },			            analog: { pin: 2 },			            ground: { pin: 3, type: "Ground" },			        }			    },         			}, function(success) {				if (success) 
					Pins.repeat("/photoresistor/read", INTERVAL, main.postData);				else 
					trace("Failed to configure\n");			});
		} else {
			trace("Bucket and access keys required. You can sign up for a free Initial State account at initialstate.com.\n");
		}	},	postData(value) {
		value = Math.round(value*1000)/1000; // Rounds to 3 significant figures
		let request = new HTTPClientRequest(INITIALSTATE_API_URI);
		request.method = "POST";		request.setHeader("Content-Type", "application/json");		let requestText = JSON.stringify({key: "analog", value: value}); 		request.setHeader("Content-Length", requestText.length);		request.start(requestText);	}}export default main;