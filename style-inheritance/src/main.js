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
var level1Skin = new Skin({ fill:'#fff' });
var level2Skin = new Skin({ fill:'#eee' });
var level3Skin = new Skin({ fill:'#ddd' });
var level4Skin = new Skin({ fill:'#ccc' });
var level5Skin = new Skin({ fill:'#bbb' });

var baseStyle = new Style({ color:'black', font:'24px', horizontal:'left' });
var captionStyle = new Style({ color:'#888', font:'24px', horizontal:'right', vertical:'top' });
var largeSizeStyle = new Style({ font:'36px' });
var mediumSizeStyle = new Style({ font:'24px' });
var smallSizeStyle = new Style({ font:'18px' });

var blueStyle = new Style({ color:'blue' });
var redStyle = new Style({ color:'red' });

var leftStyle = new Style({ horizontal:'left' });
var rightStyle = new Style({ horizontal:'right' });

/* LAYOUTS */

var Caption = Label.template($ => ({ left:4, right:4, bottom:4, style:captionStyle }));
var Sample = Label.template($ => ({ left:4, right:4, top:4, string:sample }));

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:level1Skin,
	contents: [
		Sample($),
		Caption($, { string:'application.style' }),
		Container($, {
			left:30, right:30, top:30, bottom:30, skin:level2Skin, style:mediumSizeStyle,
			contents: [
				Sample($),
				Caption($, { string:'mediumSizeStyle' }),
				Column($, {
					left:0, right:0, top:0, bottom:0,
					contents: [
						Container($, {
							left:30, right:30, top:40, bottom:0, skin:level3Skin, style:redStyle,
							contents: [
								Sample($),
								Caption($, { string:'redStyle' }),
								Line($, {
									left:0, right:0, top:0, bottom:0,
									contents: [
										Container($, {
											left:30, right:0, top:40, bottom:40, skin:level4Skin, style:leftStyle,
											contents: [
												Sample($, { string:shortSample }),
												Caption($, { string:'leftStyle' }),
											]
										}),
										Container($, {
											left:30, right:30, top:40, bottom:40, skin:level4Skin, style:rightStyle,
											contents: [
												Sample($, { string:shortSample }),
												Caption($, { string:'rightStyle' }),
											]
										}),
									]
								})
							]
						}),
						Container($, {
							left:30, right:30, top:40, bottom:40, skin:level3Skin, style:blueStyle,
							contents: [
								Sample($),
								Caption($, { string:'blueStyle' }),
								Line($, {
									left:0, right:0, top:0, bottom:0,
									contents: [
										Container($, {
											left:30, right:0, top:40, bottom:40, skin:level4Skin, style:smallSizeStyle,
											contents: [
												Sample($, { string:shortSample }),
												Caption($, { string:'smallSizeStyle' }),
											]
										}),
										Container($, {
											left:30, right:30, top:40, bottom:40, skin:level4Skin, style:largeSizeStyle,
											contents: [
												Sample($, { string:shortSample }),
												Caption($, { string:'largeSizeStyle' }),
											]
										}),
									]
								})
							]
						})
					]
				})
			]
		})
	]
}));

/* APPLICATION */

application.style = baseStyle;
let sample = "The quick brown fox jumps over the lazy dog. ";let shortSample = "Hello world.";
application.add( new MainScreen );
