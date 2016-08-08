#BLE Clapper

Clap on, Clap off! In this example we combine the Kinoma Create with the [Satechi IQ plug](http://kinoma.com/develop/documentation/tutorials/ble-satechi-iq-plug/), to build a clap on/clap off Bluetooth Low Energy BLE controlled outlet switch. 

See a video demonstration of this project [here](https://youtu.be/oAgH3v9iKF8).

<!--
<iframe width="640" height="360" src="https://www.youtube.com/embed/oAgH3v9iKF8?rel=0&amp;controls=1&amp;showinfo=0&autoplay=0" frameborder="0" allowfullscreen></iframe>
-->

## Configuration

We will be utilizing the built in Kinoma Create microphone to capture audio and toggle the Satechi IQ Plug on and off. The Pins configuration initializes both the built-in **BLE** BLL and the microphone controlled by the **audioin** BLL.


```
onLaunch(application) {
    Pins.configure({
        ble: {
            require: "/lowpan/ble"
        },
        microphone: {
            require: "audioin",
                pins: {
                    audio: {sampleRate: 8000, channels: 1}
                }
        },
    }, success => this.onPinsConfigured(application, success));
},
```

After the pins are configured, the `onPinsConfigured` function is called and the application completes initialization.

```
onPinsConfigured(application, success) {
	if (success) {
		this.data = {
			off_command: [0x0F, 0x06, 0x03, 0x00, 0x00, 0x00, 0x00, 0x04, 0xFF, 0xFF],
			on_command: [0x0F, 0x06, 0x03, 0x00, 0x01, 0x00, 0x00, 0x05, 0xFF, 0xFF],
			title: "BLE Clapper",
			titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle
		};
		Pins.when("ble", "notification", this.onBLENotification);
		application.add(new MainScreen(this.data));
	}
	else {
		throw new Error("Unable to configure BLE");
	}
},
```

Assuming the BLE library configured successfully, the application completes it's initialization. Here the on/off command data is initialized for later use and the main application screen is displayed. The application calls `Pins.when` to provide the `onBLENotification` callback function for receiving asynchronous notifications from the BLE library. All KinomaJS BLE apps roughly follow this configuration sequence. 

##Control

This application connects to the Satechi IQ Plug using the method outlined in [this tutorial](http://kinoma.com/develop/documentation/tutorials/ble-satechi-iq-plug/). So instead let's take a look at how the microphone is used to control the plug. 

```
onDisplaying(container) {
    this.container = container;
    container.duration = 500;
    this.state = "off";
    this.doSwitch(container);
    this.microphone = Pins.repeat("/microphone/read", "audio", result => this.onMicrophoneRead(result));
},
```

KinomaJS calls the `onDisplaying` behavior function when the `MainScreen` is about to be displayed. The `doSwitch` method is called to initialize the Satechi IQ Plug by turning off the connected light. Finally, the microphone is configured to deliver audio samples in real time to the application's `onMicrophoneRead` function. The call to the `Pins.repeat` function invokes the microphone BLL `read` function whenever the `audio` pin has samples available. Note that the `audio` pin name is passed to `Pins.repeat` instead of a repeat interval value. This technique, as described in the [Pins Module](http://kinoma.com/develop/documentation/element-pins-module/) documentation, uses less CPU and reduces latency compared to polling at a fixed interval.

```
doSwitch(container) {
    let column = container.first;
    if ("off" == this.state) {
        column.first.url = mergeURI(application.url, "./assets/light-off.png");
        column.last.string = "Clap to turn on!";
    }
    else {
        column.first.url = mergeURI(application.url, "./assets/light-on.png");
        column.last.string = "Clap to turn off!";
    }
    container.bubble("onSwitchStateChange", this.state);
    container.time = 0;
    container.start();
}
```

The `doSwitch` method simply keeps track of the current plug on/off state and updates the on-screen UI accordingly. The container timer is used to simplify the "clap" detection by limiting on/off state changes to once every 500 milliseconds.

```
exports.read = function() {
    var buffer = this.audio.read();
    var samples = new Int16Array(buffer)
    var count = samples.length;
    var total = 0, peak = 0, rms = 0.1;
    for (var i = 0; i < count; i += 1) {
        var sample = samples[i];
        if (sample & 0x8000)
            sample |= 0xFFFF0000;
        if (sample < 0)
            sample = -sample;

        total += sample;
        rms += sample * sample;

        if (peak < sample)
            peak = sample;
    }

    return { /*samples: samples,*/ count: count, peak: peak, average: Math.round(total / count), rms: Math.round(Math.sqrt(rms / count))};
}
```

This is the `read` function in the `audioin.js` BLL. The function processes each batch of audio samples read and calculates the batch peak, average and RMS values.

```
onMicrophoneRead(result) {
    if (null != this.microphone) {
        if ((result.average > 2000) && (result.peak == 32768) && !this.container.running) {
            this.state = ("off" == this.state ? "on" : "off");
            this.doSwitch(this.container);
        }
    }
}
```

Once the audio samples are processed, the JSON result is sent to the `onMicrophoneRead` function, where the average and peak values are evaluated. A "clap" is detected when there's a loud noise `(average > 2000)` with a peak in amplitude. If a clap hasn't already been processed in the past 500 milliseconds, the `doSwitch` function is called to toggle the Satechi IQ Plug on or off.

## Wrapping up

```
onSwitchStateChange(container, state) {
    let command = ("on" == state ? this.data.on_command : this.data.off_command);
    let params = {
        connection: this.connection,
        characteristic: 0x2B,	// IQ Plug on/off characteristic handle
        value: command
	}
	Pins.invoke("/ble/gattWriteCharacteristicValue", params);
}
```

The Satechi IQ Plug switch state is controlled by writing commands to it's on/off GATT characteristic handle. The `onSwitchStateChange` function sends the on/off command to the plug by invoking the BLE `/ble/gattWriteCharactersticValue` function, which sends the on/off value command to the connected IQ Plug device.

## Sample app

The complete sample app is available [here](https://github.com/Kinoma/KPR-examples/tree/master/ble-clapper) on GitHub.

