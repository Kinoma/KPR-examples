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

// constructor for sprite behavior
var SpriteBehavior = function( index, x01, y01 ) {
	this.index = index;
	this.x01 = x01;
	this.y01 = y01;
	this.modeFunction = this.mode0;
}

// prototype for the sprite behavior
SpriteBehavior.prototype = Object.create( Object.prototype, 
{
	x01: { value: 0.5, writable: true },
	y01: { value: 0.5, writable: true },
	index : { value: 0.5, writable: true },
	mode : { value: 0, writable: true },
	frequency : { value: 3, writable: true },

	onDisplaying: {
		value: function( sprite ) 
		{
			// calculate the width and height of the container minus the size of the
			// sprite content when initializing, so we don't need to do this every time
			// we animate the sprite
			this.width = sprite.container.width - sprite.width;
			this.height = sprite.container.height - sprite.height;
		}
	},
	
	increaseMode : {
		value: function(sprite)
		{
			this.mode = (this.mode + 1) % 4;
			switch (this.mode) {
				case 0: this.modeFunction = this.mode0; break;
				case 1: this.modeFunction = this.mode1; break;
				case 2: this.modeFunction = this.mode2; break;
				case 3: this.modeFunction = this.mode3; break;
			}
		}
	},
	mode0 : {
		value: function(now)
		{
			return 1+ Math.sin(this.frequency*(this.x01+ this.y01)+ now)/2;
		}
	},
	mode1 : {
		value: function(now)
		{
			return 1+ Math.sin(-this.frequency*this.x01         + now)/2;
		}
	},
	mode2 : {
		value: function(now)
		{
			return 1+ Math.sin(this.frequency*this.y01+ now)/2;
		}
	},
	mode3 : {
		value: function(now)
		{
			return 1+ Math.sin(this.frequency*(this.x01-.5)*(this.x01-.5) + (this.y01-.5)*(this.y01-.5)+ now)/2;
		}
	},

});


var SpriteContainerBehavior = function(  ) {
}

SpriteContainerBehavior.prototype = Object.create( Object.prototype, 
{
	onDisplaying: {
		value: function( container ) 
		{
			container.start();			
		}
	},

	onTimeChanged: {
		value: function( container ) 
		{
			var now = container.time / 1000;
			var width = container.width, height = container.height;
			var xcenter = width/2;
			var ycenter = height/2;

			this.splashContent.opacity = (1+Math.sin(now/2))/5;

			for(var layer = container.first; layer; layer = layer.next) {
				var behavior = layer.behavior;
				var x = behavior.x01*(width-layer.width);
				var y = behavior.y01*(height-layer.height);

				var z01 = behavior.modeFunction(now);
				var size = z01 * 48 - 24;

				var scale = size / 64;

				layer.translation = {
					x: x * z01 + xcenter * (1 - z01),
					y: y * z01 + ycenter * (1 - z01)
				};

				layer.scale = {
					x: scale,
					y: scale
				};
			}
		}
	}
});
