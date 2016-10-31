#Kinoma Samples

These samples demonstrate how to write Kinoma applications. They are all complete, open source code applications that you can borrow from.

- Samples that have names of the form `element-xxx` (easily accessible using the Kinoma Element filter) are for Kinoma Element only. They can be imported into [Kinoma Code] and run in the built-in Kinoma Element simulator (Mac OS version only) or deployed and run on the Kinoma Element device.

- All other samples are designed to run on the devices and platforms that KinomaJS supports, including Kinoma Create, iOS, and Android. They can be imported into [Kinoma Code] and run in the built-in Kinoma Create simulator or built as standalone native applications for Kinoma Create, iOS, and Android.

The samples are also available on our website, on the [Kinoma Samples](http://kinoma.com/develop/samples/) page. 

Walk-through tutorials and projects based on a selection of these samples may be found in the [`tutorials` folder](./tutorials).

<hr />

<!-- Version 161003-CR / Last reviewed: September 2016 by Brian Friedkin and Lizzie Prader

Guidelines for individual sample intros: 

* They must be plain text, without any italic, bold, superscripting, Markdown comments, or hyperlinks.

* They should consist entirely of complete sentences, typically beginning with "This sample" (the samples should not be called "projects").

* For consistency the samples should generally be referred to as applications, not apps. 

* Each one should make it clear which platform it's for (Kinoma Element or Kinoma Create or iOS or Android), even if just mentioning KinomaJS.

* If there is a related Kinoma Tutorial or Kinoma Project, refer to it at the end of the blurb with, e.g., "See the Analog Drawing Toy tutorial for more information." 

For more guidelines, please see http://kinoma.com/develop/documentation/doc-style-sheet/.

-->

<x-tag-info tags="createSample,elementSample,networkSample,uiSample,pinsSample,filesSample,mediaSample,mobileSample,bluetoothSample" titles="Kinoma Create,Kinoma Element,Network,User Interface,Pins,Files,Media,Mobile,Bluetooth"/>

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/amazon-alexa" class="createExampleLink" >amazon-alexa</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/amazon-alexa"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/amazon-alexa-example.jpg" height="100" alt=""/></a>

<x-app-info id="amazonalexa.example.kinoma.marvell.com"><span class="createSample pinsSample uiSample mediaSample"></span></x-app-info>

This sample shows how to use Amazon's Alexa Voice Service v1 API to build a simple KinomaJS Alexa client. The application captures and uploads spoken voice in real time using the Pins library and HTTP chunked transfer encoding. A KinomaJS canvas object animation provides interactive input voice level and Alexa answer feedback. To use this sample, you need to have an Amazon developer account and "Login with Amazon" access tokens.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-drawing-toy" class="createExampleLink">analog-drawing-toy</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-drawing-toy"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-drawing-toy-example.jpg" height="100" alt=""/></a>

<x-app-info id="analogdrawingtoy.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample uses two different BLLs. One BLL communicates with two potentiometers and sends their readings to the main thread, where they are interpreted as x, y coordinates; lines are drawn between the coordinates to make pictures. A second BLL gets readings from an accelerometer, and when these readings exceed a threshold, the drawing is erased. See the Analog Drawing Toy tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-GP2Y0A02YK0F">analog-GP2Y0A02YK0F</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-GP2Y0A02YK0F"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-GP2Y0A02YK0F-example.jpg" height="100" alt=""/></a>

<x-app-info id="GP2Y0A02YK0F.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample shows how to integrate the Sharp GP2Y0A02YK0F long-range infrared proximity sensor (available as SparkFun SEN-08958) with Kinoma Create. The analog sensor supports range readings between 15 and 150 cm. The application displays the range reading and plays a beep sound that increases in frequency as you get closer to the sensor.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-graph">analog-graph</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-graph"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-graph-example.jpg" height="100" alt=""/></a>

<x-app-info id="analoggraph.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample uses a BLL to poll values from an analog sensor and graphs these values using a KinomaJS canvas object. See the Analog Value Graph tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-HIH4030">analog-HIH4030</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-HIH4030"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-HIH4030-example.jpg" height="100" alt=""/></a>

<x-app-info id="HIH4030.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample consists of a BLL and application for the Honeywell HIH-4030 humidity sensor. It includes a BLL simulator for use in Kinoma Code and a device BLL for use on Kinoma Create. The sample also uses the Texas Instruments TMP102 digital temperature sensor to provide a temperature-compensated humidity reading. The code demonstrates how to chain sensor readings using KinomaJS messages invoked from the main screen.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-kinoma-initialstate">analog-kinoma-initialstate</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-kinoma-initialstate"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-kinoma-initialstate-example.jpg" height="100" alt=""/></a>

<x-app-info id="analogkinomainitialstate.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample sends HTTP requests to the Initial State REST API to upload sensor data to a data bucket. The values are read from an analog sensor plugged into pin 51 on Kinoma Create. Before running the application, sign up for a free Initial State account and replace the dummy text in the code with your bucket ID and access key, shown in your bucket's settings.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-MB1010">analog-MB1010</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-MB1010"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-MB1010-example.jpg" height="100" alt=""/></a>

<x-app-info id="MB1010.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample shows how to use the MaxBotix LV-MaxSonar-EZ1 MB1010 sonar range finder with Kinoma Create. The BLL reads the MB1010 analog voltage pin and converts the voltage measured to a range in inches.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-ML8511">analog-ML8511</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-ML8511"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-ML8511-example.jpg" height="100" alt=""/></a>

<x-app-info id="ML8511.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample shows how to use the SparkFun UV Sensor Breakout with Kinoma Create. This ML8511 UV Sensor developed by LAPIS Semiconductor provides a UV intensity reading through its analog output. The application displays the current sensor intensity value and the UV Index derived from it. (The UV Index calculation may require calibration for your part of the world.)

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-pulse">analog-pulse</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-pulse"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-pulse-example.jpg" height="100" alt=""/></a>

<x-app-info id="pulse.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

The sample makes your heartbeat visible on the Kinoma Create screen. Using the Pulse Sensor developed by World Famous Electronics (pulsesensor.com), available as SparkFun SEN-11574, the BLL monitors the analog signal to detect beats. The BLL is based on the sample Arduino code from World Famous Electronics, converted to JavaScript and modified for optimal use with KinomaJS.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-starter">analog-starter</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-starter"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-starter-example.jpg" height="100" alt=""/></a>

<x-app-info id="analogstarter.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This stripped-down application reads a value from an Analog Input pin and displays it on the Kinoma Create screen. It demonstrates how to implement an Analog pin BLL in KinomaJS. See the Analog Skeleton tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-temperature">analog-temperature</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-temperature"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-temperature-example.jpg" height="100" alt=""/></a>

<x-app-info id="analogtemperature.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample shows how to implement a BLL to read from an analog temperature sensor (TMP36 in this case) and display the results on the Kinoma Create screen.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-trimpot">analog-trimpot</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/analog-trimpot"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/analog-trimpot-example.jpg" height="100" alt=""/></a>

<x-app-info id="trimpot.example.kinoma.marvell.com"><span class="createSample pinsSample mediaSample uiSample"></span></x-app-info>

This sample demonstrates how to use an analog trimpot to control the media player volume level. Both device and simulator BLLs are provided. The sample was developed using the Suntan TSR-3386U 10K trimpot (available as SparkFun COM-09806). The displayed volume control is implemented using KinomaJS containers and skins.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/animated-sprite">animated-sprite</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/animated-sprite"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/animated-sprite-example.jpg" height="100" alt=""/></a>

<x-app-info id="animatedsprite.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample shows how to implement a simple animated sprite. The frames are rendered from a horizontal image strip wrapped by a KinomaJS texture and skin. The skin is bound to a KinomaJS content object that drives the animation using an interval timer.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/animation-behaviors">animation-behaviors</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/animation-behaviors"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/animation-behaviors-example.jpg" height="100" alt=""/></a>

<x-app-info id="animationbehaviors.example.kinoma.marvell.com"><span class="uiSample createSample"></span></x-app-info>

This sample provides a collection of KinomaJS behaviors for implementing animations commonly found in user interfaces. Examples show how to apply rotation, clipping, translation, fading, and blinking behaviors to KinomaJS containers. Easing functions are supported to further customize the animations. A sequencer behavior uses JavaScript 6 promises to drive sequential and parallel animations.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/audio-detect">audio-detect</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/audio-detect"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/audio-detect-example.jpg" height="100" alt=""/></a>

<x-app-info id="audiodetect.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This application monitors the audio level using the Kinoma Create built-in microphone. The audioin BLL records audio samples, which it uses the calculate the peak and average sample levels, as well as the power level (RMS). The results are displayed in real time by the application, which also adjusts the screen color in real time: black for quiet, white for loud, and grays for in between.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/audio-recorder-player">audio-recorder-player</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/audio-recorder-player"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/audio-recorder-player-example.jpg" height="100" alt=""/></a>

<x-app-info id="audiorecorderplayer.example.kinoma.marvell.com"><span class="createSample pinsSample mediaSample"></span></x-app-info>

This application demonstrates how to record and play up to 30 seconds of audio with the Kinoma Create built-in microphone and speaker. See the Audio Recorder Player tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/balls">balls</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/balls"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/balls-example.jpg" height="100" alt=""/></a>

<x-app-info id="balls.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample is a bouncing-ball animation in which each ball is created as a content object using different variants from an image skin. The balls travel as a result of changing the content coordinates over time. The application is written using the KinomaJS JavaScript API and demonstrates how to use image skins and content timers.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-checkbox">basic-checkbox</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-container-layout"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/basic-checkbox-example.jpg" height="100" alt=""/></a>

<x-app-info id="basiccheckbox.example.kinoma.marvell.com"><span class="uiSample mobileSample"></span></x-app-info>

This basic application demonstrates how to use the checkbox object from the Controls library. In addition to general setup, one option for implementing Check All is shown.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-container-layout">basic-container-layout</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-container-layout"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/basic-container-layout-example.jpg" height="100" alt=""/></a>

<x-app-info id="basiccontainerlayout.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This basic application shows how coordinates are used in KinomaJS to specify the position and size of contents relative to their container. The application also uses the KinomaJS Array.prototype.map function to build a container list from an array of instantiating data.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-dialog">basic-dialog</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-dialog"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/basic-dialog-example.jpg" height="100" alt=""/></a>

<x-app-info id="basicdialog.example.kinoma.marvell.com"><span class="uiSample mobileSample"></span></x-app-info>

This basic application shows how to display a dialog box and handle user input in KinomaJS.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-event-driven-ui">basic-event-driven-ui</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-event-driven-ui"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/basic-event-driven-ui-example.jpg" height="100" alt=""/></a>

<x-app-info id="basiceventdrivenui.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This basic application shows how to distribute events across the KinomaJS containment hierarchy to simultaneously update multiple user interface elements.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-scroller">basic-scroller</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-scroller"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/basic-scroller-example.jpg" height="100" alt=""/></a>

<x-app-info id="basicscroller.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This basic application demonstrates how to dynamically build a scrolling list from a simple array of items in KinomaJS. Tapping a list item triggers an action. Each list item also includes an embedded button (in blue) that triggers a different action when tapped.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-web-service-request">basic-web-service-request</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/basic-web-service-request"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/basic-web-service-request-example.jpg" height="100" alt=""/></a>

<x-app-info id="basicwebservicerequest.example.kinoma.marvell.com"><span class="networkSample"></span></x-app-info>

This basic application makes a request to a simple web service to generate the MD5 hash of a string in KinomaJS. It demonstrates making requests using JSON, processing JSON responses, and doing basic error handling.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-ancs">ble-ancs</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-ancs"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-ancs-example.jpg" height="100" alt=""/></a>

<x-app-info id="bleancs.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample demonstrates how to implement a BLE Apple Notification Center Service (ANCS) consumer. After an iPhone is paired with the application, received text, email, and phone call notifications are displayed on the Kinoma Create screen. Both BLE central and peripheral roles are supported by this application, which shows how to advertise the ANCS service solicitation and connect with the ANCS provider.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-clapper">ble-clapper</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-clapper"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-clapper-example.jpg" height="100" alt=""/></a>

<x-app-info id="bleclapper.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample demonstrates how to turn a light on or off by clapping into the Kinoma Create microphone. The application controls the BLE Satechi IQ Plug by monitoring the recorded audio level in real time and enabling the plug when the audio level reaches a peak threshold. The IQ Plug is discovered by name and controlled by writing to its control characteristic. See the BLE Clapper tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-colorific">ble-colorific</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-colorific"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-colorific-example.jpg" height="100" alt=""/></a>

<x-app-info id="blecolorific.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample shows how to discover and control the BLE Colorific LED light bulb. An interactive touch color wheel displayed on the Kinoma Create screen is used to change the bulb color in real time. The application additionally shows how to configure the BLE connection intervals to achieve higher responsiveness when controlling BLE peripherals. See the BLE Colorific Light Bulb tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-griffin-pm">ble-griffin-pm</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-griffin-pm"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-griffin-pm-example.jpg" height="100" alt=""/></a>

<x-app-info id="blegriffinpm.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

The Griffin Technology PowerMate Bluetooth button is a wireless control knob that can be integrated into other projects. This sample application shows how to discover the button's primary GATT service, connect, and detect button presses and left/right spins. See the Griffin PowerMate Bluetooth Button tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-heart-rate-monitor">ble-heart-rate-monitor</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-heart-rate-monitor"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-heart-rate-monitor-example.jpg" height="100" alt=""/></a>

<x-app-info id="bleheartratemonitor.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample demonstrates how to build a BLE central application that communicates with a BLE heart rate monitor. Once connected to the monitor, the application discovers the Bluetooth Heart Rate Service (0x180D) and the Heart Rate Measurement characteristic (0x2A37). Notifications are requested on the Heart Rate Measurement characteristic, enabling the application to display beats per minute. This application can be used as a companion to the ble-heart-rate-peripheral sample.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-heart-rate-peripheral">ble-heart-rate-peripheral</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-heart-rate-peripheral"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-heart-rate-peripheral-example.jpg" height="100" alt=""/></a>

<x-app-info id="bleheartrateperipheral.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample demonstrates how to build a BLE peripheral application that simulates a heart rate monitor. As a peripheral, the application advertises the Generic Access (0x1800), Device Information (0x180A), Heart Rate (0x180D), and Battery (0x180F) GATT services. Once connected to a BLE client, the application simulates a heart rate monitor by writing measurement values to its local GATT database, which in turn automatically notifies the connected client. This application can be paired with any mobile app (such as Polar Beat) that communicates with BLE heart rate monitors, or used as a companion to the ble-heart-rate-monitor sample.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-keyboard">ble-keyboard</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-keyboard"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-keyboard-example.jpg" height="100" alt=""/></a>

<x-app-info id="blekeyboard.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample integrates Kinoma Create with the BLE Miselu C.24 wireless MIDI keyboard. Notes played on the keyboard are displayed in real time on the Kinoma Create screen, and audio is played through the Kinoma Create speaker. The application interfaces to the keyboard as an Apple Bluetooth MIDI client and demonstrates full BLE service and characteristic discovery, notification enabling, configuration of high-performance connections, and audio synthesis. See the Bluetooth LE Miselu C.24 Keyboard tutorial for more information. 

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-mesh-button">ble-mesh-button</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-mesh-button"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-mesh-button-example.jpg" height="100" alt=""/></a>

<x-app-info id="blemeshbutton.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample shows how to discover and receive button press/hold notifications from Sony MESH Button Tags, which are small BLE peripherals dedicated to specific functions. The application first establishes a secure and encrypted connection as required by the tag. Once it is connected and services/characteristics are discovered, the application displays button presses on the Kinoma Create screen.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-satechi-iqplug">ble-satechi-iqplug</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-satechi-iqplug"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-satechi-iqplug-example.jpg" height="100" alt=""/></a>

<x-app-info id="blesatechiiqplug.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

The BLE Satechi IQ Plug lets you control electronic devices and appliances from Bluetooth-enabled phones. This sample shows how to connect to the plug and turn it on and off from the Kinoma Create screen. It discovers the IQ Plug by matching the device name broadcast in BLE scan response packets. Once the plug is connected, the application controls it by writing commands to the plug's control characteristic. See the Bluetooth LE Satechi IQ Plug tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-tempo">ble-tempo</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-tempo"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-tempo-example.jpg" height="100" alt=""/></a>

<x-app-info id="bletempo.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

This sample interfaces with the Blue Maestro Tempo Environment Monitor to display the measured temperature, relative humidity, and barometric pressure on the Kinoma Create screen. The Tempo provides these measurements in BLE scan response packets as custom manufacturer advertisement data. The application shows how to parse the advertisement data to extract the sensor measurements.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-ti-sensortag">ble-ti-sensortag</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ble-ti-sensortag"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ble-ti-sensortag-example.jpg" height="100" alt=""/></a>

<x-app-info id="bletisensortag.example.kinoma.marvell.com"><span class="createSample pinsSample bluetoothSample"></span></x-app-info>

The TI SensorTag is a BLE development platform for prototyping IoT devices. This sample shows how to interface with each of the onboard BLE sensor services and display the sensor data on the Kinoma Create screen.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/bll-repeat">bll-repeat</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/bll-repeat"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/bll-repeat-example.jpg" height="100" alt=""/></a>

<x-app-info id="bllrepeat.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample demonstrates how to run a Kinoma BLL repeatedly (which is useful when polling a sensor, for instance). The application calls a BLL that traces to the console 10 times and then stops the repetition.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/bll-run">bll-run</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/bll-run"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/bll-run-example.jpg" height="100" alt=""/></a>

<x-app-info id="bllrun.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

BLLs are JavaScript modules that contain the code for hardware modules and communicate directly with hardware pins. This sample demonstrates how to run a Kinoma BLL once. It shows how to pass parameters to a BLL, receive them in the BLL, and get results back from a BLL.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/browser">browser</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/browser"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/browser-example.jpg" height="100" alt=""/></a>

<x-app-info id="browser.example.kinoma.marvell.com" platform="mac,iphone,android"><span class="uiSample mobileSample"></span></x-app-info>

This sample shows how to implement an embedded web view container. The code embeds the web view with a browser container. (Note, the browser container is not available on Windows or Kinoma Create.) The application demonstrates how to display a web page in the browser, support browser forward/backward navigation, implement callbacks when the web page is loading/loaded, display a busy indicator using MobileFramework, and use anchor references to containers.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/camera">camera</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/camera"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/camera-example.jpg" height="100" alt=""/></a>

<x-app-info id="camera.example.kinoma.marvell.com" platform="mac,win,iphone,android"><span class="uiSample mobileSample"></span></x-app-info>

This sample is a camera application that supports live preview and capture. It demonstrates how to integrate the camera media reader with a picture container, use the KinomaJS Files API to write the captured image to storage, implement screen transitions, detect the platform at runtime, adapt container layouts to device orientation changes, use a canvas object to implement a button, and play one-shot sounds. (Camera support is not provided on Kinoma Create, but this application includes a mockup implementation for the Kinoma Code simulators.)

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/canvas">canvas</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/canvas"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/canvas-example.jpg" height="100" alt=""/></a>

<x-app-info id="canvas.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This MobileFramework example demonstrates how to use the HTML Canvas 2D API. Tapping the settings icon displays a menu that lets you select the drawing color and line thickness. The main container provides a 2D canvas to draw on. Selecting Play from the settings menu replays your drawing. This sample shows how to use the KinomaJS JavaScript API to build and draw on a HTML Canvas 2D Context.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/catdoor-companion">catdoor-companion</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/catdoor-companion"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/catdoor-companion-example.jpg" height="100" alt=""/></a>

<x-app-info id="catdoor.companion.example.kinoma.marvell.com"><span class="pinsSample uiSample"></span></x-app-info>

This sample is an optional mobile companion app for the element-catdoor sample. It displays information about a cat's in-and-out activity based on data shared wirelessly by a Kinoma Element attached to a cat door. See the Cat Door project for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/clare">clare</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/clare"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/clare-example.jpg" height="100" alt=""/></a>

<x-app-info id="clare.example.kinoma.marvell.com"><span class="uiSample createSample"></span></x-app-info>

This sample is an interactive animation using the HTML Canvas 2D API, with three modes: scan, pleasant surprise, and track, all accompanied by blinking and saccades of the eyes. The first two modes are randomly triggered, but the last responds to touch. The geometry is primarily composed of quadratic Bézier curves, and the eyes take advantage of the asymmetry available in the radial gradient. Every frame is recomputed using a periodic KinomaJS content timer that triggers an elastic state machine.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/coap-client">coap-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/coap-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/coap-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="coapclient.example.kinoma.marvell.com"><span class="uiSample networkSample createSample"></span></x-app-info>

This client application is intended to run simultaneously with the coap-server sample; it demonstrates how to implement a CoAP protocol client. The KinomaJS application sends an observe request to the color server running on the same network and receives updates from that server. The client can send a new color by choosing from a palette, slider, or RGB color sensor (TCS34725).

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/coap-server">coap-server</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/coap-server"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/coap-server-example.jpg" height="100" alt=""/></a>

<x-app-info id="coapserver.example.kinoma.marvell.com"><span class="uiSample networkSample createSample"></span></x-app-info>

This server application is intended to run simultaneously with the coap-client sample; it demonstrates how to implement a CoAP protocol server. The KinomaJS application serves color information and the server name to clients and also changes the color of an attached tri-color LED (available as SparkFun COM-10821) to match the server's information. Since CoAP is a standard protocol, you can use other CoAP clients with the server, such as the Ruby CoAP module. See scripts/test.rb for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/console">console</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/console"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/console-example.jpg" height="100" alt=""/></a>

<x-app-info id="console.example.kinoma.marvell.com"><span class="createSample"></span></x-app-info>

This sample demonstrates how to display a simple console for logging debugging messages on Kinoma Create. New messages are added to the end of the console log and auto-scrolled into view. The console log can also be viewed in a web browser. 

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/controls-buttons">controls-buttons</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/controls-buttons"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/controls-buttons-example.jpg" height="100" alt=""/></a>

<x-app-info id="controls.example.kinoma.marvell.com"><span class="uiSample mobileSample"></span></x-app-info>

This sample demonstrates how to integrate MobileFramework buttons and behaviors into an application. Button types include push, checkbox, radio, and radio group.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/dial-client">dial-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/dial-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/dial-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="dialclient.example.kinoma.marvell.com"><span class="createSample networkSample"></span></x-app-info>

This Kinoma Create application is the remote DIAL client for the dial-remote sample. The application can be launched, quit, and configured by the dial-remote application. DIAL client applications can receive launch configuration parameters by supplying a /dial handler. The parameters are delivered in the query property of the handler's message. The number of balls displayed can be configured by the dial-remote application.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/dial-remote">dial-remote</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/dial-remote"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/dial-remote-example.jpg" height="100" alt=""/></a>

<x-app-info id="dialremote.example.kinoma.marvell.com"><span class="createSample networkSample mobileSample"></span></x-app-info>

This MobileFramework example demonstrates how to use KinomaJS DIAL to remotely launch, configure, and quit the dial-client sample application (which must be installed on Kinoma Create). KinomaJS DIAL uses SSDP to discover DIAL servers, and DIAL requests are issued to the remote DIAL server. The target DIAL application name is the KinomaJS application ID. DIAL uses an HTTP POST request to launch applications. The body of the request contains the parameters passed to the application.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/dialog">dialog</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/dialog"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/dialog-example.jpg" height="100" alt=""/></a>

<x-app-info id="dialog.example.kinoma.marvell.com" platform="mac,win,iphone,android"><span class="uiSample mobileSample"></span></x-app-info>

This application demonstrates how to set up and display MobileFramework dialogs. Various common controls are integrated into the dialog samples, and selected values are output when the dialogs are dismissed. Dialogs are built from a list of items returned by the onDescribe dialog behavior handler function.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-in-hello-world">digital-in-hello-world</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-in-hello-world"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/digital-in-hello-world-example.jpg" height="100" alt=""/></a>

<x-app-info id="digitalinhelloworld.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample uses a Digital pin to read input from a physical button. When pressed, the button triggers an event in the application that removes a character from the string "Hello World!" on the Kinoma Create screen. This application demonstrates the setup and integration of a Digital Input pin BLL in KinomaJS.  See the Digital In Hello World tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-light-websockets-client">digital-light-websockets-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-light-websockets-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/digital-light-websockets-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="digitallightwebsocketsclient.example.kinoma.marvell.com"><span class="createSample mobileSample networkSample uiSample"></span></x-app-info>

This client application is intended to run simultaneously with the digital-light-websockets-server sample. It acts as a companion app that can switch on and off an LED hooked up to the server-side Kinoma Create. This sample shows how to discover servers using the built-in SSDP support in KinomaJS, create and invoke messages to the server using WebSockets, and keep the user interface of multiple client applications in sync with the server. See the Digital LED and WebSockets tutorial] for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-light-websockets-server">digital-light-websockets-server</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-light-websockets-server"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/digital-light-websockets-server-example.jpg" height="100" alt=""/></a>

<x-app-info id="digitallightwebsocketsserver.example.kinoma.marvell.com"><span class="createSample pinsSample networkSample"></span></x-app-info>

This server application is intended to run simultaneously with the digital-light-websockets-client sample. It shows how to connect to one or more clients using the built-in SSDP support and how to implement a BLL to turn on and off an LED in response to client commands sent via WebSockets. The server keeps all the clients synced with the state of the LED.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-out-led">digital-out-led</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-out-led"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/digital-out-led-example.jpg" height="100" alt=""/></a>

<x-app-info id="digitaloutled.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample uses a Digital pin to turn on and off an LED when a button is tapped on the Kinoma Create screen. It demonstrates the setup and integration of a Digital Output pin BLL in KinomaJS. See the Digital Out LED tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-reflex-test">digital-reflex-test</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/digital-reflex-test"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/digital-reflex-test-example.jpg" height="100" alt=""/></a>

<x-app-info id="digitalreflextest.example.kinoma.marvell.com"><span class="createSample pinsSample uiSample"></span></x-app-info>

This sample demonstrates how to use a Digital pin to read input from a physical button and use sub-pixel rendering to get smooth animation. It is a simple reflex testing game to play on Kinoma Create. Three sheep attempt to run across the screen, and the player's goal is to tap the button before they make it all the way across.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/discovery-client">discovery-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/discovery-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/discovery-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="discoveryclient.example.kinoma.marvell.com"><span class="networkSample mobileSample uiSample"></span></x-app-info>

This client application is intended to be run simultaneously with the discovery-server sample. It demonstrates how to build a companion app that discovers and interacts with a device. The client discovers all com.marvell.kinoma.example.discoveryserver servers on the same network and, for each server discovered, displays a color swatch in a vertically scrolling container. The client requests the color from the server by invoking the server's /color handler. The list is updated on the fly as servers are discovered and lost. This sample shows how to discover servers using the built-in SSDP support in KinomaJS, how to create and invoke a cross-application message, and how to dynamically build a scrolling container of items.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/discovery-server">discovery-server</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/discovery-server"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/discovery-server-example.jpg" height="100" alt=""/></a>

<x-app-info id="discoveryserver.example.kinoma.marvell.com"><span class="networkSample"></span></x-app-info>

This server application demonstrates how to implement a discoverable device and is intended to run simultaneously with the discovery-client sample. The application/device is made discoverable by setting the shared application property to true. The /color handler is called remotely by the client and returns a JSON object containing a CSS color string.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/effects">effects</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/effects"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/effects-example.jpg" height="100" alt=""/></a>

<x-app-info id="effects.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This MobileFramework example demonstrates how to build and apply a variety of effects to KinomaJS layers and pictures. Tapping the settings icon displays a scrolling menu of effect types; the effect you select is applied to the Effect layer. Tapping the Play button at the bottom of the menu applies the selected effect to a bouncing-ball animation. This application shows how to build and apply KinomaJS effects using the KinomaJS JavaScript API.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-analog-led">element-analog-led</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-analog-led"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-analog-led-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.analog.led.project.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This sample changes the brightness of a PWM LED connected to Kinoma Element based on the reading from an analog sensor. It demonstrates using both the built-in analog BLL that works on a variety of sensors (including potentiometers and photoresistors) and a user-defined BLL for the LED.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-blinking-led">element-blinking-led</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-blinking-led"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-blinking-led-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementblinkingled"><span class="elementSample pinsSample"></span></x-app-info>

This sample toggles an LED connected to Kinoma Element on and off every second. It demonstrates setting up a simple digital BLL.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-button-led">element-button-led</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-button-led"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-button-led-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementbuttonled"><span class="elementSample pinsSample"></span></x-app-info>

This sample toggles an LED connected to Kinoma Element on and off whenever a button is pressed. It demonstrates the use of the built-in digital BLL for the LED and a user-defined BLL for the button. It also demonstrates the process of setting up two BLLs such that the reading of one is used to write the other.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-catdoor">element-catdoor</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-catdoor"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-catdoor-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.catdoor.example.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This sample enables you to track a cat's in-and-out activity using an off-the-shelf cat door, a Kinoma Element, a basic LED, and two sets of magnetic reed sensors. See the Cat Door project for a walk-through of the code and instructions to build the project components. The catdoor-companion sample acts as an optional mobile companion app.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-colors">element-colors</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-colors"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-colors-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementcolors"><span class="elementSample pinsSample"></span></x-app-info>

This application for Kinoma Element changes the color of a PWM tri-color LED to the color sensed by a TCS34725 RGB color sensor. It demonstrates the process of setting up two BLLs such that the reading of one is used to write the other.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-hello-velo">element-hello-velo</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-hello-velo"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-hello-velo-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.hello.velo.project.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>


This sample was written by Valkyrie Savage. It demonstrates how to interface Kinoma Element with a GPS receiver and SIM card (connected via an AdaFruit FONA board), enabling the device to communicate with its owner via text message. In this application it is used to inform the owner of his/her bike's location and another person with an ETA when the owner leaves the office.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-http-client">element-http-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-http-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-http-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementhttpclient"><span class="elementSample"></span></x-app-info>

This client application for Kinoma Element is intended to run simultaneously with the element-http-server sample. It sends the message "Hello!" and receives the response "Hello back!" if the server is active.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-http-server">element-http-server</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-http-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-http-server-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementhttpserver"><span class="elementSample"></span></x-app-info>

This server application for Kinoma Element can be run with the element-http-client example or by sending a request by other means. The HTTP server responds with an echo of the body of each request received.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-i2c-temp">element-i2c-temp</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-i2c-temp"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-i2c-temp-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementi2ctemp"><span class="elementSample pinsSample"></span></x-app-info>

This sample obtains the current temperature from an I2C temperature sensor (TMP102) connected to Kinoma Element and traces the value every second. It demonstrates the setup and integration of an I2C BLL on Kinoma Element.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-initial-state">element-initial-state</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-initial-state"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-initial-state-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.initial.state.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This sample takes a reading from an analog sensor connected to Kinoma Element every three seconds and sends data to an Initial State bucket. Data is logged and can be visualized as a graph or saved in a file and analyzed. The application demonstrates the setup and integration of an analog BLL and the use of the HTTPClient module to send data to a web service. See the Analog Photocell and HTTPClient tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-photo-door">element-photo-door</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-photo-door"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-photo-door-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementpwmservo"><span class="elementSample pinsSample"></span></x-app-info>

This application for Kinoma Element takes a picture based on proximity sensing and posts the image to Amazon S3 cloud storage. It uses the VC0706 serial camera and the MaxBotix LV-MaxSonar-EZ1 MB1010 sonar range finder. To post images, sign up for a free AWS account and replace the dummy text in credentials.js with your access ID and access key. You can view your images in your AWS account or with the photo-door-client sample.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-serial-7segment-display">element-serial-7segment-display</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-serial-7segment-display"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-serial-7segment-display-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.s7s.example.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This simple application for Kinoma Element uses the setInterval and clearInterval functions from the Timer module and the SparkFun COM-11442 7-Segment Serial Display to create a stopwatch. Pause, reset, and start functions can be accessed via the command line.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-pwm-servo">element-pwm-servo</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-pwm-servo"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-pwm-servo-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementpwmservo"><span class="elementSample pinsSample"></span></x-app-info>

This simple application for Kinoma Element shows how to turn a continuous rotation servo clockwise and counterclockwise.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-pwm-servo-control">element-pwm-servo-control</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-pwm-servo-control"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-pwm-servo-control-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementpwmservocontrol"><span class="elementSample pinsSample"></span></x-app-info>

This simple example for Kinoma Element controls the position of a hobby servo on pin 9 using input from an analog controller (such as a potentiometer, accelerometer, or sensors for proximity, temperature, moisture, flexion, and so on) on pin 3. For maximum control and responsiveness, both the sensor and the servo can be calibrated with minimum and maximum values. This sample uses built-in BLLs for PWM, analog, power, and ground; more complex control sensors may call for a custom BLL.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-temp-led">element-temp-led</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-temp-led"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-temp-led-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.temp.led.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This sample reads the temperature from an I2C temperature sensor (TMP102) and changes the color of an RGB LED accordingly. It demonstrates the setup and integration of I2C and PWM BLLs and the process of setting up two BLLs such that the reading of one is used to write the other. See the I2C Temperature and PWM Tri-Color LED tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-touch-relay">element-touch-relay</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-touch-relay"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-touch-relay-example.jpg" height="100" alt=""/></a>

<x-app-info id="element.touch.relay.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This application for Kinoma Element reads a capacitive touch sensor and toggles a Tessel relay module when tapped. It demonstrates how to configure digital input and output sensors using the built-in digital BLL from the Pins module. See the Digital Relay and Capacitive Touch Sensor tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-twin-lamps">element-twin-lamps</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-twin-lamps"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-twin-lamps-example.jpg" height="100" alt=""/></a>

<x-app-info id="twin.lamps.example.kinoma.marvell.com"><span class="elementSample pinsSample"></span></x-app-info>

This sample uses capacitive touch sensors and Tessel relay modules interfaced with Kinoma Element to create a network of two touch-controlled table lamps. It demonstrates the use of pins sharing and discovery.  See the Twin Lamps project for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/element-wifigotchi">element-wifigotchi</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/element-wifigotchi"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/element-wifigotchi-example.jpg" height="100" alt=""/></a>

<x-app-info id="elementwifigotchi"><span class="elementSample pinsSample"></span></x-app-info>

This sample by Andrew Chalkley calls a web service created by the developer and changes the display on an 8x8 LED matrix (available as Adafruit 1857) to one of three emojis based on the command received. The command can be changed by selecting an emoji on http://wifigotchi.com before running the application. The application demonstrates the use of the HTTPClient module and an I2C sensor.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/file-explorer">file-explorer</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/file-explorer"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/file-explorer-example.jpg" height="100" alt=""/></a>

<x-app-info id="fileexplorer.example.kinoma.marvell.com"><span class="uiSample filesSample mediaSample"></span></x-app-info>

This MobileFramework example demonstrates how to use the global KinomaJS Files API to iterate over local files and directories. The application displays the results in a scrolling list view and provides for deep browsing into nested directories. In addition, previews are supported for image, audio, and video files. This sample is useful for understanding how to use the Files iterator to iterate over a directory, distinguish between file and directory results, implement command and screen handler behaviors, and build scrolling list-based views.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/files-buffers">files-buffers</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/files-buffers"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/files-buffers-example.jpg" height="100" alt=""/></a>

<x-app-info id="filesbuffers.example.kinoma.marvell.com"><span class="filesSample"></span></x-app-info>

This sample demonstrates how to use the global KinomaJS Files API, which enables reading and writing text, binary, JSON, and XML files and manipulating/iterating directories.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/flickr-grid">flickr-grid</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/flickr-grid"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/flickr-grid-example.jpg" height="100" alt=""/></a>

<x-app-info id="flickrgrid.example.kinoma.marvell.com"><span class="uiSample mediaSample mobileSample"></span></x-app-info>

This sample demonstrates how to implement an interactive, scrolling photo thumbnail grid. Tapping a thumbnail opens the full-size image using a zoom transition. The thumbnails are retrieved from a Flickr public feed using a tag search, and the resulting data set is delivered in JSON format. This is a good example of how to display images, adapt the layout to device orientation changes, use tool buttons or swipe to navigate between photos, invoke a message to fetch data from a REST API, and implement MobileFramework screen open/close transitions.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/hello">hello</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/hello"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/hello-example.jpg" height="100" alt=""/></a>

<x-app-info id="hello.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This minimal application creates a full-screen container and displays the text "Hello, KPR". Tapping the container changes the background color. This sample is useful for understanding how to build a basic KinomaJS application.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-gamepad">hid-gamepad </a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-gamepad"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/hid-gamepad-example.jpg" height="100" alt=""/></a>

<x-app-info id="hid.gamepad.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample uses 16 onscreen buttons and two analog joysticks attached to the front pins to make Kinoma Create act as a controller for games running on Windows, Mac OS, and Steam Link. It demonstrates the use of the Gamepad class of the HID library and analog sensors.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-keyboard">hid-keyboard </a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-keyboard"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/hid-keyboard-example.jpg" height="100" alt=""/></a>

<x-app-info id="hid.keyboard.example.kinoma.marvell.com"><span class="createSample"></span></x-app-info>

This sample demonstrates basic use of the Keyboard class of the HID library to make Kinoma Create act as a USB keyboard. You can send input by tapping the onscreen keyboard.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-mouse">hid-mouse</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-mouse"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/hid-mouse-example.jpg" height="100" alt=""/></a>

<x-app-info id="hid.mouse.example.kinoma.marvell.com"><span class="createSample"></span></x-app-info>

This sample uses the HID library to make Kinoma Create act as a USB mouse. The gray area on screen acts as a touchpad while the labeled buttons at the bottom enable the user to left-, middle-, and right-click.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-spotify">hid-spotify</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-spotify"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/hid-spotify-example.jpg" height="100" alt=""/></a>

<x-app-info id="hid. spotify.example.kinoma.marvell.com"><span class="createSample uiSample"></span></x-app-info>

This sample uses the HID library to make Kinoma Create act as a controller for the Spotify desktop application. A volume controller, play/pause button, and skip buttons send keyboard shortcut commands. The application also demonstrates how to use KinomaJS effects and layers to implement a colorful, animated background and how to build custom user interface elements with HTML Canvas.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-wii-nunchuck">hid-wii-nunchuck</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/hid-wii-nunchuck"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/hid-wii-nunchuck-example.jpg" height="100" alt=""/></a>

<x-app-info id="hid.wii.nunchuck.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This application interfaces to Kinoma Create a Wii Nunchuck that acts as a joystick for the game Bit Blaster XL. It builds on the i2c-wii-nunchuck-controller sample and demonstrates using the Keyboard and Gamepad classes of the HID library and an I2C sensor.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-color-sensor">i2c-color-sensor</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-color-sensor"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-color-sensor-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2ccolorsensor.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample changes the main container's skin to the color sensed by a TCS34725 RGB color sensor. R, G, and B readings are sent from the BLL to the main thread, where they are converted to hex notation. See the I2C Color Sensor tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-hover">i2c-hover</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-hover"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-hover-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2chover.example.kinoma.marvell.com"><span class="pinsSample createSample"></span></x-app-info>

This sample consists of a BLL and application for the Hover touchless gesture sensor from Hover Labs. The sample includes a BLL simulator for use in Kinoma Code and a device BLL for use on Kinoma Create. It demonstrates how to write a BLL that uses both I2C and Digital pins and changes the direction of Digital pins at runtime.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-monster-mayhem">i2c-monster-mayhem</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-monster-mayhem"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-monster-mayhem-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2cmonstermayhem.example.kinoma.marvell.com"><span class="uiSample pinsSample createSample"></span></x-app-info>

This application builds on the i2c-nfc sample by using the same Adafruit PN532 NFC/RFID Controller Shield to create an interactive game that makes use of the NFC cards as controllers. The user places a card on the reader and can select an avatar/"monster" from about 15 options. The program takes advantage of the fact that data can also be written to an NFC card and uses it as a storage medium: the user's choice is effectively serialized onto the card as JSON data, and to proceed with gameplay the user can then bring the card to another Kinoma Create on which the companion sample i2c-monster-mayhem-gumball is running.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-monster-mayhem-gumball">i2c-monster-mayhem-gumball</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-monster-mayhem-gumball"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-monster-mayhem-gumball-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2cmonstermayhemgumball.example.kinoma.marvell.com"><span class="uiSample pinsSample createSample"></span></x-app-info>

This sample is the companion application to the i2c-monster-mayhem sample and requires a properly programmed NFC card from that sample. The user places the pre-programmed card onto the NFC reader and then plays a simple memory game: all the possible candidate avatars/"monsters" scroll by, and once the correct avatar is shown (the one initially chosen by the user and programmed onto the card), the user must quickly remove the card from the reader to win the game and receive a gumball. The user is given three tries to do so and, if all attempts are exhausted, must select another monster with a Kinoma Create running i2c-monster-mayhem and reprogram the card.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-nfc">i2c-nfc</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-nfc"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-nfc-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2cnfc.example.kinoma.marvell.com"><span class="pinsSample createSample"></span></x-app-info>

This sample shows how to use the Adafruit PN532 NFC/RFID Controller Shield with Kinoma Create. The BLL can discover RFID sensors and read and write the data area on MIFARE Classic cards. The BLL communicates over I2C and can easily be adapted to work with other NFC devices that are based on the Philips PN532 NFC controller. The application shows how to display the ID of the discovered RFID.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-temperature">i2c-temperature</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-temperature"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-temperature-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2ctemperature.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample obtains the current temperature from an I2C temperature sensor and displays it on the Kinoma Create screen. It demonstrates the setup and integration of an I2C BLL in KinomaJS. See the I2C Temperature tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-tessel-accelerometer">i2c-tessel-accelerometer</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-tessel-accelerometer"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-tessel-accelerometer-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2tslaccel.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample shows how to read the Tessel Accelerometer Module, which uses the NXP (formerly Freescale) MMA8452Q three-axis accelerometer. The application displays the values of the sensor in real time and animates a ball based on the x and y values of the accelerometer. The application and BLL can easily be adapted to other accelerometers.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-tessel-climate">i2c-tessel-climate</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-tessel-climate"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-tessel-climate-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2tslclimate.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample uses the Tessel Climate Module to retrieve the humidity and temperature values from a Silicon Labs Si7020 sensor. The BLL performs the necessary calculations to transform the raw sensor data to values convenient for the application to display. The application can easily be adapted for use with other humidity and temperature sensors.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-touchshield">i2c-touchshield</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-touchshield"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-touchshield-example.jpg" height="100" alt=""/></a>

<x-app-info id="touchshield.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample shows how to integrate the SparkFun Touch Shield (DEV-12013) with Kinoma Create. The Touch Shield uses an NXP (formerly Freescale) MPR121 sensor controller to communicate multi-touch gestures over I2C. The application displays the multi-touch results in real time on the Kinoma Create screen.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-VCNL4000">i2c-VCNL4000</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-VCNL4000"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-VCNL4000-example.jpg" height="100" alt=""/></a>

<x-app-info id="VCNL4000.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample integrates the SparkFun Infrared Proximity Breakout board (VCNL4000) with Kinoma Create. The board integrates a proximity sensor, ambient light sensor, and infrared emitter. The sensor communicates over I2C, and the application displays both proximity and the ambient light levels.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-wii-nunchuck-controller">i2c-wii-nunchuck-controller</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/i2c-wii-nunchuck-controller"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/i2c-wii-nunchuck-controller-example.jpg" height="100" alt=""/></a>

<x-app-info id="i2cwiinunchuckcontroller.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample reads an I2C Wii Nunchuck. The KinomaJS application uses a Solarbotics adapter to interface with the I2C line. Values read include the x-y joystick, c and z buttons, and the in-controller three-axis accelerometer.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/kangaroo-disco">kangaroo-disco</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/kangaroo-disco"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/kangaroo-disco-example.jpg" height="100" alt=""/></a>

<x-app-info id="kangaroo.disco.example.douzen.com"><span class="uiSample"></span></x-app-info>

This KinomaJS example displays a synchronized animation built with 256 balls/sprites. Each sprite's position and size are changed with every screen update. A content clock is used to update the display on every screen refresh. Tapping the screen changes the animation mode. This sample shows how to use KinomaJS content clocks, textures/skins, behaviors, and content coordinates to achieve full frame rate animations. It also contains icon resources required to enable testing of iOS export from Kinoma Studio.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/kangaroo-text">kangaroo-text</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/kangaroo-text"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/kangaroo-text-example.jpg" height="100" alt=""/></a>

<x-app-info id="kangaroo.text.example.douzen.com"><span class="uiSample"></span></x-app-info>

This KinomaJS example displays a synchronized vortex animation built with text sprites. Each sprite's position and text size are changed with every screen update. A content clock is used to update the display on every screen refresh. Tapping the screen changes the animation mode. This sample shows how to use KinomaJS content clocks, textures/skins, styles, behaviors, and content coordinates to achieve full frame rate animations.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/kinoma-graph">kinoma-graph</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/kinoma-graph"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/kinoma-graph-example.jpg" height="100" alt=""/></a>

<x-app-info id="kinomagraph.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample uses HTML Canvas 2D to implement a virtual hypotrochoid device. Custom sliders control the radius and steps. The application demonstrates how to use canvas containers to render 2D drawing contexts, delegate and notify behaviors using container.distribute, and implement a basic touch slider control.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/layers">layers</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/layers"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/layers-example.jpg" height="100" alt=""/></a>

<x-app-info id="layers.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This MobileFramework example demonstrates how to manipulate KinomaJS layer objects. Tapping the settings icon displays a scrolling menu of layer settings. Slider controls may be used to adjust the selected layer’s origin, scale, skew, translation, opacity, and other properties. Tapping the Play button at the bottom of the menu displays a bouncing-ball animation within the layer.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/level-meter">level-meter</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/level-meter"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/level-meter-example.jpg" height="100" alt=""/></a>

<x-app-info id="levelmeter.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This application shows how to use the LevelMeterWithProbe object found in the sampleGraph module of the built-in Creations library. You can use the object to graph data over time. Configurable options include the number of samples and colors of the graph bars. This object is the same one that the Pin Explorer application uses. If you press and hold on the graph, it freezes the current samples; you can then slide your finger over the samples to view their values.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/license-simple">license-simple</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/license-simple"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/license-simple-example.jpg" height="100" alt=""/></a>

<x-app-info id="licensesimple.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This MobileFramework example demonstrates one approach for integrating display of the Apache License NOTICE file into a KinomaJS application. It demonstrates how to build a scrolling multi-style text view with active links.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/list">list</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/list"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/list-example.jpg" height="100" alt=""/></a>

<x-app-info id="list.example.kinoma.marvell.com"><span class="uiSample mobileSample"></span></x-app-info>

This MobileFramework example demonstrates how to build a scrolling list view using KinomaJS. An HTTP request is issued to a web service that returns a JSON array of items. The items are loaded and displayed in the list. Tapping a list item opens a detailed item view. The application also demonstrates how to use a KinomaJS layout object to adapt the screen layout on device orientation changes.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/logs">logs</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/logs"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/logs-example.jpg" height="100" alt=""/></a>

<x-app-info id="logs.example.kinoma.marvell.com"><span class="createSample filesSample"></span></x-app-info>

This sample demonstrates how to use the Kinoma Create built-in logging support to capture trace output into a log file. Log files can be viewed and/or removed using the built-in Logs application.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/media-library">media-library</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/media-library"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/media-library-example.jpg" height="100" alt=""/></a>

<x-app-info id="medialibrary.example.kinoma.marvell.com" platform="mac,iphone,android"><span class="uiSample mediaSample mobileSample"></span></x-app-info>

This MobileFramework example demonstrates how to access the core media library on the iOS, Android, and Mac OS platforms to display photos and play media files. (Media library support is currently not available for Kinoma Create or Windows.) The application uses a tabbed view to display photo/video thumbnails and songs. Tapping a media item opens a dedicated media viewer screen. KinomaJS messages are used to request the media items.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/media-player">media-player</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/media-player"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/media-player-example.jpg" height="100" alt=""/></a>

<x-app-info id="mediaplayer.example.kinoma.marvell.com"><span class="uiSample mediaSample mobileSample"></span></x-app-info>

This MobileFramework example shows how to build a media player using a KinomaJS media object. Media transport controls are provided to start, stop, and seek the media. The controls are displayed over the video and automatically hide/show when needed. Tapping the screen displays the controls. The current play time and duration are displayed and updated. This sample demonstrates how to integrate KinomaJS media playback, use content timers, and implement skin-based buttons and transitions.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/menu-button">menu-button</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/menu-button"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/menu-button-example.jpg" height="100" alt=""/></a>

<x-app-info id="menubutton.example.kinoma.marvell.com"><span class="uiSample mobileSample"></span></x-app-info>

This sample demonstrates how to use a MobileFramework menu button. The menu button displays the currently selected item in an active label. When the button is tapped, a modal menu of choices is displayed. The newly selected item is returned to the caller using a handler.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/multitouch-picture">multitouch-picture</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/multitouch-picture"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/multitouch-picture-example.jpg" height="100" alt=""/></a>

<x-app-info id="multitouchpicture.example.kinoma.marvell.com" platform="mac,iphone,android,linux"><span class="uiSample mobileSample"></span></x-app-info>

This sample demonstrates how to use features of the MultiTouch Library to create an interactive image viewer suitable for selecting a cropping area from an image. The image may be panned, zoomed, rotated, and tossed, with some animated constraints applied. Interactive gestures include tap, press and hold, drag, toss, and two-finger pinch. The sample's comments discuss the framework used, including TouchStateMachine and TouchBehavior.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/multitouch-slide-browser">multitouch-slide-browser</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/multitouch-slide-browser"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/multitouch-slide-browser-example.jpg" height="100" alt=""/></a>

<x-app-info id="slidebrowser.example.kinoma.marvell.com" platform="mac,iphone,android,linux"><span class="uiSample mediaSample"></span></x-app-info>

This Kinoma Create application enables browsing multiple images by swiping between them. By making use of the slidePictureTouchStates module, it supports a wide range of single and multi-touch actions, including pinching to scale and pan, dragging and tossing the image, pressing and holding to zoom about a particular point, and tapping to zoom to view the entire image again.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/oauth">oauth</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/oauth"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/oauth-example.jpg" height="100" alt=""/></a>

<x-app-info id="oauth.example.kinoma.marvell.com" platform="mac,iphone,android"><span class="uiSample mobileSample"></span></x-app-info>

This sample demonstrates how to implement OAuth 1.0a (Twitter) and OAuth 2.0 (Google) browser-based login and authentication. The browser is embedded in a web view container. (Note, the browser container is not available on Windows or Kinoma Create.) This application is useful for understanding how to use a browser container, MobileFramework buttons, and handlers to invoke HTTP requests and parse responses, and how to implement CommonJS JavaScript modules with exported methods. 

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/orientation">orientation</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/orientation"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/orientation-example.jpg" height="100" alt=""/></a>

<x-app-info id="orientation.example.kinoma.marvell.com" platform="mac,win,iphone,android"><span class="uiSample mobileSample"></span></x-app-info>

This sample uses a layout container to demonstrate how to adapt layouts to device orientation changes. KinomaJS calls the onMeasureVertically and onMeasureHorizontally functions in layout containers when the device orientation changes. The application dynamically changes the container contents based on the current orientation.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/periodic-fetch">periodic-fetch</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/periodic-fetch"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/periodic-fetch-example.jpg" height="100" alt=""/></a>

<x-app-info id="periodic.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample is a basic digital clock that is driven by a periodic update implemented by a pair of handlers. The time handler notifies the application of the time change and then invokes the delay handler to wait 1/2 second. Once the delay has completed, the time handler is invoked again. This technique is commonly used by applications that require periodic polling of a resource.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/photo-door-client">photo-door-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/photo-door-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/photo-door-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="photo.door.client.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample is a companion application for the element-photo-door sample. It displays images in an Amazon S3 bucket on the screen. You can select an image to zoom in, click the trash button that appears in the top-right corner to delete an image from the bucket, or click the back button in the top-left corner to go back to the grid view of all images. This sample can be run on Kinoma Create or packaged for Android or iOS mobile devices. To upload and view images, sign up for a free AWS account and replace the dummy text in the credentials.js with your access ID and access key.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/platform-identifier">platform-identifier</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/platform-identifier"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/platform-identifier-example.jpg" height="100" alt=""/></a>

<x-app-info id="platform.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample is a minimal application that reads and displays the host platform string read from system.platform. Applications can query the platform string to wrap platform-specific code.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/port">port</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/port"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/port-example.jpg" height="100" alt=""/></a>

<x-app-info id="port.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to use a KinomaJS port object to implement a simple toggle switch. Tapping the switch toggles between the on and off states. The toggle state is displayed as text by another KinomaJS port object. The application demonstrates the use of various KinomaJS port functions, including drawImage, drawLabel, fillColor, and invalidate.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/preferences">preferences</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/preferences"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/preferences-example.jpg" height="100" alt=""/></a>

<x-app-info id="preferences.example.kinoma.marvell.com"><span class="uiSample filesSample mobileSample"></span></x-app-info>

This sample demonstrates how to implement preferences settings that persist across application launches. The selected color swatch is stored across runs. The model.readPreferences function reads stored preferences; its optional third parameter can be used to initialize the preference value. The model.writePreferences function saves the preferences. This sample is also useful for learning how to build a containment hierarchy using KinomaJS.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/project-3d">project-3d</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/project-3d"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/project-3d-example.jpg" height="100" alt=""/></a>

<x-app-info id="project3d.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to use the port object's projectImage function, which enables a 3D projection to be defined in an intuitive way. Imagine holding a sheet of paper in one hand and a camera in the other; the paper would correspond to a 2D texture, and what the virtual camera sees is projected onto the port. The projectImage function takes as parameters a texture, a billboard description (including the size of the texture, 3D position, and 3D orientation), and a camera description (similar to the billboard description but also including a field of view). Orientations are described as quaternions, which are complex, but the sample includes conversion to and from angles expressed in degrees. Sliders enable the various billboard and camera parameters to be exercised.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/proxy-handler">proxy-handler</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/proxy-handler"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/proxy-handler-example.jpg" height="100" alt=""/></a>

<x-app-info id="proxyhandler.example.kinoma.marvell.com"><span class="uiSample networkSample mediaSample"></span></x-app-info>

This sample displays an auto-scrolling horizontal view of photos. Photo images are fetched from a Flickr feed using a proxy handler that returns an array of photo objects. A proxy handler is often used to filter data returned from a web service into a simplified format for use by the host application.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/pubnub">pubnub</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/pubnub"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/pubnub-example.jpg" height="100" alt=""/></a>

<x-app-info id="pubnum.example.kinoma.marvell.com"><span class="networkSample"></span></x-app-info>

This sample sends and receives JSON messages using the PubNub messaging service. It is a good starting point for learning how to add device-to-device and device-to-web communication to your application. PubNub provides low-latency delivery of messages through the cloud. The application includes a full KinomaJS version of PubNub's JavaScript API.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/pwm-continuous-servo">pwm-continuous-servo</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/pwm-continuous-servo"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/pwm-continuous-servo-example.jpg" height="100" alt=""/></a>

<x-app-info id="pwmcontinuousservo.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample demonstrates control of 360-degree servos using PWM output from pins on the front (with two-argument pulse-width mode) or the back (with one-argument duty-cycle mode) of Kinoma Create. It also demonstrates how to implement a custom parts simulator and how to use data from an external JSON file. See the PWM Continuous Servo tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/pwm-tri-color-led">pwm-tri-color-led</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/pwm-tri-color-led"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/pwm-tri-color-led-example.jpg" height="100" alt=""/></a>

<x-app-info id="pwmtricolorled.example.kinoma.marvell.com"><span class="createSample pinsSample "></span></x-app-info>

This sample uses red/green/blue sliders to control the color of an RGB LED. The LED is controlled by PWM pins. Each slider is a KinomaJS canvas object that triggers an onChanged event when you move the slider to a new position. See the PWM Tri-Color LED tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/screen-capture">screen-capture</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/screen-capture"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/screen-capture-example.jpg" height="100" alt=""/></a>

<x-app-info id="screencapture.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to capture the contents of the KinomaJS application container as a JPEG image file. It then saves that JPEG to disk in the Documents Directory of the target platform.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-camera">serial-camera</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-camera"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/serial-camera-example.jpg" height="100" alt=""/></a>

<x-app-info id="serialcamera.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample captures from a serial digital camera (VC0706) and displays photographs on the Kinoma Create screen when a button (connected to pin 53) is pressed. At startup, the main thread waits for three affirmative messages back from the camera BLL: one after initialization, one after setting the compression, and one after setting the image size. If all goes well, the main container's skin turns green and the user can take a photo by pressing the button. See the Serial Camera tutorial for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-7segment-display">serial-7segment-display</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-7segment-display"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/serial-7segment-display-example.jpg" height="100" alt=""/></a>

<x-app-info id="s7s.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample consists of a BLL and application for the SparkFun COM-11442 7-Segment Serial Display. It includes a BLL simulator for use in Kinoma Code and a device BLL for use on Kinoma Create. The application demonstrates how to display text strings (ticker tape style) and a digital clock with a blinking colon. The device can display all numbers and some letters and special characters. The sample also shows how to integrate the Kinoma Create full-screen standard keyboard.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-fingerprint-lock">serial-fingerprint-lock</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-fingerprint-lock"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/serial-fingerprint-lock-example.jpg" height="100" alt=""/></a>

<x-app-info id="gt511c3.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample integrates a TTL fingerprint scanner (SparkFun GT-511C3) with a 5V solenoid (SparkFun ROB-11015) to prototype a fingerprint locking system. The prototype registers and stores authorized fingerprints on the scanner, and the authorized fingerprints can then unlock the door controlled by the solenoid. The prototype shows how to control the fingerprint scanner via a serial BLL and the solenoid using a digital output. It also shows how to integrate the Kinoma Create full-screen keyboard, play sounds, build scrolling lists, and display rotated graphics. See the Fingerprint Lock project for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-MTK3339">serial-MTK3339</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/serial-MTK3339"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/serial-MTK3339-example.jpg" height="100" alt=""/></a>

<x-app-info id="MTK3339.example.kinoma.marvell.com"><span class="createSample pinsSample"></span></x-app-info>

This sample consists of a BLL and application for the Adafruit Ultimate GPS Breakout (MTK3339). The application polls the GPS position periodically and displays the position on a map requested from the Google Static Maps API. The map is updated when the position changes.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/simplesynth">simplesynth</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/simplesynth"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/simplesynth-example.jpg" height="100" alt=""/></a>

<x-app-info id="simplesynth.example.kinoma.marvell.com"><span class="createSample pinsSample mediaSample"></span></x-app-info>

This sample shows how to synthesize audio in real time for low-latency playback on Kinoma Create. You can use the onscreen multi-touch keyboard to play up to five simultaneous notes on the sine wave-based synthesizer. Additional synthesizer modes and an optional analog input for volume control have been added in. See the Synthesizer project for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/sketchat">sketchat</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/sketchat"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/sketchat-example.jpg" height="100" alt=""/></a>

<x-app-info id="sketchat.create.kinoma.marvell.com"><span class="createSample pinsSample networkSample uiSample"></span></x-app-info>

Sketchat (a contraction of "sketch" and "chat") is a "shared whiteboard" application for Kinoma Create; when something is drawn on one Sketchat it appears on all others. The application demonstrates how to discover other Sketchats on the network and how they can easily exchange information. The pen color can be chosen using a TCS34725 color sensor. An accelerometer is used so that shaking the Kinoma Create will clear the canvas. When the application is stopped, its drawing disappears from other Sketchats.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/slideshow">slideshow</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/slideshow"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/slideshow-example.jpg" height="100" alt=""/></a>

<x-app-info id="slideshow.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample displays a slideshow of images that animate picture scaling, panning, and opacity settings to implement Ken Burns-style transitions. It demonstrates how to dynamically add picture containers into the containment hierarchy, distribute events to container behaviors, use a content timer to drive animations, display a busy indicator, and invoke an HTTP request to fetch a photo collection from a public Flickr feed.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/somafm-nfc">somafm-nfc</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/somafm-nfc"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/somafm-nfc-example.jpg" height="100" alt=""/></a>

<x-app-info id="somafmplayernfc.example.kinoma.marvell.com"><span class="createSample pinsSample mediaSample uiSample networkSample"></span></x-app-info>

This Kinoma Create example streams live radio from the SomaFM service. Channels are selected using NFC cards and the Adafruit PN532 NFC/RFID Controller Shield. To make individual cards correspond to a unique station, change entries in the channels dictionary in credentials.js. This application demonstrates how to use a KinomaJS media object to play HTTP streams, build custom user interface elements with HTML Canvas 2D, use a proxy handler to fetch data from a web service, and use KinomaJS effects and layers to implement an animated image collage. You can optionally stream channel selections to a PubNub channel by changing the keys in credentials.js.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/somafm-player">somafm-player</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/somafm-player"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/somafm-player-example.jpg" height="100" alt=""/></a>

<x-app-info id="somafmplayer.example.kinoma.marvell.com"><span class="createSample mediaSample uiSample networkSample"></span></x-app-info>

This MobileFramework example for Kinoma Create streams live radio from the SomaFM service. Channels are selected using a touch-controlled scrolling tuner. A music-artist image collage is displayed and updated on track changes. This sample demonstrates how to use a KinomaJS media object to play HTTP streams, build custom user interface elements with HTML Canvas 2D, use a proxy handler to fetch data from a web service, and use KinomaJS effects and layers to implement an animated image collage. The SomaFM player also supports KinomaJS DIAL and can be controlled remotely by the somafm-remote sample.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/somafm-remote">somafm-remote</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/somafm-remote"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/somafm-remote-example.jpg" height="100" alt=""/></a>

<x-app-info id="somafmremote.example.kinoma.marvell.com"><span class="mobileSample mediaSample uiSample networkSample"></span></x-app-info>

This MobileFramework phone application streams live radio from the SomaFM service and can be used to remotely control the somafm-player sample. Using KinomaJS DIAL, this application discovers the SomaFM player application running on Kinoma Create and can change channels and the volume level remotely. Channels are selected using a touch-controlled scrolling tuner. A music-artist image collage is displayed and updated on track changes. This sample demonstrates how to use the KinomaJS media object to play HTTP streams, build custom user interface elements with HTML Canvas 2D, use a proxy handler to fetch data from a web service, and use KinomaJS effects and layers to implement an animated image collage.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/sound">sound</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/sound"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/sound-example.jpg" height="100" alt=""/></a>

<x-app-info id="sound.example.kinoma.marvell.com"><span class="mediaSample uiSample"></span></x-app-info>

This sample displays a mockup camera preview with a shutter button. Tapping the button plays a shutter sound. The application calls Sound.play to play a WAVE file. It also demonstrates how to use a transition to simulate the shutter closing and opening.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/spinner">spinner</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/spinner"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/spinner-example.jpg" height="100" alt=""/></a>

<x-app-info id="spinner.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample displays a spinning busy indicator by rotating a custom graphic using a periodic timer. The application displays the indicator half size by setting the scale and origin properties of the graphic's picture.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/ssdp">ssdp</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/ssdp"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/ssdp-example.jpg" height="100" alt=""/></a>

<x-app-info id="ssdp.example.kinoma.marvell.com"><span class="networkSample uiSample"></span></x-app-info>

This simple application demonstrates SSDP usage. It starts an HTTP server on port 1234, registers an SSDP device with type ssdp.example.kinoma.marvell.com, and advertises a UPnP MediaRenderer with the AVTransport, ConnectionManager, and RenderingControl services. It also looks for available HTTP servers on the local network.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/states">states</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/states"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/states-example.jpg" height="100" alt=""/></a>

<x-app-info id="states.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to use content states to change a button's background and text colors when the button is tapped. The text color is defined by the text's style states. The button background color is defined by the skin states.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/style-inheritance">style-inheritance</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/style-inheritance"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/style-inheritance-example.jpg" height="100" alt=""/></a>

<x-app-info id="styleInheritance.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample (which is best viewed on a tablet-sized screen or simulator) demonstrates how KinomaJS cascades styles in the containment hierarchy. Content inherits the characteristics of its container style when the characteristics are undefined in the content's style. In this sample, applicationStyle defines a style for the root of the containment hierarchy, and nested containers build on applicationStyle by overriding various style characteristics, including point size, alignment, and color.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/styles">styles</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/styles"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/styles-example.jpg" height="100" alt=""/></a>

<x-app-info id="styles.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample displays a vertical scrolling column of text formatted with a wide variety of styles. It demonstrates the use of all the common text style attributes, including font, style, point size, alignment, leading, color, and margins.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/tabs">tabs</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/tabs"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/tabs-example.jpg" height="100" alt=""/></a>

<x-app-info id="tabs.example.kinoma.marvell.com"><span class="uiSample mobileSample"></span></x-app-info>

This MobileFramework example demonstrates how to build a tabbed user interface screen. Each tab opens a different style pane. The tabs, which are placed in the screen footer area, are built using the MobileFramework screen's TabFooter object and skinned using the default sample theme tab skins. The tab-to-tab transition is managed by MobileFramework's TabListSwapTransition object. You can customize the tab look and behaviors by replacing or overriding these objects. For example, you can use the MobileFramework screen's TabLine object to implement a tab bar that can be placed anywhere on the screen and without icons.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/text">text</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/text"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/text-example.jpg" height="100" alt=""/></a>

<x-app-info id="text.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This MobileFramework example demonstrates how to use KinomaJS to get and set various KinomaJS text and style properties, including font, point size, style, alignment, indentation, and margins. It also shows how to implement tappable text links and use text spans to display multi-styled text blocks. Tapping the settings button displays a scrolling menu of text and style options.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/tiled-skins">tiled-skins</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/tiled-skins"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/tiled-skins-example.jpg" height="100" alt=""/></a>

<x-app-info id="tiledskins.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to use tiled skins to fill content. It includes examples of nine-part and three-part horizontal/vertical tiled skins. The nine-part container is a button that changes color (state) when tapped. The application also shows how to use a layer to display rotated text.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/timers">timers</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/timers"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/timers-example.jpg" height="100" alt=""/></a>

<x-app-info id="timers.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to use different timer techniques: one-shot, interval, repeating, handler.wait, and container.wait. It uses an interval timer to animate skin states.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/transition-easing-functions">transition-easing-functions</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/transition-easing-functions"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/transition-easing-functions-example.jpg" height="100" alt=""/></a>

<x-app-info id="transitioneasingfunctions.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates the array of easing functions available for use when designing transitions. A simple "slide off" transition is displayed using the selected easing function.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/transitions">transitions</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/transitions"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/transitions-example.jpg" height="100" alt=""/></a>

<x-app-info id="transitions.example.kinoma.marvell.com"><span class="uiSample"></span></x-app-info>

This sample demonstrates how to use the Transitions library to configure and use a variety of transitions. The host application can further customize the behavior of each transition by overriding its duration and easing function used for pacing time.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/wave-recorder">wave-recorder</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/wave-recorder"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/wave-recorder-example.jpg" height="100" alt=""/></a>

<x-app-info id="waverecorder.example.kinoma.marvell.com"><span class="uiSample mediaSample pinsSample"></span></x-app-info>

This sample shows how to configure and capture recorded audio into a WAVE file.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/web-server">web-server</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/web-server"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/web-server-example.jpg" height="100" alt=""/></a>

<x-app-info id="webserver.example.kinoma.marvell.com"><span class="networkSample"></span></x-app-info>

This sample demonstrates how to build a simple web server with KinomaJS. Setting the application shared property to true shares the application as a service on the local network and enables the HTTP server. The application shows how to support GET and POST requests and serve static and dynamic web pages with images. Transactions are displayed in a scrolling log view.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/websocket-client">websocket-client</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/websocket-client"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/websocket-client-example.jpg" height="100" alt=""/></a>

<x-app-info id="websocketclient.example.kinoma.marvell.com"><span class="networkSample mobileSample uiSample"></span></x-app-info>

This MobileFramework example demonstrates how to implement a WebSocket client in KinomaJS. Coupled with the websocket-server example, it implements a WebSocket-based chat client. The client discovers and connects to the server using SSDP and exchanges text messages with the server. This application is useful for understanding how to integrate WebSockets, use SSDP to discover server devices, and build user interfaces with editable text fields and transitions.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/websocket-server">websocket-server</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/websocket-server"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/websocket-server-example.jpg" height="100" alt=""/></a>

<x-app-info id="websocketserver.example.kinoma.marvell.com"><span class="networkSample uiSample"></span></x-app-info>

This sample demonstrates how to implement a WebSocket server in KinomaJS. Coupled with the websocket-client sample, it implements a WebSocket-based chat server. The client discovers and connects to the server using SSDP and, once the connection is established, exchanges text messages with the server. This application is useful for understanding how to build a WebSocket server and use KinomaJS text and scroller objects to display a scrolling list of messages.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/xml-dom">xml-dom</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/xml-dom"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/xml-dom-example.jpg" height="100" alt=""/></a>

<x-app-info id="xmldom.example.kinoma.marvell.com"><span class="networkSample uiSample"></span></x-app-info>

This sample demonstrates how to issue an HTTP request to the OpenWeatherMap service and use the DOM parsing API of KinomaJS to parse the XML response. The temperature for the requested city is displayed. The application shows how to invoke a HTTP request to a web service, parse the XML response, display a busy indicator while waiting for the result, and implement a tappable link that opens in the device browser. (Note, browser support may not be available on all platforms.)

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/zeroconf">zeroconf</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/zeroconf"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/zeroconf-example.jpg" height="100" alt=""/></a>

<x-app-info id="zeroconf.example.kinoma.marvell.com" platform="mac,iphone,android,linux"><span class="networkSample uiSample"></span></x-app-info>

This simple application demonstrates Zeroconf usage. It starts an HTTP server on port 1234 and registers it with a service named "Sample Server". It also looks for available HTTP servers and services on the local network. To run this application in the simulators on Windows, first install Apple iTunes.

<div style="clear:both; margin-bottom: 16px;"></div>

***

### <a href="https://github.com/Kinoma/KPR-examples/tree/master/zigbee-ha">zigbee-ha</a>

<a href="https://github.com/Kinoma/KPR-examples/tree/master/zigbee-ha"><img src="https://raw.githubusercontent.com/Kinoma/KPR-examples/master/screenshots/zigbee-ha-example.jpg" height="100" alt=""/></a>

<x-app-info id="zigbeeha.example.kinoma.marvell.com" platform="linux"><span class="createSample pinsSample"></span></x-app-info>

This sample integrates Digi's XBee radio (available as SparkFun WRL-10414) with GE Link light bulbs to build a ZigBee Home Automation gateway with Kinoma Create. The application shows how to commission, discover, and control the bulbs on the ZigBee network. See the Home Automation project for more information.

<div style="clear:both; margin-bottom: 16px;"></div>

***

These samples are licensed under the <a href="http://www.apache.org/licenses/LICENSE-2.0.html" rel="license">Apache License, Version 2.0</a>.