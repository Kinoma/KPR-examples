//@program
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
/*
	The LevelMeterWithProbe's graph is rendered within it's bounds, the probe may be rendered outside of the bounds and is shown
	while the user presses and holds on the graph.
	
	The LevelMeterWithProbe constructor may be passed the following optional properties:
		
		probeOffest:		The probe is drawn just above the graph by default. A positive probeOffset
							renders the probe more towards the top of the screen and negative more towards
							the bottom. 
		
		numSamples:			The number of samples to be taken (corresponding to the number of bars rendred in the graph)
							
		barColor:			The color of the bars in the graph
		
		currentBarColor:	The color of the most recent sample's bar in the graph

*/

let SAMPLEGRAPH = require("creations/sampleGraph");

/* ASSETS */

let whiteSkin = new Skin({ fill:'white' });

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:whiteSkin,
	Behavior: class extends Behavior {
		generateTestValue(container) {
			let duration = 4000;
			let fraction = (container.time % duration) / duration;
			let value = Math.sin(fraction * 2 * Math.PI);
			value = (1 + value) / 2;
			return value;
		}
		onDisplaying(container) {
			container.interval = 100;
			container.start();
		}
		onTimeChanged(container) {
			let value = this.generateTestValue(container);
			container.firstMeter.distribute("onMeterLevelChanged", value);
			container.secondMeter.distribute("onMeterLevelChanged", Math.random());
		}
	},
	contents: [
		SAMPLEGRAPH.LevelMeterWithProbe($.first, { left:0, right:0, top:40, height:80, name:'firstMeter' }),
		SAMPLEGRAPH.LevelMeterWithProbe($.first, { left:0, right:0, bottom:0, height:110, name:'secondMeter' }),
	]
}));

/* APPLICATION */

let data = { 
	first : { numSamples : 22, barColor : "#E0E0E0", currentBarColor : "black" },	// data scoped for firstMeter
	second : { probeOffset : 50, numSamples : 14 }									// data scoped for secondMeter
}
application.add( new MainScreen(data) );
