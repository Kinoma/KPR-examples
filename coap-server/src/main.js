/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
import SERVER from 'server';
import CIRCLE_SLIDER from 'slider';
import Pins from 'pins';

/* Skins and styles */
var backgroundSkin = new Skin({ fill: '#F0F0F0',});
var sideBoardSkin = new Skin({ fill: '#cccccc',});
var colorTipBoarderSkin = new Skin({ fill: '#888',});

var statLabelStyle = new Style({ color: 'gray', font: 'bold 18px', horizontal: 'right', vertical: 'top', lines: 1, });
var statValueStyle = new Style({ color: 'black', font: 'bold 24px', horizontal: 'right', vertical: 'top', lines: 1, });
var titleStyle = new Style({ color: 'black', font: 'bold 24px', horizontal: 'left', vertical: 'top', lines: 1, });
var clockStyle = new Style({ color: '#444', font: 'bold 24px', horizontal: 'right', vertical: 'top', lines: 1, });

/* Miscellaneous functions */
function updateColorTip() {
	var color = SERVER.color;
	Pins.invoke("/led/write", color);
	colorTip.skin = new Skin("rgb(" + color.red + "," + color.green + "," + color.blue + ")");
}

/* UI templates */
var CircleSlider = CIRCLE_SLIDER.CircleSlider.template($ =>({ left: MARGIN, right: MARGIN, top: MARGIN, bottom: MARGIN }));

var MainContainer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: sideBoardSkin, 
	contents: [
		Column($, { 
			left: 0, right: 100, top: 24, bottom: 24, skin: backgroundSkin, anchor: 'MAIN_STAGE', 
			Behavior: class extends Behavior {
					onChanged(canvas, value, color) {
					SERVER.color[color] = Math.floor(value);
					updateColorTip();
					SERVER.broadcastColorToListeners();
				}
			}
		}),
		Column($, { 
			width: 100, right: 0, top: 0, bottom: 24, anchor: 'SIDE_BOARD', 
			contents: [
				Text($, { left: 18, right: 8, top: 0, height: 20, style: clockStyle, anchor: 'CLOCK' }),
				Container($, { 
					left: 18, right: 8, top: 8, height: 74, skin: colorTipBoarderSkin, 
					contents: [ Content($, { left: 2, right: 2, top: 2, bottom: 2, anchor: 'COLOR_TIP' }) ], 
				}),
				Text($, { left: 18, right: 8, top: 8, anchor: 'STATS', }),
			], 
		}),
		Text($, { 
			left: 8, right: 100, top: 0, height: 24, style: titleStyle, 
			Behavior: class extends Behavior {
				onDisplaying(text) {
					text.invoke(new Message("xkpr://shell/settings/name"), Message.JSON);
				}
				onComplete(text, message, value) {
					var TITLE_PREFIX = "Server: ", name;

					if (value && value != "None") {
						name = value;
					} else {
						var suffix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
						var index = Math.floor(Math.random() * suffix.length);
						name = "Color Server " + suffix[index];
					}

					SERVER.setName(name);
					text.string = TITLE_PREFIX + name;
				}
			}
		}),
		Text($, { 
			left: 8, right: 8, height: 24, bottom: 0, style: titleStyle, 
			Behavior: class extends Behavior {
				onDisplaying(text) {
					if (CoAP) {
						text.invoke(new Message("xkpr://wifi/status"), Message.JSON);
					} else {
						text.string = "CoAP is disabled";
					}
				}
				onComplete(text, message, json) {
					if (json && ("ip_address" in json)) {
						text.string = 'coap://' + json.ip_address + '/color';
					}
				}
			}
		}),
	], 
}));


/* Application set-up */
var CIRCLE_RADIUS = 20;
var MARGIN = 8;

var redSliderData = {
	label:"red",
	min:0,
	max:255,
	value:0,
	circleColor: "red",
	strokeColor: "#8E9595",
	strokeWidth: 8,
	radius: CIRCLE_RADIUS
};

var greenSliderData = {
	label:"green",
	min:0,
	max:255,
	value:0,
	circleColor: "green",
	strokeColor: "#8E9595",
	strokeWidth: 8,
	radius: CIRCLE_RADIUS
};

var blueSliderData = {
	label: "blue",
	min:0,
	max:255,
	value:0,
	circleColor: "blue",
	strokeColor: "#8E9595",
	strokeWidth: 8,
	radius: CIRCLE_RADIUS
};

var data = {};

var mainContainer = new MainContainer(data);

var mainStage = data.MAIN_STAGE;
var sideBoard =  data.SIDE_BOARD;
var colorTip = data.COLOR_TIP;
var clock = data.CLOCK;

var statsText = this.statsText = data.STATS;

var redSlider = new CircleSlider( redSliderData );
var greenSlider = new CircleSlider( greenSliderData );
var blueSlider = new CircleSlider( blueSliderData );

mainStage.add( redSlider );
mainStage.add( greenSlider );
mainStage.add( blueSlider );

application.add( mainContainer );

var ApplicationBehavior = Behavior.template({
	onLaunch: function(application) {
		try {
			if (!CoAP) CoAP = null;
		} catch (e) {
			CoAP = null;
		}
		
		// test if CoAP extension are loaded.
		try {
			SERVER.start(model);
		} catch (e) {
			trace(e + "\n");
		}
		
		// Sample CoAP request to the external world
		if (CoAP) {
			var client = new CoAP.Client();
		
			var request = client.createRequest("coap://iot.eclipse.org/obs", 'GET');
			request.token = 'clock';
			request.observe = true;
			request.onResponse = function(response) {
				moodel.clock.string = response.payload;
		
				SERVER.stats.received += 1;
				model.onUpdateStats();
			};
			SERVER.stats.sent += 1;
			client.send(request);
		}
		
		application.shared = true;
		updateColorTip();
		
		this.onUpdateStats();

		Pins.configure({
			led: {
				require: "led",
				pins: {
					red: { pin: 51 },
					green: { pin: 53 },
					blue: { pin: 54 },
					anode: { pin: 52 },
				}
			}
		}, success => this.onPinsConfigured(application, success));
	},
	onPinsConfigured: function(application, success) {
		if (success) {
			Pins.share("ws", {zeroconf: true, name: "i2c-color-sensor"});
		} else {
			trace("failed to configure pins\n");
		}
	},
	onQuit: function(application) {
		application.shared = false;
	},
	onUpdateStats: function(application) {
		statsText.format([
			{spans:[
				{
					style: statLabelStyle,
					string: 'Received',
				},
			]},
			{spans:[
				{
					style: statValueStyle,
					string: '' + SERVER.stats.received,
				},
			]},
			{spans:[
				{
					style: statLabelStyle,
					string: 'Sent',
				},
			]},
			{spans:[
				{
					style: statValueStyle,
					string: '' + SERVER.stats.sent,
				},
			]},
		]);
	},
	onUpdateColors: function(application) {
		updateColorTip();

		var color = SERVER.color;
		redSlider.delegate('setValue', color.red);
		greenSlider.delegate('setValue', color.green);
		blueSlider.delegate('setValue', color.blue);
	},
})
var model = application.behavior = new ApplicationBehavior();



