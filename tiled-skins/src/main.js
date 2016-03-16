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

let horizontalThreePartSkin = new Skin({ texture: new Texture('./assets/3-part.png'), width:60, height:60, tiles:{ left:10, right:10 } });
let ninePartButtonSkin = new Skin({ texture: new Texture('./assets/9-part-button.png'), width:60, height:60, states:60, tiles:{ left:10, right:10, top:10, bottom:10 } });
let repeatingPatternSkin = new Skin({ texture: new Texture('./assets/kinoma.png'), width:48, height:48, tiles:{ left:0, right:0, top:0, bottom:0 } });
let verticalThreePartSkin = new Skin({ texture: new Texture('./assets/3-part.png'), width:60, height:60, tiles:{ top:10, bottom:10 } });

let textStyle = new Style({ font:'28px', color:'#444', horizontal:'center', vertical:'middle' });

/* HANDLERS */

Handler.bind("/tap", Behavior({
	onInvoke(handler, message) {
		trace("Button tapped!\n");
	}
}));

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:repeatingPatternSkin,
	contents: [
		Container($, {
			top:40, left:10, width:140, height:60, skin:horizontalThreePartSkin,
			contents:[
				Text($, { left:0, right:0, style:textStyle, string:'3-part horizontal' })
			]
		}),
		Container($, {
			right:10, width:60, height:200, skin:verticalThreePartSkin,
			Behavior: class extends Behavior {
				onDisplaying(container) {
					let title = "3-part vertical";
					let size = textStyle.measure(title);
					let label = new Label({ left:0, right:0, style:textStyle, string:title });
					let layer = new Layer({ width:container.height, height:size.height });
					layer.add( label );
					layer.origin = { x:verticalThreePartSkin.height >> 1, y:size.height >> 1 };
					layer.rotation = -90;
					layer.translation = { x: ( ( verticalThreePartSkin.width + ( size.height >> 1 ) ) ), y: size.width >> 1 };
					container.add( layer );
				}
			}
		}),
		Container($, {
			bottom:40, left:10, width:150, height:60, active:true, skin:ninePartButtonSkin,
			Behavior: class extends Behavior {
				onTouchBegan(container) {
					container.state = 1;
				}
				onTouchCancelled(container) {
					container.state = 0;
				}
				onTouchEnded(container) {
					container.state = 0;
					container.invoke(new Message("/tap"));
				}
			},
			contents:[
				Label($, { left:0, right:0, style:textStyle, string:'9-part button' })
			]
		}),
	]
}));

/* APPLICATION */

application.add(new MainScreen);
