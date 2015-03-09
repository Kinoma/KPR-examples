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
/*
  Beep sound from Sound-e-Scape Studios:
  http://www.soundescapestudios.com/Sound-e-Scape-Studios-policy.html
*/

Handler.bind("/proximity", {
	onInvoke: function(handler, message) {
		application.distribute("onProximityChanged", message.requestObject);
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        application.invoke(new MessageWithObject("pins:/GP2Y0A02YK0F/read?repeat=on&callback=/proximity&interval=100"));

        application.skin = new Skin({ fill: "gray" });
        var style = new Style({ font:"bold 30px", color:"white", horizontal:"center", vertical:"middle" });
        application.add(this.data.label = new Label({left: 0, right: 0, style: style, string:"Proximity: " }));
        
		Sound.volume = 1;
		this.data.sound = new Sound( mergeURI( application.url, "assets/Beeps-very-short-01.wav" ) );
        application.interval = this.data.interval;
        application.start();
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            GP2Y0A02YK0F: {
                require: "GP2Y0A02YK0F",
                pins: {
                    proximity: {pin: 61}
                }
            }}), Message.JSON);

        this.data = { label: {}, sound: {}, interval: 1000 };
    }},
	onProximityChanged: { value: function(application, value) {
        this.data.label.string = "Proximity: " + value.toFixed(2) + " cm";
        application.interval = value / 15 * 150;
	}},
	onTimeChanged: { value: function(application) {
		this.data.sound.play();
    }},
});
