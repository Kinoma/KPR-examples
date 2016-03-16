/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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
let Pins = require("pins");
import {
	PlotterCanvas,
} from "plotter";

/* ASSETS */
let whiteSkin = new Skin({ fill:'white' });
let labelStyle = new Style({ font:'bold 30px', color:'#47476B' });

/* BEHAVIORS */
class ApplicationBehavior extends Behavior {
	onLaunch(application) {
		/**
			Initializes a GraphContainer, which includes the GraphCanvas,
			upon which values are drawn, and the GraphLabel, which displays
			the value as text. 
		*/
		let graph = new GraphContainer();
		
		/**
			Parameters for the plotter
				name- unique identifier
				interval- ms between updates
				buckets- number of values displayed on the screen at once
				background- background color
				strokeStyle- color of the line
				lineWidth- width of the line
				string- label to precede the value in the Graph Label
				complement- if true, graph ( 1 - value ) rather than the value 
		*/
    	let plotterParams = {
    		name: "sensor1",		
 			interval: 10,
			buckets:200,
    		background: "white",
    		strokeStyle: "red",
			lineWidth: 4,
			string: "x",
			complement: false
		};
		
		graph.add( new GraphCanvas( plotterParams ) );
		graph.add( new GraphLabel( plotterParams) );
		let mainScreen = new MainScreen;
		mainScreen.add( graph ); 
		application.add( mainScreen );
		            
		Pins.configure({
			analogSensor: {pin: 52, type: "Analog"},
		}, success => this.onPinsConfigured(application, success));
	}
	onPinsConfigured(application, success) {		
		if (success) {
			Pins.repeat("/analogSensor/read", 100, result => application.distribute("onReceivedValue", result));

			Pins.share("ws", {zeroconf: true, name: "analog-graph"});
		}
		else
			trace("failed to configure pins\n");
	}
};

/* LAYOUTS */
let GraphCanvas = PlotterCanvas.template($ => ({ left:5, right:5, top:5, bottom:5 }));

let GraphContainer = Container.template($ => ({ left:0, right:0, top:0, bottom:0 }));

let GraphLabel = Label.template($ => ({
	left:10, bottom:5, string:'--', style:labelStyle, skin:new Skin({ fill:'#B3FFFFFF' }),
	behavior: Behavior({
		onCreate(label, data) {
			this.data = data;
		},
		onReceiveReading(label, reading, name) {
			if (this.data.name == name) {
				label.string = this.data.string + ':' + reading.toFixed(2);
			}
		}
	})
}));

let MainScreen = Container.template($ => ({ left:0, right:0, top:0, bottom:0, skin:whiteSkin }));

/* APPLICATION */

application.behavior = new ApplicationBehavior(application);


