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

Handler.bind("/accelData", {
	onInvoke: function(handler, message) {
        var data = model.data;

		data.axes = message.requestObject;
        data.axes.y *= -1;        // adjust y for Kinoma Create orientation
        
        data.labels.x.string = "x: " + formatAcceleration(data.axes.x);
        data.labels.y.string = "y: " + formatAcceleration(data.axes.y);
        data.labels.z.string = "z: " + formatAcceleration(data.axes.z);
	}
});

var model = application.behavior = Object.create(Object.prototype, {
	onComplete: { value: function(application, message) {
        if (0 != message.error) {
            return;
        }
        
        // axis values
        var style = new Style({ font:"bold 36px", color:"white", horizontal:"left", vertical:"middle" });
        model.data.labels = {
            x: new Label({left: 60, top: 70}, null, style, "x: "),
            y: new Label({left: 60, top: 105}, null, style, "y: "),
            z: new Label({left: 60, top: 140}, null, style, "z: "),
        };
        application.add(model.data.labels.x);
        application.add(model.data.labels.y);
        application.add(model.data.labels.z);

        // bouncing ball
        application.skin = new Skin({ fill: "#76b321" });
        var ballTexture = new Texture("ball.png");
        var ballSkin = new Skin(ballTexture, {x:0, y:0, width:50, height:50}, 50, 0);
        var ball = new Content({left:125, width: 50, top: 95, height: 50}, ballSkin);
        ball.behavior = new BallBehavior();
        application.add(ball);

        trace("onComplete, error " + message.error + "\n");
        application.invoke(new MessageWithObject("pins:/tesselAccelerometer/read?repeat=on&callback=/accelData&interval=30"));
	}},
	onLaunch: { value: function(application) {
        application.invoke(new MessageWithObject("pins:configure", {
            tesselAccelerometer: {
                require: "tesselAccelerometer",
                pins: {
                    accelerometer: {sda: 27, clock: 29, outputRate: 50}
                }
            }}), Message.JSON);

		this.data = { axes: {x: 0, y: 0, z: 0} };
	}},
});

var BallBehavior = function (delta) {
}
BallBehavior.prototype = Object.create(Object.prototype, {
	x: { value: 0, writable: true },
	y: { value: 0, writable: true },
	vx: { value: 0, writable: true },
	vy: { value: 0, writable: true },
	width: { value: 0, writable: true },
	height: { value: 0, writable: true },
	onDisplaying: {
		value: function(ball) {
			ball.start();
			this.width = ball.container.width - ball.width;
			this.height = ball.container.height - ball.height;
		}
	},
	onTimeChanged: {
		value: function(ball) {
            var axes = model.data.axes;

            // apply accelerometer
            this.vx = (this.vx + axes.x) * 0.98;
            this.vy = (this.vy + axes.y) * 0.98;

            var dx = this.vx;
            var dy = this.vy;

            // bounce against sides
			var x = ball.x - ball.container.x;
			var y = ball.y - ball.container.y;
            if (x < 0) {
                dx = -x;
                this.vx = -this.vx;
            }
            else if (x > this.width) {
                dx = this.width - x;
                this.vx = -this.vx;
            }
            if (y < 0) {
                dy = -y;
                this.vy = -this.vy;
            }
            else if (y > this.height) {
                dy = this.height - y;
                this.vy = -this.vy;
            }

            // move ball
			ball.moveBy(dx, dy);
		}
	},
});

function formatAcceleration(val)
{
    val = ((val * 100000) | 0) / 100000;
    var result = val.toPrecision(5).toString();
    if (0 == result)
        result = "  0.00000";
    else {
        if (result >= 0)
            result = "+" + result;
        if (result.length < 8)
            result += "00000000".slice(0, 8 - result.length);
    }

    return result;

}
