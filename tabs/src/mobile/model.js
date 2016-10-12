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
import THEME from 'theme';
import KEYBOARD from 'keyboard';

export class HistoryItem {
	constructor(behavior) {
		this.behavior = behavior;
		this.data = behavior.data;
		this.url = behavior.url;
	}
}

export class ApplicationBehavior extends Behavior {
	canGoBack() {
		return this.history.length ? true : false;
	}
	canGoBy(delta) {
		var c = this.history.length;
		if (!c) return false;
		var item = this.history[c - 1];
		return item.behavior.hasSelection(item.data, delta);
	}
	changed(hint) {
		application.distribute(this._onChanged, hint);
	}
	closeDialog() {
		KEYBOARD.hide();
		application.run(new THEME.DialogCloseTransition, this.dialog);
		this.dialog = null;
	}
	deleteAnchors(data) {
		var prototype = Content.prototype;
		for (var i in data) {
			var property = data[i];
			if (prototype.isPrototypeOf(property)) {
//							trace("delete anchor " + i + "\n");
				delete data[i];
			}
			else if (Array.prototype.isPrototypeOf(property))
				property.forEach(this.deleteAnchors, this);
			else if (Object.prototype.isPrototypeOf(property))
				this.deleteAnchors(property);
		}
	}
	display(currentScreen) {
		if (!currentScreen)
			debugger
		var container = this.getScreenContainer();
		var current = this.current;
		var currentData = current.data;
		var formerScreen = this.getScreenContent();
		if (formerScreen) {
			var formerData = this.former;
			application.distribute(this._onScreenEnding, this.backwards, this.delta);
			//formerScreen.behavior = null;
			currentScreen.behavior = current;
			current.onCreate(currentScreen, currentData);
			var transition = this.getScreenTransition(formerData, currentData);
			this.displaying = true;
			container.run(transition, formerScreen, currentScreen, formerData, currentData);
		}
		else {
			currentScreen.behavior = current;
			current.onCreate(currentScreen, currentData);
			container.add(currentScreen);
			application.distribute(this._onScreenBegan, this.backwards, this.delta);
		}
	}
	doGoBack() {
		var item = this.history.pop();
		this.backwards = true;
		this.delta = 0;
		this.unload();
		this.load(item.behavior, item.data, item.url);
	}
	doGoBy(delta) {
		var c = this.history.length;
		var item = this.history[c - 1];
		var selection = item.behavior.getSelection(item.data, delta);
		var url = Message.URI(selection.action); // @@
		var handler = Handler.get(url);
		var behavior = handler.behavior;
		var parts = parseURI(url);
		var query = parseQuery(parts.query);
		var data = behavior.onDescribe(query, selection);
		this.backwards = undefined;
		this.delta = delta;
		this.unload();
		this.load(behavior, data, url);
	}
	doGoHome() {
		if (this.dialog)
			this.closeDialog()
		if (this.history.length) {
			var item = this.history[0];
			this.history = [];
			this.backwards = true;
			this.delta = 0;
			this.unload();
			this.load(item.behavior, item.data, item.url);
		}
	}
	doGoTo(behavior, message) {
		var current = this.current;
		var former = current.data;
		var selection = (current.hasSelection(former, 0)) ? current.getSelection(former, 0) : null;
		var data = behavior.onDescribe(parseQuery(message.query), selection);
		this.history.push(new HistoryItem(current));
		this.backwards = false;
		this.delta = 0;
		this.unload();
		this.load(behavior, data, message.url);
	}
	getScreenContent() {
		return application.first;
	}
	getScreenContainer() {
		return application;
	}
	getScreenTransition(formerData, currentData) {
		var transition;
		if (this.backwards) {
			if ("CloseTransition" in formerData)
				transition = new formerData.CloseTransition;
			else if ("CloseSelectionTransition" in currentData)
				transition = new currentData.CloseSelectionTransition;
			else
				transition = new THEME.ScreenCloseTransition;
		}
		else if (this.delta < 0) {
			if ("PreviousTransition" in currentData)
				transition = new currentData.PreviousTransition;
			else
				transition = new THEME.ScreenPreviousTransition;
		}
		else if (this.delta > 0) {
			if ("NextTransition" in currentData)
				transition = new currentData.NextTransition;
			else
				transition = new THEME.ScreenNextTransition;
		}
		else {
			if ("OpenTransition" in currentData)
				transition = new currentData.OpenTransition;
			else if ("OpenSelectionTransition" in formerData)
				transition = new formerData.OpenSelectionTransition;
			else
				transition = new THEME.ScreenOpenTransition;
		}
		return transition;
	}
	load(behavior, data, url) {
		this.current = behavior;
		behavior.data = data;
		behavior.url = url;
		this.display(new data.Screen(data));
		trace("### loaded " + url + "\n");
	}
	onAdapt() {
		//var size = application.size;
		//trace("### onAdapt " + size.width + " " + size.height + "\n");
		//application.distribute(this._onScreenRotated);
	}
	onCreate(application, data) {
		application.active = true;
		application.focus();
		this.data = data || {};
		this.backwards = ("backwards" in this.data) ? this.data.backwards : undefined;
		this.current = ("current" in this.data) ? this.data.current : null;
		this.delta = ("delta" in this.data) ? this.data.delta : undefined;
		this.dialog = ("dialog" in this.data) ? this.data.dialog : null;
		this.displaying = ("displaying" in this.data) ? this.data.displaying : false;
		this.former = ("former" in this.data) ? this.data.former : null;
		this.history = ("history" in this.data) ? this.data.history : [];
		this._onChanged = "onChanged";
		this._onScreenBegan = "onScreenBegan";
		this._onScreenEnding= "onScreenEnding";
		this._onScreenRotated = "onScreenRotated";
	}
	onInvoke(application, message) {
		trace(message.url + "\n");
		if (message.name == "back")
			this.doGoBack();
		else if (message.name == "home")
			this.doGoHome();
	}
	onKeyDown(application, key, modifiers, count, ticks) {
		var code = key.charCodeAt(0);
		if ((code == 8) || (code == 0xF0001)) {
			if (this.canGoBack()) {
				application.invoke(new Message("/back"));
				return true;
			}
			if (system.platform == "android") {
				application.invoke(new Message("/quit"));
				return true;
			}
		}
	}
	onLaunch() {
		var url = Message.URI("/main");
		var handler = Handler.get(url);
		if (handler) {
			var behavior = handler.behavior;
			var parts = parseURI(url);
			var query = parseQuery(parts.query);
			var data = behavior.onDescribe(query);
			this.backwards = undefined;
			this.delta = 0;
			this.load(behavior, data, url);
		}
	}
	onQuit() {
		var current = this.current;
		if (current) {
			this.backwards = undefined;
			this.delta = 0;
			this.unload(current);
		}
		var former = this.former;
		if (former) {
			this.deleteAnchors(former);
			this.former = null;
		}
		application.shared = false;
	}
	onTransitionEnded(application) {
		var former = this.former;
		if (former) {
			this.deleteAnchors(former);
			this.former = null;
			application.purge();
		}
		if (this.displaying) {
			this.displaying = false;
			application.distribute(this._onScreenBegan, this.backwards, this.delta);
		}
	}
	openDialog(dialog) {
		if (this.dialog)
			this.closeDialog()
		this.dialog = dialog;
		application.run(new THEME.DialogOpenTransition, dialog);
	}
	readPreferences(application, name, preferences) {
		try {
			var url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			if (Files.exists(url))
				return JSON.parse(Files.readText(url));
		}
		catch(e) {
		}
		return preferences;
	}
	unload() {
		var current = this.current;
		if (!current.url)
			debugger
		this.former = current.data;
		trace("### unloading " + current.url + "\n");
		current.data = null;
		current.url = null;
		this.current = null;
	}
	writePreferences(application, name, preferences) {
		try {
			var url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			Files.writeText(url, JSON.stringify(preferences));
		}
		catch(e) {
		}
	}
	deletePreferences(application, name) {
		try {
			var url = mergeURI(Files.preferencesDirectory, application.di + "." + name + ".json");
			Files.deleteFile(url);
		}
		catch(e) {
		}
	}
	deleteAllPreferences(di) {
		try {
			var directory = Files.preferencesDirectory;
			var info, iterator = new Files.Iterator(directory);
			var toDelete = [];
			while (info = iterator.getNext()) {
				if ("file" == info.type && 0 == info.path.indexOf(di))
					toDelete.push(directory + info.path);
			}
			for (var i = 0, c = toDelete.length; i < c; ++i)
				Files.deleteFile(toDelete[i]);
		}
		catch(e) {
		}
	}
}

export class CommandBehavior extends Behavior {
	onCreate(handler) {
		this.context = { 
			get: function() { return application.behavior.current; } 
		}
	}
	onComplete(handler, message, result) {
		var query = parseQuery(handler.message.query);
		var status = message.status;
		if ((200 <= status) && (status < 300)) {
			this.onResponse(handler, query, message, result);
		}
		else {
			this.onError(handler, query, message, result);
		}
	}
	onError(handler, query, message, result) {}
	onInvoke(handler, message) {
		this.onQuery(handler, parseQuery(message.query));
	}
	onQuery(handler, query) {}
	onResponse(handler, query, message, result) {}
}

export class DialogBehavior extends CommandBehavior {
	constructor() {
		super();
	}
	canOK(dialog) {
		return true;
	}
	onCancel(dialog) {}
	onDescribe(query) {
		debugger
	}
	onQuery(handler, query) {
		var data = this.onDescribe(query);
		data.query = query;
		var dialog = new data.Dialog(data);
		delete data.query;
		dialog.behavior = this;
		this.data = data;
		application.behavior.openDialog(dialog);
	}
	onOK(dialog, query) {
		var layout = dialog.first;
		application.invoke(new Message(layout.behavior.data.action + "?" + serializeQuery(query)));
	}
	onTouchBegan(dialog, id, x, y, ticks) {
		var layout = dialog.first;
		layout.behavior.onCancelBegan(layout);
	}
	onTouchEnded(dialog, id, x, y, ticks) {
		var layout = dialog.first;
		layout.behavior.onCancelEnded(layout);
	}
}

export class ScreenBehavior extends Behavior {
	getSelection(data, delta) {}
	hasSelection(data, delta) {
		return false;
	}
	onDescribe(query, selection) {
		debugger
	}
	onInvoke(handler, message) {
		application.behavior.doGoTo(this, message);
	}
}

export var QuitAlert = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, 
	contents: [
		Label($, { 
			skin: THEME.dialogBoxSkin, style: THEME.dialogCommentStyle, 
			Behavior: class extends Behavior {
				onCancelBegan(label) {}
				onCancelEnded(label) {
					application.behavior.closeDialog(label.container);
				}
				onDisplaying(label) {
					this.former = label.focus();
				}
				onKeyDown(label, key, repeat, ticks) {
					var code = key.charCodeAt(0);
					if ((code == 8) || (code == 0xF0001)) {
						label.invoke(new Message("xkpr://shell/quit"));
					}
					return true;
				}
				onUndisplayed(label) {
					if (this.former)
						this.former.focus();
				}
			}, 
			string: 'Press back once more to exit.' }),
	]
}));

class QuitHandlerBehavior extends DialogBehavior{
	onDescribe(query) {
		return { Dialog: QuitAlert };
	}
}
Handler.bind("/quit", new QuitHandlerBehavior);

export default {
	HistoryItem, ApplicationBehavior, CommandBehavior, DialogBehavior, ScreenBehavior, QuitAlert
}