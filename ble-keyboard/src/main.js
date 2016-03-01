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
// Helpful BLE docs
// https://www.bluetooth.org/en-us/specification/adopted-specifications
// Apple BLE MIDI spec
// https://developer.apple.com/bluetooth/Apple-Bluetooth-Low-Energy-MIDI-Specification.pdf
// Essentials of the MIDI protocol
// https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html

// ----------------------------------------------------------------------------------
// Themes/ Global Vars/ Modules
// ----------------------------------------------------------------------------------
var FTHEME = require("themes/flat/theme");
THEME = require("themes/sample/theme");
for (var i in FTHEME)
	THEME[i] = FTHEME[i];
var CREATIONS = require("creations/creations");

var Pins = require("pins");
// Service UUID for getting the keyboard data
var KEYBOARD_SERVICE_UUID = "03B80E5A-EDE8-4B33-A751-6CE34EC4C700";
// Characteristic UUID for MIDI data
var CLIENT_CHARACTERISTIC_CONFIGURATION_UUID = "7772E5DB-3868-4112-A1A9-F2669D106BF3";

// ----------------------------------------------------------------------------------
// Styles
// ----------------------------------------------------------------------------------
var applicationStyle = new Style({font: "16px Fira Sans"});
var valueStyle = new Style({font:"bold 52px", color:"white", horizontal:"center", vertical:"middle"});
var statusStyle = new Style({font:"bold 22px", color:"white", horizontal:"center", vertical:"bottom"});

// ----------------------------------------------------------------------------------
// Skins
// ----------------------------------------------------------------------------------
var keySkin = new Skin({ fill: ["white", "silver"], stroke:"silver", borders: {left: 1, right: 1, top: 1, bottom: 1} });
var halfkeySkin = new Skin({ fill: ["black", "silver"], stroke:"silver", borders: {left: 1, right: 1, top: 1, bottom: 1}});
var greenSkin = new Skin({fill: "#59C92C"}); // Kinoma green!

// ----------------------------------------------------------------------------------
// BLE Behavior Functions
// ----------------------------------------------------------------------------------
var BLEKeyboardServiceBehavior = Behavior.template({	
	onCreate: function(container, data) {
		this.data = data;
		this.initialize(container);	
	},
	onDisplaying: function(container) {
		this.startScanning(container);
	},
	onGattCharacteristicFound: function(container, result) {	
		// Found characteristic
		if (CLIENT_CHARACTERISTIC_CONFIGURATION_UUID == result.uuid && null == this.ccc_handle) {	
			this.ccc_handle = result.characteristic;
		}
	},
	// Characteristic sent notification
	onGattCharacteristicNotified: function(container, result) {	
		// Breaks result into chunks, each containing a single byte 
		var bytes = result.value;
		application.distribute("onMIDIEventMessage", bytes);	
	},
	onGattRequestCompleted: function(container, result) { 
		// After connecting, looks for services
		if ("services" == this.state) {
			// found end handle
			if (null != this.end_handle) {
				// Discover service attributes
				this.changeState(container, "characteristics");
				var params = {
					connection: this.connection_handle,
					start: this.start_handle,
					end: this.end_handle
				};
				// Finds attribute information
				Pins.invoke("/ble/gattDiscoverAllCharacteristics", params);
			}
		}
		// Already has attribute info
		else if ("characteristics" == this.state) {
			if (null != this.ccc_handle) {
				// Enable notifications
				var buffer = new ArrayBuffer(2); // 16-bit little endian Client Characteristic Configuration - setting bit 1 enables notification
				var ccc_data = new Uint8Array(buffer);
				ccc_data[0] = 0x01;	ccc_data[1] = 0x00;
				var params = {
					connection: this.connection_handle,
					characteristic: this.ccc_handle  + 1, // Char handle 40, UUID 2902 config attribute to set notifications on
					value: buffer
				};
				// Send message to turn on the notification service
				Pins.invoke("/ble/gattWriteCharacteristicValue", params);
				// End state, listens to notifications
				this.changeState(container, "");
				// In reading state, no longer busy making connections
				this.data.BUSY.visible = false;
				// Make Keyboard visible
				this.data.KEYBOARD.visible = true;
			}
			// If ccc_handle isn't set for some reason (i.e. order latency), send back to previous state
			else this.changeState(container, "services");
		}
	},
	// Finds Keyboard Service
	onGattServiceFound: function(container, result) {
		if ( KEYBOARD_SERVICE_UUID == result.uuid) {
			// Sets handles for address of service
			this.start_handle = result.start;
			this.end_handle = result.end;
		}
	},
	// On a connection
	onPeripheralConnected: function(container, peripheral) {
		this.connection_handle = peripheral.connection;
		Pins.invoke("/ble/gattDiscoverAllPrimaryServices", { connection: this.connection_handle });
		// Call connected function
		application.distribute("onConnected");
		// Change state flag to services
		this.changeState(container, "services");
		
	},
	// On a disconnect, restart the app.
	onPeripheralDisconnected: function(container, peripheral) {
		this.initialize(container);
		application.distribute("onDisconnected");
		this.startScanning(container);
	},
	// Fires when initially discovered
	onPeripheralDiscovered: function(container, peripheral) {
		
		if ("discovery" != this.state) return;
		var scanResponseData = peripheral.data;
		for (var i = 0, c = scanResponseData.length; i < c; i++) {
			var entry = scanResponseData[i];	
			if (0x07 == entry.flag && KEYBOARD_SERVICE_UUID == entry.data) {				
				// Discovery confirmed, so connect
				this.connect(container, peripheral);		
				return;
			}
		}		
	},
	// Changes state, before sending statechange message.
	changeState: function(container, state) {
		this.state = state;
		application.distribute("onStateChange", state);
	},
	// Set connection configuration
	connect: function(container, peripheral) {
		var params = {
			address: peripheral.address,
			addressType: peripheral.addressType,
			intervals : { // Connection Interval specc'ed by BLE MIDI keyboard
				min : 8,
				max: 12
			},
			timeout: 100	// 1000 timeout, 10 ms units
		}
		// Send GAP connection message
		Pins.invoke("/ble/gapConnect", params);
		
		this.changeState(container, "connect");
	},
	initialize: function(container) {
		this.start_handle = null;
		this.end_handle = null;
		this.connection_handle = null;
		this.ccc_handle = null;
		this.measurement_handle = null;
		this.changeState(container, "idle");
	},
	startScanning: function(container) {
    	// Start Scanning
		Pins.invoke("/ble/gapStartScanning");
		this.changeState(container, "discovery");
	},
});

// ----------------------------------------------------------------------------------
// Main screen / UI elements
// ----------------------------------------------------------------------------------
// White keys template
var Key = Content.template(function($) { return {
    top: 2, width: 14, height: 100, skin: keySkin,
    behavior: Behavior({
    	// Set frequency data associated with key
        onCreate: function(container, data) {
            this.frequency = data;
        },
    }),
}});

// Black keys template
var halfKey = Content.template(function($) { return {
    top: 2, width: 12, height: 70, skin: halfkeySkin,
    behavior: Behavior({
   		// Set frequency data associated with key
        onCreate: function(container, data) {
            this.frequency = data;
        }, 
    }),
}});
// Main UI container
var MainScreen = Container.template(function($) { return {
	left: 0, right: 0, top: 0, bottom: 0, skin: greenSkin, active:true, multitouch: true,
	behavior: Behavior({
		// Back button for easy app quit.
		onBackButton: function(container) {
			application.invoke(new Message("xkpr://shell/close?id=" + application.id));
		},
	}),
	contents: [
		CREATIONS.DynamicHeader($),
		Container($, {
			left: 0, right: 0, top: 32, bottom: 0,
			behavior : BLEKeyboardServiceBehavior({
				
				onConnected: function(container) {
					// Initialize active notes arrays
					this.amplitude_factor = 3072;
					this.frequencies = [];
					this.velocities = [];
					// Frequencies array for 127 note MIDI spec
					this.configFreq = [8, 8.6, 9.2, 9.7, 10.3, 10.9, 11.6, 12.2, 13, 13.75, 14.6, 15.4,
					16.4, 17.3, 18.4, 19.4, 20.6, 21.8, 23.1, 24.5, 26, 27.5, 29.1, 30.8,
					32.7, 34.6, 36.7, 38.9, 41.2, 43.7, 46.2, 49, 51.9, 55, 58.3, 61.7,
					65.4, 69.3, 73.4, 77.8, 82.4, 87.3, 92.5, 98, 103.8, 110, 116.5, 123.5,
					131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247,
					262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494,
					523, 554, 587, 622, 660, 698, 740, 783, 831, 880, 932, 988, 
					1046, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976,
					2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951,
					4186, 4435, 4699, 4978, 5274, 5588, 5920, 6272, 6645, 7040, 7459, 7902,
					8372, 8870, 9397, 9956, 10548, 11175, 11840, 12544];
					// Asscoiated notes values
					this.noteFreq = ["C0", "C0#", "D0", "E0b", "E0", "F0", "F0#", "G0", "G0#", "A0", "B0b", "B0",
					"C1", "C1#", "D1", "E1b", "E1", "F1", "F1#", "G1", "G1#", "A1", "B1b", "B1",
					"C2", "C2#", "D2", "E2b", "E2", "F2", "F2#", "G2", "G2#", "A2", "B2b", "B2",
					"C3", "C3#", "D3", "E3b", "E3", "F3", "F3#", "G3", "G3#", "A3", "B3b", "B3",
					"C4", "C4#", "D4", "E4b", "E4", "F4", "F4#", "G4", "G4#", "A4", "B4b", "B4",
					"C5", "C5#", "D5", "E5b", "E5", "F5", "F5#", "G5", "G5#", "A5", "B5b", "B5",
					"C6", "C6#", "D6", "E6b", "E6", "F6", "F6#", "G6", "G6#", "A6", "B6b", "B6",
					"C7", "C7#", "D7", "E7b", "E7", "F7", "F7#", "G7", "G7#", "A7", "B7b", "B7",
					"C8", "C8#", "D8", "E8b", "E8", "F8", "F8#", "G8", "G8#", "A8", "B8b", "B8",
					"C9", "C9#", "D9", "E9b", "E9", "F9", "F9#", "G9"]
				},
				onDisconnected: function(container) {
					this.data.BUSY.visible = true;
					this.data.KEYBOARD.visible = false;
					this.data.STATUS.string = "";
				},
				// Called from onGattCharacteristicNotified, which changes on a key event
				onMIDIEventMessage: function(container, bytes) {
					var frequencies = this.frequencies;
					var velocities = this.velocities;
					var mapFrequency = this.configFreq;
					var status,changed = false;
					// Loop through returned MIDI packet data, see Apple MIDI spec for info.			
					for (var i = 1; i < bytes.length;){
						if(bytes[i] & 0x80 ){// MIDI status event, change status
							status = bytes[i+1];
							i+=2;
						}			
						if(status == 0x90 ){// MIDI onkey status
							changed = true; // Set changed to true, in case of multiple message event, where last message is not onkey
							if(bytes[i+1] != 0){// See velocity non zero, add values to arrays
								// Constrict frequencies for Kinoma Create Hardware
								if(mapFrequency[bytes[i]] > 247 && mapFrequency[bytes[i]] < 2093){
									frequencies.push(mapFrequency[bytes[i]]); 
									velocities.push(bytes[i+1]);
								}
							}
							else{// See velocity zero, cut coresspoding velocity/frequency from arrays
								if(mapFrequency[bytes[i]] > 247 && mapFrequency[bytes[i]] < 2093){
									velocities.splice(frequencies.indexOf(mapFrequency[bytes[i]]),1);
									frequencies.splice(frequencies.indexOf(mapFrequency[bytes[i]]),1);
									
								}
							}				
						}
						i+=2;					
					}
					// Amplitudes updated, if there was an onkey status
					if(changed){
						this.updateAmplitudes(container);
						changed = false;
					}			
				},
				onStateChange: function(container, state) {
					this.data.STATUS.string = state;
				},
				updateAmplitudes: function(container){
					var velocities = this.velocities;
					var amplitudes = [];
					for(var i = 0; i < velocities.length; i++){
						// Change velocities from hex value to something within hearable range.
						amplitudes[i] = velocities[i] * this.amplitude_factor/128;
					}
					// Send setAmplitudes Message for first 5 only
					if( amplitudes.length > 5) Pins.invoke('/audio/setAmplitudes', amplitudes.slice(0,5));
					else Pins.invoke('/audio/setAmplitudes', amplitudes);
					// Call frequency update
					this.updateFrequencies(container);   
				},
				updateFrequencies: function(container){
					var frequencies = this.frequencies;
					var notes = this.noteFreq;
					container.distribute("changeKeys", frequencies);
					if( frequencies.length > 5) {
						// SynthOut( and KinomaCreate) can only handle 5 keys at once, so filter if greater
           				var filtered = frequencies.slice(0,5);
           				Pins.invoke('/audio/setFrequencies', filtered);
           				// Rewrite Note String
           				this.data.NOTE.string = ""; 
           				for (var i =0; i < filtered.length; i++){
           					this.data.NOTE.string +=  notes[this.configFreq.indexOf(filtered[i])]+" ";	
           				 }
           				
           			}
           			// Send setFrequencies message
           			else {
           				
           				Pins.invoke('/audio/setFrequencies', frequencies);
           				
           				this.data.NOTE.string = "";	
       					for (var i =0; i < frequencies.length; i++){
       						this.data.NOTE.string +=  notes[this.configFreq.indexOf(frequencies[i])]+" ";	
       				 	}	
           			}
           				 	
				},
			}),
			// Display content 
			contents: [
				// Busy picture, while discovering/connectnig to ble
				CREATIONS.BusyPicture($, {anchor: "BUSY", url: "./assets/spinner.png", top: 40}),
				// Nested container for keyboard
				Container($, { anchor: "KEYBOARD", left: 3, right: 0, visible: false,
					behavior : Behavior({
						// When played frequencies change, map to visual key states.
						changeKeys: function(container, frequencies) {
							// The Initial notes array.
							var notes = $.notes;
							// Set all to 0 to reset.
							for(var i = 0; i <= notes.length; i++){
								// Set all contents to 0 state.
								container.content(i).state = 0;
							}
							for(var i = 0; i < frequencies.length; i++){		
								// Find frequency matches, and set to 1
								container.content(notes.indexOf(frequencies[i])+1).state = 1;
							}
						 	
			        	},
					}),
					// Map notes to new keys
					contents: [ Text($, {anchor: "NOTE", left: 20, right: 20, bottom: 0, top: -50, style: valueStyle}),
					$.notes.map(function(notes, index) {
			    	if ( index < 21) return new Key(notes, { left: index * 15 });
			    	else if ( index < 23) return new halfKey(notes, { left: 8 + (index-21) * 15 });
			       	else if ( index < 26) return new halfKey(notes, { left: 53 + (index-23) * 15 });
			       	else if ( index < 28) return new halfKey(notes, { left: 113 + (index-26) * 15 });
			       	else if ( index < 31) return new halfKey(notes, { left: 158 + (index-28) * 15 });
			       	else if ( index < 33) return new halfKey(notes, { left: 218 + (index-31) * 15 });
			        else if ( index < 36) return new halfKey(notes, { left: 263 + (index-33) * 15 });
			   		 }),	
					]
				}),
				// Displays current status of BLE connection
				Label($, {anchor: "STATUS", left: 20, right: 20, bottom: 5, style: statusStyle}),
			],
		})
	]
}});

// ----------------------------------------------------------------------------------
// Application
// ----------------------------------------------------------------------------------

application.behavior = Behavior({
    onBLENotification(response) {
    // Respond to BLE notifications
		var notification = response.notification;
		if ("gap/discover" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralDiscovered", peripheral);
		}
		else if ("gap/connect" == notification) {
			var peripheral = response;
			application.distribute("onPeripheralConnected", peripheral);
		}
		else if ("gap/disconnect" == notification) {
			var connection_handle = response.connection_handle;
			application.distribute("onPeripheralDisconnected", connection_handle);
		}
		else if ("gatt/service" == notification) {
			application.distribute("onGattServiceFound", response);
		}
		else if ("gatt/characteristic" == notification) {
			application.distribute("onGattCharacteristicFound", response);
		}
		else if ("gatt/descriptor" == notification) {
			application.distribute("onGattCharacteristicDescriptorFound", response);
		}
		else if ("gatt/characteristic/notify" == notification) {
			application.distribute("onGattCharacteristicNotified", response);
		}
		else if ("gatt/request/complete" == notification) {
			application.distribute("onGattRequestCompleted", response);
		}
	},
	onLaunch: function(application) {
    	application.style = applicationStyle;
   		// Configure BLE, and audio pins
        Pins.configure({
			ble: {
				require: "/lowpan/ble"
			},
			audio: {
                require: "synthOut",
                pins: {
                /*  Sample rate 4kHz, to allow for more simultaneous tones (to support synth modes). 
                	You get 5 notes at 4kHz, and 3 at 8kHz.*/
                    speaker: {sampleRate: 8000, amplitude: 2048}
				}
            }},  success => this.onPinsConfigured(application, success));
    },
    onPinsConfigured(application, success) {		
		if (success) {
			this.data = {
	        	title: "Keyboard",
	        	titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle,
	        	// playable notes at 4kHz sample rate
	            notes: [262, 294, 330, 349, 392, 440, 494,
						523, 587, 660, 698, 783, 880, 988, 
						1046, 1175, 1319, 1397, 1568, 1760, 1976,
						277, 311, 370, 415, 466, 554, 622, 740, 831, 932, 1109, 1245, 1480, 1661, 1865]
			};
			// Start ble reading
			Pins.when("ble", "notification", this.onBLENotification);
			application.distribute("startScanning");						
			// Create UI
			application.add(new MainScreen(this.data));
	        // Starts audio output hardware 
	        Pins.invoke('/audio/start');      
		}
		else {
			throw new Error("Unable to configure BLE");
		}
	},
	
});