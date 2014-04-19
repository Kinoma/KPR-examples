/**
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
**/
var testTexture = new Texture("./assets/testImage1.png");

var PortBehavior = function(data, context) {
	Behavior.call(this, data, context);
}
PortBehavior.prototype = Object.create(Behavior.prototype, {
	onCreate: { 
		value: function(data, context) {
			this.data = data;
		}
	},
	onDraw: { 
		value: function(port) {
			port.projectImage3D(testTexture, this.data.billboard, this.data.camera);
		}
	}
});

var doBuild = function(container) {
	var port = new Port({left:0, right:0, top:0, bottom:0});
	port.behavior = new PortBehavior(this.data);
	container.add(port);
	this.data.billboard = {
		width : testTexture.width,
		height : testTexture.height,
		position : { x : 0, y : 0, z : 0 },
		orientation : { x : 0, y : 0, z : 0, w : 1 },
		eulerAngles : { x : 0, y : 0, z : 0 },
		scale : 1
	}
	this.data.camera = {
		width : application.width - 120,				// less tools width
		height : application.height - 50,				// less header height
		position : { x : 0, y : 0, z : 240.0 },
		orientation : { x : 0, y : 0, z : 0, w : 1 },
		eulerAngles : { x : 0, y : 0, z : 0 },
		focalLength : 0,
		verticalFOV : 60
	}
	this.data.camera.focalLength = handler.behavior.verticalFieldOfViewToFocalLength(this.data.camera.verticalFOV, this.data.camera.height);
	this.data.PORT = port;
}

var Project3DBehavior = function() {
	this.PixelsPerMeter = 253
}
Project3DBehavior.prototype = Object.create(MainScreenBehavior.prototype, {

	multiplyQuaternions: {
		value: function(q1, q2) {
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
		}
	},

	panTiltRollToQuaternionWXYZ: {
		value: function(pan, tilt, roll) {

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
		}
	},
	setQuaternionComponent: {
		value: function(orientation, component, value) {
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
		}
	},
	verticalFieldOfViewToFocalLength: {
		value: function(verticalFOV, imagePlaneHeight) {
			var fovRadians = verticalFOV * Math.PI / 180
			var focalLength = ((imagePlaneHeight - 1) / 2) / (Math.tan(fovRadians / 2))
			return focalLength;
		}
	},
	onDescribe: { 
		value: function() {
			return {
				Screen: MainScreen,
				build: doBuild,
				menu: {
					items: [
						{
							Item: MenuSlider,
							log: false,
							min: -200,
							max: 200,
							step: 1,
							title: "B Pos X",
							getter: function() { return -this.context.data.billboard.position.x },				// UNITY parity : negating x
							setter: function(value) { this.context.data.billboard.position.x = -value; this.context.data.PORT.invalidate(); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -200,
							max: 200,
							step: 1,
							title: "B Pos Y",
							getter: function() { return this.context.data.billboard.position.y },
							setter: function(value) { this.context.data.billboard.position.y = value; this.context.data.PORT.invalidate(); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -200,
							max: 200,
							step: 1,
							title: "B Pos Z",
							getter: function() { return this.context.data.billboard.position.z },
							setter: function(value) { this.context.data.billboard.position.z = value; this.context.data.PORT.invalidate(); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "B Angle X",
							getter: function() { return -this.context.data.billboard.eulerAngles.x },
							setter: function(value) {															// UNITY parity : negating x
										var billboard = this.context.data.billboard
										var angles = billboard.eulerAngles
										angles.x = -value
										billboard.orientation = handler.behavior.panTiltRollToQuaternionWXYZ(angles.y, -value, angles.z)
									},
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "B Angle Y",
							getter: function() { return this.context.data.billboard.eulerAngles.y },
							setter: function(value) {
										var billboard = this.context.data.billboard
										var angles = billboard.eulerAngles
										angles.y = value
										billboard.orientation = handler.behavior.panTiltRollToQuaternionWXYZ(value, angles.x, angles.z)
									},
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "B Angle Z",
							getter: function() { return this.context.data.billboard.eulerAngles.z },
							setter: function(value) {
										var billboard = this.context.data.billboard
										var angles = billboard.eulerAngles
										angles.z = value
										billboard.orientation = handler.behavior.panTiltRollToQuaternionWXYZ(angles.y, angles.x, value)
									},
						},
						{
							Item: MenuSlider,
							log: false,
							min: -500,
							max: 500,
							step: 5,
							title: "C Pos X",
							getter: function() { return -this.context.data.camera.position.x },			// UNITY parity : negating x
							setter: function(value) { this.context.data.camera.position.x = -value; this.context.data.PORT.invalidate(); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -500,
							max: 500,
							step: 5,
							title: "C Pos Y",
							getter: function() { return this.context.data.camera.position.y },
							setter: function(value) { this.context.data.camera.position.y = value; this.context.data.PORT.invalidate(); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: 0,
							max: 2000,
							step: 1,
							title: "C Pos Z",
							getter: function() { return this.context.data.camera.position.z },
							setter: function(value) { this.context.data.camera.position.z = value; this.context.data.PORT.invalidate(); },
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "C Angle X",
							getter: function() { return this.context.data.camera.eulerAngles.x },
							setter: function(value) {
										var camera = this.context.data.camera
										var angles = camera.eulerAngles
										angles.x = value
										camera.orientation = handler.behavior.panTiltRollToQuaternionWXYZ(angles.y, value, angles.z)
									},
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "C Angle Y",
							getter: function() { return this.context.data.camera.eulerAngles.y + 180 },
							setter: function(value) {												// UNITY parity : subtract 180 degrees
										var camera = this.context.data.camera
										var angles = camera.eulerAngles
										angles.y = value - 180
										camera.orientation = handler.behavior.panTiltRollToQuaternionWXYZ(value - 180, angles.x, angles.z)
									},
						},
						{
							Item: MenuSlider,
							log: false,
							min: -180,
							max: 180,
							step: 1,
							title: "C Angle Z",
							getter: function() { return -this.context.data.camera.eulerAngles.z },
							setter: function(value) {													// UNITY parity : negating z
										var camera = this.context.data.camera
										var angles = camera.eulerAngles
										angles.z = -value
										camera.orientation = handler.behavior.panTiltRollToQuaternionWXYZ(angles.x, angles.y, -value)
									},
						},
						{
							Item: MenuSlider,
							log: false,
							min: 1,
							max: 179,
							step: 1,
							title: "C Vert FOV",
							getter: function() { return this.context.data.camera.verticalFOV },
							setter: function(value) {
										this.context.data.camera.verticalFOV = value
										var focalLength = handler.behavior.verticalFieldOfViewToFocalLength(value, this.context.data.camera.height);
										//trace("\n verticalFieldOfView: " + value + " focalLength: " + focalLength);
										this.context.data.camera.focalLength = focalLength;
										this.context.data.PORT.invalidate(); 
									},
						}
					],
					selection: -1,
				},
				title: "Project 3D Example",
			};
		}
	}
});
var handler = new Handler("/main");
handler.behavior = new Project3DBehavior;
Handler.put(handler);

