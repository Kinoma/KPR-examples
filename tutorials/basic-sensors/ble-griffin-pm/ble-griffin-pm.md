#Griffin PowerMate Bluetooth Button

The [Griffin PowerMate Bluetooth Button](https://support.griffintechnology.com/product/powermate-bluetooth/) is a programmable BLE wireless controller compatible with Macintosh computers. The PowerMate can replace a keyboard or mouse to control media applications with its built-in twist and click features. Using Kinoma Create's built-in BLE stack, this tutorial shows how to build a KinomaJS app that interfaces with the PowerMate Button.

See a video demonstration of this project [here](https://youtu.be/EwN-jGOoF24).

<!--
<iframe width="640" height="360" src="https://www.youtube.com/embed/EwN-jGOoF24?rel=0&amp;controls=1&amp;showinfo=0&autoplay=0" frameborder="0" allowfullscreen></iframe>
-->

##Initialization

Applications incorporating BLE must first configure and initialize the associated BLL before using any BLE services.

```
Pins.configure({
    ble: {
        require: "/lowpan/ble"
    }
}, success => this.onPinsConfigured(application, success));
...
```

After configuration, the `onPinsConfigured` application function is called, where the application completes initialization and displays the `MainScreen`.

```
onPinsConfigured(application, success) {		
	if (success) {
		this.data = {
			title: "Griffin PowerMate",
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
	
Assuming the BLE library configured successfully, the application completes it's initialization by providing a BLE notification callback. The callback is triggered by the BLE module to deliver the application BLE notifications. `Pins.when` is used here to provide the callbacks. All KinomaJS BLE apps should follow this configuration sequence.

##Discovery

The sample app provides both the service UUID required for discovery and client characteristic control handle (a.k.a. CCC handle) for enabling notifications.

```
let GRIFFIN_PM_SERVICE_UUID = "25598CF7-4240-40A6-9910-080F19F91EBC";
let CCC_HANDLE = 45;
```

The PowerMate service UUID can otherwise be discovered using the built-in BLE Explorer app on [Kinoma Create](http://kinoma.com/create/about/), or by using a third party BLE discovery app, e.g. [LightBlue](https://itunes.apple.com/us/app/lightblue/id639944780?mt=12). The CCC handle can be found programatically by calling the BLL `gattDiscoverAllCharacteristics` method from a KinomaJS application, or by packet sniffing with a [BLE sniffer](https://www.adafruit.com/product/2269). 

Once the `MainScreen` is displayed, the application scans for BLE peripherals nearby by calling the `startScanning` function. The `startScanning` function invokes the `/ble/gapStartScanning` BLE function to discover peripherals.

```
startScanning: function(container) {
	Pins.invoke("/ble/gapStartScanning");
	this.changeState(container, "discovery");
}
```
	
The `onPeripheralDiscovered` behavior function is called for each peripheral discovered while scanning. The `peripheral` parameter contains properties that describe the peripheral discovered. Here we examine the discovered peripheral's UUID list, looking for the unique PowerMate service UUID. If a match is found, the application connects to the peripheral.

```
onPeripheralDiscovered: function(container, peripheral) {
	if ("discovery" != this.state) return;
	
	let scanResponseData = peripheral.data;
	
	for (let i = 0, c = scanResponseData.length; i < c; ++i) {
		let entry = scanResponseData[i];
		if (0x06 == entry.flag) {			// Incomplete list of 128-bit UUIDS
			let uuids = entry.data;
			for (let j = 0; j < uuids.length; ++j) {
				if (GRIFFIN_PM_SERVICE_UUID == uuids[j]) {
					this.connect(container, peripheral);
					return;
				}
			}
		}
	}
},
```

##Connection

The BLE `gapConnect` function is used to establish a BLE connection between Kinoma Create and the Griffin PowerMate peripheral. The connection requires both the peripheral address and address type, both of which are passed to the `gapConnect` function.

```
connect: function(container, peripheral) {
	Pins.invoke("/ble/gapConnect", { address:peripheral.address, addressType:peripheral.addressType });
	this.changeState(container, "connecting");
},
```

#Configuring notifications

Once Kinoma Create is connected to the PowerMate, we request the PowerMate to send notifications to Kinoma Create whenever the PowerMate state changes, for example, when the button is pressed or spun. In order for Kinoma Create to receive notifications, the application must enable peripheral notifications by writing the value 0x0001 to the peripheral's CCC handle. You can learn more about Bluetooth notifications in [this](http://mbientlab.com/blog/bluetooth-low-energy-introduction/) blog post.

```
onPeripheralConnected: function(container, peripheral) {
	this.connection = peripheral.connection;
	let buffer = new ArrayBuffer(2);
	let ccc_data = new Uint8Array(buffer);
	ccc_data[0] = 0x01;	ccc_data[1] = 0x00;
	var params = {
		connection: this.connection,
		characteristic: CCC_HANDLE,
		value: buffer
	}
	Pins.invoke("/ble/gattWriteCharacteristicValue", params);
	this.changeState(container, "connected");
	application.distribute("onConnected");
}
```

A `Uint8Array` typed array is used to ensure BLE-compatible byte ordering by writing the byte value `0x01` before the byte value `0x00`. The reverse ordering is required because BLE devices use [little endian format](https://en.wikipedia.org/wiki/Endianness), which requires a 16-bit value's low byte to preceed the high byte in memory.

```
onConnected(container) {
	this.data.BUSY.visible = false;
	this.data.READINGS.visible = true;
},
```

Once connected, the `READINGS` label object contained by the `MainScreen` is made visible. In this application we simply change the label's string when we receive a notification from the peripheral. 


#Receiving notifications

```
onGattCharacteristicNotified(container, result) {
	let value = result.value[0];
	application.distribute("onValue", parseInt(value));
}

...

onValue(container, value) {
	let s = "IDLE";
	switch(value) {
		case 104: //right turn
			s = "RIGHT";
			break;
		case 103: //left turn
			s = "LEFT";
			break;
		case 101: //button press
			s = "PRESS";
			break;
	}
	this.data.READINGS.string = s;
}
```

The values received are numeric codes representing whether the button is spinning right, left, or being pressed. We update the displayed `READINGS` label string based on the numeric code. There are additional timestamp data and codes not shown in this example. You may be able to correlate these notifications with the timestamp data to implement more advanced control features. 

## Sample app

The complete sample app is available [here](https://github.com/Kinoma/KPR-examples/tree/master/ble-griffin-pm) on GitHub.

