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
var THEME = require ("themes/flat/theme");
var KEYBOARD = require("creations/keyboard");
var CONTROL = require("mobile/control");
var SLIDERS = require("controls/sliders");
var TRANSITIONS = require("transitions");
var S7S = require("s7s");

// styles
var errorStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });
var buttonStyle = new Style({ font:"bold 24px", color:["white","white","black"], horizontal:"center" });

// layouts
var Button = Container.template(function($) { return {
	width:160, height:40, active:true, skin:THEME.buttonSkin,
	behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
		onTap: { value: function(container) {
			application.run(new TRANSITIONS.TimeTravel(), application.last, new KeyboardScreen(model.data.keyboard), { direction : "forward", easeType : "sineEaseIn", duration : 500 } );
		}},
	}),
	contents: [
		Label($, { top:0, bottom:0, style:buttonStyle, string:$.string }),
	]
}});

var MainScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({fill: "#c6faff"}),
	contents: [
		Button({ string:"Display message" }),
		SLIDERS.HorizontalSlider($.brightness, {
			height:50, left:50, right:50, bottom:20,
			behavior: Object.create(SLIDERS.HorizontalSliderBehavior.prototype, {
				onTouchEnded: { value: function(container, id, x, y, ticks) {
					SLIDERS.HorizontalSliderBehavior.prototype.onTouchEnded.call(this, container, id, x, y, ticks);
        			container.invoke(new MessageWithObject("pins:/S7S/brightness", this.data.value));
				}}
			})
		}),
		Label($, { bottom:10, style:buttonStyle, style: new Style({ font:"22px", color:"black", horizontal:"center" }), string:"Adjust brightness" }),
	],
}});

var KeyboardScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({fill: "white"}),
	contents: [
		KEYBOARD.KeyboardScreen($, {
			behavior: Object.create(KEYBOARD.KeyboardScreenBehavior.prototype, {
				goBack: { value: function(container) {
					application.run(new TRANSITIONS.TimeTravel(), application.last, new MainScreen(model.data), { direction : "back", easeType : "sineEaseOut", duration : 500 } );
				}},
				onKeyboardCancel: { value: function(container, input) {
					this.goBack(container);
				}},
				onKeyboardEnter: { value: function(container, input) {
					this.onKeyboardOK(container, input);
				}},
				onKeyboardOK: { value: function(container, input) {
					application.distribute("onTextEntered", input);
					model.data.keyboard.previousText = "";
					this.goBack(container);
				}},
			})
		})
	],
}});

// model
var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            application.skin = new Skin({ fill: "#f78e0f" });
            application.add(new Label({ left:0, right:0, style: errorStyle, string:"Error " + message.error }));
            return;
        }

		// Display the keyboard screen
		application.add(new MainScreen(this.data));

		// Clear the display and set the display to full brightness level
        application.invoke(new MessageWithObject("pins:/S7S/clear"));
        application.invoke(new MessageWithObject("pins:/S7S/brightness", this.data.brightness.value));
        
        // Display the clock
        this.onTimeChanged(application);
		application.interval = 1000;
		application.start();
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            S7S: {
                require: "s7s",
                pins: {
                    display: {tx: 31}
                }
            }}), Message.JSON);

        this.data = {
        	clock: true,
        	colon: true,
        	keyboard: {
				title: "Display",
				okLabel: "OK",
				cancelLabel: "Cancel",
				previousText: "",
				keyboard: KEYBOARD.standardKeyboard,
				hintText: "Enter text to display"
        	},
        	brightness: {
        		min: 0,
        		max: 1,
        		value: 1
        	},
        	ticker: {
        		started: false,
        		string: ""
        	}
        };
    }},
	onTextEntered: { value: function(application, input) {
        application.invoke(new MessageWithObject("pins:/S7S/clear"));
        application.interval = 500;
		this.data.clock = false;
		this.data.ticker.string = input;
	}},
	onTimeChanged: { value: function(application) {
		if (this.data.clock)
			this.updateClock(application);
		else
			this.updateTicker(application);
	}},
	updateClock: { value: function(application) {
		var date = new Date();
		var hours = String(date.getHours());
		var minutes = String(date.getMinutes());
		if ( 1 == hours.length )
			hours = ' ' + hours;
		if ( 1 == minutes.length )
			minutes = '0' + minutes;
		var time = hours + minutes;
		
		// display the time string
        application.invoke(new MessageWithObject("pins:/S7S/writeString", time));

        // blink the colon
        if (this.data.colon)
        	application.invoke(new MessageWithObject("pins:/S7S/writeDecimalControl", S7S.COLON_BIT_MASK));
        else
        	application.invoke(new MessageWithObject("pins:/S7S/writeDecimalControl", 0));
        this.data.colon = !this.data.colon;
	}},
	updateTicker: { value: function(application) {
		var ticker = this.data.ticker;
		var string = ticker.string;
		if (!ticker.started) {
			string = "   " + string;
			ticker.started = true;
		}
		else {
			string = string.slice(1);
		}
		if (string.length) {
			var length = string.length;
			ticker.string = string;
			if (length < 4) {
				for (var i = 0; i < length; ++i) {
					string += " ";
				}
			}
        	application.invoke(new MessageWithObject("pins:/S7S/writeString", string.slice(0, 4)));
		}
		else {
        	application.invoke(new MessageWithObject("pins:/S7S/clear"));
			ticker.started = false;
			this.data.clock = this.data.colon = true;
			application.interval = 1000;
		}
	}},
});

application.style = new Style({ font: "16px Fira Sans" });

