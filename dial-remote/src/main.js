//@program
/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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

KEYBOARD = require('mobile/keyboard');
FTHEME = require('themes/flat/theme');
THEME = require('themes/sample/theme');
let CONTROL = require('mobile/control');
let MODEL = require('mobile/model');
let DIALOG = require('mobile/dialog');
let BUTTONS = require('controls/buttons');

/* ASSETS */

let backgroundSkin = new Skin({ fill:'#a2ffff' });
let enabledEffect = new Effect(); enabledEffect.colorize('#5ab021', 1);
let selectedEffect = new Effect(); selectedEffect.colorize('#333333', 1);
let greenButtonSkin = new FTHEME.DynamicSkin( FTHEME.buttonTexture, FTHEME.disabledEffect, enabledEffect, selectedEffect, undefined, { left : 10, top : 10, right : 10, bottom : 10 });
let greenButtonStyle = new Style({ color:'white', font:'bold 24px', horizontal:'left', vertical:'middle' });

/* HANDLERS */

Handler.bind("/configure", MODEL.DialogBehavior({
	onDescribe(query) {
		return {
		    Dialog: DIALOG.Box,
		    title: "Set ball count",
		    items: [
		        {
		            Item: DIALOG.Slider,
		            label: "Balls",
		            id: "ballCount",
		            min: 1,
		            max: 10,
		            value: query.count,
		            toString: function(val) { return Math.floor(val); }, 
		        },
		    ],
		    url: query.url,
		    ok: "OK",
		    cancel: "Cancel",
		    action: "/dial/app/configure",
		};
	}
}));

// Retrieve DIAL device server info
Handler.bind("/dial", Behavior({
	onComplete(handler, message, document) {
		let device = parseQuery(handler.message.query);
		device.applicationURL = message.getResponseHeader("Application-URL") + model.dialClientApplicationID;
		device.friendlyName = document.getElementsByTagName("friendlyName").item(0).firstChild.value;
		let element = document.getElementsByTagName("icon").item(0);
		if (element)
			device.iconURL = mergeURI(device.url, element.getElement("url"));
		application.invoke(new Message("/dial/app?" + serializeQuery(device)));
	},
	onInvoke(handler, message) {
		let server = parseQuery(message.query);
		let msg = new Message(server.url)
		handler.invoke(msg, Message.DOM);
	}
}));

// Confirm remote device supports the DIAL sample client application
Handler.bind("/dial/app", Behavior({
	onComplete(handler, message, document) {
		let device = parseQuery(handler.message.query);
		if (message.status == 200) { // check if device supports DIAL client application
			model.devices.push(device);
			application.distribute("onDIALClientFound", device);
		}
	},
	onInvoke(handler, message) {
		let device = parseQuery(message.query);
		let msg = new Message(device.applicationURL);
		handler.invoke(msg, Message.DOM);
	}
}));

// Launch and/or configure the DIAL sample client application. The body of the request contains the app parameters.
Handler.bind("/dial/app/configure", Behavior({
	onComplete(handler, message, document) {
		if (201 == message.status)
			application.distribute("onDIALClientAppConfigured");	// configure
		else if (200 == message.status)
			application.distribute("onDIALClientAppConfigured");	// already configured
	},
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		model.ballCount = parseInt(query.ballCount);
		let msg = new Message(query.url);
		msg.method = "POST";
		msg.requestText = "count=" + model.ballCount;
		msg.setRequestHeader("Content-Length", msg.requestText.length);
		msg.setRequestHeader("Content-Type", "text/plain");
		handler.invoke(msg, Message.TEXT);
	}
}));

// Launch the DIAL sample client application
Handler.bind("/dial/app/launch", Behavior({
	onComplete(handler, message, document) {
		if (201 == message.status)
			application.distribute("onDIALClientAppLaunched");	// launched
		else if (200 == message.status)
			application.distribute("onDIALClientAppLaunched");	// already launched
	},
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		let msg = new Message(query.url);
		msg.method = "POST";
		handler.invoke(msg, Message.TEXT);
	}
}));

// Quit the DIAL sample client application
Handler.bind("/dial/app/quit", Behavior({
	onComplete(handler, message, document) {
		if (201 == message.status)
			application.distribute("onDIALClientAppQuit");
	},
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		let msg = new Message(query.url + "/run");
		handler.invoke(msg, Message.TEXT);
	}
}));

// Check DIAL sample client application status
Handler.bind("/dial/app/status", Behavior({
	onComplete(handler, message, document) {
		if (200 == message.status) {
			let items = document.getElementsByTagName("state");
			if (items.length > 0) {
				handler.message.responseText = items.item(0).firstChild.nodeValue;
			}
		}
		else {
			handler.message.responseText = "not found";
		}
	},
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		let msg = new Message(query.url);
		handler.invoke(msg, Message.DOM);
	}
}));

/* BEHAVIORS */

class ApplicationBehavior extends MODEL.ApplicationBehavior {
	onLaunch(application) {
		let data = {};
		application.add(new MainScreen(data));
		
		this.dialClientApplicationID = "dialclient.example.kinoma.marvell.com";
		this.ballCount = 4;
		
		this.localDevice = this.currentDevice = new LocalDevice();
		this.devices = [ this.currentDevice ];
		this.ssdpClient = new SSDP.Client();
		this.ssdpClient.addService("urn:dial-multiscreen-org:service:dial:1");
		this.ssdpClient.behavior = this;
		this.ssdpClient.start();
	}
	onQuit(application) {
		this.ssdpClient.stop();
		this.ssdpClient = undefined;
	}
	onSSDPServerDown(server) {
		trace("DIAL Server down: " + server.url + "\n");
		this.devices.some(function(item, index, array) {
			if (("url" in item) && (item.url == server.url)) {
				array.splice(index, 1);
				if (this.currentDevice == item) {
					application.distribute("onDIALClientLost", this.currentDevice);
					this.selectDevice(this.localDevice.uuid);
				}
				return true;
			}
		}, this);
	}
	onSSDPServerUp(server) {
		trace("DIAL Server up: " + server.url + "\n");
		application.invoke(new Message("/dial?" + serializeQuery(server)));
	}
};

class DialClientButtonBehavior extends BUTTONS.ButtonBehavior {
	onDIALClientFound(button, device) {
		if (model.devices.length > 1) {
			button.active = true;
			this.changeState(button, 1);
		}
	}
	onDIALClientLost(button, device) {
		button.active = false;
		this.changeState(button, 0);
	}
};

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		BUTTONS.Button($, {
			left:20, right:20, top:50, height:50, skin:greenButtonSkin, active:false,
			Behavior: class extends DialClientButtonBehavior {
				onCreate(button, data) {
					super.onCreate(button, data);
					this.appLaunched = false;
				}
				onDIALClientAppConfigured(button) {
					button.delegate("onDIALClientAppLaunched");
				}
				onDIALClientAppLaunched(button) {
					this.appLaunched = true;
					button.first.string = "Quit DIAL client";
				}
				onDIALClientAppQuit(button) {
					this.appLaunched = false;
					button.first.string = "Launch DIAL client";
				}
				onDIALClientFound(button, device) {
					super.onDIALClientFound(button, device);
					if (button.active) {
						var device = model.devices[1];
						var applicationURL = device.applicationURL;
						let message = new Message("/dial/app/status?" + serializeQuery({url: applicationURL}));
						let promise = message.invoke(Message.TEXT);
						promise.then(text => {
							if ("running" == text)
								button.delegate("onDIALClientAppLaunched");
							else if ("stopped" == text)
								button.delegate("onDIALClientAppQuit");
						});
					}
				}
				onTap(button) {
					let device = model.devices[1];
					let applicationURL = device.applicationURL;
					let message;
					if (this.appLaunched)
						message = new Message("/dial/app/quit?" + serializeQuery({url: applicationURL}));
					else
						message = new Message("/dial/app/launch?" + serializeQuery({url: applicationURL}));
					button.invoke(message);
				}
			},
			contents: [
				Label($, { top:0, bottom:0, style:greenButtonStyle, string:'Launch DIAL client' })
			]
		}),
		BUTTONS.Button($, {
			left:20, right:20, bottom:50, height:50, skin:greenButtonSkin, active:false,
			Behavior: class extends DialClientButtonBehavior {
				onTap(button) {
					let device = model.devices[1];
					let applicationURL = device.applicationURL;
					button.invoke(new Message("/configure?" + serializeQuery({count: model.ballCount, url: applicationURL})));
				}
			},
			contents: [
				Label($, { top:0, bottom:0, style:greenButtonStyle, string:'Configure DIAL client' })
			]
		})
	]
}));

/* APPLICATION */

class LocalDevice {
	constructor() {
		this.iconURL = mergeURI(application.url, "./assets/local.png");
		this.friendlyName = "My Phone";
		this.uuid = application.uuid;
	}
};

var model = application.behavior = new ApplicationBehavior(application);

