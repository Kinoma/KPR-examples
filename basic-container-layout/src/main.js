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

/* Skins and Styles */
var blueSkin = new Skin ({fill: 'blue'});
var greenSkin = new Skin ({fill: 'green'});
var redSkin = new Skin ({fill: 'red'});
var whiteSkin = new Skin ({fill: 'white'});
var yellowSkin = new Skin ({fill: 'yellow'});

var blackStyle = new Style ({ font: '18px', color: 'black', horizontal: 'left' });
var whiteStyle = new Style ({ font: '18px', color: 'white', horizontal: 'left' });

var ContainerTemplate = Container.template(function ($) { return {
	top: $.top, bottom: $.bottom, left: $.left, right: $.right, height: $.height, width: $.width, skin: $.skin,
	contents: [
		Text($, {top: 0, bottom: 0, left: 5, right: 0, string: $.string, style: $.style})
	]
}})

/* Main screen layout */
var mainContainer = Container.template(function ($) { return {
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin, 
	contents: $.containers.map(function(item) {
		return new ContainerTemplate(item);
	})	
}});

/* Application definition */
application.behavior = {
	onLaunch: function() { 
		var data = this.data = {
			containers: [
				{top: 0, bottom: undefined, left: 0, right: 0, height: 100, width: undefined, skin: redSkin, string: 'Positioned By:\ntop, left, right, height', style: whiteStyle},
				{top: 0, bottom: 0, left: undefined, right: 0, height: undefined, width:100, skin: greenSkin, string: 'Positioned By:\ntop, bottom, \nright, width', style: whiteStyle},
				{top: undefined, bottom: 0, left: 0, right: 0, height: 75, width: undefined, skin: yellowSkin, string: 'Positioned By:\nbottom, left, right, height', style: blackStyle},
				{top: undefined, bottom: undefined, left: undefined, right: undefined, height: 100, width: 160, skin: blueSkin, string: 'Positioned By:\nheight, width', style: whiteStyle}
			]
		};
		application.add(new mainContainer(data));
	}
}