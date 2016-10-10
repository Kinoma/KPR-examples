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
import CONTROL from 'mobile/control';import SCROLLER from 'mobile/scroller';import SCREEN from 'mobile/screen';import TRANSITIONS from 'transitions';

/* Skins and styles */let whiteSkin = new Skin({ fill: 'white',});let maskSkin = new Skin({ fill: '#7f000000',});let itemSkin = new Skin({ borders: { left:0, right:0, top:0, bottom:1 }, fill: ['#515153', '#2ea7cb'], stroke: '#cccccc',});
let noServersStyle = new Style({ color: 'black', font: '18px', horizontal: 'center', vertical: 'middle', });let titleStyle = new Style({ color: 'white', font: 'bold 24px', horizontal: 'left', vertical: 'middle', });let urlStyle = new Style({ color: 'white', font: '18px', horizontal: 'left', vertical: 'middle', });

/* Handlers */Handler.bind("/discover", Behavior({	onComplete: function(container, message, json) {		let query = parseQuery(message.query);		let server = model.getServer(query.uuid);		server.update(json);		application.distribute("onDevicesChanged");	},	onInvoke: function(handler, message) {		let discovery = JSON.parse(message.requestText);		let servers = model.servers;		let serversTable = model.serversTable;		let uuid = discovery.uuid;		if (!(uuid in serversTable)) {			let server = new Server(discovery);			let message = server.createMessage("info", { uuid: server.uuid });			handler.invoke(message, Message.JSON);			serversTable[uuid] = servers.length;			servers.push(server);		}	},}));Handler.bind("/forget", Behavior({	onInvoke: function(handler, message) {		let discovery = JSON.parse(message.requestText);		let servers = model.servers;		let serversTable = model.serversTable;		let uuid = discovery.uuid;		if (uuid in serversTable) {			servers.splice(serversTable[uuid], 1);			delete serversTable[uuid];			application.distribute("onDevicesChanged");		}	},}));

/* UI templates */let NoServersLine = Label.template($ => ({ top: 40, style: noServersStyle, string: 'No servers' }));
let ServerContainer = Container.template($ => ({ 
	left: 0, right: 0, height: 44, active: true, skin: itemSkin, 
	Behavior: class extends SCREEN.ListItemBehavior {
		onCreate(container, data) {			this.server = data.server;		}		onTap(container) {			this.changeState(container, 0);			let chatRoom = new ChatRoom({ server:this.server });			application.run( new TRANSITIONS.Flip(), application.first, chatRoom, { direction : "left" } );		}
	}, 
	contents: [		Text($, { left: 0, right: 0, 			blocks: [				{ style: titleStyle, string: $.server.name, },				{ style: urlStyle, string: $.server.url, },			], 
		}),	], 
}));
let MainContainer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin, 
	contents: [		SCROLLER.VerticalScroller($, { 
			contents: [				Column($, { left: 0, right: 0, top: 0, 
					Behavior: class extends Behavior {
						onCreate(column, data) {							this.onDevicesChanged( column );						}						onDevicesChanged(column) {							column.empty();							this.build( column );						}						build(column) {							let servers = model.servers;							if ( !servers || ( 0 == servers.length ) )								column.add( new NoServersLine );							else {								for ( let i = 0; i < model.servers.length; ++i )									column.add( new ServerContainer( { server: model.servers[ i ] } ) );							}						}
					},
				}),			], 
		}),	], 
}));
let InputField = Line.template($ => ({ 
	left: 0, right: 0, height: 44, bottom: 0, active: true,
	 contents: [		Label($, { left: 0, top: 0, bottom: 0, style: THEME.dialogLabelStyle, string: $.label, }),		Container($, { 
			left: 0, right: 10, top: 5, bottom: 5, skin: THEME.fieldScrollerSkin, 
			contents: [				Scroller($, { 
					left: 0, right: 30, top: 0, bottom: 0, active: true, 
					Behavior: CONTROL.FieldScrollerBehavior, clip: true, 
					contents: [						Label($, { 
							left: 0, top: 0, bottom: 0, skin: THEME.fieldLabelSkin, style: THEME.fieldLabelStyle,
							editable: true, string: $.value,  
							Behavior: class extends CONTROL.FieldLabelBehavior {								onEdited(label) {									let string = label.string;									label.container.next.visible = string.length > 0;									label.bubble("onChanged", string);								}								onKeyDown(label, key, repeat, ticks) {									if (key) {										let code = key.charCodeAt(0);										if (code == 3 /* enter */ || code == 13 /* return */) {											let string = label.string;											label.bubble("onCommit", string);											label.string = "";										} else {											return super.onKeyDown(label, key, repeat, ticks);										}									}								}							},
						}),					], 
				}),				Content($, { right: -5, top: 0, bottom: 0, active: true, skin: THEME.fieldDeleterSkin, Behavior: CONTROL.FieldDeleterBehavior, }),			], 
		}),		Label($, { 
			right: 0, top: 0, bottom: 0, active: true, style: THEME.dialogLabelStyle, string: 'Send',
			Behavior: class extends CONTROL.ButtonBehavior {				onTap(label) {					let field = label.previous.first.first;					label.bubble("onCommit", field.string);					field.string = "";				}			}, 
		}),	], 
}));

class ChatRoomBehavior extends Behavior {	onCreate(container, data) {		this.server = data.server;		let field = new InputField({label:"Name", value:""});		container.add(field);		this.STAGE = container.first.next.first;		this.conn = this.doConnect(this.server.url);;		this.nameDefined = false;		this.FIELD = field;		this.FIELD_LABEL = field.first;		this.FIELD_VALUE = field.first.next.first.first;				this.FIELD_VALUE.active = false;		this.FIELD_VALUE.string = "connecting";	}	onCommit(container, string) {		// first line must be name of the user		if (!this.nameDefined)			this.user = string;		this.conn.send(string);	}	doConnect(url) {		let conn = new WebSocket(url);		let self = this;		conn.onopen = function() {			self.FIELD_LABEL.string = "Name?";						self.FIELD_VALUE.active = true;			self.FIELD_VALUE.string = "";		};		conn.onmessage = function(e) {			let message = JSON.parse(e.data);			switch (message.type) {				case 'history':					self.onHistory(message.data);					break;				case 'color':					self.onLoginSuccess(message.data);					break;				case 'message':					self.onReceive(message.data);					break;			}		};		conn.onclose = function(e) {};		conn.onerror = function(e) {};		return conn;	}	onLoginSuccess(color) {		this.FIELD_LABEL.string = this.user;		this.FIELD_LABEL.style = new Style("20px Arial", color);		this.nameDefined = true;	}	onReceive(message) {		let name = message.author;		let color = message.color;		let text = message.text;		let block = new Text({left: 4, right: 4, top: 0});		block.string = name + ': ' + text;		block.style = new Style("18px Arial", color);		if (this.STAGE.first) {			this.STAGE.insert(block, this.STAGE.first);		} else {			this.STAGE.add(block);		}	}	onHistory(messages) {		for (let i = 0, c = messages.length; i < c; i++)			this.onReceive(messages[i]);	}}
let ChatRoom = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin, 
	Behavior: ChatRoomBehavior, 
	contents: [		Text($, { 
			left: 0, right: 0, top: 0, height: 44, skin: itemSkin, 			blocks: [				{ style: titleStyle, string: $.server.name, },				{ style: urlStyle, string: $.server.url, },			], 
		}),		SCROLLER.VerticalScroller($, { 
			left: 0, right: 0, top: 44, bottom: 44, active: true, clip: true, 
			contents: [				Column($, { left: 0, right: 0, top: 0, }),			], 
		}),	], 
}));
class Server {
	constructor(discovery) {		this.location = discovery.url;		this.type = discovery.id;		this.uuid = discovery.uuid;		this.name = "- Untitled -";		this.port = undefined;
		this.url = undefined;
		this.conn = undefined;	}	createMessage(name, query) {		let url = this.location + name;		if (query)			url += "?" + serializeQuery(query);		return new Message(url);	}	update(json) {		this.name = json.name;		this.port = json.port;				this.url = 'ws:' + this.location.split(':')[1] + ':' + this.port;	}};

/* Application set-up */
class ApplicationBehavior extends Behavior {	onLaunch(application) {		this.servers = [];		this.serversTable = {};
		application.add( new MainContainer({}) );	}	onDisplayed(application) {		application.discover("websocketserver.example.kinoma.marvell.com");	}	onQuit(application) {		application.forget("websocketserver.example.kinoma.marvell.com");	}	getServer(uuid) {		return this.servers[this.serversTable[uuid]];	}}let model = application.behavior = new ApplicationBehavior();