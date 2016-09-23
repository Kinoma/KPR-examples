/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
const PUBNUB_PUBLISH_KEY = "YOUR-PUBLISH-KEY-HERE";const PUBNUB_SUBSCRIBE_KEY = "YOUR-SUBSCRIBE-KEY-HERE";const PUBNUB_CHANNEL = "YOUR_CHANNEL-NAME-HERE";import PubNub from "pubnub";let pubnub = new PubNub({	publishKey: PUBNUB_PUBLISH_KEY,	subscribeKey: PUBNUB_SUBSCRIBE_KEY,	ssl:true});	
let MainScreen = Container.template($ => ({	left:0, right:0, top:0, bottom:0, skin:new Skin({ fill:'white' }),	contents:[		Label($, {			left:0, right:0, string:'- - -',			style: new Style({ font:'bold 46px', color:'black' }),			Behavior: class extends Behavior {				onDisplayed(label) {					pubnub.subscribe({						channel : PUBNUB_CHANNEL,						message : data => {			                label.string = Number(data.message).toFixed(6);						},					 });				}			}		})	]}));

class AppBehavior extends Behavior {
	onLaunch(application) {
		application.skin = new Skin({ fill: "white" });		application.add(new MainScreen);
	}
	onQuit(application) {
		pubnub.stop();
	}
}application.behavior = new AppBehavior;