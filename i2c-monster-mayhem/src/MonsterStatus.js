//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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

exports.Screen = Column.template(function($){

	return {
		left: 0, right: 0, top: 0, bottom: 0,
		skin: new Skin({ fill: "white" }),
		behavior: Behavior({
			onNFCLost: function(container) {
				// go to the main screen
				var oldScreen = currentScreen;
				currentScreen = new HomeScreenTemplate;
				application.run(new TRANSITIONS.CrossFade(), oldScreen, currentScreen, {duration: 500});
			}
		}),
		contents: [
			new TitleLabel({string: ($.tries > 1? $.tries + " Tries Left" : "Last try!")}),
			new Line({
				top: 0, left: 0, right: 0, bottom: 0, 
				contents: [
					new Container({
						top: 0, bottom: 0, left: 0, right: 0,
						contents: [
							new Picture({
								top: 0, bottom: 0, left: 0, right: 0,
								url: "assets/NFCGuys-" + ($.id + 1) + ".png",
							}),
						],
						behavior: Behavior({
							onDisplaying: function(content) {
								if ($.tries < 3) {
									content.first.opacity = .5;
									content.add(
										new Picture({
											top: 0, bottom: 0, left: 0, right: 0,
											url: "assets/wrong.png",
										})
									)
								}
							}
						})
					}),
					new Container({
						top: 0, bottom: 0, left: 0, right: 0,
						contents: [
							new Picture({
								top: 0, bottom: 0, left: 0, right: 0,
								url: "assets/NFCGuys-" + ($.id + 1) + ".png",
							}),
						],
						behavior: Behavior({
							onDisplaying: function(content) {
								if ($.tries < 2) {
									content.first.opacity = .5;
									content.add(
									
										new Picture({
											top: 0, bottom: 0, left: 0, right: 0,
											url: "assets/wrong.png",
										})
									)
								}
							}
						})
					}),
					new Container({
						top: 0, bottom: 0, left: 0, right: 0,
						contents: [
							new Picture({
								top: 0, bottom: 0, left: 0, right: 0,
								url: "assets/NFCGuys-" + ($.id + 1) + ".png",
							}),						],
						behavior: Behavior({
							onDisplaying: function(content) {
								if ($.tries < 1) {
									content.first.opacity = .5;
									content.add(
										new Picture({
											top: 0, bottom: 0, left: 0, right: 0,
											url: "assets/wrong.png",
										})
									)
								}
							}
						})
					}),
				]
			})
		]
	}
})
