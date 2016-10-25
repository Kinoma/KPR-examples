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
var HTTPClient = require("HTTPClient");
import mdns from "mdns";

var main = {
	onLaunch() {
		/* Search for server app */
		mdns.query("_telnet._tcp", service => {
		    if (service.name == "element-http-server") {
		    	/* When found, get its IP address and send it an HTTP request */
		    	if (service.status == "found") {
		    		trace(`Found ${service.name}\n`);
		    		main.sendRequest(service.addr);
		    	} else {
		    		trace(`Lost ${service.name}\n`);
		    	}
		    }		});
	},
	sendRequest(ip) {
		let request = new HTTPClient(`http://${ip}:80`); 
		
		request.onDataReady = response => { 
			if (request.statusCode == 200) {
				let body = String.fromArrayBuffer(response);
				trace(`Response from server: ${body}\n`);
			} else {
				trace(`Error: ${request.statusCode}\n`);
			}
		} 
		
		let message = "Hello";
		trace(`Saying "${message}" to server...\n`);
		request.start(message); // sends the request	
	}
}

export default main;

