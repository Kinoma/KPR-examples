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

export default {
	onLaunch() {
		let pubnub = this.pubnub = new PubNub({
			publishKey: PUBNUB_PUBLISH_KEY,
			subscribeKey: PUBNUB_SUBSCRIBE_KEY,
			ssl:true
		});
		
		pubnub.subscribe({ 		    channel: PUBNUB_CHANNEL,		    message: event => {		        trace(`Received message: ${JSON.stringify(event.message)}\n`);		    },		    status: status => {
		    	if (status.category == "PNConnectedCategory") trace(`Subscribed to channel "${PUBNUB_CHANNEL}"\n`);		    }		});
	    
		let msg = "Hello from Kinoma Element!";
		pubnub.publish({
			channel: PUBNUB_CHANNEL,
		    callback: (error, data) => {
		    	if (error) trace(`Publish Error: ${error}\n`);
		    	else trace(`Published message ${msg}\n`);
	        },
			message: msg,
		});
		
		
		pubnub.history({
		    channel: PUBNUB_CHANNEL,
		    callback: (error, data) => {		    	if (error) trace(`History Error: ${JSON.stringify(error)}\n`);
		    	else trace(`History: ${JSON.stringify(data[0])}\n`);		    },
		    count: 5,
		    reverse: false
		 });
	},	
};
