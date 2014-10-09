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

var THEME = require("themes/sample/theme");
var CONTROL = require("mobile/control");
var SCROLLER = require("mobile/scroller");
var MODEL = require("mobile/model");

/*
	ASSETS
*/

var toolsTexture = new Texture("./assets/tools.png");
var toolsSkin = new Skin({ texture: toolsTexture,  x:0, y:0, width:32, height:32, states:32, variants:32 });
var menuSkin = new Skin({ texture: toolsTexture, x:64, y:0, width:32, height:32, states:32, 
	tiles: { left:4, right:0, top:0, bottom:0 }, 
});
var marksTexture = new Texture("./assets/marks.png");
var marksSkin = new Skin({ texture: marksTexture,  x:0, y:0, width:30, height:30, states:30 });
var sliderBarSkin = new Skin({ texture: marksTexture, x:30, y:0, width:40, height:30, states:30, 
	tiles:{ left:10, right:10 }
});
var sliderThumbSkin = new Skin({ texture: marksTexture, x:70, y:0, width:20, height:30, states:30 });

var sliderLabelStyle = new Style({ font:"bold", size:14, horizontal:"left", color:["white","white","#acd473"] });
var sliderValueStyle = new Style({ font:"bold", size:14, horizontal:"right", color:["white","white","#acd473"] });

var testTexture = new Texture("./assets/testImage1.png");

/*
	MODEL
*/

var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	onLaunch: { value: function() {
		var data = this.data = { 
			billboard: {
				width : testTexture.width,
				height : testTexture.height,
				position : { x : 0, y : 0, z : 0 },
				orientation : { x : 0, y : 0, z : 0, w : 1 },
				eulerAngles : { x : 0, y : 0, z : 0 },
				scale : 1
			},
			camera: {
				width : application.width - 124,				// less tools width
				height : application.height,				// less header height
				position : { x : 0, y : 0, z : 240.0 },
				orientation : { x : 0, y : 0, z : 0, w : 1 },
				eulerAngles : { x : 0, y : 0, z : 0 },
				focalLength : 0,
				verticalFOV : 60
			}
		};
		this.data.camera.focalLength = this.verticalFieldOfViewToFocalLength(this.data.camera.verticalFOV, this.data.camera.height);
		application.add(new Screen(data));
	}},
	multiplyQuaternions: { value: function(q1, q2) {
		var qr = { w:0, x:0, y:0, z:0 }
		qr.w = (	q1.w * q2.w
				-	q1.x * q2.x
				-	q1.y * q2.y
				-	q1.z * q2.z);
		qr.x = (	q2.w * q1.x
					+	q1.w * q2.x
					+	q1.y * q2.z
					-	q1.z * q2.y);
		qr.y = (	q2.w * q1.y
					+	q1.w * q2.y
					+	q1.z * q2.x
					-	q1.x * q2.z);
		qr.z = (	q2.w * q1.z
					+	q1.w * q2.z
					+	q1.x * q2.y
					-	q1.y * q2.x);
		return qr
	}},
	panTiltRollToQuaternionWXYZ: { value: function(pan, tilt, roll) {

		var qPan = { w:0, x:0, y:0, z:0 }
		var qTilt = { w:0, x:0, y:0, z:0 }
		var qRoll = { w:0, x:0, y:0, z:0 }
		var qPanTilt = { w:0, x:0, y:0, z:0 }
		
		pan *= Math.PI / 360
		tilt *= Math.PI / 360
		roll *= Math.PI / 360
				
		qPan.w  = Math.cos(pan);	qPan.x  = 0;				qPan.y  = Math.sin(pan);	qPan.z  = 0;
		qTilt.w = Math.cos(tilt);	qTilt.x = Math.sin(tilt);	qTilt.y = 0;				qTilt.z = 0;
		qRoll.w = Math.cos(roll);	qRoll.x = 0;				qRoll.y = 0;				qRoll.z = Math.sin(roll);
	
		qPanTilt = this.multiplyQuaternions(qTilt, qPan)
		var q = this.multiplyQuaternions(qRoll, qPanTilt)
		
		//trace("\n euler pan " + pan + " tilt " + tilt + " roll " + roll);
		//trace("\n quaternion w " + q.w + " x " + q.x + " y " + q.y + " z " + q.z);
		
		return q;
	}},
	setQuaternionComponent: { value: function(orientation, component, value) {
		var n = Math.sqrt(1 - value * value)
		var m
		switch(component) {
			case "x":
				m = Math.sqrt(orientation.w * orientation.w + orientation.y * orientation.y + orientation.z * orientation.z)
				if (m == 0)
					orientation.w = n
				else {
					n /= m
					orientation.y *= n
					orientation.z *= n
					orientation.w *= n
				}
				orientation.x = value
				break
			case "y":
				m = Math.sqrt(orientation.w * orientation.w + orientation.x * orientation.x + orientation.z * orientation.z)
				if (m == 0)
					orientation.w = n
				else {
					n /= m
					orientation.x *= n
					orientation.z *= n
					orientation.w *= n
				}
				orientation.y = value
				break
			case "z":
				m = Math.sqrt(orientation.w * orientation.w + orientation.x * orientation.x + orientation.y * orientation.y)
				if (m == 0)
					orientation.w = n
				else {
					n /= m
					orientation.x *= n
					orientation.y *= n
					orientation.w *= n
				}
				orientation.z = value
				break
			case "w":
				m = Math.sqrt(orientation.x * orientation.x + orientation.y * orientation.y + orientation.z * orientation.z)
				if (m == 0)
					orientation.z = n
				else {
					n /= m
					orientation.x *= n
					orientation.y *= n
					orientation.z *= n
				}
				orientation.w = value
				break		
		}
	}},
	verticalFieldOfViewToFocalLength: { value: function(verticalFOV, imagePlaneHeight) {
		var fovRadians = verticalFOV * Math.PI / 180
		var focalLength = ((imagePlaneHeight - 1) / 2) / (Math.tan(fovRadians / 2))
		return focalLength;
	}},
});

var model = application.behavior = new ApplicationBehavior(application);

/*
	SCREEN
*/

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin:THEME.whiteSkin,
	contents: [
		Port($, { anchor:"PORT", left:0, right:0, top:0, bottom:0, active:true,
			behavior: Object.create(Behavior.prototype, {
				onCreate: { value: function(port, data) {
					this.data = data;
				}},
				onDraw: { value: function(port) {
					port.projectImage3D(testTexture, this.data.billboard, this.data.camera);
				}},
			}),
		}),
		Container($, { left:0, top:0, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onTap: { value: function(container) {
					application.invoke(new Message("xkpr://shell/close?id=" + application.id));
				}},
			}),
			contents: [
				Content($, { skin:toolsSkin, variant:0 }),
			]
		}),
		Container($, { width:32, right:4, height:32, top:0, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				onDisplayed: { value: function(container) {
					this.menuVisible = false;
					this.onTap(container);
				}},
				onTap: { value: function(container) {
					if (this.menuVisible)
						container.container.run(new MenuTransition, container, container.last.width - 4);
					else
						container.container.run(new MenuTransition, container, 4 - container.last.width);
					this.menuVisible = !this.menuVisible;
				}},
			}),
			contents: [
				Content($, { skin:toolsSkin, variant:1 }),
				Layout($, { left:32, top:0, skin:menuSkin,
					behavior: Object.create(Behavior.prototype, {
						onMeasureHorizontally: { value: function(layout) {
							var size = layout.first.first.measure();
							return size.width + 4;
						}},
						onMeasureVertically: { value: function(layout) {
							var size = layout.first.first.measure();
							return Math.min(size.height + 4, application.height);
						}},
					}),
					contents: [
						SCROLLER.VerticalScroller($, { left:4, clip:true, 
						contents:[ 
							Menu($),
							SCROLLER.TopScrollerShadow($),
							SCROLLER.BottomScrollerShadow($),
						]}),
					]
				}),
			]
		}),
	],
}});

var Menu = Column.template(function($) { return {
	left:0, top:0,
	contents: [
		MenuSlider({ log: false, min: -200, max: 200, step: 1, title: "B Pos X",
			getter: function() { 
				return -this.billboard.position.x 
			}, // UNITY parity : negating x
			setter: function(value) { 
				this.billboard.position.x = -value; 
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -200, max: 200, step: 1, title: "B Pos Y",
			getter: function() { 
				return this.billboard.position.y
			},
			setter: function(value) {
				this.billboard.position.y = value; 
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -200, max: 200, step: 1, title: "B Pos Z",
			getter: function() {
				return this.billboard.position.z
			},
			setter: function(value) {
				this.billboard.position.z = value; this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "B Angle X",
			getter: function() {
				return -this.billboard.eulerAngles.x
			},
			setter: function(value) {															// UNITY parity : negating x
				var billboard = this.billboard;
				var angles = billboard.eulerAngles;
				angles.x = -value;
				billboard.orientation = model.panTiltRollToQuaternionWXYZ(angles.y, -value, angles.z);
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "B Angle Y",
			getter: function() {
				return this.billboard.eulerAngles.y
			},
			setter: function(value) {
				var billboard = this.billboard;
				var angles = billboard.eulerAngles;
				angles.y = value;
				billboard.orientation = model.panTiltRollToQuaternionWXYZ(value, angles.x, angles.z);
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "B Angle Z",
			getter: function() {
				return this.billboard.eulerAngles.z
			},
			setter: function(value) {
				var billboard = this.billboard;
				var angles = billboard.eulerAngles;
				angles.z = value;
				billboard.orientation = model.panTiltRollToQuaternionWXYZ(angles.y, angles.x, value);
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -500, max: 500, step: 5, title: "C Pos X",
			getter: function() {
				return -this.camera.position.x
			},			// UNITY parity : negating x
			setter: function(value) {
				this.camera.position.x = -value; this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -500, max: 500, step: 5, title: "C Pos Y",
			getter: function() {
				return this.camera.position.y
			},
			setter: function(value) {
				this.camera.position.y = value; this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: 0, max: 2000, step: 1, title: "C Pos Z",
			getter: function() {
				return this.camera.position.z
			},
			setter: function(value) {
				this.camera.position.z = value; this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "C Angle X",
			getter: function() {
				return this.camera.eulerAngles.x
			},
			setter: function(value) {
				var camera = this.camera;
				var angles = camera.eulerAngles;
				angles.x = value;
				camera.orientation = model.panTiltRollToQuaternionWXYZ(angles.y, value, angles.z);
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "C Angle Y",
			getter: function() {
				return this.camera.eulerAngles.y + 180
			},
			setter: function(value) {												// UNITY parity : subtract 180 degrees
				var camera = this.camera;
				var angles = camera.eulerAngles;
				angles.y = value - 180;
				camera.orientation = model.panTiltRollToQuaternionWXYZ(value - 180, angles.x, angles.z);
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: -180, max: 180, step: 1, title: "C Angle Z",
			getter: function() {
				return -this.camera.eulerAngles.z
			},
			setter: function(value) {													// UNITY parity : negating z
				var camera = this.camera;
				var angles = camera.eulerAngles;
				angles.z = -value;
				camera.orientation = model.panTiltRollToQuaternionWXYZ(angles.x, angles.y, -value);
				this.PORT.invalidate();
			}
		}),
		MenuSlider({ log: false, min: 1, max: 179, step: 1, title: "C Vert FOV",
			getter: function() {
				return this.camera.verticalFOV
			},
			setter: function(value) {
				this.camera.verticalFOV = value
				var focalLength = model.verticalFieldOfViewToFocalLength(value, this.camera.height);
				//trace("\n verticalFieldOfView: " + value + " focalLength: " + focalLength);
				this.camera.focalLength = focalLength;
				this.PORT.invalidate(); 
			}
		})
	]
}});

var MenuSlider = Container.template(function($) { return { 
	left:0, width:120, height:44, active:true,
	behavior: Object.create(Behavior.prototype, {
		changeState: { value: function(container, state) {
			var content = container.first;
			while (content) {
				content.state = state;
				content = content.next;
			}
		}},
		onCreate: { value: function(container, data) {
			this.data = data;
		}},
		onDisplaying: { value: function(container) {
			this.onModelChanged(container);
		}},
		onFinished: { value: function(container, ticks) {
			var touch = this.touch;
			container.captureTouch(touch.id, touch.x, touch.y, ticks);
			touch.captured = true;
			this.onTouchMoved(container, touch.id, touch.x, touch.y, ticks);
		}},
		onTouchBegan: { value: function(container, id, x, y, ticks) {
			this.touch = { captured: false, id: id, x: x, y: y };
			container.duration = 250;
			container.time = 0;
			container.start();
			this.changeState(container, 2);
		}},
		onTouchCancelled: { value: function(container, id, x, y, ticks) {
			container.stop();
			this.changeState(container, 1);
		}},
		onTouchEnded: { value: function(container, id, x, y, ticks) {
			var touch = this.touch;
			if ((!touch.captured)) {
				container.stop();
				touch.captured = true;
				this.onTouchMoved(container, id, x, y, ticks);
			}
			this.changeState(container, 1);
		}},
		onTouchMoved: { value: function(container, id, x, y, ticks) {
			var touch = this.touch;
			if ((!touch.captured) && (Math.abs(x - touch.x) > 8)) {
				container.stop();
				container.captureTouch(id, x, y, ticks);
				touch.captured = true;
			}
			if (touch.captured) {
				var thumb = container.last;
				var bar = thumb.previous;
				var value = this.offsetToValue(x - bar.x - (thumb.width >> 1), bar.width - thumb.width);
				this.data.setter.call(model.data, value);
				this.onModelChanged(container);
			}
		}},
		offsetToValue: { value: function(offset, size) {
			var data = this.data;
			var result;
			if (data.log) {
			  var minv = Math.log(data.min);
			  var maxv = Math.log(data.max);
			  result = Math.exp(minv + (offset * (maxv - minv) / size));
			}
			else
				result = data.min + ((offset * (data.max - data.min)) / size);
			if (result < data.min)
				result = data.min;
			else if (result > data.max)
				result = data.max;
			return result;
		}},
		onModelChanged: { value: function(container) {
			var thumb = container.last;
			var bar = thumb.previous;
			var data = this.data;
			var value = data.getter.call(model.data);
			thumb.x = bar.x + this.valueToOffset(value, bar.width - thumb.width);
			if (data.step >= 1.0)
				container.first.next.string = Math.round(value).toString();
			else {
				var numStr = value.toString();
				var index = numStr.lastIndexOf(".");
				if (index >= 0)
					numStr = numStr.slice(0, index + 2);
				container.first.next.string = numStr;
			}
		}},
		valueToOffset: { value: function(value, size) {
			var data = this.data;
			var result;
			if (data.log) {
				var minv = Math.log(data.min);
				var maxv = Math.log(data.max);
				result = Math.round(((Math.log(value) - minv) * size) / (maxv - minv));
			}
			else
				result = Math.round(((value - data.min) * size) / (data.max - data.min));
			return result;
		}},
	}),
	contents: [
		Label($, { left:10, right:0, top:4, height:20, style:sliderLabelStyle, string:$.title, }),
		Label($, { left:0, right:10, top:4, height:20, style:sliderValueStyle, }),
		Content($, { left:0, right:0, top:18, skin:sliderBarSkin, }),
		Content($, { left:10, top:18, skin:sliderThumbSkin, }),
	]
}});

/*
	TRANSITIONS
*/

var MenuTransition = function() {
	Transition.call(this, 250);
}
MenuTransition.prototype = Object.create(Transition.prototype, {
	onBegin: { value: function(screen, container, delta) {
		var toolLayer = this.toolLayer = new Layer({ alpha:true });
		toolLayer.attach(container.first);
		var menuLayer = this.menuLayer = new Layer({ alpha:true });
		menuLayer.attach(container.last);
		this.delta = delta;
	}},
	onEnd: { value: function(screen, container, delta) {
		this.menuLayer.detach();
		this.toolLayer.detach();
		container.moveBy(delta, 0);
	}},
	onStep: { value: function(fraction) {
		fraction = Math.quadEaseOut(fraction);
		this.menuLayer.translation = this.toolLayer.translation = { x: this.delta * fraction };
	}}
});












