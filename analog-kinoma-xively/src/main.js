//@program
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

/* APPLICATION */

var FEED_ID = "YOUR FEED ID";
var API_KEY = "YOUR API KEY";
var CHANNEL_ID = "YOUR CHANNEL ID"	//add a channel with this ID

if ("YOUR FEED ID" == FEED_ID || "YOUR API KEY" == API_KEY || "YOUR CHANNEL ID" == CHANNEL_ID) {
	let errorStyle = new Style( { font: "24px", color: "white", horizontal: "middle", vertical:"center" } );
	application.add( new Text( { string: "This application requires an Xively account. You can sign up for a free account at https://xively.com/signup/", left: 0, right: 0, style: errorStyle } ) );
}
else {
    // initialize the pin to read from 
	Pins.configure({
        potentiometer: {
            require: "a2d",
            pins: {
                a2d: { pin: 52 }
            }
        }
    });
	Pins.repeat("/potentiometer/read", 70, function(reading) {
		let message = new Message( "https://api.xively.com/v2/feeds/" + FEED_ID + ".json" );
		message.method = "PUT";				
		let body = {
			"version":"1.0.0",
			"datastreams" : [{
				"id" : CHANNEL_ID,
		        "current_value" : reading
		    }]
		}
		message.requestText = JSON.stringify( body ); 
		message.setRequestHeader("X-ApiKey", API_KEY);
		message.setRequestHeader("User-Agent", "Kinoma");
		message.setRequestHeader("Content-Length", message.requestText.length );
		application.invoke( message, Message.TEXT ); 
	});
}
