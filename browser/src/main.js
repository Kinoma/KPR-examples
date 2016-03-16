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
var CONTROL = require('mobile/control');
var MODEL = require('mobile/model');
THEME = require('themes/sample/theme');

/* ASSETS */

let backgroundSkin = new Skin({ fill:'white' });
let buttonSkin = new Skin({ fill:'#ccf' });
let hiliteSkin = new Skin({ fill:'#88c' });
let toolbarSkin = new Skin({ fill:'#aaa' });

let buttonStyle = new Style({ font:'bold 24px', color:'blue', horizontal:'center', vertical:'middle' });
let errorStyle = new Style({ font:'bold 24px', color:'red', horizontal:'center', vertical:'middle' });
let titleStyle = new Style({ font:'24px', color:'black', horizontal:'center', vertical:'middle' });

/* BEHAVIORS */

var BrowserBehavior = Behavior.template({
	onCreate(browser, data) {
		this.data = data;
		browser.url = this.data.url;
	},
	onLoading(browser) {
		// onLoading will be called when the browser start loading the page
		this.data.TITLE.string = "Loading";
		this.data.BUSY.visible = true;
		browser.visible = false;
	},
	onLoaded(browser) {
		// onLoaded will be called when page is completely loaded
		this.data.TITLE.string = browser.evaluate("document.title");
		this.data.BUSY.visible = false;
		browser.visible = true;
	}
});

class ButtonBehavior extends Behavior {
	onCreate(label, data) {
		label.skin = buttonSkin;
		label.style = buttonStyle;
		label.active = true;
		this.data = data;
	}
	onTap(label) {
		debugger;
	}
	onTouchBegan(label) {
		label.skin = hiliteSkin;
	}
	onTouchEnded(label) {
		label.skin = buttonSkin;
		this.onTap(label);
	}
};

/* TEMPLATES */

let ErrorContainer = Text.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin, style:errorStyle,
	string:'Browser is not supported for the ' + $.platform + ' platform.'
}));

let MainContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Line($, {
			left:0, right:0, top:0, height:50, skin:toolbarSkin,
			contents: [
				Label($, { left:4, string:' << ',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							this.data.BROWSER.back();
						}
					}
				}),
				Label($, { left:4, string:' >> ',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							this.data.BROWSER.forward();
						}
					}
				}),
				Label($, { left:4, right:4, anchor:'TITLE', skin:backgroundSkin, style:titleStyle }),
				Content($, { width:40, height:40, right:4, anchor:'BUSY', skin:THEME.BusySkin, visible:false, behavior:CONTROL.BusyBehavior }),
			]
		}),
		(function() {
			let browser = $.BROWSER = new Browser({ left:0, right:0, top:50, bottom:40 });
			browser.behavior = new BrowserBehavior(browser, $);
			return browser;
		})(),
		Line($, {
			left:0, right:0, bottom:0, height:40, skin:toolbarSkin,
			contents: [
				Label($, { left:4, string:'Kinoma',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							this.data.BROWSER.load("http://developer.kinoma.com/");
						}
					}
				}),
				Label($, { left:4, string:'Google',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							this.data.BROWSER.load("http://www.google.com/");
						}
					}
				}),
				Label($, { left:4, string:'Apple',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							this.data.BROWSER.load("http://www.apple.com/");
						}
					}
				}),
				Label($, { left:4, string:'Twitter',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							this.data.BROWSER.load("http://www.twitter.com/");
						}
					}
				}),
			]
		}),
	]
}));

/* APPLICATION */

let container;

if (["mac", "android", "iphone"].indexOf(system.platform) < 0) {
	container = new ErrorContainer({ platform: system.platform });
} else {
	container = new MainContainer({ url: "http://kinoma.com/meet-kinoma/" });
}

application.add(container);
