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
import SCROLLER from './scroller';

/* Skins and styles */
var whiteSkin = new Skin({ fill: 'white' });
var maskSkin = new Skin({ fill: '#7f000000' });
var noServersStyle = new Style({ color: 'black', font: '18px', horizontal: 'center', vertical: 'middle' });
var colorStyle = new Style({ color: 'white', font: 'bold 18px', horizontal: 'center', vertical: 'middle' });

/* Handlers */
Handler.bind("/discover", {
	onComplete(handler, message, json) {
		var query = parseQuery(message.query);
		var server = model.getServer(query.uuid);
		server.color = json.color;
		application.distribute("onDevicesChanged");
	},
	onInvoke(handler, message) {
		var discovery = JSON.parse(message.requestText);
		var uuid = discovery.uuid;
		var servers = model.servers;
		var serversTable = model.serversTable;
		var server = new Server(discovery);
		serversTable[uuid] = servers.length;
		servers.push(server);
		var message = server.createMessage("color", { uuid: uuid });
		handler.invoke(message, Message.JSON);
	}
});

Handler.bind("/forget", {
	onInvoke(handler, message) {
		var discovery = JSON.parse(message.requestText);
		var uuid = discovery.uuid;
		var servers = model.servers;
		var serversTable = model.serversTable;
		if (uuid in serversTable) {
			var index = serversTable[uuid];
			var server = servers[index];
			delete serversTable[uuid];
			servers.splice(index, 1);
			application.distribute("onDevicesChanged");
		}
	}
});

/* UI templates */
var NoServersLine = Label.template($ => ({ top: 40, style: noServersStyle, string: 'No servers' }));

var ServerContainer = Container.template($ => ({ 
	width: 110, height: 110, 
	contents: [
		Container($, { 
			width: 100, height: 100, skin: new Skin( $.server.color ), 
			contents: [
				Text($, { left: 0, right: 0, bottom: 0, skin: maskSkin, blocks: [{ style: colorStyle, string: $.server.color, }] }),
			]
		}),
	]
}));

class MainContainerBehavior extends Behavior {
	onCreate(column, data) {
		this.onDevicesChanged( column );
	}
	onDevicesChanged(column) {
		column.empty();
		this.build( column );
	}
	build(column) {
		var servers = model.servers;
		if ( !servers || ( 0 == servers.length ) )
			column.add( new NoServersLine );
		else {
			for ( var i = 0; i < servers.length; ++i ) column.add( new ServerContainer({ server: servers[i] }) );
		}
	}
}
var MainContainer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin, 
	contents: [
		SCROLLER.VerticalScroller($, { 
			contents: [
				Column($, { left: 0, right: 0, top: 0, Behavior: MainContainerBehavior }),
			]
		}),
	]
}));

/* Application set-up */
class Server {
	constructor(discovery) {
		this.url = discovery.url;
		this.id = discovery.id;
		this.protocol = discovery.protocol;
		this.uuid = discovery.uuid;
		this.color = "";
	}
	createMessage(name, query) {
		var url = this.url + name;
		if (query) url += "?" + serializeQuery(query);
		return new Message(url);
	}
}	

class ApplicationBehavior extends Behavior {
	onLaunch(application) {
		application.add( new MainContainer( {} ) );
		this.servers = [];
		this.serversTable = {};
	}
	onDisplayed(application) {
		application.discover("discoveryserver.example.kinoma.marvell.com");
	}
	onQuit(application) {
		application.forget("discoveryserver.example.kinoma.marvell.com");
	}
	getServer(uuid) {
		return this.servers[this.serversTable[uuid]];
	}
}
var model = application.behavior = new ApplicationBehavior();
