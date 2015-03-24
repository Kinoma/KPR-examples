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

// styles
var messageStyle = new Style({ font:"28px", color:"white", horizontal:"center", vertical:"middle" });

// handlers
Handler.bind("/gpsData", {
	onInvoke: function(handler, message) {
		var response = message.requestObject;
		application.distribute("onGPS", response);
	}
});

var MapPicture = Picture.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	behavior: Object.create(Behavior.prototype, {
		onCreate: { value: function(picture, url) {
			picture.url = url;
		}},
		onLoaded: { value: function(picture) {
			if (picture.ready)
				application.distribute("onMapReady", picture);
		}},
	})
}});

var GPSScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	skin: new Skin({ fill:"black" }),
	behavior: Object.create(Behavior.prototype, {
		onDisplayed: { value: function(container) {
			this.latitude = this.longitude = -1;
			this.map = null;
			this.url = "https://maps.googleapis.com/maps/api/staticmap?center=[LAT],[LON]&zoom=16&format=JPEG&markers=[LAT],[LON]&size=" + application.width + "x" + application.height;
			container.invoke(new MessageWithObject("pins:/gps/read?repeat=on&callback=/gpsData&interval=1000"));
		}},
		onGPS: { value: function(container, position) {
			if (-1 == this.latitude && -1 == this.longitude)
				container.remove(container.first);
			if (position.latitude != this.latitude || position.longitude != this.longitude) {
				var url = this.url.replace("[LAT]", position.latitude).replace("[LON]", position.longitude);
				this.map = new MapPicture(url);
			}
			this.latitude = position.latitude;
			this.longitude = position.longitude;
		}},
		onMapReady: { value: function(container, picture) {
			if (container.length)
				container.replace(container.last, picture);
			else
				container.add(picture);
			this.map = null;
		}},
	}),
	contents: [
		Label($, { left:0, right:0, top:0, bottom: 0, style:messageStyle, string:"Waiting for position" })
	]
}});
		
var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
		application.add(new GPSScreen(this.data));
	}},
	onLaunch: { value: function(application) {
		this.data = {latitude: -1, longitude: -1};
        application.invoke(new MessageWithObject("pins:configure", {
            gps: {
                require: "MTK3339",
                pins: {
                    serial: {tx: 31, rx: 33}
                }
            }}), Message.JSON);
    }},
});
