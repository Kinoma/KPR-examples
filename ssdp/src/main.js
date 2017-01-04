/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import THEME from 'mobile/theme';
import CONTROL from 'mobile/control';
import DIALOG from 'mobile/dialog';
import MODEL from 'mobile/model';
import SCROLLER from 'mobile/scroller';

/* Skins and styles */
var blackSkin = new Skin({ fill: 'black' });
var whiteSkin = new Skin({ fill: 'white' });
var headerSkin = new Skin({ fill: '#203a6f' });

var headerStyle = new Style({ color: 'white', font: 'bold 24px Arial', horizontal: 'left' });
var rightStyle = new Style({ color: 'white', font: '24px Arial', horizontal: 'right' });
var nameStyle = new Style({ color: 'white', font: 'bold 24px Arial', horizontal: 'left', top: 5, });
var hostStyle = new Style({ color: 'white', font: '18px Arial', horizontal: 'left' });
var errorStyle = new Style({ color: 'white', font: '18px Arial', horizontal: 'center', vertical: 'middle', });
var backTexture = new Texture('./assets/back.png', 1);

var backSkin = new CONTROL.DynamicSkin(backTexture, THEME.tabDisabledEffect, THEME.tabEnabledEffect, THEME.tabSelectedEffect);
var toggleSwitchForegroundTexture = new Texture('./assets/switchForeground.png', 1);
var toggleSwitchBackgroundTexture = new Texture('./assets/switchBackground.png', 1);

/* Handlers */
Handler.bind("/browse", Behavior({
	onComplete: function(line, message) {
		if (message.status == 200) {
			var type = message.getResponseHeader("Content-Type");
			if (type.indexOf("image/") == 0)
				application.replace(application.first, new ImageScreen(this.data));
			else if (type.indexOf("text/html") == 0) {
				var platform = system.platform;
				if (platform == "linux")
					application.replace(application.first, new TextScreen(this.data));
				else
					application.replace(application.first, new WebviewScreen(this.data));
			}
			else if (type.indexOf("text/xml") == 0)
				application.replace(application.first, new TextScreen(this.data));
			else
				application.replace(application.first, new ErrorScreen(this.data));
		}
		else
			application.replace(application.first, new ErrorScreen(this.data));
	},
	onInvoke: function(handler, message) {
		var data = parseQuery(message.query);
		var url = data.url;
		this.data = data;
		var message = new Message(url);
		message.method = "GET";
		handler.invoke(message, Message.TEXT);
	}
}));

Handler.bind("/", Behavior({
	onInvoke: function(handler, message) {
		handler.redirect("http://www.kinoma.com/img/kinoma-logo.png");
	}
}));


/* UI templates */
class ToggleSwitchBehavior extends Behavior {
	onCreate(port, data, onOff) {
		this.onOff = onOff;
		this.switchForeground = toggleSwitchForegroundTexture;
		this.switchBackground = toggleSwitchBackgroundTexture;
		
		this.$size = this.switchBackground.width - this.switchForeground.width;
		this.$offset = ("off" == onOff ? this.$size : 0);
		this.$touched = false;
		this.$capturing = false;
		this.$touchMovedOffset = 15;
	}
	onTouchBegan(port, id, x, y, ticks) {
		if (port.running) {
			port.stop();
			port.time = port.duration;
		}
		this.$anchor = x;
		this.$delta = this.$offset + x;
		this.$touched = true;
		port.invalidate();
	}
	onTouchCancelled(port, id, x, y, ticks) {
		this.$touched = false;
	}
	onTouchMoved(port, id, x, y, ticks) {
		if (this.$capturing)
			this.$offset = this.constraint(port, this.$delta - x);
		else if (Math.abs(x - this.$anchor) >= this.$touchMovedOffset) {
			port.captureTouch(id, x, y, ticks);
			this.$capturing = true;
			this.$offset = this.constraint(port, this.$delta - x);
		}
		port.invalidate();
	}
	onTouchEnded(port, id, x, y, ticks) {
		var offset = this.$offset;
		var size = this.$size;
		var delta = size >> 1;
		this.$anchor = offset;
		if (this.$capturing) {
			if (offset < delta)
				delta = 0 - offset;
			else 
				delta = size - offset;
		}
		else {
			if (offset == 0)
				delta = size;
			else
				delta = 0 - size;
		}
		if (delta) {
			this.$delta = delta;
			port.duration = 250 * Math.abs(delta) / size;
			port.time = 0;
			port.start();
		}
		else
			this.onFinished(port);
		port.invalidate();
	}
	onTimeChanged(port) {
		var fraction = port.fraction;
		this.$offset = this.$anchor + Math.round(this.$delta * fraction);
		port.invalidate();
	}
	onFinished(port) {
		this.$touched = false;
		this.$capturing = false;
		
		if (this.$offset == 0)
			this.onOff = "on";
		else
			this.onOff = "off";
			
		this.onSwitchChanged(port, this.onOff);
	}
	onSwitchChanged(port, onOff) {
		debugger
	}
	constraint(port, offset) {
		if (offset < 0)
			offset = 0;
		else if (offset > this.$size)
			offset = this.$size;
		return offset;
	}
	onDraw(port, x, y, width, height) {
		port.pushClip();
		port.intersectClip(x + 6, y + 6, width - 12, height - 12);
		port.drawImage(this.switchBackground, x - this.$offset, y, width + this.$size, height, 
				0, this.$touched ? 40 : 0, width + this.$size, height);
		port.popClip();
		port.drawImage(this.switchForeground, x, y, width, height);
	}
}

var BrowsersScroller = SCROLLER.VerticalScroller.template($ => ({ left: 0, right: 0, top: 40, bottom: 0, 
	contents: [
		Column($, { left: 0, right: 0, top: 0, contents: [
			($.servers) ? $.servers.map($ => { 
				var $$ = this; 
				return [
					Line($, { left: 0, right: 0, active: true, 
						Behavior: class extends CONTROL.ButtonBehavior {
							onTap(line) {
								application.invoke(new Message("/browse?" + serializeQuery(this.data)));
							}
						}, 
						contents: [
							Column($, { left: 0, right: 0, top: 0, 
								contents: [
									Label($, { left: 10, right: 10, style: nameStyle, string: $.type, }),
									Label($, { left: 20, right: 10, style: hostStyle, string: $.uuid, }),
									Label($, { left: 20, right: 10, style: hostStyle, string: $.url, }),
									($.services) ? $.services.map($ => { 
										var $$ = this; 
										return [ Label($, { left: 30, right: 10, style: hostStyle, string: $, }) ]
									}, $) : null, 
								]
							}),
						], 
					}),
				Container($, { left: 0, right: 0, top: 0, height: 1, skin: headerSkin, }),
			]}, $) : null, 
		], }),
	], 
}));

var BrowserScreen = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin, 
	Behavior: class extends Behavior {
		onBrowsersChanged(layout) {
			if (this.data.servers.length == 0)
				layout.replace(layout.first, new DIALOG.Spinner);
			else
				layout.replace(layout.first, new BrowsersScroller(this.data));
		}
		onCreate(layout, data) {
			this.data = data;
		}
	}, 
	contents: [
		DIALOG.Spinner($, { }),
		Line($, { left: 0, right: 0, top: 0, height: 40, skin: headerSkin, contents: [
			Label($, { left: 10, style: headerStyle, string: $.title, }),
			Label($, { left: 100, right: 10, style: rightStyle, string: 'All', }),
			Port($, { 
				width: toggleSwitchForegroundTexture.width, height: toggleSwitchForegroundTexture.height, active: true, 
				Behavior: class extends ToggleSwitchBehavior {
					onCreate(port, data) {
						this.data = data;
						var onOff = data.state ? "on" : "off";
						super.onCreate(port, data, onOff);
					}
					onSwitchChanged(port, onOff) {
						var state = ("on" == onOff);
						if (this.data.state != state) {
							var client = model.client;
							this.data.state = state;
							if (state) {
								model.discoverAll();
							}
							else {
								model.discoverMediaRenderer();
							}
							application.distribute("onBrowsersChanged");
						}
					}
				},
			})
		], }),
	], 
}));

var BrowserLine = Container.template($ => ({ left: 0, right: 0, top: 0, height: 40, skin: headerSkin, 
	contents: [
		Container($, { 
			left: 0, width: 40, top: 0, height: 40, active: true, 
			Behavior: class extends CONTROL.ButtonBehavior {
				onTap(container) {
					application.replace(application.first, new BrowserScreen(data));
					application.distribute("onBrowsersChanged");
				}
			}, 
			contents: [ Content($, { left: 0, right: 0, top: 0, bottom: 0, skin: backSkin, }) ], 
		}),
		Label($, { left: 40, right: 10, top: 0, height: 40, style: headerStyle, string: $.uuid, }),
	], 
}));

var WebviewScreen = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin, 
	Behavior: class extends Behavior {
		onCreate(layout, data) {
			this.data = data;
			data.BROWSER.url = "http://" + data.ip + ":" + data.port;
		}	}, 
	contents: [
		(function() {
			var browser = $.BROWSER = new Browser({ left: 0, right: 0, top: 40, bottom: 0,  }, null);
			return browser;
		})(),
		BrowserLine($, { }),
	], 
}));

var ImageScreen = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin, 
	Behavior: class extends Behavior {
		onCreate(layout, data) {
			this.data = data;
			data.IMAGE.url = data.url;
		}
	}, 
	contents: [
		Container($, { left: 0, right: 0, top: 40, bottom: 0, skin: whiteSkin, 
			contents: [ Picture($, { left: 10, right: 10, top: 10, bottom: 10, anchor: 'IMAGE', }) ] 
		}),
		BrowserLine($, { }),
	], 
}));

var TextScreen = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin, 
	Behavior: class extends Behavior {
		onComplete(layout, message) {
			this.data.TEXT.string = message.responseText;
		}
		onCreate(layout, data) {
			this.data = data;
			var message = new Message(data.url);
			layout.invoke(message, Message.TEXT);
		}
	}, 
	contents: [
		SCROLLER.VerticalScroller($, { left: 0, right: 0, top: 40, bottom: 0, 
			contents: [ Text($, { left: 10, right: 10, style: hostStyle, anchor: 'TEXT', }) ] 
		}),
		BrowserLine($, { }),
	], 
}));

var ErrorScreen = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin, 
	contents: [
		Label($, { left: 10, right: 10, top: 40, bottom: 0, style: errorStyle, string: data.error, }),
		BrowserLine($, { }),
	], 
}));


/* Application set-up */
var data = {
	"error": "Cannot display this page!",
	"title": "Servers",
	"servers": [],
	"state": true
};

class ApplicationBehavior extends MODEL.ApplicationBehavior {
	discoverAll() {
		if (this.client)
			this.client.stop();
		data.servers = [];
		this.client = new SSDP.Client();
		this.client.behavior = this;
		this.client.start();
	}
	discoverMediaRenderer() {
		if (this.client)
			this.client.stop();
		data.servers = [];
		this.client = new SSDP.Client("urn:schemas-upnp-org:device:MediaRenderer:1");
		this.client.addService("urn:schemas-upnp-org:service:AVTransport:1");
		this.client.addService("urn:schemas-upnp-org:service:ConnectionManager:1");
		this.client.addService("urn:schemas-upnp-org:service:RenderingControl:1");
		this.client.behavior = this;
		this.client.start();
	}
	onLaunch(application) {
		application.shared = true;
		model.discoverAll();
		this.server = new SSDP.Server("urn:schemas-upnp-org:device:MediaRenderer:1", application.serverPort, "/", 1800);
		this.server.addService("urn:schemas-upnp-org:service:AVTransport:1");
		this.server.addService("urn:schemas-upnp-org:service:ConnectionManager:1");
		this.server.addService("urn:schemas-upnp-org:service:RenderingControl:1");
		this.server.behavior = this;
		this.server.start();
		application.discover(application.id);
		super.onLaunch(application);
	}
	onQuit(application) {
		application.forget(application.id);
		this.server.stop();
		this.server = undefined;
		this.client.stop();
		this.client = undefined;
		application.shared = false;
		super.onQuit(application);
	}
	onSSDPServerCompare(a,b) {
		return a.url.toLowerCase().compare(b.url.toLowerCase());
	}
	onSSDPServerDown(server) {
		trace("onSSDPServerDown: " + JSON.stringify(server) + "\n");
		var servers = data.servers;
		for (var i = servers.length; i--;) {
			if (servers[i].uuid == server.uuid) {
				servers.splice(i, 1);
				application.distribute("onBrowsersChanged");
				break;
			}
		}
	}
	onSSDPServerRegistered(server) {
		trace("onSSDPServerRegistered: " + JSON.stringify(server) + "\n");
	}
	onSSDPServerUnregistered(server) {
		trace("onSSDPServerUnregistered: " + JSON.stringify(server) + "\n");
	}
	onSSDPServerUp(server) {
		trace("onSSDPServerUp: " + JSON.stringify(server) + "\n");
		var servers = data.servers;
		for (var i = servers.length; i--;) {
			if (servers[i].uuid == server.uuid) {
				servers.splice(i, 1);
				break;
			}
		}
		data.servers.push(server);
		data.servers.sort(this.onSSDPServerCompare);
		application.distribute("onBrowsersChanged");
	}
}

var model = application.behavior = new ApplicationBehavior(application);
application.add(new BrowserScreen(data));