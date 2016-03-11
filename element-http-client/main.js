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
var HTTPClient = require("HTTPClient");

var main = {
	onLaunch() {
		let serverIP = "IP_ADDRESS_HERE"; // IP address of Kinoma Element running http-server-element app goes here		let request = new HTTPClient(`http://${serverIP}:80`); 
		
		request.onDataReady = response => { 
			if (request.statusCode == 200) {				let body = String.fromArrayBuffer(response);				trace(`Response from server: ${body}`);
			} else {
				trace("Error: "+request.statusCode+"\n");
			}		} 
				let message = "Hello";
		trace(`Saying "${message}" to server...\n`);		request.start(message); // send the request
	},
}

export default main;

