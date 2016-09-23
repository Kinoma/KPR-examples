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
const PUBNUB_PUBLISH_KEY = "YOUR-PUBLISH-KEY-HERE";const PUBNUB_SUBSCRIBE_KEY = "YOUR-SUBSCRIBE-KEY-HERE";const PUBNUB_CHANNEL = "YOUR_CHANNEL-NAME-HERE";

import PubNub from "pubnub";
import Pins from "pins";

var main = {
    onLaunch(){
		let pubnub = this.pubnub = new PubNub({
			publishKey: PUBNUB_PUBLISH_KEY,
			subscribeKey: PUBNUB_SUBSCRIBE_KEY,
			ssl:false
		});
		trace("Initialized PubNub object.\n");
		
		Pins.configure({
			analogSensor: {
				require: "Analog", // Uses the built-in analog BLL
				pins: {
					power: { pin: 1, type: "Power" },
					analog: { pin: 2 },
					ground: { pin: 3, type: "Ground" },
				}
			}    		
		}, success => {			
			if (success) {
				trace("Configured pins.\n");
				Pins.repeat("/analogSensor/read", 750, reading => {
					pubnub.publish({
						channel: PUBNUB_CHANNEL,
					    callback: (error, data) => {
					    	if (error) trace(`Publish Error: ${JSON.stringify(error)}\n`);
				        },
						message: reading,
					});
				});
			} else {
				trace("Failed to configure pins.\n");
			}
		});
    },
};

export default main;


