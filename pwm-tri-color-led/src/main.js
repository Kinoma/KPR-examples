/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import Pins from 'pins';import {
	CircleSlider
} from 'slider';

let circleRadius = 25; let margin = 10; 
let backgroundSkin = new Skin({ fill: '#F0F0F0' });
let ColorSlider = CircleSlider.template($ => ({ left: margin, right: margin, top: margin, bottom: margin }));
let MainContainer = Column.template($ => ({ 	left: 10, right: 10, top: 10, bottom: 10, skin: backgroundSkin, 	Behavior: class extends Behavior {		onChanged(canvas, value, color) {			Pins.invoke("/led/write", { color: color, value: value });		}	}, }));let redSliderData = {	label:"red",	min:0, 	max:1, 	value:0, 	circleColor: "red", 	strokeColor: "#8E9595", 	strokeWidth: 10,  	radius: circleRadius };let greenSliderData = {	label:"green",	min:0, 	max:1, 	value:0, 	circleColor: "green", 	strokeColor: "#8E9595", 	strokeWidth: 10,  	radius: circleRadius };let blueSliderData = {	label: "blue",	min:0, 	max:1, 	value:0, 	circleColor: "blue", 	strokeColor: "#8E9595", 	strokeWidth: 10,  	radius: circleRadius };class AppBehavior extends Behavior {	onLaunch(application) {		let mainContainer = new MainContainer();		mainContainer.add( new ColorSlider( redSliderData ) );		mainContainer.add( new ColorSlider( greenSliderData ) );		mainContainer.add( new ColorSlider( blueSliderData ) );		application.add( mainContainer );		Pins.configure({		   led: {		        require: "led",		        pins: {		            red: { pin: 59 },		            green: { pin: 61 },		            blue: { pin: 62 }, 		            anode: { pin: 60 }		        }			}		},		success => {			if (!success) trace("Failed to configure pins\n");		});	}}application.behavior = new AppBehavior();