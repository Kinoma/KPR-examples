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

// https://developer.apple.com/library/ios/documentation/CoreBluetooth/Reference/AppleNotificationCenterServiceSpecification/Introduction/Introduction.html
// http://processors.wiki.ti.com/index.php/Cc2640_ANCS_Sample
// http://mbientlab.com/blog/ancs-on-ti2541-in-an-afternoon/

var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var SCROLLER = require("mobile/scroller");
var CREATIONS = require("creations/creations");
var Pins = require("pins");

var NC_NAME = "Kinoma";
var NOTIFICATION_SOURCE_UUID = "9FBF120D-6301-42D9-8C58-25E699A21DBD";
var CONTROL_POINT_SOURCE_UUID = "69D1D8F3-45E1-49A8-9821-9BBDFDAAD9D9";
var DATA_SOURCE_UUID = "22EAC6E9-24D6-4BB5-BE44-B36ACE7C7BFB";
var SERVICE_UUID = "7905F431-B5CE-4E99-A40F-4B1E122D00D0";

var GAP_SERVICE = {
	uuid: "1800",
	characteristics: [
		{
			uuid: "2A00",						// device name string
			properties: ["read"],
			value: NC_NAME
		},
	]
};

// ----------------------------------------------------------------------------------
// ANCS constants
// ----------------------------------------------------------------------------------

const CategoryID = {
	Other: 0,
	IncomingCall: 1,
	MissedCall: 2,
	Voicemail: 3,
	Social: 4,
	Schedule: 5,
	Email: 6,
	News: 7,
	HealthAndFitness: 8,
	BusinessAndFinance: 9,
	Location: 10,
	Entertainment: 11,
	Reserved: 12	// (12-255)
};

const EventID = {
	NotificationAdded: 0,
	NotificationModified: 1,
	NotificationRemoved: 2,
	Reserved: 3		// (3-255)
};

const CommandID = {
	GetNotificationAttributes: 0,
	GetAppAttributes: 1,
	PerformNotificationAction: 2,
	Reserved: 3		// (3-255)
};

const EventFlags = {
	Silent: 1 << 0,
	Important: 1 << 1,
	PreExisting: 1 << 2,
	PositiveAction: 1 << 3,
	NegativeAction: 1 << 4,
	Reserved: 1 << 5	// (1 << 5 - 1 << 7)
};

const NotificationAttributeID = {
	AppIdentifier: 0,
	Title: 1,
	Subtitle: 2,
	Message: 3,
	MessageSize: 4,
	Date: 5,
	PositiveActionLabel: 6,
	NegativeActionLabel: 7,
	Reserved: 8		// (8-255)
};

const ActionID = {
	Positive: 0,
	Negative: 1,
	Reserved: 2		// (2-255)
};

const AppAttributeID = {
	DisplayName: 0,
	Reserved: 1		// (1-255)
};

// ----------------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------------
var messageStyle = new Style({font:"24px", color:"black", horizontal:"left", left:5 });
var noItemsStyle = new Style({font:"24px", color:"gray", horizontal:"center", vertical:"middle" });
var statusStyle = new Style({font:"bold 24px", color:"black", horizontal:"center", vertical:"bottom" });
var titleStyle = new Style({font:"bold 28px", color:"black", left:5 });

// ----------------------------------------------------------------------------------
// assets
// ----------------------------------------------------------------------------------
var backgroundSkin = new Skin({ fill:"white" });
var dividerSkin = new Skin({ fill:"silver" });

// ----------------------------------------------------------------------------------
// behaviors
// ----------------------------------------------------------------------------------
class ANCSDiscoveryBehavior extends Behavior {
	advertise(container) {
		var data = {
			completeLocalName: NC_NAME,
			solicitationUUID128List: [SERVICE_UUID]
		};
		Pins.invoke("/ble/gapSetScanResponseData", data);
		Pins.invoke("/ble/gapStartAdvertising", { data });
	}
	addServices(container) {
		Pins.invoke("/ble/gattAddServices", { services: [GAP_SERVICE] });
	}
	changeState(container, state) {
		this.state = state;
		container.last.string = state;
	}
	initialize(container) {
		this.notification_source_characteristic = null;
		this.control_point_characteristic = null;
		this.data_source_characteristic = null;
		this.start_handle = null;
		this.end_handle = null;
		this.connection = null;
		this.changeState(container, "Idle");
	}
	onCreate(container, data) {
		this.addServices(container);
	}
	onDisplaying(container) {
		this.initialize(container);
		this.advertise(container);
		this.changeState(container, "Advertising: " + NC_NAME);
	}
	onGattCharacteristicFound(container, result) {
		if (CONTROL_POINT_SOURCE_UUID == result.uuid) {
			this.control_point_characteristic = result.characteristic;
		}
		else if (DATA_SOURCE_UUID == result.uuid) {
			this.data_source_characteristic = result.characteristic;
		}
		else if (NOTIFICATION_SOURCE_UUID == result.uuid) {
			this.notification_source_characteristic = result.characteristic;
		}
		if (null == this.end_handle || this.end_handle < result.characteristic - 1) {
			this.end_handle = result.characteristic - 1;
		}
	}
	onGattRequestCompleted(container, result) {
		if ("services" == this.state) {
			if (null != this.end_handle) {
				this.changeState(container, "characteristics");
				var params = {
					connection: this.connection,
					start: this.start_handle,
					end: this.end_handle
				};
				Pins.invoke("/ble/gattDiscoverAllCharacteristics", params);
			}
		}
		else if ("characteristics" == this.state) {
			if (null == this.data_source_characteristic || null == this.notification_source_characteristic) {
				this.changeState(container, "Error");
			}
			else {
				let data = {
					connection: this.connection,
					data_source_characteristic: this.data_source_characteristic,
					notification_source_characteristic: this.notification_source_characteristic,
					control_point_characteristic: this.control_point_characteristic
				};
				this.changeState(container, "ready");
				container.bubble("onPeripheralPaired", data);
			}
		}
	}
	onGattServiceFound(container, result) {
		if (SERVICE_UUID == result.uuid) {
			this.start_handle = result.start;
			this.end_handle = result.end;
		}
	}
	onPeripheralConnected(container, peripheral) {
		this.connection = peripheral.connection;

		Pins.invoke("/ble/gapStopAdvertising");
		
		Pins.invoke("/ble/smSetSecurityParameter", { connection: this.connection, bonding: true });
		Pins.invoke("/ble/smStartEncryption", { connection: this.connection });
		this.changeState(container, "services");
	}
	onEncryptionCompleted(container, result) {
		Pins.invoke("/ble/gattDiscoverAllPrimaryServices", { connection:this.connection });
	}
	onUndisplayed(container) {
		Pins.invoke("/ble/gapStopAdvertising");
	}
};

class ANCSNotificationBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.count = 0;
		this.notifications = [];
	}
	onDisplayed(container) {
		// Enable notifications on data source
		let params = {
			connection: this.data.connection,
			characteristic: this.data.data_source_characteristic + 1,
			value: [0x01, 0x00]
		};
		Pins.invoke("/ble/gattWriteCharacteristicValue", params);
		
		// Enable notifications on notification source
		params.characteristic = this.data.notification_source_characteristic + 1;
		Pins.invoke("/ble/gattWriteCharacteristicValue", params);
	}
	onGattCharacteristicNotified(container, result) {
		let characteristic = result.characteristic;
		let notification = result.value;

		if (this.data.notification_source_characteristic == characteristic) {
			let notification = this.parseNotificationSourceNotification(result.value);
			
			if (EventID.NotificationRemoved == notification.eventID) {
				container.distribute("onNotificationRemoved", notification.notificationUID);
			}
			else if (EventID.NotificationAdded == notification.eventID) {
				let display = false;
				switch(notification.categoryID) {
					case CategoryID.IncomingCall:
					case CategoryID.Voicemail:
					case CategoryID.Email:
					case CategoryID.Social:	// text message
						display = true;
						break;
				}
				if (display) {
					let request = [
						CommandID.GetNotificationAttributes,
						notification.notificationUID[0], notification.notificationUID[1], notification.notificationUID[2], notification.notificationUID[3],
						NotificationAttributeID.Title, 100, 0,
						NotificationAttributeID.Message, 100, 0
					];
					let params = {
						connection: this.data.connection,
						characteristic: this.data.control_point_characteristic,
						value: request
					};
					Pins.invoke("/ble/gattWriteCharacteristicValue", params);
					
					this.notifications.push(notification);
				}
				else {
					trace("Unhandled notification: " + JSON.stringify(notification) + "\n");
				}
			}
		}
		else if (this.data.data_source_characteristic == characteristic) {
			let notification = this.parseDataSourceNotification(result.value);
			for (let i = 0; i < this.notifications.length; ++i) {
				if (uidMatch(this.notifications[i].notificationUID, notification.notificationUID)) {
					let title = "", message = "", icon, sound;
					for (let j = 0; j < notification.attributes.length; ++j) {
						let attribute = notification.attributes[j];
						if (NotificationAttributeID.Title == attribute.ID) {
							title = this.parseAttributeString(attribute);
						}
						else if (NotificationAttributeID.Message == attribute.ID) {
							message = this.parseAttributeString(attribute);
						}
					}
					switch(this.notifications[i].categoryID) {
						case CategoryID.IncomingCall:
							icon = mergeURI(application.url, "./assets/call.png");
							sound = mergeURI(application.url, "./assets/call.m4a");
							break;
						case CategoryID.Voicemail:
							icon = mergeURI(application.url, "./assets/voicemail.png");
							sound = mergeURI(application.url, "./assets/voicemail.m4a");
							break;
						case CategoryID.Email:
							icon = mergeURI(application.url, "./assets/email.png");
							sound = mergeURI(application.url, "./assets/email.m4a");
							break;
						case CategoryID.Social:
							icon = mergeURI(application.url, "./assets/message.png");
							sound = mergeURI(application.url, "./assets/message.m4a");
							break;
					}
					let data = { title:title, message:message, sound:sound, icon:icon, notificationUID:notification.notificationUID };
					let column = container.first.first;
					let scroller = container.first;
					if (0 == this.count++)
						column.empty();
					column.add(new ANCSNotificationLine(data));
					scroller.scrollTo(0, 0x7FFFF);
					break;
				}
			}
		}
	}
	parseAttributeString(attribute) {
		let string = decodeURIComponent("%" + attribute.data.map(i => i < 16 ? "0" + i.toString(16) : i.toString(16)).join("%"));
		return string;
	}
	parseDataSourceNotification(notification) {
		let index = 0;
		let length = notification.length;
		let result = {
			commandID: notification[index++],
			notificationUID: notification.slice(index, index + 4),
			attributes: []
		};
		index += 4;
		while (index < length) {
			let ID = notification[index++];
			let dataLength = notification[index++] | (notification[index++] << 8);
			let attribute = {
				ID: ID,
				length: dataLength,
				data: notification.slice(index, index + dataLength)
			}
			result.attributes.push(attribute);
			index += dataLength;
		}
		return result;
	}
	parseNotificationSourceNotification(notification) {
		let result = {
			eventID: notification[0],
			eventFlags: notification[1],
			categoryID: notification[2],
			categoryCount: notification[3],
			notificationUID: notification.slice(4, 8)
		};
		return result;
	}
};

class NotificationSoundBehavior extends Behavior {
	onCreate(media, data) {
		this.data = data;
	}
	onDisplaying(media) {
		media.url = this.data.sound;
	}
	onLoaded(media) {
		media.volume = 0.8;
		media.start();
	}
	onNotificationRemoved(media, notificationUID) {
		if (uidMatch(this.data.notificationUID, notificationUID))
			media.stop();
	}
};

// ----------------------------------------------------------------------------------
// layouts
// ----------------------------------------------------------------------------------

var ANCSDiscoveryContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, Behavior: ANCSDiscoveryBehavior,
	contents: [
		CREATIONS.BusyPicture($, { top:40 }),
		Label($, { left:20, right:20, bottom:5, style: statusStyle }),
	]
}));

var ANCSNotificationContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, Behavior: ANCSNotificationBehavior,
	contents: [
		SCROLLER.VerticalScroller($, {
			clip: true,
			contents: [
				Column($, {
					left:0, right:0, top:0,
					contents: [
						ANCSNoNotificationsLine($)
					]
				})
			]
		})
	]
}));

var ANCSNoNotificationsLine = Container.template($ => ({
	width:application.width, height:application.height - 32, style:noItemsStyle,
	contents: [
		Label($, { string:'No notifications' })
	]
}));

var ANCSNotificationLine = Column.template($ => ({
	left:0, right:0, top:0,
	contents: [
		Line($, {
			left:0, right:0, top:5,
			contents: [
				Picture($, { top:0, width:40, height:40, url:$.icon }),
				Column($, {
					left:0, right:0,
					contents: [
						Label($, { left:0, style:titleStyle, string:$.title }),
						Text($, { left:0, right:5, style:messageStyle, string:$.message }),
					]
				}),
				Media($, { Behavior:NotificationSoundBehavior, url:$.sound })
			]
		}),
		Content($, { left:0, right:0, top:5, height:1, skin:dividerSkin }),
	]
}));

var MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	Behavior: class extends Behavior {
		discover(container) {
			this.data.BODY.empty();
			this.data.BODY.add(new ANCSDiscoveryContainer(this.data));
		}
		onBackButton(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		}
		onCreate(container, data) {
			this.data = data;
		}
		onDisplaying(container) {
			this.discover(container);
		}
		onPeripheralPaired(container, data) {
			this.data.BODY.empty();
			this.data.BODY.add(new ANCSNotificationContainer(data));
		}
		onPeripheralDisconnected(container) {
			this.discover(container);
		}
	},
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			anchor:"BODY", left:0, right:0, top:32, bottom:0,
			contents: [
			]
		})
	]
}));

// ----------------------------------------------------------------------------------
// Application
// ----------------------------------------------------------------------------------

var uidMatch = function(uid1, uid2) {
	return (uid1[0] == uid2[0] && uid1[1] == uid2[1] && uid1[2] == uid2[2] && uid1[3] == uid2[3]);
}

application.behavior = Behavior({
	onBLENotification(response) {
		var notification = response.notification;

		//trace("response: " + JSON.stringify(response) + "\n");
		
		if ("gap/discover" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralDiscovered", peripheral);
		}
		else if ("gap/connect" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralConnected", peripheral);
		}
		else if ("gap/disconnect" == notification) {
			var connection = response.connection;
			application.distribute("onPeripheralDisconnected", connection);
		}
		else if ("gatt/service" == notification) {
			application.distribute("onGattServiceFound", response);
		}
		else if ("gatt/characteristic" == notification) {
			application.distribute("onGattCharacteristicFound", response);
		}
		else if ("gatt/characteristic/notify" == notification) {
			application.distribute("onGattCharacteristicNotified", response);
		}
		else if ("gatt/request/complete" == notification) {
			application.distribute("onGattRequestCompleted", response);
		}
		else if ("sm/encryption/complete" == notification) {
			application.distribute("onEncryptionCompleted", response);
		}
	},
	onLaunch(application) {
 		Pins.configure({
            ble: {
                require: "/lowpan/ble"
            }
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured(application, success) {		
		if (success) {
			this.data = {
				title: "ANCS Example",
				titleStyle: CREATIONS.blackDynamicHeaderTitleStyle
			};
		
			Pins.when("ble", "notification", this.onBLENotification);

			application.add(new MainScreen(this.data));
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	},
});
