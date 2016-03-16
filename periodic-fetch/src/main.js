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

let blackSkin = new Skin({ fill:"black" });

let timeStyle = new Style({ font:"bold 64px", color:"white", horizontal:"center", vertical:"middle" });
	
/* HANLDERS */

Handler.bind("/delay", Behavior({
	onComplete(handler, message) {
		handler.invoke(new Message("/time"));
	},
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		let duration = query.duration;
		handler.wait(duration)
	}
}));

Handler.bind("/time", Behavior({
	onInvoke(handler, message) {
		application.distribute("onTimeUpdated");
		handler.invoke(new Message("/delay?duration=500"));
	}
}));

/* LAYOUTS */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blackSkin,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			container.invoke(new Message("/time"));
		}
		onTimeUpdated(container) {
			let date = new Date();
			let hours = String( date.getHours() );
			let minutes = String( date.getMinutes() );
			let seconds = String( date.getSeconds() );
			if ( 1 == minutes.length )
				minutes = '0' + minutes;
			if ( 1 == seconds.length )
				seconds = '0' + seconds;
			let time = hours + ':' + minutes + ':' + seconds;
			container.first.string = time;
		}
	},
	contents: [
		Label($, { style:timeStyle })
	]
}));

/* APPLICATION */

application.add(new MainScreen);
