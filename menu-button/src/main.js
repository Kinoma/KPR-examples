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
THEME = require('themes/sample/theme');
var TOOL = require('mobile/tool');

/* ASSETS */

let backgroundSkin = new Skin({ fill:'gray' });

/* HANDLERS */

Handler.bind("/selectStandard", Behavior({
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
		let selection = query.standard;
		trace( "\n selected: " + selection );
	}
}));

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		TOOL.MenuButton($, { left:0, top:0 })
	]
}));

/* APPLICATION */

let standardsMenuData = {
	action: "/selectStandard?standard=",
	items: [
		{ title: "Top Rated", value: "top_rated" },
		{ title: "Top Favorites", value: "top_favorites" },
		{ title: "Most Popular", value: "most_popular" },
		{ title: "Most Discussed", value: "most_discussed" },
		{ title: "Most Responded", value: "most_responded" },
	],
	selection: 0,
};

application.add(new MainScreen(standardsMenuData));
