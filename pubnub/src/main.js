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

/*
    This is the PubNub JavaScript library ported to KinomaJS.
    You can learn more about the PubNub JavaScript API at http://www.pubnub.com/docs/javascript/javascript-sdk.html.
    
    A large number of warnings are generated when it loads. These are safe.

*/
include("pubnub");

var THEME = require("themes/flat/theme");
var BUTTONS = require("controls/buttons");

/*
    Put your own PubNub publish and subscribe keys here.
    You can sign up for your own PubNub account at http://www.pubnub.com
*/
var PUBNUB_PUBLISH_KEY = "pub-c-49c9d18f-08fe-412c-9f98-f288d5fad0d0";
var PUBNUB_SUBSCRIBE_KEY = "sub-c-438e4caa-85ad-11e4-9b92-02ee2ddab7fe";
var PUBNUB_CHANNEL = "hello_kinoma";

var LabeledButton = BUTTONS.LabeledButton.template(function($) { return {
	width:130, height:35,
	behavior: Object.create(BUTTONS.LabeledButtonBehavior.prototype, {
		onTap: { value: function(container) {
            /*
                Publish the name of the button tapped to our PUBNUB_CHANNEL.
                You can monitor these messages on the PubNub developer console at http://pubnub.com/console
                You can also use the PubNub developer console to send messages to this app.
            */
			pubnub.publish({channel: PUBNUB_CHANNEL,
                            message: {name: $.name, when: (new Date).toString()},
                            });
		}},
	})
}});

var ApplicationBehavior = function(content, data) {
	PubNubBehavior.call(this, content, data);
};
ApplicationBehavior.prototype = Object.create(PubNubBehavior.prototype, {
	onLaunch: { value: function(application) {
		pubnub = PUBNUB.init({
			publish_key: PUBNUB_PUBLISH_KEY,
			subscribe_key: PUBNUB_SUBSCRIBE_KEY
		});
		pubnub.subscribe({
			channel : PUBNUB_CHANNEL,
			message : function(message, env, channel) {
                model.receivedMessage.string = JSON.stringify(message);
                model.receivedLabel.string = "Last received message (" + ++model.receivedCount + "):";
			},
			connect: function pub() {
                /*
                    We're connected! Send a message.
                */
				pubnub.publish({                                     
					channel : PUBNUB_CHANNEL,
					message : "Hello from PubNub Kinoma sample!"
				});
			}
		 });

        application.skin = new Skin({ fill: "white" });
        var style = new Style({ font:"bold 20px", color:"black", horizontal:"left", vertical:"middle" });

        application.add(new Label({left: 10, right: 0, top: 0, height: 35, style: style, string: "Publish message:"}));

        application.add(new LabeledButton({ name : "Hello"}, {top: 35, left: 20}) );
        application.add(new LabeledButton({ name : "Kinoma"}, {top: 35, left: 170}));
        application.add(new LabeledButton({ name : "PubNub"}, {top: 80, left: 20}));
        application.add(new LabeledButton({ name : "Test!"}, {top: 80, left: 170}));

        application.add(model.receivedLabel = new Label({left: 10, right: 0, top: 120, height: 35, style: style, string: "Last received message:"}));
        application.add(model.receivedMessage = new Text({left: 20, right: 0, top: 160, bottom: 0, style: style, string: "(no messages yet)"}));
        model.receivedCount = 0;
	}},
});
var model = application.behavior = new ApplicationBehavior(application, {});
