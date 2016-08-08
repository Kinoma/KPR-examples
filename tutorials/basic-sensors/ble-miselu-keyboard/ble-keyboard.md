#BLE Miselu C.24 Keyboard

The [Miselu C.24 keyboard](http://miselu.com/c-24/) is a Bluetooth low energy wireless keyboard designed for iPad. In this tutorial we interface the keyboard to Kinoma Create and play notes to the Kinoma Create audio output and built-in speaker.

See a video demonstration of this project [here](https://youtu.be/xVfH5Oj5e80).

<!--
<iframe width="640" height="360" src="https://www.youtube.com/embed/xVfH5Oj5e80?rel=0&amp;controls=1&amp;showinfo=0&autoplay=0" frameborder="0" allowfullscreen></iframe>
-->

##Configuration

Applications incorporating BLE must first configure and initialize the associated BLL before using any BLE services. In addition, the audio pin must also be initialized for this application. Here we configure the audio pin to use the `"synthOut"` module for note synthesis.

```
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
	}
},  success => this.onPinsConfigured(application, success));
```

The application assigns the unique name `ble` to the BLE BLL and uses that name in subsequent calls to the library. After configuring pins, the `onPinsConfigured` function is called.

```
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
...
```
	
Assuming the audio and BLE libraries configured successfully, the application completes it's initialization by providing a BLE notification callback. The callback is triggered by the BLE module to deliver the application BLE notifications. `Pins.when` is used here to provide the application callback function. Lastly the application displays the main screen UI. All KinomaJS BLE apps should follow this configuration sequence. Here you can see we are also setting up the keyboard with the list of corresponding note frequencies. The Kinoma Create on-screen keyboard is displayed after establishing a Bluetooth connection to the keyboard.
	
## Connection

Though not neccessary every time, this app goes through the entire service and characteristic discovery process, to explicitly find the connection handles needed to connect to the device and request key press notifications. Once these connection handles are known, the app merely needs to connect and set the notification bit at the known characteristic handle, however for the purpose of understanding how these values are found, this example app retains the entire services/characteristics discovery process. This process can be used in lieu of doing BLE sniffing on a peripheral, however unlike sniffing, it is only useful if you know which service and characteristic you wish to target. 
The `onBLENotification` callback function distributes BLE notifications for all the notification types.

```
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
...
```
		
The app first calls `gapStartScanning` to discover BLE peripherals nearby.

```
startScanning: function(container) {
	// Start Scanning
	Pins.invoke("/ble/gapStartScanning");
	this.changeState(container, "discovery");
}
```

When a peripheral is discovered, the `"gap/discover"` notification will be sent back to the app, where `onPeripheralDiscovered` is then called.

```
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
```

The `KEYBOARD\_SERVICE\_UUID` is from the [Apple BLE MIDI specification](https://developer.apple.com/bluetooth/Apple-Bluetooth-Low-Energy-MIDI-Specification.pdf), and is a universal service UUID for all Apple MIDI BLE services. This keyboard is intended for use with iPad, and thus follows this spec. When our app discovers the peripheral and matches the service UUID, we know we've found the keyboard. When this happens `connect` is called.

```
connect: function(container, peripheral) {
	var params = {
		address: peripheral.address,
		addressType: peripheral.addressType,
		intervals : { // Connection Interval spec'ed by BLE MIDI keyboard
			min : 8,
			max: 12
		},
		timeout: 100	// 1000 timeout, 10 ms units
	}
	// Send GAP connection message
	Pins.invoke("/ble/gapConnect", params);
	this.changeState(container, "connect");
},
```
	
The `address` and `adressType` are properties of the peripheral object returned by the `"gap/discover"` notification. The connection intervals are relatively small to increase our connection performance and achieve higher responsiveness when playing the keyboard. With these parameters set, we then call `gapConnect` to request a connection between the app and keyboard. Once a connection has been established, the `onPeripheralConnected` function is called.

```
onPeripheralConnected: function(container, peripheral) {
	this.connection_handle = peripheral.connection;
	Pins.invoke("/ble/gattDiscoverAllPrimaryServices", { connection: this.connection_handle });
	// Call connected function
	application.distribute("onConnected");
	// Change state flag to services
	this.changeState(container, "services");
},
```
	
Once connected, we use the connection handle to call `gattDiscoverAllPrimaryServices`. This will give us a series of `"gatt/service"` notifications through which we call `onGattServiceFound`.

```
onGattServiceFound: function(container, result) {
	if ( KEYBOARD_SERVICE_UUID == result.uuid) {
		// Save starting and ending service handles
		this.start_handle = result.start;
		this.end_handle = result.end;
	}
},
```

For this app, we are only concerned with the keyboard service, and so we set our start and end handles to the start and end of this particular service. All BLE services include a group of handles related to the service and it's contained characteristics. Once this request is complete we then call `gattDiscoverAllCharacteristics`.

```
...
this.changeState(container, "characteristics");
var params = {
	connection: this.connection_handle,
	start: this.start_handle,
	end: this.end_handle
};
// Finds attribute information
Pins.invoke("/ble/gattDiscoverAllCharacteristics", params);
...
```
	
I've skipped the section where we are updating the application's "state", but basically all that is changing is the currently displayed text on screen. Since the `"gatt/request/complete"` is generic to all GATT requests, it helps our flow logic to track our application's "state". As you can see, we are doing characteristic discovery with the previously found handles. This keeps the bounds of the characteristics we find within the service of interest (Keyboard).

```
onGattCharacteristicFound: function(container, result) {	// Found characteristic
	if (CLIENT_CHARACTERISTIC_CONFIGURATION_UUID == result.uuid && null == this.ccc_handle) {		this.ccc_handle = result.characteristic;
	}
},
```
	
The `CLIENT\_CHARACTERISTIC\_CONFIGURATION\_UUID` is the MIDI I/O Characteristic in the [Apple BLE MIDI specification](https://developer.apple.com/bluetooth/Apple-Bluetooth-Low-Energy-MIDI-Specification.pdf). Similar to the MIDI service, this UUID is set for all Apple BLE MIDI products. Once we find this characteristic we can save the handle.

```
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
```
	
After finding the keyboard service, and the I/O characteristic, we can now send a write command to it, to enable keyboard press notifications. Through inspection, we found that the handle immediately after the `ccc_handle` had the UUID of 2902. This is the configuration handle for our I/O characteristic. This format is fairly typical of BLE peripherals. You can read more on p.542 of the [Core BLE Specification](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjz-bOF15HLAhUI1mMKHe56BnMQFggdMAA&url=https%3A%2F%2Fwww.bluetooth.org%2Fdocman%2Fhandlers%2Fdownloaddoc.ashx%3Fdoc_id%3D229737&usg=AFQjCNFY1IFeFAAWwimnoaWMsIRZQvPDSw&sig2=MWAyJvBaixwwudOdnN-9_w&bvm=bv.115277099,d.cGc). According to the spec we have to set the two bytes to 0x0001, in order to enable notifications. Although just an `Array` can be used, here `ArrayBuffer` and `Uint8Array` are used to ensure proper 8-bit encoding. After calling `gattWriteCharacteristicValue`,  the notifications from the keyboard will be active, and we set the keyboard to visible. 

```
onGattCharacteristicNotified: function(container, result) {
	// Breaks result into chunks, each containing a single byte 
	var bytes = result.value;
	application.distribute("onMIDIEventMessage", bytes);	
},
```
	
Each time a notification comes through, we call the `onMIDIEventMessage` method with the value data from the notification.

```
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
```

The MIDI event messages returned are 7-9 bytes long. We interpret the message, and are able to react to the on-key statuses, reading both the sent frequency, and press velocity. When this occurs we update our frequencies, and velocities arrays, then call `updateAmplitudes`. From there we then make the calls to our audio BLL.

## Sound Synthesis

The second part of this application uses the data being sent from the keyboard to synthesize simple tones. The calls to update the amplitudes and frequencies are made from the application side, but the underlying audio configuration, functions, and calculations reside in the `synthOut` BLL.

```
...
Pins.invoke('/audio/setAmplitudes', amplitudes);
...
Pins.invoke('/audio/setFrequencies', frequencies);
...
```
	
`setAmplitudes` is called first to set the correct volumes before the notes get played. The `setFrequencies` function in our module will initiate the sound synthesis. 

```
//@module
...
exports.setFrequencies = function(frequencies) {
	this.frequencies = frequencies;
	for (var i = 0, k = this.k; i < frequencies.length; i++)
	    frequencies[i] *= k;
	this.renderAudio = voices[frequencies.length];
}
```
	
We update our frequencies array, then multiply each value by k, a constant which simplifies our sound wave synthesis equations later. Then we set `renderAudio` to the function which will define the synthesis calculation based on the number of frequencies. The BLL configure function optimizes audio rendering performance for the Kinoma Create device.

```
exports.configure = function(config) {
	this.samplesPerRender = 185; // This is the value best supported by the hardware
	this.sampleRate = config.pins.speaker.sampleRate;// can range 4~8k
	this.amplitudes = config.pins.speaker.amplitudes;// array of amplitudes matched to frequency array
	this.buffer = new ArrayBuffer(this.samplesPerRender * 2);// data storage to send to the speaker
	this.samples = new Int16Array(this.buffer);
	this.k = 2 * Math.PI / this.sampleRate;// constant that simplifies sound wave function later
	this.speaker.init();// calls the initialize speaker function through HPS
	this.setFrequencies(config.pins.speaker.frequencies);// initialize Frequencies to zero
	this.speakerRepeater = PINS.repeat("speaker", this, this.synthesize);
}
```
	
The `PINS.repeat` function here is repeating a call to the `speaker` with no path. This will cause the `this.synthesize` function to be called continuously to render audio to the speaker.

```
exports.synthesize = function(){
    this.renderAudio(0, this.samplesPerRender, this.frequencies);
    this.speaker.write(this.buffer);
}
```
	
From before, the `renderAudio` function is redefined whenever there is a change in the frequencies being played. However, the arguments are always the same. Depending on the frequencies being set, a synthesis calculation occurs, and the sound samples are written to the speaker from our array buffer. Below is the synthesis function for none, and two notes being played, for example.

```
// Synthesize silence
function synthesize0(i, count) {
    var samples = this.samples;
    for (; i < count; i++)
        samples[i] = 0;
    this.time = 0;
}
...
// Synthesize 2 pure tones at once
function synthesize2(i, count, frequencies) {
    var amplitudes = this.amplitudes, samples = this.samples;
    var step1 = frequencies[0], step2 = frequencies[1]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2; i < count; time1 += step1, time2 += step2)
        samples[i++] = Math.sin(time1)* amplitudes[0] + Math.sin(time2)* amplitudes[1];
    this.time += step1 * count;
}
```
	
The `time` variable here is relative to the last state of the speaker. When no notes are being played, the time and samples are set to 0. So nothing is written to the speaker. When notes are being played, the samples array is filled with the calculated simple sine wave function. Then the `time` is continuously updated to sync with the synthesization. From the BLL configuration, the `samplesPerRender` value is 185. More information on the sound calculations can be found at this [helpful website](http://js.do/blog/sound-waves-with-javascript).

## Going Further

Obviously this is the most simplistic form of sound synthesis. It is possible to write synthesis functions for more complex sounds. However the Kinoma Create is limited in it's capacity to run calculations fast enough for super complex sounds. Left in [synthOut.js](https://github.com/Kinoma/KPR-examples/blob/master/ble-keyboard/src/synthOut.js) are some functions for other types of sounds, but you are limited in the number of different complex tones that could be rendered at once. 

## Sample app

The complete sample app is available [here](https://github.com/Kinoma/KPR-examples/tree/master/ble-keyboard) on GitHub.
