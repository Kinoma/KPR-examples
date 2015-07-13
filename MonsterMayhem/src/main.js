//@program

/**********
 * IMPORTS
 */
 
var THEME = require('themes/sample/theme');
var TRANSITIONS = require("transitions");
var SCROLLER = require("mobile/scroller");

var NFCHELP = require("NFCHelper")
var MONSTERSELECT = require("MonsterSelect.js");
var MONSTERSTATUS = require("MonsterStatus.js");

/**********
 * SKINS AND STYLES
 */
 
var headerSkin = new Skin({ fill: "#76b321", stroke: "#f78e0f", borders: {bottom: 5}});
var titleText = new Style({color: "white", font: "bold 40px fira sans", horizontal: "center", vertical: "center"});

/**********
 * GUI TEMPLATES
 */
 
var TitleLabel = Label.template(function($) {

	return {
		left: 0, right:0, top:0, height: 50,
		string: $.string,
		style: titleText,
		skin: headerSkin,
	}
})

function makePicture(path, aspect) {
	return new Picture({
		top: 0, left: 0, bottom: 0, right: 0,
		aspect: aspect ? aspect : "fill",
		url: mergeURI(application.url, path)
	});
}

var Pictures = {};
Pictures.instructions = makePicture("assets/instructions.png");

function instructions() {

	var stripBehavior = Behavior({
		onCreate: function(strip) {
			this.forward = true;
			this.index = 0;
			this.previousIndex = undefined;
			strip.duration = 300;
		},
		onDisplayed: function(strip) {
			strip.start();
		},
		onFinished: function(strip) {
			this.previousIndex = this.index;
			if (this.forward) {
				if (7 == this.index) {
					this.forward = false;
					this.index = 6;
				} else {
					this.index += 1;
				}
			} else {
				if (0 == this.index) {
					this.forward = true;
					this.index = 1;
				} else {
					this.index -= 1;
				}
			}
			strip.time = 0;
			strip.start();
		},
		onTimeChanged: function(strip) {
			strip.invalidate();
		},
		onDraw: function(strip) {
			var h = Pictures.instructions.height / 8;
			strip.drawImage(Pictures.instructions, 0, 0, 320, 240, 0, h * this.index, Pictures.instructions.width, h);
			if (undefined != this.previousIndex) {
				if (strip.fraction < 0.5) {
					strip.opacity = 1 - strip.fraction;
					strip.drawImage(Pictures.instructions, 0, 0, 320, 240, 0, h * this.previousIndex, Pictures.instructions.width, h);
					strip.opacity = 1;
				}
			} 
		}
	});
	
	return new Port({top: 0, left: 0, bottom: 0, right: 0, behavior: stripBehavior}); 
}

var HomeScreenTemplate = new Column.template(function($){

	return{
		left: 0, right: 0, top: 0, bottom: 0,
		behavior: Behavior({
			onNFCFound: function(content, data) {
				// read nfc data
				if (!data.commandData || !data.commandData.tries || data.commandData.tries == 0 || data.commandData.gum) {
					var oldScreen = currentScreen;
					currentScreen = new MONSTERSELECT.Screen(data.commandData);
					application.run(new TRANSITIONS.CrossFade(), oldScreen, currentScreen, {duration: 500});
				} else {
					var oldScreen = currentScreen;
					currentScreen = new MONSTERSTATUS.Screen(data.commandData);
					application.run(new TRANSITIONS.CrossFade(), oldScreen, currentScreen, {duration: 500});
				}
			},
		}),
		contents: [
			new TitleLabel({string:"Place card on reader"}),
			instructions()
		]
	}
});

/*********
 * GUI/APPLICATION COMMANDS
 */

var currentScreen = new HomeScreenTemplate();
application.behavior = Behavior({	
	onLaunch: function(application, data) {
		application.add(currentScreen);
		
		var message = new MessageWithObject("pins:configure", {
			nfc: {
				require: "PN532",
				pins: {
					data: {sda: 27, clock: 29}
				}
			}
		});
		
		application.invoke(message, Message.TEXT);
	},
	onComplete: function(application, message, text) {
		//poll only returns if they change, getcard just constantly polls
		application.invoke(new MessageWithObject("pins:/nfc/poll?repeat=on&callback=/nfc&interval=100", 
			{command: "mifare_ReadString", commandParams: {page: 16, token: null, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]}}));
	}
});
