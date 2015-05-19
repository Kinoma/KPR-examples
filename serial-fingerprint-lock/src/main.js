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

// Sounds from WavSource - http://www.wavsource.com/dis.htm

var THEME = require("themes/flat/theme");
var STHEME = require("themes/sample/theme");

THEME.dialogCaptionStyle = STHEME.dialogCaptionStyle;
THEME.dialogSubtitleStyle = STHEME.dialogSubtitleStyle;
THEME.dialogCommentStyle = STHEME.dialogCommentStyle;
THEME.headerTitleSkin = STHEME.headerTitleSkin;
THEME.cancellerSkin = STHEME.cancellerSkin;
THEME.dialogBoxSkin = STHEME.dialogBoxSkin;
THEME.topScrollerShadowSkin = STHEME.topScrollerShadowSkin;
THEME.bottomScrollerShadowSkin = STHEME.bottomScrollerShadowSkin;
THEME.DialogOpenTransition = STHEME.DialogOpenTransition;
THEME.DialogCloseTransition = STHEME.DialogCloseTransition;
THEME.emptySkin = STHEME.emptySkin;

var KEYBOARD = require("creations/keyboard");
var SKEYBOARD = require("mobile/keyboard");

KEYBOARD.hide = SKEYBOARD.hide;

var MODEL = require("mobile/model");
var CONTROL = require("mobile/control");
var DIALOG = require("mobile/dialog");
var TRANSITIONS = require("transitions");
var SCROLLER = require("mobile/scroller");
var BUTTONS = require("controls/buttons");
var CREATIONS = require("creations/creations");
var CDIALOG = require("creations/dialog");	
var SCREEN = require("mobile/screen");
var SENSOR = require("GT511C3");

include("bmp");

// ---------------------------------------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------------------------------------
var successTexture = new Texture("./assets/green-check.png");
var successSkin = new Skin({ texture: successTexture,  x:0, y:0, width:220, height:220, aspect: 'fit' });
var failTexture = new Texture("./assets/red-fail.png");
var failSkin = new Skin({ texture: failTexture,  x:0, y:0, width:220, height:220, aspect: 'fit' });

// ---------------------------------------------------------------------------------------------------------
// Skins
// ---------------------------------------------------------------------------------------------------------
var whiteSkin = new Skin("white");
var blackSkin = new Skin("black");
var separatorSkin = new Skin("silver");

// ---------------------------------------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------------------------------------
var promptStyle = new Style({ font:"28px", color:"black", horizontal:"center", vertical:"bottom" });
var instructionsStyle = new Style({ font:"26px", color:"black" });
var buttonStyle = new Style({font: "26px", color: "white"});
var titleStyle = new Style({font:"24px", color:"black", horizontal:"center", vertical:"middle", lines:"1"});
var listItemStyle = new Style({font:"28px", color:"black", horizontal:"left", vertical:"middle", lines:"1"});
var authorizedTitleStyle = new Style({ font:"bold 42px", color:"black", horizontal:"center", vertical:"middle" });
var authorizedCaptionStyle = new Style({ font:"28px", color:"black", horizontal:"center", vertical:"middle" });

// ---------------------------------------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------------------------------------
Handler.bind("/fingerPressed", {
	onInvoke: function(handler, message) {
        var response = message.requestObject;
        if (0 == response.parameter)
			application.distribute("onFingerPressed");
		else
			application.distribute("onFingerReleased");
	}
});

Handler.bind("/confirm", MODEL.DialogBehavior({
	onDescribe: function(query) {
        return {
            Dialog: CDIALOG.Box,
            action: query.action,
            items: [
				{
                    Item: DIALOG.Caption,
                    string: query.message
				},
            ],
            ok: "OK",
            cancel: "Cancel",
        };
	}
}));

Handler.bind("/delete_all", {
	onInvoke: function(handler, message) {
		handler.invoke(new MessageWithObject("pins:/fingerprint/delete_all"));
		application.distribute("onClearAll");
	}
});

// ---------------------------------------------------------------------------------------------------------
// Layouts
// ---------------------------------------------------------------------------------------------------------
var BackButtonHeader = CREATIONS.DynamicHeader.template(function($) { return {
	anchor:"HEADER",
	behavior: Object.create(Behavior.prototype, {
		onBackButtonTap: { value: function(container) {
			container.bubble("onBackButton");
		}}
	})
}});

// ---------------------------------------------------------------------------------------------------------
// Fingerprint registration instructions screen
// ---------------------------------------------------------------------------------------------------------
var EnrollInstructionsScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	behavior: Object.create(Behavior.prototype, {
		onBackButton: { value: function(container) {
			application.run(new TRANSITIONS.TimeTravel(), application.last, new ListScreen(model.data), { direction : "back", easeType : "sineEaseOut", duration : 500 } );
		}}
	}),
	contents: [
		BackButtonHeader($),
		BUTTONS.LabeledButton({ name : "Start"}, { 
			width: 90, bottom: 10, height: 30, style: buttonStyle,
			behavior: BUTTONS.LabeledButtonBehavior({
				onTap: function(button) {
					application.run(new TRANSITIONS.TimeTravel(), application.last, new EnrollScreen({title: "Register Fingerprint"}), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
				}
			})
		}),
		Text($, {
			left: 2, right: 2, style: instructionsStyle,
			string: "Fingerprint registration requires submitting your fingerprint three times. Tap the 'Start' button to begin."
		}),
	]
}});
					
// ---------------------------------------------------------------------------------------------------------
// Fingerprint registration screen
// ---------------------------------------------------------------------------------------------------------
var EnrollScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	behavior: Object.create(Behavior.prototype, {
		onBackButton: { value: function(container) {
			application.run(new TRANSITIONS.TimeTravel(), application.last, new ListScreen(model.data), { direction : "back", easeType : "sineEaseOut", duration : 500 } );
		}},
		onComplete: { value: function(container, message, result) {
			trace("onComplete: state = " + this.state + "\n");
			var state = this.state;
			switch(this.state) {
				case "initialize":
					var enrolledCount = result.parameter;
					this.ID = enrolledCount;
					trace("we have " + enrolledCount + " fingerprints enrolled\n");
					this.state = "enroll_start";
					break;
				case "enroll_start":
					this.state = "press1";
					break;
				case "capture1":
					this.state = "enroll1";
					break;
				case "enroll1":
					this.state = "remove1";
					break;
				case "capture2":
					this.state = "enroll2";
					break;
				case "enroll2":
					this.state = "remove2";
					break;
				case "capture3":
					this.state = "enroll3";
					break;
				case "enroll3":
					this.state = "image";
					break;
				case "image":
					this.state = "done";
					break;
			}
			if (state != this.state)
				this.onStateChange(result);
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
			this.container = container;
			this.state = "initialize";
			this.ID = 0;
			this.processing_finger = false;
			this.finger_pressed_pending = false;
			this.onStateChange();
		}},
		onFingerPressed: { value: function(container) {
			if (this.processing_finger) return;
			if (!("press1" == this.state || "press2" == this.state || "press3" == this.state)) return;
			this.processing_finger = true;
			this.finger_pressed_pending = false;
			container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=off&interval=200&callback=/fingerPressed"));
			switch(this.state) {
				case "press1":
					this.state = "capture1";
					break;
				case "press2":
					this.state = "capture2";
					break;
				case "press3":
					this.state = "capture3";
					break;
			}
			this.onStateChange();
		}},
		onFingerReleased: { value: function(container) {
			if (this.processing_finger) return;
			if (!("remove1" == this.state || "remove2" == this.state)) return;
			this.processing_finger = true;
			this.finger_pressed_pending = false;
			container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=off&interval=200&callback=/fingerPressed"));
			switch(this.state) {
				case "remove1":
					this.state = "press2";
					break;
				case "remove2":
					this.state = "press3";
					break;
			}
			this.onStateChange();
		}},
		onFinished: { value: function(container) {
			application.run(new TRANSITIONS.TimeTravel(), application.last, new KeyboardScreen(model.data.keyboard), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
		}},
		onStateChange: { value: function(result) {
			var container = this.container; 
			trace("State: " + this.state + "\n");
			switch(this.state) {
				case "initialize":
					container.invoke(new MessageWithObject("pins:/fingerprint/enroll_count"), Message.JSON);
					break;
				case "enroll_start":
					container.invoke(new MessageWithObject("pins:/fingerprint/enroll_start", this.ID), Message.JSON);
					break;
				case "press1":
					this.data.PROMPT.string = "Place finger on scanner (1)";
					this.finger_pressed_pending = true;
					container.invoke(new MessageWithObject("pins:/fingerprint/cmos_led", 1));
					container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=on&interval=200&callback=/fingerPressed"));
					break;
				case "capture1":
					container.invoke(new MessageWithObject("pins:/fingerprint/capture", 1), Message.JSON);
					break;
				case "enroll1":
					this.data.PROMPT.string = "Processing fingerprint...";
					container.invoke(new MessageWithObject("pins:/fingerprint/enroll", {pos: this.ID, index: 1}), Message.JSON);
					break;
				case "remove1":
					this.data.PROMPT.string = "Remove finger from scanner";
					this.processing_finger = false;
					this.finger_pressed_pending = true;
					container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=on&interval=200&callback=/fingerPressed"));
					break;
				case "press2":
					this.data.PROMPT.string = "Place finger on scanner (2)";
					this.processing_finger = false;
					this.finger_pressed_pending = true;
					container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=on&interval=200&callback=/fingerPressed"));
					break;
				case "capture2":
					container.invoke(new MessageWithObject("pins:/fingerprint/capture", 1), Message.JSON);
					break;
				case "enroll2":
					this.data.PROMPT.string = "Processing fingerprint...";
					container.invoke(new MessageWithObject("pins:/fingerprint/enroll", {pos: this.ID, index: 2}), Message.JSON);
					break;
				case "remove2":
					this.data.PROMPT.string = "Remove finger from scanner";
					this.processing_finger = false;
					this.finger_pressed_pending = true;
					container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=on&interval=200&callback=/fingerPressed"));
					break;
				case "press3":
					this.data.PROMPT.string = "Place finger on scanner (3)";
					this.processing_finger = false;
					this.finger_pressed_pending = true;
					container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=on&interval=200&callback=/fingerPressed"));
					break;
				case "capture3":
					container.invoke(new MessageWithObject("pins:/fingerprint/capture", 1), Message.JSON);
					break;
				case "enroll3":
					this.data.PROMPT.string = "Processing fingerprint...";
					container.invoke(new MessageWithObject("pins:/fingerprint/enroll", {pos: this.ID, index: 3}), Message.JSON);
					break;
				case "image":
					//this.data.PROMPT.string = "Getting image...";
        			container.invoke(new MessageWithObject("pins:/fingerprint/get_rawimage"), Message.JSON);
					break;
				case "done":
					this.data.PROMPT.string = "Your fingerprint!";
					var source = result.chunk;
					var width = 160;
					var height = 120;
					var bits = new Chunk(width * height * 4);
					var srcIndex = 0;
					var dstIndex = 0;
					for (var i = 0; i < height; ++i) {
						for (var j = 0; j < width; ++j) {
							var color = (255 - (source[srcIndex++] & 0xFF)) + 100;	// lighten
							if (color > 255) color = 255;
							bits[dstIndex++] = color;
							bits[dstIndex++] = color;
							bits[dstIndex++] = color;
							bits[dstIndex++] = 0xFF;
						}
					}
					var bmp = this.bmp = buildBMP32(bits, width, height);
					var url = getBMPUrl(this.ID);
					Files.writeChunk(url, bmp);
					model.data.id = this.ID;
					container.replace(container.first.next, new FingerprintPicture(url));
					container.time = 0;
					container.duration = 2500;
					container.start();
					break;
			}
		}},
		onUndisplayed: { value: function(container) {
			container.invoke(new MessageWithObject("pins:/fingerprint/cmos_led", 0));
			if (this.finger_pressed_pending)
				container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=off&interval=200&callback=/fingerPressed"));
		}},
	}),
	contents: [
		BackButtonHeader($),
		CREATIONS.BusyPicture($),
		Label($, { anchor:"PROMPT", left:10, right:10, bottom:5, style:promptStyle }),
	]
}});

// ---------------------------------------------------------------------------------------------------------
// Fingerprint picture - loads the picture from the provided url and rotates for display
// ---------------------------------------------------------------------------------------------------------
var FingerprintPicture = Picture.template(function($) { return {
	width:160, height:120,
	behavior: Object.create(Behavior.prototype, {
		onCreate: { value: function(picture, url) {
			picture.load(url);
		}},
		onLoaded: { value: function(picture) {
			picture.origin = {x: picture.width/2, y: picture.height/2};
			picture.rotation = 90;
		}},
	})
}});

// ---------------------------------------------------------------------------------------------------------
// Fingerprint verification screen
// ---------------------------------------------------------------------------------------------------------
var VerifyScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	behavior: Object.create(Behavior.prototype, {
		onBackButton: { value: function(container) {
			application.run(new TRANSITIONS.TimeTravel(), application.last, new ListScreen(model.data), { direction : "back", easeType : "sineEaseOut", duration : 500 } );
		}},
		onComplete: { value: function(container, message, result) {
			trace("onComplete: state = " + this.state + "\n");
			var state = this.state;
			switch(this.state) {
				case "capture":
					this.state = "identify";
					break;
				case "identify":
					this.state = "done";
					break;
			}
			if (state != this.state)
				this.onStateChange(result);
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
			this.container = container;
			this.state = "press";
			this.ID = 0;
			this.processing_finger = false;
			this.finger_pressed_pending = false;
			this.onStateChange();
		}},
		onFingerPressed: { value: function(container) {
			if (this.processing_finger) return;
			if (!("press" == this.state)) return;
			this.processing_finger = true;
			this.finger_pressed_pending = false;
			container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=off&interval=200&callback=/fingerPressed"));
			switch(this.state) {
				case "press":
					this.state = "capture";
					break;
			}
			this.onStateChange();
		}},
		onStateChange: { value: function(result) {
			var container = this.container; 
			trace("State: " + this.state + "\n");
			switch(this.state) {
				case "press":
					this.data.PROMPT.string = "Place finger on scanner";
					this.finger_pressed_pending = true;
					container.invoke(new MessageWithObject("pins:/fingerprint/cmos_led", 1));
					container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=on&interval=200&callback=/fingerPressed"));
					break;
				case "capture":
					container.invoke(new MessageWithObject("pins:/fingerprint/capture", 0), Message.JSON);
					break;
				case "identify":
					this.data.PROMPT.string = "Identifying fingerprint...";
					container.invoke(new MessageWithObject("pins:/fingerprint/identify"), Message.JSON);
					break;
				case "done":
					if (SENSOR.ACK_OK == result.response) {
						var id = result.parameter;
						for (var i = 0, items = model.data.items, c = items.length; i < c; ++i) {
							if (items[i].id == id) {
								unlockDoor();
								application.run(new TRANSITIONS.TimeTravel(), application.last, new VerificationResultScreen({title: model.data.title, result: "success", caption: items[i].caption}), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
								return;
							}
						}
					}
					application.run(new TRANSITIONS.TimeTravel(), application.last, new VerificationResultScreen({title: model.data.title, result: "fail", caption: "Fingerprint not recognized"}), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
					break;
			}
		}},
		onUndisplayed: { value: function(container) {
			container.invoke(new MessageWithObject("pins:/fingerprint/cmos_led", 0));
			if (this.finger_pressed_pending)
				container.invoke(new MessageWithObject("pins:/fingerprint/is_finger_pressed?repeat=off&interval=200&callback=/fingerPressed"));
		}},
	}),
	contents: [
		BackButtonHeader($),
		CREATIONS.BusyPicture($),
		Label($, { anchor:"PROMPT", left:10, right:10, bottom:5, style:promptStyle }),
	]
}});

// ---------------------------------------------------------------------------------------------------------
// Fingerprint scanner initialization screen
// ---------------------------------------------------------------------------------------------------------
var InitializeScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	behavior: Object.create(Behavior.prototype, {
		onComplete: { value: function(application, message, result) {
			switch(message.path) {
				case "/fingerprint/change_baudrate":
					application.invoke(new MessageWithObject("pins:/fingerprint/initialize"), Message.JSON);
					break;
				case "/fingerprint/initialize":
					application.time = 0;
					application.duration = 1000;
					application.start();
					break;
			}
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
		}},
		onDisplaying: { value: function(application) {
			this.data.PROMPT.string = "Initializing scanner";
	        application.invoke(new MessageWithObject("pins:/fingerprint/change_baudrate", 115200), Message.JSON);
		}},
		onFinished: { value: function(application) {
			application.replace(application.last, new ListScreen(model.data));
		}},
	}),
	contents: [
		BackButtonHeader($),
		CREATIONS.BusyPicture($),
		Label($, { anchor:"PROMPT", left:10, right:10, bottom:10, style:promptStyle }),
	]
}});

// ---------------------------------------------------------------------------------------------------------
// Keyboard entry screen - provides for entering a description for the registered fingerprint
// ---------------------------------------------------------------------------------------------------------
var KeyboardScreen = Container.template(function($, bmp) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	contents: [
		KEYBOARD.KeyboardScreen($, {
			behavior: Object.create(KEYBOARD.KeyboardScreenBehavior.prototype, {
				goBack: { value: function(container) {
					application.run(new TRANSITIONS.TimeTravel(), application.last, new ListScreen(model.data), { direction : "back", easeType : "sineEaseOut", duration : 500 } );
				}},
				onKeyboardCancel: { value: function(container, input) {
					application.invoke(new MessageWithObject("pins:/fingerprint/delete_one", model.data.id));
					Files.deleteFile(getBMPUrl(model.data.id));
					this.goBack(container);
				}},
				onKeyboardEnter: { value: function(container, input) {
					this.onKeyboardOK(container, input);
				}},
				onKeyboardOK: { value: function(container, input) {
					for (var i = 0, items = model.data.items, c = items.length; i < c; ++i) {
						if (items[i].id == model.data.id) {
							items.splice(i, 1);
							break;
						}
					}
					model.data.items.push({caption: input, id: model.data.id, url: getBMPUrl(model.data.id)});
					model.writePreferences(application, "fingerprints", model.data.items);
					model.data.keyboard.previousText = "";
					this.goBack(container);
				}},
			})
		})
	],
}});

// ---------------------------------------------------------------------------------------------------------
// Fingerprint verification result screen
// ---------------------------------------------------------------------------------------------------------
var VerificationResultScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	behavior: Object.create(Behavior.prototype, {
		onBackButton: { value: function(container) {
			application.run(new TRANSITIONS.TimeTravel(), application.last, new ListScreen(model.data), { direction : "back", easeType : "sineEaseOut", duration : 500 } );
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
		}},
		onDisplaying: { value: function(container) {
			if ("success" == this.data.result) {
				this.data.RESULT.string = "Authorized!";
				this.data.ICON.skin = successSkin;
			}
			else {
				this.data.RESULT.string = "Unauthorized!";
				this.data.ICON.skin = failSkin;
			}
			this.data.CAPTION.string = this.data.caption;
		}},
		onDisplayed: { value: function(container) {
			if ("success" == this.data.result)
				this.data.SOUND.url = mergeURI(application.url, "./assets/cheering.wav");
			else
				this.data.SOUND.url = mergeURI(application.url, "./assets/buzzer_x.wav");
			container.time = 0;
			container.duration = 4500;
			container.start();
		}},
		onFinished: { value: function(container) {
			this.onBackButton(container);
		}}
	}),
	contents: [
		BackButtonHeader($),
		Column($, {
			left:0, right:0, top: 40, height: 180,
			contents: [
				Label($, {anchor: "RESULT", left:0, right:0, style: authorizedTitleStyle}),
				Container($, {
					width: 120, height: 120,
					contents: [
						Content($, {anchor: "ICON", width: 80, height: 80}),
					]
				}),
				Label($, {anchor: "CAPTION", left:0, right:0, style: authorizedCaptionStyle}),
			]
		}),
		Media($, {
			anchor: "SOUND",
			behavior: Object.create(Behavior.prototype, {
				onLoaded: { value: function(media) {
					media.volume = 0.5;
					media.start();
				}},
				onUndisplayed: { value: function(media) {
					media.url = null;
				}},
			})
		})
	]
}});

// ---------------------------------------------------------------------------------------------------------
// Registered fingerprint listing screen
// ---------------------------------------------------------------------------------------------------------
var ListItem = Column.template(function($) { return {
	left: 0, right: 0,
	contents: [
		Line($, {
			left:0, right:0, height: 55,
			contents: [
				Picture($, {
					left: -10, width: 55, height: 55, aspect: "fit",
					behavior: Object.create(Behavior.prototype, {
						onCreate: { value: function(picture, data) {
							picture.url = data.url;
						}},
						onLoaded: { value: function(picture) {
							picture.origin = {x: picture.width/2, y: picture.height/2};
							picture.rotation = 90;
						}}
					}),
				}),
				Label($, {left: 8, right: 0, style: listItemStyle, string: $.caption})
			]
		}),
		Line($, {left: 0, right: 0, height: 1, skin: separatorSkin})
	]
}});

var ListEmptyItem = Label.template(function($) { return {
	left: 0, right: 0, top: 70,
	style: titleStyle,
	string: "No fingerprints registered"
}});

var ListScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: whiteSkin,
	behavior: Object.create(Behavior.prototype, {
		onBackButton: { value: function(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		}},
		onDisplaying: { value: function(container) {
			lockDoor();
		}}
	}),
	contents: [
		BackButtonHeader($),
		Scroller($, {
			left: 0, right: 0, top: 32, bottom: 40, active: true, clip: true,
			behavior: SCROLLER.VerticalScrollerBehavior({
			}),
			contents: [
				Column($, {
					left:0, right:0, top:0,
					behavior: SCREEN.ListBehavior({
						addEmptyLine: function(list) {
							list.add(new ListEmptyItem);
						},
						addItemLine: function(list, item) {
							list.add(new ListItem(item));
						},
						onClearAll: function(list) {
							for (var i = 0, items = model.data.items, c = items.length; i < c; ++i) {
								Files.deleteFile(items[i].url);
							}
							this.data.items = model.data.items = [];
							model.writePreferences(application, "fingerprints", model.data.items);
							list.empty();
							this.addLines(list, this.data.items, this.data.more);
						}
					}),
				}),
				SCROLLER.TopScrollerShadow($),
				SCROLLER.BottomScrollerShadow($)
			]
		}),
		Line($, {
			anchor:"FOOTER", left:0, right:0, bottom:0, height: 40, skin: blackSkin,
			contents: [
				BUTTONS.LabeledButton({name : "Register"}, { 
					left: 5, right: 5, width: 90, height: 30, style: buttonStyle,
					behavior: BUTTONS.LabeledButtonBehavior({
						onTap: function(button) {
							application.run(new TRANSITIONS.TimeTravel(), application.last, new EnrollInstructionsScreen(model.data), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
						}
					})
				}),
				BUTTONS.LabeledButton({name : "Authorize"}, { 
					left: 5, right: 5, width: 90, height: 30, style: buttonStyle,
					behavior: BUTTONS.LabeledButtonBehavior({
						onTap: function(button) {
							application.run(new TRANSITIONS.TimeTravel(), application.last, new VerifyScreen(model.data), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
						}
					})
				}),
				BUTTONS.LabeledButton({name : "Clear"}, { 
					left: 5, right: 5, width: 90, height: 30, style: buttonStyle,
					behavior: BUTTONS.LabeledButtonBehavior({
						onTap: function(button) {
							var url = "/confirm?" + serializeQuery({
								message: "Clear all saved fingerprints?",
								action: "/delete_all"
							});
							button.invoke(new Message(url));
						}
					})
				}),
			]
		})
	],
}});

// ---------------------------------------------------------------------------------------------------------
// Application behavior
// ---------------------------------------------------------------------------------------------------------
var model = application.behavior = Object.create(MODEL.ApplicationBehavior.prototype, {
	onComplete: { value: function(application, message) {
		trace("onComplete\n");
		application.add(new InitializeScreen(model.data));
	}},
	onLaunch: { value: function(application) {
		this.data = {
        	keyboard: {
				title: "Register Fingerprint",
				okLabel: "OK",
				cancelLabel: "Cancel",
				previousText: "",
				keyboard: KEYBOARD.standardKeyboard,
				hintText: "Enter a title for the fingerprint",
        	},
        	title: "Fingerprint Authentication",
        	items: this.readPreferences(application, "fingerprints", []),
        	more: false,
        	id: -1
		};
		
		// Configure PinMux
		// Both front headers set to +5V
		// Pin 51: digital out
		// Pin 65: ground
		// Pin 66: power
		var PinType = {
			disconnected: 0,
			power: 1,
			ground: 2,
			analog: 3,
			digitalIn: 4,
			digitalOut: 5,
			i2cClock: 6,
			i2cData: 7
		};

		var pinConfiguration = JSON.stringify({
			port0: [PinType.digitalOut, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected], 
			port1: [PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.disconnected, PinType.ground, PinType.power], 
			leftVoltage: 0,		// 5 volts
			rightVoltage: 0		// 5 volts
		});

		var message = new Message("xkpr://shell/settings/pinmux");
		message.method = "PUT";
		message.setRequestHeader("Content-Type", "application/json");
		message.requestText = pinConfiguration;
		application.invoke(message);

		// Configure fingerprint scanner and solenoid BLLs
        application.invoke(new MessageWithObject("pins:configure", {
            fingerprint: {
                require: "GT511C3",
                pins: {
                    scanner: {tx: 31, rx: 33},
                }
            },
            door: {
                require: "solenoid",
                pins: {
		            solenoid: {pin: 51}
                }
            },
		}), Message.JSON);
    }},
	onQuit: { value: function(application) {
    }}
});

var getBMPUrl = function(id) {
	var url = mergeURI(Files.documentsDirectory, "fingerprint" + id + ".bmp");
	return url;
}

var lockDoor = function() {
	application.invoke(new MessageWithObject("pins:/door/lock"));
}

var unlockDoor = function() {
	application.invoke(new MessageWithObject("pins:/door/unlock"));
}

application.style = new Style({ font: "16px Fira Sans" });

