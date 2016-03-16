/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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

/* ASSETS */

let backgroundSkin = new Skin({ fill:'white' });
let maskSkin = new Skin({ fill:'#7f000000' });

let attributionLinkStyle = new Style({ font:'24px', bottom:5, color:['blue', '#40007f'] });
let locationStyle = new Style({ font:'bold 36px', horizontal:'center', vertical:'middle', color:'white', top:5, bottom:5 });
let temperatureStyle = new Style({ font:'bold 125px', horizontal:'center', vertical:'middle', color:'#555' });

/* BEHAVIORS */

class LinkBehavior extends Behavior {
	onTouchBegan(text) {
		text.state = 1;
	}
	onTouchCancelled(text) {
		text.state = 0;
	}
	onTouchEnded(text) {
		text.state = 0;
		launchURI("http://openweathermap.org");
	}
};

/* TEMPLATES */

let BusyPicture = Picture.template($ => ({
	url:'./assets/waiting-black.png',
	Behavior: class extends Behavior {
		onLoaded(picture) {
			picture.origin = { x:picture.width >> 1, y:picture.height >> 1 };
			picture.scale = { x:0.75, y:0.75 };
			picture.start();
		}
		onTimeChanged(picture) {
			let rotation = picture.rotation;
			rotation -= 1;
			if (rotation < 0) rotation = 360;
			picture.rotation = rotation;
		}
	}
}));

let MainContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			container.add(new BusyPicture);
			let uri = "http://api.openweathermap.org/data/2.5/weather?" + serializeQuery({
				q: data.location,
				mode: "xml",
				units: "imperial",
				APPID: data.APPID
			});
			let message = new Message(uri);
			let promise = message.invoke(Message.DOM);
			promise.then(document => {
				let temperature;
				if (document)
					temperature = this.parse(document);
				let label = new Label({ left:10, right:0, top:20, bottom:0, style:temperatureStyle });
				label.string = temperature ? temperature + "°" : "Error";
				container.replace(container.last, label);
			});
		}
		parse(document) {
			let items, node, value, temperature;
			items = document.getElementsByTagName( "city" );
			if ( items.length > 0 ) {
				node = items.item( 0 );
				value = node.getAttribute( "id" );
				if ( value )
					trace("City id: " + value + "\n" );
				items = node.getElementsByTagName( "country" );
				if ( items.length > 0 ) {
					value = items.item( 0 ).firstChild.nodeValue;
					if ( value )
						trace( "Country: " + value + "\n" );
				}
			}
			items = document.getElementsByTagName( "temperature" );
			if ( items.length > 0 ) {
				node = items.item( 0 );
				value = node.getAttribute( "value" );
				if ( value )
					temperature = Math.floor( value );
			}
			return temperature;
		}
	},
	contents: [
		Label($, { left:0, right:0, top:0, skin:maskSkin, style:locationStyle, string:$.location }),
		Label($, { left:0, right:0, bottom:0, style:attributionLinkStyle, active:true, string:$.attribution, Behavior:LinkBehavior })
	]
}));

/* APPLICATION */

let data = {
	location: "Del Mar",
	attribution: "openweathermap.org",
	APPID: "94de4cda19a2ba07d3fa6450eb80f091"
};
application.add( new MainContainer( data ) );
