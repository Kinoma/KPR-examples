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
import { channels } from "credentials";
import { Radio } from "radio";		

let Pins = require("pins");
Handler.bind("/getAudioMedia", {
	onComplete: function(handler, message, text) {
		let value;		let lines = text.split("\n");		let c = lines.length;		if (lines[0] == "[playlist]") {			for (let i = 1; i < c; i++) {				let pair = lines[i].split("=");				if (pair.length == 2) {					let name = pair[0].toLowerCase();					if (name.indexOf("file") == 0) {						value = pair[1];						break;					}				}			}		}		if (value)			handler.redirect(value, "audio/mpeg");		},	onInvoke: function(handler, message) {		let query = parseQuery(message.query);		var message = new Message("http://somafm.com/" + query.id + ".pls");
		handler.invoke(message, Message.TEXT);		},});

/* =-====================================================================-= *//* =-======================== APPLICATION SET-UP ========================-= *//* =-====================================================================-= */
application.style = new Style({ color: 'white', font: '18px Fira Sans', horizontal: 'left', vertical: 'middle', });
var ApplicationBehavior = class extends Behavior { 	onLaunch(application) {
		Pins.configure({			nfc: {				require: "PN532",				pins: {					data: {sda: 27, clock: 29}				}			}
		}, success => {
			if (success) {
				Pins.repeat("/nfc/poll", 100, result => {
					var data = model.data.nfc;					var it = result;					data.token = it;					data.authorized = false;					data.read = false;					data.written = false;					application.distribute("onNFCTokenChanged", JSON.stringify(data.token));					if (data.token.length) {						Pins.invoke("/nfc/mifare_CmdAuthA", {token: data.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]}, result => {							if (!data.authorized) {								if (0 == result) {									data.authorized = true;
									Pins.invoke("/nfc/mifare_CmdRead", {page: 4});								}							}							else if (!data.read) {								trace("mifare_CmdRead onComplete " + JSON.stringify(result) + "\n");								data.read = true;												if (result) {									var bytes = result;													if (('K' != String.fromCharCode(result[0])) || ('N' != String.fromCharCode(result[1])) ||										('M' != String.fromCharCode(result[2])) || ('A' != String.fromCharCode(result[3])))										bytes = ['K'.charCodeAt(0), 'N'.charCodeAt(0), 'M'.charCodeAt(0), 'A'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];													var count = (bytes[4] << 8) | bytes[5];									trace("last count " + (count) + "\n");									count += 1;									bytes[4] = (count >> 8) & 0xff;									bytes[5] = count & 0xff;						 									var lastTime = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];									trace("last time " + (new Date(lastTime * 1000)) + "\n");									var now = (Date.now() / 1000) | 0;									bytes[6] = (now >> 24) & 0xff;									bytes[7] = (now >> 16) & 0xff;									bytes[8] = (now >>  8) & 0xff;									bytes[9] = (now >>  0) & 0xff;						
									Pins.invoke("/nfc/mifare_CmdWrite", {page: 4, data: bytes});								}							}							else if (!data.written) {								trace("mifare_CmdWrite onComplete " + JSON.stringify(result) + "\n");								data.written = true;							}
						});
						
						channels.some(function(channel, index) {							for (var i = 0; i < 4; i++) {								if (channel.token[i] != data.token[i])									return false;							}							application.distribute("onChannelChanging", index);							return true;						});					}					else {						application.distribute("onChannelChanging", channels.length - 1);					}
				});				application.distribute("onNFCTokenChanged", "[]");				
			} else {
			 	trace("Failed to configure pins.\n");
			}
		});
					let preferences = this.preferences = this.readPreferences(application, "preferences", {			radio: {				index: 0,				volume: 0.5,			},		});
				let data = this.data = {			nfc: { token: "(initializing)" },			pubnub: {},			radio: {				artist: "",				busy: true,				index: preferences.radio.index,				running: false,				title: "",				volume: preferences.radio.volume,				volumeMaximum: 1,				volumeMinimum: 0,			},		};		application.add(new Radio(data));	} 	readPreferences(application, name, preferences) {		try {			let url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");			if (Files.exists(url)) return JSON.parse(Files.readText(url));		}		catch(e) {}		return preferences;	} 	savePreferences() {		let data = this.data;		let preferences = this.preferences;		preferences.radio.index = data.radio.index;		preferences.radio.volume = data.radio.volume;		this.writePreferences(application, "preferences", preferences);	} 	writePreferences(application, name, preferences) {		try {			let url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");			Files.writeText(url, JSON.stringify(preferences));		}		catch(e) {}	}}export var model = application.behavior = new ApplicationBehavior();


