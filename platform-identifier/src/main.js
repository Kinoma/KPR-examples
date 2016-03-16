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

let backgroundSkin = new Skin({ fill:'blue' });

let labelStyle = new Style({ font:'bold 36px', color:'white', horizontal:'center', vertical:'middle' });

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
		}
		onDisplaying(container) {
			let label = container.first;
			switch( this.data.platform ) {
				case "mac":
					label.string = "Mac OS";
					break;
				case "win":
					label.string = "Windows";
					break;
				case "android":
					label.string = "Android";
					break;
				case "linux":
					label.string = "Linux";
					break;
				case "iphone":
					label.string = "iOS";
					break;
				default:
					label.string = this.data.platform;
					break;
			}
		}
	},
	contents: [
		Label($, { left:0, right:0, style:labelStyle })
	]
}));

/* APPLICATION */

application.add(new MainScreen({ platform: system.platform }));
