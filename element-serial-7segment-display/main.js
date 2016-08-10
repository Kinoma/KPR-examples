/*  Copyright 2011-2016 Marvell Semiconductor, Inc.  Licensed under the Apache License, Version 2.0 (the "License");  you may not use this file except in compliance with the License.  You may obtain a copy of the License at      http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software  distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and  limitations under the License.*/
import Pins from "pins";

import {
	setInterval, 
	clearInterval
} from "timer";

function secondsToString(seconds) {	let string, value;	value = Math.floor(seconds / 3600);	if (value) {		string = value.toString();		seconds %= 3600;	}	else		string = "";	value = Math.floor(seconds / 60);	if (value < 10)		string += "0";	string += value.toString();	seconds %= 60;	value = Math.floor(seconds);	if (value < 10)		string += "0";	string += value.toString();	return string;}var main = {
	counter: 0,    onLaunch() {        Pins.configure({            display: {                require: "s7s",                pins: {                	display: { tx: 2, rx: 1 },
                    power: { pin: 3, type: "Power" },                    ground: { pin: 4, type: "Ground" },                }            },         }, success => {            if (success) {
            	Pins.invoke("/display/writeString", "0000");
            	Pins.invoke("/display/writeDecimalControl", 0x10);
				main.start();
            } else {
            	trace("Failed to configure pins.\n");
            }        });    },
    pause() {
    	if (this.interval) clearInterval(this.interval);
    },
    reset() {
    	if (this.interval) clearInterval(this.interval);
    	this.counter = 0;
    	Pins.invoke("/display/writeString", "0000");
    },
    start() {
    	this.interval = setInterval(() => main.write(String(main.counter++)), 1000);
    },
    write(string) {        Pins.invoke("/display/writeString", secondsToString(string));    },
    onQuit() {
    	Pins.invoke("/display/clear");
    
    }}export default main;