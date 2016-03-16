//@module
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
THEME = require("themes/sample/theme");
var SCROLLER = require("mobile/scroller");

var whiteSkin = new Skin("white");
	
var bodyStyle = new Style({
	font:"16px", horizontal: "left", color: "black", left: 7
});

var linkStyle = new Style({
	font:"16px", horizontal: "left", color: "rgba(68,169,113,1)", left: 7
});

var LinkBehavior = Behavior.template({
  	url:null,
  	onTouchEnded: function(content) {
    	launchURI(this.url);
  	}
});

var LicenseTextBehavior = Behavior({
	onCreate: function(content) {
		var block;
		var str = Files.readText(mergeURI(application.url, "./assets/notice.txt"));
		var index = str.indexOf("http");
		var bodyString,linkString;
		while(index>0) {
			bodyString = str.slice(0,index);
			str = str.slice(index);
			index = str.indexOf("\n");
			if(index<0)
				break;
			linkString = str.slice(0,index);
			str = str.slice(index+1);
			
			block = new Text({left: 0, right: 0});
			block.active = true;
			var format = [{
				style: bodyStyle, 
				spans: [
					{style: bodyStyle, string: bodyString},
					{style: linkStyle, string: linkString, behavior: LinkBehavior({url: linkString})}
				]
			}];
			block.format(format);
			content.add(block);
			index = str.indexOf("http");
		}			
	}
});

exports.ViewerContainer = SCROLLER.VerticalScroller.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, clip: true, active: true,
	skin: whiteSkin,
	contents:[
		new Column({
			left: 0, right: 0, top: 0,
			behavior: LicenseTextBehavior
		}),
		SCROLLER.VerticalScrollbar($, {})
	]
}));
