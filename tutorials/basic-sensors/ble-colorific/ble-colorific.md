#BLE Colorific Light Bulb

The [Colorific](http://www.amazon.com/Colorific-Controlled-Dimmable-Android-Bluetooth/dp/B00KG1JYCI) is a LED light bulb that can be controlled via Bluetooth 4.0 (BLE). A Colorific Bulb app, available on both Android and iOS, is used to control the bulb color. This tutorial shows how to use Kinoma Create's touch screen and built-in JavaScript BLE stack to control the bulb color.

See a video demonstration of this project [here](https://youtu.be/PNwzZdrzlL4).

<!--
<iframe width="640" height="360" src="https://www.youtube.com/embed/PNwzZdrzlL4?rel=0&amp;controls=1&amp;showinfo=0&autoplay=0" frameborder="0" allowfullscreen></iframe>
-->

## Configuration

Applications incorporating BLE must first configure and initialize the BLE BLL before using any BLE services. 

```
   ...
   Pins.configure({   	
      ble: {
         require: "/lowpan/ble",			
      }
   }, success => this.onPinsConfigured(application, success));
   ...
```
After configuration, the `onPinsConfigued` function is called and the application completes initialization. 

```
onPinsConfigured(application, success) {
   if (success) {
      this.data = {
         title: "RGBLightOne",
         titleStyle: CREATIONS.whiteDynamicHeaderTitleStyle,
         colorable: true,
         hue: 1,
         brightness: .1,
         saturation: 1
   };
   Pins.when("ble", "notification", this.onBLENotification);
   application.add(new MainScreen(this.data));
}	
```
Assuming the BLE library configured successfully, the application completes it's initialization by providing a BLE notification callback. The callback is triggered by the BLE module to deliver the application BLE notifications. `Pins.when` is used here to configure the notification callback. All KinomaJS BLE apps should follow this configuration sequence.

##Control

For this BLE peripheral, there is a very well written project on Adafruit that shows how you can [reverse engineer the light control protocol](https://learn.adafruit.com/reverse-engineering-a-bluetooth-low-energy-light-bulb/overview). The article also provides additional background information on BLE, and how to sniff BLE devices using the [Bluefruit LE Sniffer](https://www.adafruit.com/product/2269) and [Wireshark](https://www.wireshark.org/download.html). 

Using the Bluefruit LE Sniffer, we found the writable GATT characteristic that controls the bulb color. The characteristic is accessed via handle 40, which we define at the top of `main.js.`

```
var COLORIFIC_HANDLE = 40;
```

The bulb color is controlled by writing a payload buffer to the GATT characteristic. The first four bytes of the payload are static values. The fifth byte controls the bulb's white brightness. In this sample app we specify a fixed brightness level. The final byte in the static portion of the payload serves as a separation byte. The next three bytes (index 6-8 not shown below) specify the bulb color. 

```
initialize(container) {
	var payload = this.payload;
	payload[0] = 0x58;
	payload[1] = 0x01;
	payload[2] = 0x03;
	payload[3] = 0x01;
	payload[4] = 0x10; // White brightness
	payload[5] = 0x00; // Separator byte
	this.connection = null;
	this.changeState(container, "idle");
}
```

The application enables peripheral device scanning and finds the Colorific by matching the device's BLE name in the scan response packets delivered for each peripheral discovered. The advertising data entry `flag` 0x09 correponds to a device's complete local name, which is specified as a string (`RGBLightOne`) in the `data` property. The application then connects to the matched peripheral.

```
onPeripheralDiscovered(container, peripheral) {
   if ("discovery" != this.state) return;
   var scanResponseData = peripheral.data;
   for (var i = 0, c = scanResponseData.length; i < c; ++i) {
      var entry = scanResponseData[i];
      if (0x09 == entry.flag && 'RGBLightOne' == entry.data) {
         // Complete local name
         this.connect(container, peripheral);
         return;
      }
   }
}
```

When connecting to the Colorific bulb, we specify a min and max connection interval range in the `intervals` property. The interval values allow Kinoma Create to send data more frequently to the bulb, which results in real time control of the color.

```
connect(container, peripheral) {
   if ("discovery" != this.state) return;
   this.changeState(container, "connect");
   var params = {
      address: peripheral.address,
      addressType: peripheral.addressType,
      intervals: {min: 8, max: 12},			// Fast connection interval for higher responsiveness
   }
   Pins.invoke("/ble/gapConnect", params);
}
```

This `onLightChanged` function is called to change the color of the bulb when the user interacts with the application's on-screen color wheel. The function sends our complete nine byte payload to the bulb using `gattWriteWithoutResponse`. The last three bytes contain the color value, which are converted to RGB from the HSV color space.

```
onLightChanged(container){
   if (null == this.connection) return;
	
   var rgb = hsvToColor(this.data.hue, this.data.saturation, 0.5 + this.data.brightness * 0.5);
   var rgbVals = rgb.slice(4,(rgb.length-1)).split(",");

   var payload = this.payload;
   payload[6] = rgbVals[0]; //R
   payload[7] = rgbVals[1]; //G
   payload[8] = rgbVals[2]; //B
	
   var params = {
      connection: this.connection,
      characteristic: COLORIFIC_HANDLE,
      value: this.buffer
   };
   Pins.invoke("/ble/gattWriteWithoutResponse", params);
}
```
	
The on-screen touch color wheel is implemented by a separate `common.js` JavaScript source code file that is included by the main application. This organization allows us to separate the UI code from the BLE connection logic.

```
include('common');
```

Inside our `common.js` file we implement our HSV color wheel using an HTML5 2D Canvas object. The user changes the selected color by dragging his or her finger on the wheel. The `onLightChanged` event is distributed to the application whenever the color changes.

```
setValue(container, value) {
   this.data.hue = value;
   application.distribute("onLightChanged");
}
```

## Sample app

The complete sample app is available [here](https://github.com/Kinoma/KPR-examples/tree/master/ble-colorific) on GitHub.
