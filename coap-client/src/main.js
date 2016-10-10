/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
import Pins from 'pins';
import CLIENT from 'client';
import DEBUG from 'debug';
import CIRCLE_SLIDER from 'slider';
import MODEL  from 'mobile/model';
import CONTROL from 'mobile/control';

/* Uncomment the following line to disable debug information */
// DEBUG.active = false;

/* Skins and styles */
var backgroundSkin = new Skin({ fill: '#F0F0F0',});
var sideBoardSkin = new Skin({ fill: '#cccccc',});
var colorTipBoarderSkin = new Skin({ fill: '#888',});
var tabButtonSkin = new Skin({ fill: ['#444', '#888', 'black'], });
var tabButtonActiveSkin = new Skin({ fill: ['#444', 'black', 'black'], });
var statLabelStyle = new Style({ color: 'gray', font: 'bold 18px', horizontal: 'right', vertical: 'top', lines: 1, });
var statValueStyle = new Style({ color: 'black', font: 'bold 20px', horizontal: 'right', vertical: 'top', lines: 1, });
var tabButtonStyle = new Style({ color: ['#888', 'white', 'white'],  font: 'bold' });
var titleStyle = new Style({ color: 'black', font: 'bold 18px', horizontal: 'center', lines: 1, });
var commentStyle = new Style({ color: 'gray', font: '14px', horizontal: 'center', lines: 1, });

/* Handlers */
Handler.bind("/discover", Behavior({
	onInvoke: function(handler, message) {
		var info = JSON.parse(message.requestText);
		CLIENT.discoverServer(info);
	},
}));

Handler.bind("/forget", Behavior({
	onInvoke: function(handler, message) {
		var info = JSON.parse(message.requestText);
		CLIENT.forgetServer(info);
	},
}));

/* Miscellaneous functions */
function updateColors() {
	updateColorTip();
	application.distribute('onColorChanged');
}

function updateColorTip() {
	application.distribute('updateColorTip');
}

function updateStats() {
	application.distribute('updateStats');
}

function colorToSkin(color) {
	return new Skin("rgb(" + color.red + "," + color.green + "," + color.blue + ")", {left:2, top:2, bottom:2, right:2}, ['rgba(0,0,0,0)', '#888', '#444']);
}

/* UI templates */
var MainContainer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: sideBoardSkin, 
	contents: [
		Container($, { left: 0, right: 100, top: 0, bottom: 35, skin: backgroundSkin, anchor: 'STAGE', }),
		Line($, { 
			left: 8, right: 0, height: 35, bottom: 0, 
			Behavior: class extends Behavior {
				onCreate(line, data) {
					this.data = data;
					this.tab = 0;

					var tabs = [
						{ Pane: ColorPallettePane, label: "Palette", selected: true },
						{ Pane: ColorSliderPane, label: "Slider" },
						{ Pane: SensorPane, label: "Sensor" },
					];

					tabs.forEach(function(item, index) {
						var tab = new TabButton(item);
						line.add(tab);
					});

					this.installPane(line, tabs[0]);
				}
				onTabTap(line, tab) {
					this.installPane(line, tab);
				}
				installPane(line, data) {
					var stage = this.data.STAGE;

					var pane = new data.Pane(data);
					if (stage.first) stage.remove(stage.first);
					stage.add(pane);
				}
				updateColorTip() {
					this.data.COLOR_TIP.skin = colorToSkin(CLIENT.color);
				}
				updateStats(line) {
					this.data.STATS.format([
						{spans:[
							{
								style: statLabelStyle,
								string: 'Server',
							},
						]},
						{spans:[
							{
								style: statValueStyle,
								string: CoAP ? (CLIENT.stats.server ? CLIENT.stats.server : "- none -") : "No CoAP",
							},
						]},
						{spans:[
							{
								style: statLabelStyle,
								string: 'Received',
							},
						]},
						{spans:[
							{
								style: statValueStyle,
								string: '' + CLIENT.stats.received,
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
								string: '' + CLIENT.stats.sent,
							},
						]},
					]);
				}
			}
		}),
		Column($, { width: 100, right: 0, top: 0, bottom: 35, skin: backgroundSkin, contents: [
			Container($, { left: 8, right: 8, top: 8, height: 64, skin: colorTipBoarderSkin, contents: [
				Content($, { left: 0, right: 0, top: 0, bottom: 0, anchor: 'COLOR_TIP', }),
			], }),
			Text($, { left: 8, right: 8, top: 8, anchor: 'STATS', }),
		], }),
	], 
}));

var TabButton = Container.template($ => ({ 
	left: 0, right: 8, top: 0, bottom: 0, active: true, skin: tabButtonSkin, 
	Behavior: class extends CONTROL.ButtonBehavior {
		onCreate(container, data) {
			this.data = data;
			if ('selected' in data && data.selected) container.skin = tabButtonActiveSkin;
		}
		onTap(container) {
			var button = container.container.first;
			while (button) {
				button.skin = (button == container) ? tabButtonActiveSkin : tabButtonSkin;
				button = button.next;
			}
			container.bubble('onTabTap', this.data);
		}
	}, 
	contents: [
		Label($, { style: tabButtonStyle, string: $.label, }),
	], 
}));

var ColorPallettePane = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: class extends Behavior {
		onCreate(column, data) {
			this.data = data;

			var x = 10, y = 10;

			data.colors = [];
			for (var i = 0; i < 16; i++) {
				data.colors.push({ red:Math.floor(Math.random() * 256),  green:Math.floor(Math.random() * 256),  blue:Math.floor(Math.random() * 256) });
			}

			data.colors.forEach(function(color, index) {
				var button = new ColorTipButton({color:color}, {left:x, top:y, width: 40, height:40});
				column.add(button);
				if (((index + 1) % 4) == 0) {
					x = 10;
					y += 50;
				} else {
					x += 50;
				}
			});
		}
	}, 
}));

var ColorTipButton = Container.template($ => ({ 
	active: true, 
	Behavior: class extends CONTROL.ButtonBehavior{
		onCreate(container, data) {
			this.data = data;
			container.skin = colorToSkin(this.data.color);
		}
		onTap(container) {
			CLIENT.setColor(this.data.color);
			CLIENT.sendColor();
			updateColorTip();
		}
	} 
}));

var ColorSliderPane = Column.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: class extends Behavior {
		onCreate(column, data) {
			this.data = data;

			var sliders = [
				{
					label:"red",
					value: CLIENT.color.red,
					circleColor: "red",
				}, {
					label:"green",
					value: CLIENT.color.green,
					circleColor: "green",
				}, {
					label: "blue",
					value: CLIENT.color.blue,
					circleColor: "blue",
				}
			];

			data.RED = this.installSlider(column, sliders[0]);
			data.GREEN = this.installSlider(column, sliders[1]);
			data.BLUE = this.installSlider(column, sliders[2]);
		}
		installSlider(column, data) {
			data.min = 0;
			data.max = 255;
			data.strokeColor = "#8E9595";
			data.strokeWidth = 10;
			data.radius = 25;

			var slider = new CircleSlider(data);
			column.add(slider);
			return slider;
		}
		onChanged(canvas, value, color) {
			CLIENT.setColor(color, Math.floor(value));
			CLIENT.sendColor();
			updateColorTip();
		}
		onColorChanged(column) {
			var color = CLIENT.color;
			this.data.RED.distribute('setValue', color.red);
			this.data.GREEN.distribute('setValue', color.green);
			this.data.BLUE.distribute('setValue', color.blue);
		}
	}, 
}));

var CircleSlider = CIRCLE_SLIDER.CircleSlider.template($ =>({ left: 8, right: 0, top: 4, bottom: 0, }));

var SensorPane = Column.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: class extends Behavior {
		onDisplaying(column) {
			model.previousSensorColor = Object.create(CLIENT.color);
			Pins.invoke("/light/LEDOn");
			this.repeater = Pins.repeat("/light/getColor", 200, result => {
				var prev = model.previousSensorColor;

				var factor = 0.3
				var red = Math.floor(prev.red * factor + result.r * (1 - factor));
				var green = Math.floor(prev.green * factor + result.g * (1 - factor));
				var blue = Math.floor(prev.blue * factor + result.b * (1 - factor));

				if (red != prev.red || green != prev.green || blue != prev.blue) {
					prev.red = red;
					prev.green = green;
					prev.blue = blue;

					CLIENT.setColor(prev);
					CLIENT.sendColor();
					updateColorTip();
				}
			});
		}
		onUndisplayed(column) {
			Pins.invoke("/light/LEDOff");
			if (this.repeater) {
				this.repeater.close();
				this.repeater = undefined;
			}
		}
	}, 
	contents: [
		Label($, { top: 5, style: titleStyle, string: 'RGB Color Sensor', }),
		Label($, { top: 5, style: commentStyle, string: 'Setup Left Front Pins like this:', }),
		Picture($, { top: 10, url: './assets/pins.png', }),
	], 
}));

/* Application set-up */
try {
	if (!CoAP) CoAP = null;
} catch (e) {
	CoAP = null;
}

class ApplicationBehavior extends MODEL.ApplicationBehavior {
	onLaunch(application) {
		CLIENT.start(this);
		Pins.configure({
			light :  {
				require: "TCS34725",
				pins: {
					rgb: { type: "I2C", sda: 53, clock: 54 },
					power: { pin: 55, type: "Power", voltage: 3.3 },
					ground: { pin: 56, type: "Ground" },
					led: { type: "Digital", direction: "output", pin: 51, value: 0 }
				}
			}}, success => { if (!success) trace("failed to configure pins\n")});

		var data = {};
		application.add(new MainContainer({}));
	}
	onDisplayed(application) {
		application.discover("coapserver.example.kinoma.marvell.com");
		updateStats();
	}
	onQuit(application) {
		application.forget("coapserver.example.kinoma.marvell.com");
	}
	onUpdateStats() {
		updateStats();
	}
	onUpdateColors() {
		updateColors();
	}
}
var model = application.behavior = new ApplicationBehavior(application);


