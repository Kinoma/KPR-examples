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

/* BEHAVIORS */

class BallBehavior extends Behavior {
	constructor(delta) {
		super(delta);
		this.dx = delta;
		this.dy = delta;
		this.width = 0;
		this.height = 0;
    }
    onDisplaying(ball) {
		ball.start();
		this.width = ball.container.width - ball.width;
		this.height = ball.container.height - ball.height;
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

/* APPLICATION */

var build = function(container) {
	container.skin = new Skin({ fill:"white" });
	let ballTexture = new Texture("balls.png");
	let ballSkin = new Skin({ texture:ballTexture, x:0, y:0, width:30, height:30, variants:30 });
	var ball = new Content({ left:0, width:30, top:0, height:30, skin:ballSkin });
	ball.behavior = new BallBehavior(6);
	ball.variant = 0;
	container.add(ball);
	var ball = new Content({ right:0, width:30, top:0, height:30, skin:ballSkin });
	ball.behavior = new BallBehavior(5);
	ball.variant = 1;
	container.add(ball);
	var ball = new Content({ right:0, width:30, bottom:0, height:30, skin:ballSkin });
	ball.behavior = new BallBehavior(4);
	ball.variant = 2;
	container.add(ball);
	var ball = new Content({ left:0, width:30, bottom:0, height:30, skin:ballSkin });
	ball.behavior = new BallBehavior(3);
	ball.variant = 3;
	container.add(ball);
}

application.behavior = Behavior({
	onAdapt(application) {
		application.empty();
		build(application);
	},
	onLaunch(application) {
		build(application);
	}
});
