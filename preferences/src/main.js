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

let blueSkin = new Skin({ fill:"blue" });
let greenSkin = new Skin({ fill:"green" });
let redSkin = new Skin({ fill:"red" });
let selectionSkin = new Skin({ fill:["white","#edbc3c"] });
let whiteSkin = new Skin({ fill:"white" });

let feedbackStyle = new Style({ font:"bold 26px", color:"white", horizontal:"center", vertical:"middle" });
	
/* LAYOUTS */

let ColorSwatchContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:selectionSkin, active:true,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
			container.state = ( model.preferences.color == this.data.color ? 1 : 0 );
		}
		onSelectionChanged(container, color) {
			container.state = ( color == this.data.color ? 1 : 0 );
			if (color == this.data.color)
				container.add(new FeedbackContainer(this.data));
		}
		onTouchBegan(container, id, x, y, ticks) {
			model.preferences.color = this.data.color;
			model.writePreferences( application, "swatches", model.preferences );
			application.distribute( "onSelectionChanged", model.preferences.color );
		}
	},
	contents: [
		Container($, { left:4, right:4, top:4, bottom:4, skin:$.skin })
	]
}));

let FeedbackContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
			container.duration = 2000;
		}
		onDisplaying(container) {
			let label = new Label({ string:"Saving preferences: " + this.data.color, style:feedbackStyle });
			let layer = this.layer = new Layer({ width:container.width, height:container.height });
			layer.add(label);
			container.add(layer);
			container.start();
		}
		onFinished(container) {
			container.container.remove(container);
		}
		onTimeChanged(container) {
			this.layer.opacity = 1 - Math.quadEaseOut(container.fraction);
		}
	}
}));

/* APPLICATION */

var model = application.behavior = Behavior({
	onLaunch(application) {
		model.preferences = this.readPreferences(application, "swatches", { color:"red" });
		let column = new Column({ left:0, right:0, top:0, bottom:0, skin:whiteSkin });
		column.add( new ColorSwatchContainer({ skin:redSkin, color:"red" }));
		column.add( new ColorSwatchContainer({ skin:greenSkin, color:"green" }));
		column.add( new ColorSwatchContainer({ skin:blueSkin, color:"blue" }));
		
		application.add( column );
	},
	readPreferences(application, name, preferences) {
		try {
			var url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			if (Files.exists(url))
				return JSON.parse(Files.readText(url));
		}
		catch(e) {
		}
		return preferences;
	},
	writePreferences(application, name, preferences) {
		try {
			var url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			Files.writeText(url, JSON.stringify(preferences));
		}
		catch(e) {
		}
	}
});
