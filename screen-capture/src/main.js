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

let blueSkin = new Skin({ fill:'blue' });
let greenSkin = new Skin({ fill:'green' });
let redSkin = new Skin({ fill:'red' });
let yellowSkin = new Skin({ fill:'yellow' });

let screenStyle = new Style({ font:'bold 48px', horizontal:'center', vertical:'middle', color:'white' });

/* BEHAVIORS */

Handler.Bind("/capture", class extends Behavior {
	onInvoke(handler, message) {
		let layer = new Layer(null, true, true);
		layer.attach(application);
		layer.setResponseJPEG(message);
		layer.detach();
	}
});
/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, style:screenStyle, active:true,
	Behavior: class extends Behavior {
		onComplete(container, message) {
			Files.writeBuffer(Files.documentsDirectory + "capture.jpg", message.responseBuffer);
		}
		onDisplaying(container) {
			let halfWidth = application.width / 2;
			let halfHeight = application.height / 2;
			container.add(new Content({ left:0, top:0, width:halfWidth, height:halfHeight, skin:redSkin }));
			container.add(new Content({ right:0, top:0, width:halfWidth, height:halfHeight, skin:greenSkin }));
			container.add(new Content({ left:0, bottom:0, width:halfWidth, height:halfHeight, skin:blueSkin }));
			container.add(new Content({ right:0, bottom:0, width:halfWidth, height:halfHeight, skin:yellowSkin }));
			container.add(new Label({ left:0, right:0, string:'Screenshot!' }));
		}
		onTouchEnded(container) {
			container.invoke(new Message("/capture"), Message.BUFFER);
		}
	},
}));

/* APPLICATION */

application.add(new MainScreen);
