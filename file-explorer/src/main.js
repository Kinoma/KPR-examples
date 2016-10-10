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
import MODEL from 'mobile/model';
import SCREEN from 'mobile/screen';
import SCROLLER from 'mobile/scroller';
import TOOL from 'mobile/tool';

/* Skins, styles, and textures */
let applicationIconTexture = new Texture('assets/icon.png', 1);
let applicationIconSkin = new Skin({ texture: applicationIconTexture, width: 80, height: 80, aspect: 'fit' });

var blackSkin = new Skin({ fill: 'black' });
var whiteSkin = new Skin({ fill: 'white' });
var separatorSkin = new Skin({ fill: 'silver' });
var itemNameStyle = new Style({  font: 'bold', lines: 1, });

/* Handlers */
class IterateHandlerBehavior extends MODEL.CommandBehavior {
onQuery(handler, query) {
	var items = [];
	try {
		var iterator = new Files.Iterator(query.path);
		let info;
		while (info = iterator.getNext())
			items.push(info);
	}
	catch (e) {
	}
	handler.message.responseText = JSON.stringify(items);
}
}
Handler.bind("/iterateDirectory", new IterateHandlerBehavior);

class DirectoryHandlerBehavior extends MODEL.ScreenBehavior {
	hasSelection(data, delta) {
		var selection = data.selection + delta;
		return (0 <= selection) && (selection < data.items.length)
	}
	getSelection(data, delta) {
		data.selection += delta;
		return data.items[data.selection];
	}
	onDescribe(query, selection) {
		var path = selection.path + selection.name + "/";
		var title = (0 == path.indexOf("file://")) ? path.slice(7) : path;
		return {
			Screen: DirectoryScreen,
			title: title,
			items: null,
			more: false,
			path: path,
			scroll: {
				x: 0,
				y: 0
			},
			selection: -1,
			applicationIconSkin
		};
	}
}
Handler.bind("/directory", new DirectoryHandlerBehavior);

class FileHandlerBehavior extends MODEL.ScreenBehavior {
	hasSelection(data, delta) {
		var selection = data.selection + delta;
		return (0 <= selection) && (selection < data.items.length)
	}
	getSelection(data, delta) {
		data.selection += delta;
		return data.items[data.selection];
	}
	onDescribe(query, selection) {
		return {
			Screen: FileScreen,
			title: selection.name,
			path: selection.path + selection.name,
			extension: selection.extension,
			scroll: {
				x: 0,
				y: 0
			},
			selection: -1,
			applicationIconSkin
		};
	}
}
Handler.bind("/file", new FileHandlerBehavior);

class MainHandlerBehavior extends MODEL.ScreenBehavior {
	hasSelection(data, delta) {
		var selection = data.selection + delta;
		return (0 <= selection) && (selection < data.items.length)
	}
	getSelection(data, delta) {
		data.selection += delta;
		return data.items[data.selection];
	}
	onDescribe(query, selection) {
		var title = (0 == model.root.indexOf("file://")) ? model.root.slice(7) : model.root;
		return {
			Screen: MainScreen,
			title: title,
			items: null,
			more: false,
			path: model.root,
			scroll: {
				x: 0,
				y: 0
			},
			selection: -1,
			applicationIconSkin
		}
	}
}
Handler.bind("/main", new MainHandlerBehavior);

/* UI templates */
class FileListBehavior extends SCREEN.ListBehavior {
	addItemLine(list, item) {
		list.add(new FileLine(item));
	}
	createMessage(list, data) {
		var message = new Message("/iterateDirectory?path=" + encodeURIComponent(data.path));
		return message;
	}
	getItems(list, message, results) {
		var data = this.data;
		var items = [];
		for (var i = 0, c = results.length; i < c; ++i) {
			var item = results[i];
			if (Files.linkType == item.type)
				continue;
			item.name = item.path;
			item.path = data.path;
			if (item.type == Files.fileType) {
				try {
					var dot = item.name.lastIndexOf(".");
					item.extension = (dot > 0) ? item.name.slice(dot + 1) : "";
				}
				catch(e) {
					item.extension = "";
				}
				item.action = "/file";
				item.thumbnail = "./assets/file.png";
				items.push(item);
			}
			else if (item.type == Files.directoryType) {
				item.action = "/directory";
				item.thumbnail = "./assets/folder.png";
				items.push(item);
			}
		}
		return items.length ? items : null;
	}
	hasMore(list, message, result) {
		return false;
	}
}

var FileLine = Line.template($ => ({ 
	left: 0, right: 0, active: true, skin: THEME.lineSkin, 
	Behavior: SCREEN.ListItemBehavior, 
	contents: [
		Column($, { left: 0, right: 0, contents: [
			Line($, { left: 0, right: 0, height: 1, skin: separatorSkin, }),
			Line($, { left: 2, right: 2, height: 52, contents: [
				Thumbnail($, { width: 40, height: 40, url: $.thumbnail, }),
				Text($, { left: 4, right: 0, 
				blocks: [
					{ style: itemNameStyle, string: $.name, },
				], }),
			], }),
		], }),
	], 
}));

var AVContainer = Media.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, url: $,
	Behavior: class extends Behavior {
		onLoaded(media) {
			media.start();
			media.bubble("onItemLoaded");
		}
	},  
}));

var PictureContainer = Picture.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, url: $,
	Behavior: class extends Behavior {
		onLoaded(picture) {
			picture.bubble("onItemLoaded");
		}
	}  
}));

var GenericFileContainer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	Behavior: class extends Behavior {
		onDisplayed(container) {
			container.bubble("onItemLoaded");
		}
	}
}));

var Header = SCREEN.EmptyHeader.template($ => ({ 
	skin: blackSkin, 
	contents: [
		TOOL.BackButton($, { }),
		TOOL.HeaderTitle($, { style: THEME.plainHeaderTitleStyle }),
	], 
}));

var Footer = SCREEN.EmptyFooter.template($ => ({ 
	skin: blackSkin, 
	contents: [
		Line($, { 
			top: 0, bottom: 0, 
			contents: [
				TOOL.PreviousButton($, { }),
				TOOL.NextButton($, { }),
			], 
		}),
	], 
}));

var DirectoryScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [
		SCREEN.EmptyBody($, { 
			skin: whiteSkin, anchor: 'BODY', 
			contents: [
				SCROLLER.VerticalScroller($, { 
					contents: [
						Column($, { left: 0, right: 0, top: 0, anchor: 'LIST', Behavior: FileListBehavior }),
						SCROLLER.VerticalScrollbar($, { }),
						SCROLLER.TopScrollerShadow($, { }),
						SCROLLER.BottomScrollerShadow($, { }),
					], 
				}),
			], 
		}),
		Header($, { anchor: 'HEADER' }),
		Footer($, { anchor: 'FOOTER', }),
	], 
}));

class FileScreenBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.audioExtensions = ["mp3","m4a","wav"];
		this.imageExtensions = ["bmp","gif","jpg","jpeg","png"];
		this.videoExtensions = ["flv","mp4","mov","qt"];
	}
	onDisplayed(container) {
		var extension = this.data.extension;
		if (this.imageExtensions.some(this.matchExtension, extension))
			container.add(new PictureContainer(this.data.path));
		else if (this.audioExtensions.some(this.matchExtension, extension) || this.videoExtensions.some(this.matchExtension, extension))
			container.add(new AVContainer(this.data.path));
		else
			container.add(new GenericFileContainer(this.data.title));
	}
	onItemLoaded(container) {
		container.remove(this.data.BUSY);
	}
	matchExtension(extension) {
		return this.toLowerCase() == extension;
	}
}
var FileScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [
		SCREEN.EmptyBody($, { 
			bottom: THEME.screenFooterHeight, skin: blackSkin, anchor: 'BODY', Behavior: FileScreenBehavior, 
			contents: [
				Content($, { skin: THEME.busySkin, anchor: 'BUSY', Behavior: CONTROL.BusyBehavior }),
			], 
		}),
		Header($, { anchor: 'HEADER' }),
		Footer($, { anchor: 'FOOTER', }),
	], 
}));

var MainScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [
		SCREEN.EmptyBody($, { skin: whiteSkin, anchor: 'BODY', contents: [
			SCROLLER.VerticalScroller($, { contents: [
				Column($, { left: 0, right: 0, top: 0, anchor: 'LIST', Behavior: FileListBehavior }),
				SCROLLER.VerticalScrollbar($, { }),
				SCROLLER.TopScrollerShadow($, { }),
				SCROLLER.BottomScrollerShadow($, { }),
			], }),
		], }),
		Header($, { anchor: 'HEADER' }),
	], 
}));

/* Application set-up */
var model = application.behavior = new MODEL.ApplicationBehavior(application);
model.root = ("linux" == system.platform) ? "file:///" : Files.picturesDirectory;
//model.root = Files.temporaryDirectory;
//model.root = "/Users/brianfriedkin/Documents/Kinoma Media/";
//model.root = "file://c:/"