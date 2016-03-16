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

/* BEHAVIORS */

class BallBehavior extends Behavior {
	constructor() {
		super();
		this.width = 0;
		this.height = 0;
		this.dx = 2 + Math.round(Math.random() * 5);
		this.dy = 2 + Math.round(Math.random() * 5);
	}
	onDisplaying(ball) {
		ball.start();
		this.width = ball.container.width - ball.width;
		this.height = ball.container.height - ball.height;
		ball.moveBy(Math.round(Math.random() * this.width), Math.round(Math.random() * this.height));
	}
	onTimeChanged(ball) {
		let dx = this.dx;
		let dy = this.dy;
		ball.moveBy(dx, dy);
		let x = ball.x - ball.container.x;
		let y = ball.y - ball.container.y;
		if ((x < 0) || (x > this.width)) dx = -dx;
		if ((y < 0) || (y > this.height)) dy = -dy;
		this.dx = dx;
		this.dy = dy;
	}
};

/* HANDLERS */

Handler.Bind("/dial", class extends Behavior {
    onInvoke(handler, message) {
		if (("query" in message) && message.query) {
			let query = parseQuery(message.query);
			if ("count" in query) {
				let count = parseInt(query.count);
				if (count > 10) count = 10;
				else if (count < 1) count = 1;
				let model = application.behavior;
				model.count = count;
				model.onAdapt(application);
			}
		}
    }
});

/* APPLICATION */

var build = function(container) {
	let count = application.behavior.count;
	container.skin = new Skin("#a2ffff");
	let ballTexture = new Texture("balls.png");
	let ballSkin = new Skin({ texture:ballTexture, x:0, y:0, width:30, height:30, variants:30 });
	for (let i = 0; i < count; i++) {
		let ball = new Content({ left:0, width:30, top:0, height:30, skin:ballSkin });
		ball.behavior = new BallBehavior();
		ball.variant = i % 4;
		container.add(ball);
	}
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
