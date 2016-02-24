//@program

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

/* APPLICATION */

var Pins = require("pins");

var BUCKET_KEY = "YOUR BUCKET KEY";
var ACCESS_KEY = "YOUR ACCESS KEY";

var INITIALSTATE_API_URI = "https://groker.initialstate.com/api/events"

class AppBehavior extends Behavior{
	onComplete(app, message, text){
		if (message.status != 204){
			trace("Initial State stream did not update successfully. Server replied with: " + text + "\n");
		}
	}
	
	onSensorValue(app, analogValue){
		let message = new Message(INITIALSTATE_API_URI);
		message.method = "POST";
		message.setRequestHeader("Content-Type", "application/json");
		message.setRequestHeader("X-IS-AccessKey", ACCESS_KEY);
		message.setRequestHeader("X-IS-BucketKey", BUCKET_KEY);
		message.setRequestHeader("User-Agent", "Kinoma");
		
		let body = [
			{ key: "analogValue", value: analogValue}, 
		];
		
		message.requestText = JSON.stringify( body ); 
		
		message.setRequestHeader("Content-Length", message.requestText.length);
		application.invoke( message, Message.TEXT ); 
	}
}

application.behavior = new AppBehavior();

if ("YOUR BUCKET ID" == BUCKET_KEY || "YOUR ACCESS KEY" == ACCESS_KEY) {
	let errorStyle = new Style( { font: "24px", color: "white", horizontal: "middle", vertical:"center" } );
	application.add( new Text( { string: "This application requires an Initial State account. You can sign up for a free account at initialstate.com", left: 0, right: 0, style: errorStyle } ) );
} else {
	Pins.configure({
        sensor: {pin: 51, type: "Analog"}
    }, success => {
    	Pins.repeat("/sensor/read", 1000, function(analogValue) {
			application.delegate("onSensorValue", analogValue);
		});
	});
}
