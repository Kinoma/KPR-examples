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
	MODEL
*/

var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	doErase: { value: function(application) {
		var canvas = this.data.CANVAS;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.doNotify({
			uuid: application.uuid,
			touches: null,
		});
		this.touches = [];
	}},
	doNotify: { value: function(json) {
		var text = JSON.stringify(json);
		var length = text.length;
		this.servers.forEach(function(server) {
			var message = new Message(mergeURI(server.url, "/notify"));
			message.requestText = text;
			message.setRequestHeader("Content-Length", length);
			message.setRequestHeader("Content-Type", "application/json");
			application.invoke(message);
		});
	}},
	onColorChanged: { value: function() {
		var data = this.data;
		var components = data.components;
		data.color = "rgb(" + components.r + "," + components.g + "," + components.b + ")";
	}},
	onComplete: { value: function(application, message, json) {
		if (json) {
			var container = this.data.CHATS;
			var servers = this.servers;
			servers.some(function(server) { 
				if (server.uuid == json.uuid) {
					server.canvas.delegate("onNotify", json);
					container.run(new DiscoverTransition, server.canvas);
					return true;
				}
			});
		}
	}},
	onDiscover: { value: function(discovery) {
		var container = this.data.CHATS;
		var servers = this.servers;
		var uuid = discovery.uuid;
		if (application.uuid != uuid) {
			if (!servers.some(function(server) { 
				return server.uuid == uuid; 
			})) {
				trace("DISCOVER " + uuid + " " + discovery.url + "\n");
				discovery.canvas = new ChatCanvas(discovery);
				servers.push(discovery);
				container.add(discovery.canvas);
				var message = new Message(mergeURI(discovery.url, "/state"));
				application.invoke(message, Message.JSON);

			}
		}
	}},
	onForget: { value: function(discovery) {
		var container = this.data.CHATS;
		var servers = this.servers;
		var uuid = discovery.uuid;
		if (application.uuid != uuid) {
			servers.some(function(item, index, array) { 
				if (item.uuid == uuid) {
					trace("FORGET " + uuid + "\n");
					array.splice(index, 1);
					container.run(new ForgetTransition, item.canvas);
					return true;
				}
			});
		}
	}},
	onLaunch: { value: function() {
		var data = this.data = { 
			color: "black",
			components: {r:0, g:0, b:0},
			thickness: 10,
		};
		this.servers = [];
		this.touches = [];
		application.add(new Screen(data));
		
		application.share({ ssdp: true });
		application.discover(application.id, { ssdp: true });
		
		var message = new MessageWithObject("pins:configure", {
			orientation: {
				require: "ADXL335",
				pins: {
					x: { type: "A2D", pin: 39 },
					y: { type: "A2D", pin: 40 },
					z: { type: "A2D", pin: 37 },
				}
			},
			light :  {
				require: "TCS34725",
				pins: {
					rgb: { type: "I2C", sda: 27, clock: 29 },
					led: { type: "Digital", direction: "output", pin: 21, value: 1 }
				}
			},
		});
		message.setRequestHeader("referrer", "xkpr://" + application.id);
		application.invoke(message);
		var message = new Message("pins:/light/getColor?repeat=on&callback=/color&interval=1000");
		message.setRequestHeader("referrer", "xkpr://" + application.id);
		application.invoke(message);
		var message = new Message("pins:/orientation/get?repeat=on&callback=/erase&interval=100");
		message.setRequestHeader("referrer", "xkpr://" + application.id);
		application.invoke(message);
	}},
	onNotify: { value: function(json) {
		var data = this.data;
		var container = this.data.CHATS;
		var servers = this.servers;
		servers.some(function(server) { 
			if (server.uuid == json.uuid) {
				server.canvas.delegate("onNotify", json);
				return true;
			}
		});
	}},
	onThicknessChanged: { value: function() {
		var data = this.data;
		data.COLOR.height = data.thickness;
	}},
	onQuit: { value: function() {
		application.forget(application.id);
		application.share(false);
	}},
});

var model = application.behavior = new ApplicationBehavior(application);

Handler.bind("/color", {
	onInvoke: function(handler, message) {
		var components = model.data.components;
		var result = message.requestObject;
		components.r = result.r;
		components.g = result.g;
		components.b = result.b;
		application.delegate("onColorChanged");
		application.distribute("onModelChanged")
	}
});
Handler.bind("/discover", {
	onInvoke: function(handler, message) {
		var json = JSON.parse(message.requestText);
		model.onDiscover(json);
	}
});
Handler.bind("/erase", {
	onInvoke: function(handler, message) {
		model.doErase(application);
	}
});
Handler.bind("/forget", {
	onInvoke: function(handler, message) {
		var json = JSON.parse(message.requestText);
		model.onForget(json);
	}
});
Handler.bind("/notify", {
	onInvoke: function(handler, message) {
		var json = JSON.parse(message.requestText);
		model.onNotify(json);
	}
});
Handler.bind("/state", {
	onInvoke: function(handler, message) {
		var text = JSON.stringify({
			uuid: application.uuid,
			touches: model.touches,
		});
		var length = text.length;
		message.status = 200;
		message.responseText = text;
		message.setResponseHeader("Content-Length", length);
		message.setResponseHeader("Content-Type", "application/json");
	}
});

/*
	SCREEN
*/

var ChatCanvas = Canvas.template(function($) { return {
	left:0, right:0, top:0, bottom:0, visible:false,
	behavior: Object.create(Behavior.prototype, {
		onNotify: { value: function(canvas, data) {
			var ctx = canvas.getContext("2d");
			if (data.touches) {
				data.touches.forEach(function(touch) {
					ctx.lineWidth = touch.thickness
					ctx.strokeStyle = touch.color
					ctx.beginPath();
					ctx.moveTo(touch.x, touch.y);
					touch.lines.forEach(function(line) {
						ctx.lineTo(line.x, line.y);
					});
					ctx.stroke();
				});
			}
			else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
		}},
	}),
}});

var Screen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, active:true,
	contents: [
		Container($, { anchor:"CHATS", left:0, right:0, top:0, bottom:0, skin: new Skin({ fill: "white" }) }),
		Canvas($, { anchor:"CANVAS", left:0, right:0, top:0, bottom:0, active:true,
			behavior: Object.create(Behavior.prototype, {
				onDisplaying: { value: function(canvas) {
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}},
				onTouchBegan: { value: function(canvas, id, x, y, ticks) {
					this.position = canvas.position;
					x -= this.position.x;
					y -= this.position.y;
					var ctx = canvas.getContext("2d");
					ctx.lineWidth = model.data.thickness
					ctx.strokeStyle = model.data.color
					ctx.beginPath();
					ctx.moveTo(x, y);
					this.data = {
						uuid: application.uuid,
						touches: [ 
							{
								color: model.data.color,
								thickness: model.data.thickness,
								x: x,
								y: y,
								lines: []
							}
						]
					};
					this.lines = this.data.touches[0].lines;
				}},
				onTouchMoved: { value: function(canvas, id, x, y, ticks) {
					x -= this.position.x;
					y -= this.position.y;
					var ctx = canvas.getContext("2d");
					ctx.lineTo(x, y);
					ctx.stroke();
					this.lines.push({ x: x, y: y });
				}},
				onTouchEnded: { value: function(canvas, id, x, y, ticks) {
					model.doNotify(this.data);
					model.touches = model.touches.concat(this.data.touches);
					delete this.data;
					delete this.lines;
				}},
			}),
		}),
		Canvas($, { left:0, width:33, height:33, top:0, active:true,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				changeState: { value: function(canvas, state) {
					canvas.state = state;
					this.draw(canvas);
				}},
				draw: { value: function(canvas) {
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					var x = 16;
					var y = 16;
					var radius = 16;
					ctx.lineWidth = 1;
					ctx.fillStyle = canvas.state > 1 ? "black" : "white";
					ctx.strokeStyle = "black";
					ctx.beginPath();
					ctx.arc(x, y, radius - 1, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
					ctx.lineCap = "round";
					ctx.lineJoin = "round";
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(17, 7);
					ctx.lineTo(8, 16);
					ctx.lineTo(17, 25);
					ctx.strokeStyle = canvas.state > 1 ? "white" : "black";
					ctx.stroke();
				}},
				onDisplaying: { value: function(canvas) {
					CONTROL.ButtonBehavior.prototype.onDisplaying.call(this, canvas);
					this.draw(canvas);
				}},
				onTap: { value: function(container) {
					application.invoke(new Message("xkpr://shell/close?id=" + application.id));
				}},
			}),
		}),
		Canvas($, { width:33, right:0, height:33, top:0,
			behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
				draw: { value: function(canvas) {
					var ctx = canvas.getContext("2d");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					var x = 16;
					var y = 16;
					var radius = 16;
					ctx.fillStyle = model.data.color;
					ctx.strokeStyle = "black";
					ctx.beginPath();
					ctx.arc(x, y, radius - 1, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
					
				}},
				onDisplaying: { value: function(canvas) {
					this.draw(canvas);
				}},
				onModelChanged: { value: function(canvas) {
					this.draw(canvas);
				}},
			}),
		}),
	],
}});

/*
	TRANSITIONS
*/

var DiscoverTransition = function() {
	Transition.call(this, 500);
}
DiscoverTransition.prototype = Object.create(Transition.prototype, {
	onBegin: { value: function(container, canvas) {
		canvas.visible = true;
		var layer = this.layer = new Layer({ alpha:true });
		layer.attach(canvas);
	}},
	onEnd: { value: function(container, canvas) {
		this.layer.detach();
	}},
	onStep: { value: function(fraction) {
		this.layer.opacity = Math.quadEaseOut(fraction);
	}}
});

var ForgetTransition = function() {
	Transition.call(this, 500);
}
ForgetTransition.prototype = Object.create(Transition.prototype, {
	onBegin: { value: function(container, canvas) {
		var layer = this.layer = new Layer({ alpha:true });
		layer.attach(canvas);
	}},
	onEnd: { value: function(container, canvas) {
		this.layer.detach();
		container.remove(canvas);
	}},
	onStep: { value: function(fraction) {
		this.layer.opacity = Math.quadEaseOut(1 - fraction);
	}}
});












