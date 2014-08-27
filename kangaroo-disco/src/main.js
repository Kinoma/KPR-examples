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
include("sprite.js"); 

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

	// create a new sprite texture and skin using the specified image file
	var spriteTexture = new Texture("disco.png");
	var dxdydust = spriteTexture.height;
	var spriteSkin = new Skin(spriteTexture, {x:0, y:0, width:dxdydust, height:dxdydust}, dxdydust, 0,
						undefined, undefined, "fit");
	
	// create new sprites and add them to the container
	var s=0;
	var xcols=16;
	var yrows=16;
	var dxdydust = 64;
	for(var x=0; x<xcols; x++)
	{	for(var y=0; y<yrows; y++)
		{
			var sprite = new Thumbnail({left: 0, width: dxdydust, top: 0, height: dxdydust});
			sprite.aspect = "draw";
			sprite.behavior = new SpriteBehavior(s, x/(xcols-1), y/(yrows-1));
			sprite.url = "disco.png";
			
			sprite.crop = {x: (s % 5) * dxdydust, y: 0, width: dxdydust, height: dxdydust};
			sprite.subPixel = false;
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
	
	onTouchBegan: function(content, id, x, y, ticks) 
	{
		for(var sprite = content.first.first; sprite; sprite = sprite.next)
		{
			sprite.behavior.increaseMode();
		}
	}
}
	