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

var dtcycle 			= 2.5;
var dtcycleoffsetobject = 0.035;
var turns				= 4;

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
	x01				: { value: 0.5, writable: true },
	y01				: { value: 0.5, writable: true },
	index			: { value: 0.5, writable: true },
	mode			: { value: 0, writable: true },
	frequency		: { value: 5, writable: true },
	t1cycle			: { value: 0.0, writable: true },
	dtcycle			: { value: dtcycle, writable: true },
	tcycleoffset	: { value: 0.0, writable: true },
	radius01		: { value: 0.0, writable: true },

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
			return 1+ Math.sin(this.frequency*(this.x01+ this.y01)+ now/3);
		}
	},
	mode1 : {
		value: function(now)
		{
			return 1+ Math.sin(-this.frequency*this.x01         + now*2);
		}
	},
	mode2 : {
		value: function(now)
		{
			return 1+ Math.sin(this.frequency*this.y01+ now*4);
		}
	},
	mode3 : {
		value: function(now)
		{
			return 1+ Math.sin(this.frequency*(this.x01-.5)*(this.x01-.5) + (this.y01-.5)*(this.y01-.5)+ now/5);
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
		{	var now = container.time / 1000;
			now = now / (5-container.first.behavior.mode);
			
			var width = container.width;
			var height = container.height;
			var xcenter = width/2;
			var yradius = height/3;
			var y1center = -height/3;
			var y2center = height;
			var dycenter = y2center - y1center;
			var xradius = width/2;

			this.splashContent.opacity = (1+Math.sin(now*2))/5;

			for(var sprite = container.first; sprite; sprite = sprite.next) 
			{	var b = sprite.behavior;
				var index	= b.index;
				if(b.t1cycle == 0)
					b.t1cycle 		= now + index*dtcycleoffsetobject;
	
				var t01 = (now - b.t1cycle) / b.dtcycle; 
				while(t01>b.dtcycle) t01-=b.dtcycle;	//modulo?
				var t01 			= Math.max(0,t01);
				var t01eo 			= Math.sineEaseOut(t01);
				var t10 			= Math.max(0,1-t01);
				var t10eo 			= Math.sineEaseOut(t10);
				var theta 			= t01 * turns * 2 * Math.PI - Math.PI;
				var ycenter 		= y1center + dycenter*t01eo; //eo*t01eo; //*t01*t01;
				var x 				= xcenter + Math.cos(theta)*xradius*t10; //ei;
				var size 			= Math.max(4, 48*t10*t10); //48*x10ei+10; //Math.max(6, (z01) * 48-24);
				var _width 			=  10 + size * 48;
				var _height 		=  size;
				var _x 				= x - _width/2;
				var y 				= ycenter + Math.sin(theta)*yradius*t10;//; //*t10ei;
		
				sprite.style.size 	= size;
			
				sprite.coordinates = {
					top: y,
					left: _x,
					width: _width,
					height: _height
				};
			}
		}
	}
});

