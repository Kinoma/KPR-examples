//@program
/*
  Copyright 2014 DouZen, Inc.

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
include("color"); 
include("sprite"); 

var state_capitols = [
 "Alabama - Montgomery","Alaska - Juneau"
,"Arizona - Phoenix","Arkansas - Little Rock"
,"California - Sacramento","Colorado - Denver"
,"Connecticut - Hartford","Delaware - Dover"
,"Florida - Tallahassee","Georgia - Atlanta"
,"Hawaii - Honolulu","Idaho - Boise"
,"Illinois - Springfield","Indiana - Indianapolis"
,"Iowa - Des Moines","Kansas - Topeka"
,"Kentucky - Frankfort","Louisiana - Baton Rouge"
,"Maine - Augusta","Maryland - Annapolis"
,"Massachusetts - Boston","Michigan - Lansing"
,"Minnesota - St. Paul","Mississippi - Jackson"
,"Missouri - Jefferson City","Montana - Helena"
,"Nebraska - Lincoln","Nevada - Carson City"
,"New Hampshire - Concord","New Jersey - Trenton"
,"New Mexico - Santa Fe","New York - Albany"
,"North Carolina - Raleigh","North Dakota - Bismarck"
,"Ohio - Columbus","Oklahoma - Oklahoma City"
,"Oregon - Salem","Pennsylvania - Harrisburg"
,"Rhode Island - Providence","South Carolina - Columbia"
,"South Dakota - Pierre","Tennessee - Nashville"
,"Texas - Austin","Utah - Salt Lake City"
,"Vermont - Montpelier","Virginia - Richmond"
,"Washington - Olympia","West Virginia - Charleston"
,"Wisconsin - Madison","Wyoming -Cheyenne"
];

// returns a random number between two values
//   min - minimum value for the random number
//   max - maximim value for the random number
var rand = function( min, max ) {
	return Math.round( (Math.random() * (max - min)) + min );
}

// creates the sprite content objects and adds them to the specified container
//   container - the parent container to add the sprites to
var build = function( container ) 
{
	// set the container's skin to black
	container.skin = new Skin("black");

	var c = new Container({left: 0, right: 0, top: 0, bottom: 0});
	c.behavior = new SpriteContainerBehavior();
	container.add(c);	
	
	// create new sprites and add then to the container
	var s=0;
	var xcols=5; //16;
	var yrows=10; //16;
	for(var x=0; x<xcols; x++)
	{	for(var y=0; y<yrows; y++)
		{	//Add text
			color = HSVtoHex(s*255/15, 128, 128);
			var style = new Style('28px', color, 'center', 0, 0, 5, 'middle', 0, 0, 20, 6);
			var sprite = new Text({x:0, y:0, width:400, height:200}, null, style, state_capitols[s%50]);
			sprite.behavior = new SpriteBehavior(s, x/(xcols-1), y/(yrows-1) +  s/250);
			c.add(sprite);
			s++;
		}
	}
	
	// add splash background
	var splashContent = new Picture({left:0, right:0, top:0, bottom:0}, "splash.png");
	c.behavior.splashContent = splashContent;
	container.add(splashContent);
}

// create a new behavior object for the application
application.behavior = {
	onAdapt: function( application ) 
	{
		// when the application is adapted to the shell then remove all of its
		// children and rebuild the content objects
		application.empty();
		application.active = true;
		build(application);
	},
	
	onTouchBegan: function (content, id, x, y, ticks) 
	{
		for(var sprite = content.first.first; sprite; sprite = sprite.next)
			sprite.behavior.increaseMode();
	}
}
	