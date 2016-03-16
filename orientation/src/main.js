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

let horizontalSkin = new Skin({ fill:'red' });
let verticalSkin = new Skin({ fill:'blue' });

let labelStyle = new Style({ font:'bold 28px', color:'white', horizontal:'center', vertical:'middle' });

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	contents: [
		Layout($, {
			left:0, right:0, top:0, bottom:0,
			Behavior: class extends Behavior {
				onCreate(layout, data) {
					this.width = -1;
				}
				onMeasureVertically(layout, height) {
					if (this.width != application.width) {
						this.width = application.width;
						if (application.width > application.height) {
							layout.skin = horizontalSkin;
							layout.first.string = 'Horizontal';
						}
						else {
							layout.skin = verticalSkin;
							layout.first.string = 'Vertical';
						}
					}
				}
			},
			contents: [
				Label($, { left:0, right:0, style:labelStyle })
			]
		})
	]
}));

/* APPLICATION */

application.add(new MainScreen);
