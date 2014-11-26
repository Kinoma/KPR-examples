//@program
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

var BallBehavior = function () {
	this.dx = 2 + Math.round(Math.random() * 5);
	this.dy = 2 + Math.round(Math.random() * 5);
}

BallBehavior.prototype = Object.create(Object.prototype, {
	dx: { value: 5, writable: true },
	dy: { value: 5, writable: true },
	x: { value: 0, writable: true },
	y: { value: 0, writable: true },
	width: { value: 0, writable: true },
	height: { value: 0, writable: true },
	onDisplaying: {
		value: function(ball) {
			ball.start();
			this.width = ball.container.width - ball.width;
			this.height = ball.container.height - ball.height;
			ball.moveBy(Math.round(Math.random() * this.width), Math.round(Math.random() * this.height));
		}
	},
	onTimeChanged: {
		value: function(ball) {
			var dx = this.dx;
			var dy = this.dy;
			ball.moveBy(dx, dy);
			var x = ball.x - ball.container.x;
			var y = ball.y - ball.container.y;
			if ((x < 0) || (x > this.width)) dx = -dx;
			if ((y < 0) || (y > this.height)) dy = -dy;
			this.dx = dx;
			this.dy = dy;
		}
	},
});

var HandlerBehavior = function(handler, data, context) {
	Behavior.call(this, handler, data, context);
};

// Reconfigure the number of balls requested by the remote app
HandlerBehavior.prototype = Object.create(Behavior.prototype, {
	onInvoke: {
		value: function(handler, message) {
			if (("query" in message) && message.query) {
				var query = parseQuery(message.query);
				if ("count" in query) {
					var count = parseInt(query.count);
					if (count > 10) count = 10;
					else if (count < 1) count = 1;
					var model = application.behavior;
					model.count = count;
					model.onAdapt(application);
				}
			}
		}
	},
});

var build = function(container) {
	var count = application.behavior.count;
	container.skin = new Skin("#a2ffff");
	var ballTexture = new Texture("balls.png");
	var ballSkin = new Skin(ballTexture, {x:0, y:0, width:30, height:30}, 30, 0);
	for (var i = 0; i < count; i++) {
		var ball = new Content({left:0, width: 30, top: 0, height: 30}, ballSkin);
		ball.behavior = new BallBehavior();
		ball.variant = i % 4;
		container.add(ball);
	}

	var handler = new Handler("/dial");
	handler.behavior = new HandlerBehavior(handler);
	Handler.put(handler);
}

application.behavior = {
	onAdapt: function(application) {
		application.empty();
		build(application);
	},
	onLaunch: function(application) {
		this.count = 4;
		build(application);
	},
}
