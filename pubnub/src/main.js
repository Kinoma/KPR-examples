/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
const PUBNUB_PUBLISH_KEY = "YOUR-PUBLISH-KEY-HERE";const PUBNUB_SUBSCRIBE_KEY = "YOUR-SUBSCRIBE-KEY-HERE";const PUBNUB_CHANNEL = "YOUR_CHANNEL-NAME-HERE";import PubNub from "pubnub";let buttonSkin = new Skin({ fill : ["#7DBF2E", "#5f9023"] });let textStyle = new Style({ font: "bold 20px", color: "black", horizontal: "center", vertical: "middle" });let LabeledButton = Container.template($ => ({	width:130, height:35,	active: true, skin: buttonSkin, state: 0,	contents: [		Label($, { top: 0, bottom: 0, left: 0, right: 0, style: textStyle, string: $.name }),	],	Behavior: class extends Behavior {		onTouchBegan(container) {			container.state = 1;		}		onTouchEnded(container) {			container.state = 0;			            /*                Publish the name of the button tapped to our PUBNUB_CHANNEL.                You can monitor these messages on the PubNub developer console at http://pubnub.com/console                You can also use the PubNub developer console to send messages to this app.            */			application.delegate("publish", { name: $.name, when: (new Date).toString() });            		}	}}));let historyButton = new Container({	height: 35, width: 200, left: 60, bottom: 10,	active: true, skin: buttonSkin, state: 0,	contents: [		new Label({ top: 0, bottom: 0, left: 0, right: 0, style: textStyle, string: "Get history" }),	],	Behavior: class extends Behavior {		onTouchBegan(container) {			container.state = 1;		}		onTouchEnded(container) {			container.state = 0;			application.delegate("getHistory");		}	}});class ApplicationBehavior extends Behavior {	onLaunch(application) {		application.skin = new Skin({ fill: "white" });		
		this.pubnub = new PubNub({			publishKey: PUBNUB_PUBLISH_KEY,			subscribeKey: PUBNUB_SUBSCRIBE_KEY,			ssl:true		});			this.subscribe();
		         application.add(new LabeledButton({ name : "Hello"}, {top: 10, left: 20}) );        application.add(new LabeledButton({ name : "Kinoma"}, {top: 10, left: 170}));        application.add(new LabeledButton({ name : "PubNub"}, {top: 65, left: 20}));        application.add(new LabeledButton({ name : "Test!"}, {top: 65, left: 170}));        application.add(model.receivedLabel = new Label({left: 10, right: 0, top: 105, height: 35, style: textStyle, string: "Last received message:"}));        application.add(model.receivedMessage = new Text({left: 20, right: 0, top: 145, bottom: 0, style: textStyle, string: "(no messages yet)"}));        model.receivedCount = 0;                application.add(historyButton);	}
	subscribe(application) {
		this.pubnub.subscribe({			channel : PUBNUB_CHANNEL,			message : data => {                model.receivedMessage.string = JSON.stringify(data.message);                model.receivedLabel.string = `Last received message (${++model.receivedCount}):`;			},		 });
	}
	publish(application, message) {
		this.pubnub.publish({
			channel: PUBNUB_CHANNEL,
		    callback: (error, data) => {
		    	if (error) trace("Publish Error: " + error + "\n");
	        },
			message: message
		});
	}
	getHistory(application) {
		this.pubnub.history({
		    channel: PUBNUB_CHANNEL,
		    callback: (error, data) => {
		    	if (error) trace("History Error: " + error + "\n");
	            else trace("History: " + JSON.stringify(data[0]) + "\n");
	        },
		    count: 5, // 50 is the default
		});
	}
	onQuit(application) {
		this.pubnub.stop();
	}}let model = application.behavior = new ApplicationBehavior();