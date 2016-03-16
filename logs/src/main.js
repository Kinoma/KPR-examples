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

 ---------------------------------------------------------------------------
 
  The K4.log() function is used to output debugging strings to log files. The function takes two parameters:
    log file name - The log file name. The log file is created if it doesn't already exist.
    log string - The log string to append to the file
    
  The built-in Kinoma Create Logs application can be used to view and/or delete log files. Each log string is time/date stamped. 
*/

/* ASSETS */

let backgroundSkin = new Skin({ fill:'blue' });

let labelStyle = new Style({ font:'bold 28px', color:'white', horizontal:'center', vertical:'middle' });

/* TEMPLATES */

let MainContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	behavior: Behavior({
		onCreate(container, data) {
			K4.log("example", "MainContainer onCreate");
		}
	}),
	contents: [
		Label($, { left:0, right:0, style:labelStyle, string:'Logs Example' })
	]
}));

/* APPLICATION */

application.behavior = Behavior({
	onLaunch(application) {
		K4.log("example", "application launched");
		application.add(new MainContainer);
	},
	onQuit(application) {
		K4.log("example", "application quit");
	}
});

