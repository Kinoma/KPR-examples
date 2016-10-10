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
import CONTROL from 'control';
import SCROLLER from 'scroller';
import TOOL from 'tool';

export var EmptyScreen = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, }));

export var TabScreen = EmptyScreen.template($ => ({ 
	contents: [
		$.tabs[$.selection].Pane($.tabs[$.selection], { anchor: 'BODY' }),
		TabFooter($, { anchor: 'FOOTER' }),
		$.tabs[$.selection].Header($.tabs[$.selection], { anchor: 'HEADER' }),
	], 
}));

export var EmptyBody = Container.template($ => ({ 
	left: 0, right: 0, top: THEME.screenHeaderHeight, bottom: 0, 
	Behavior: class extends Behavior {
		onDisplaying(container) {
			container.focus();
		}
	}, 
}));

export class ListBehavior extends Behavior {
	addBusyLine(list) {
		list.add(new BusyLine);
	}
	addEmptyLine(list) {
		list.add(new EmptyLine);
	}
	addErrorLine(list) {
		list.add(new ErrorLine);
	}
	addItemLine(list, item, index) {
		debugger;
	}
	addLines(list, items, more) {
		var c = items.length;
		if (c) {
			for (var i = 0; i < c; i++)
				this.addItemLine(list, items[i], i);
			if (more)
				this.addMoreLine(list);
		}
		if (!list.length)
			this.addEmptyLine(list);
	}
	addMoreLine(list, more) {
		list.add(new MoreLine(this.data));
	}
	createMessage(list, data) {
		debugger;
	}
	getItems(list, message, result) {
		debugger;
	}
	hasMore(list, message, result) {
	}
	load(list, more) {
		this.addBusyLine(list);
		list.invoke(this.createMessage(list, this.data), "JSON");
	}
	onComplete(list, message, result) {
		var data = this.data;
		list.remove(list.last);
		var items = this.getItems(list, message, result);
		var more = this.hasMore(list, message, result);
		if (items && items.length) {
			if (data.items)
				data.items = data.items.concat(items);
			else
				data.items = items;
			data.more = more;
			this.addLines(list, items, more);
		}
		else {
			if (!data.items) {
				data.items = [];
				this.addLines(list, data.items, false);
			}
		}
	}
	onCreate(list, data) {
		this.data = data;
		if (data.items)
			this.addLines(list, data.items, data.more);
		else
			this.load(list);
	}
	onDelete(list) {
		list.cancel();
	}
	onDisplayed(list) {
		var content = this._selection;
		delete this._selection;
		if (content) {
			content.duration = 400;
			content.time = 0;
			content.start();
		}
	}
	onDisplaying(list) {
		var data = this.data;
		this._selection = null;
		if (data && ("selection" in data)) {
			var index = data.selection;
			if ((0 <= index) && (index < list.length)) {
				var content = list.content(index);
				var behavior = content.behavior;
				if (ListItemBehavior.prototype.isPrototypeOf(behavior)) {
					behavior.changeState(content, 1);
					this._selection = content;
					if ("scroll" in data) {
						var bounds = content.bounds;
						bounds.y -= list.y;
						list.container.reveal(bounds);
					}
				}
				data.selection = -1;
			}
		}
	}
	onItemTap(list, item) {
		var data = this.data;
		if (data && ("selection" in data))
			data.selection = item.index;
	}
	onMore(list) {
		list.remove(list.last);
		this.load(list);
		return true;
	}
	reload(list) {
		this.unload(list);
		this.load(list);
	}
	unload(list) {
		list.cancel();
		this.data.items = null;
		list.empty();
	}
}

export class ListItemBehavior extends Behavior {
	changeState(line, state) {
		line.state = state;
	}
	onCreate(line, data) {
		this.data = data;
		this.waiting = false;
	}
	onFinished(line) {
		if (this.waiting) {
			this.waiting = false;
			this.changeState(line, 1);
		}
	}
	onTap(line) {
		var list = line.container;
		list.behavior.onItemTap(list, line);
		var data = this.data;
		if (data && ("action" in data))
			line.invoke(new Message(data.action));
	}
	onTimeChanged(line) {
		if (!this.waiting)
			this.changeState(line, 1 - line.fraction);
	}
	onTouchBegan(line, id, x, y, ticks) {
		this.waiting = true;
		line.duration = 100;
		line.time = 0;
		line.start();
	}
	onTouchCancelled(line, id, x, y, ticks) {
		if (this.waiting) {
			line.stop();
			this.waiting = false;
		}
		else {
			line.duration = 500;
			line.time = 0;
			line.start();
		}
	}
	onTouchEnded(line, id, x, y, ticks) {
		if (this.waiting) {
			line.stop();
			this.waiting = false;
			this.changeState(line, 1);
		}
		line.captureTouch(id, x, y, ticks);
		this.onTap(line);
	}
};

export var BusyLine = Container.template($ => ({ 
	left: 0, right: 0, height: 50, 
	contents: [
		Content($, { skin: THEME.busySkin, Behavior: CONTROL.BusyBehavior }),
	], 
}));

export var EmptyLine = Container.template($ => ({ 
	left: 0, right: 0, height: 50, 
	contents: [
		Container($, { skin: THEME.emptySkin }),
	], 
}));
export var ErrorLine = Container.template($ => ({ 
	left: 0, right: 0, height: 50, 
	contents: [
		Container($, { skin: THEME.errorSkin, contents: [ Label($, { style: THEME.errorStyle, string: $ }) ] }),
	], 
}));

export class MoreBehavior extends CONTROL.ButtonBehavior {
	onTap(button) {
		button.bubble("onMore");
	}
}

export var MoreLine = Container.template($ => ({ 
	left: 0, right: 0, height: 50, 
	contents: [
		Container($, { active: true, skin: THEME.moreSkin, Behavior: MoreBehavior }),
	], 
}));

export var TabLine = Line.template($ => ({ 
	left: 0, right: 0, height: THEME.defaultLineHeight, style: THEME.tabLineStyle, 
	Behavior: class extends CONTROL.TabBarBehavior {
		onCreate(line, data) {
			super.onCreate(line, data);
			line.content(0).skin = THEME.tabLineLeftSkin;
			line.content(line.length - 1).skin = THEME.tabLineRightSkin;
		}
		onTabTap(line, item) {
			super.onTabTap(line, item);
			var data = this.data;
			var list = line.container;
			var tab = data.tabs[data.selection];
			list.run(new THEME.TabListSwapTransition, list.last, new tab.Pane(tab));
		}
	}, 
	contents: [
		($.tabs) ? $.tabs.map(function($) { var $$ = this; return [
			Container($, { left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.tabLineMiddleSkin, Behavior: CONTROL.TabBehavior, contents: [ Label($, { left: 0, right: 0, top: 0, bottom: 0, string: $.title }) ], }),
		]}, $) : null, 
	], 
}));

export var EmptyFooter = Container.template($ => ({ 
	left: 0, right: 0, height: THEME.screenFooterHeight, bottom: 0, skin: THEME.footerSkin
}));

export var TabFooter = Line.template($ => ({ 
	left: 0, right: 0, height: THEME.screenFooterHeight, bottom: 0, skin: THEME.footerSkin, style: THEME.tabBarStyle, 
	Behavior: class extends CONTROL.TabBarBehavior {
		onCreate(line, data) {
			super.onCreate(line, data);
			line.content(0).skin = THEME.tabBarLeftSkin;
			line.content(line.length - 1).skin = THEME.tabBarRightSkin;
		}
		onTabTap(line, item) {
			super.onTabTap(line, item);
			var data = this.data;
			var screen = line.container;
			var tab = data.tabs[item.index];
			data.BODY = new tab.Pane(tab);
			data.HEADER = new tab.Header(tab);
			screen.run(new THEME.TabScreenSwapTransition, line.previous, data.BODY, line.next, data.HEADER);
		}
	}, 
	contents: [
		($.tabs) ? $.tabs.map(function($) { var $$ = this; return [
			Container($, { left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.tabBarMiddleSkin, Behavior: CONTROL.TabBehavior, contents: [
				Content($, { width: 40, top: 0, height: 40, skin: $$.skin, variant: $.variant, }),
				Label($, { width: 100, bottom: 0, string: $.title, }),
			], }),
		]}, $) : null, 
	], 
}));


export var EmptyHeader = Line.template($ => ({ 
	left: 0, right: 0, top: 0, height: THEME.screenHeaderHeight, skin: THEME.headerSkin, style: THEME.headerStyle
}));

export var PlainHeader = EmptyHeader.template($ => ({ 
	contents: [
		TOOL.BackButton($, { }),
		TOOL.HeaderTitle($, { style: THEME.plainHeaderTitleStyle, }),
	], 
}));

export var SearchHeader = EmptyHeader.template($ => ({ 
	contents: [
		TOOL.BackButton($, { }),
		Container($, { 
			left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.searchTitleSkin, 
			Behavior: class extends Behavior {
				onKeyDown(container, key, repeat, ticks) {
					var code = key.charCodeAt(0);
					if (code == 13) {
						container.next.delegate("onTouchBegan");
						return true;
					}
				}
				onKeyUp(container, key, repeat, ticks) {
					var code = key.charCodeAt(0);
					if (code == 13) {
						container.next.delegate("onTouchEnded");
						return true;
					}
				}
			}, 
			contents: [
				Scroller($, { 
					left: 18, right: 40, top: 8, bottom: 8, active: true, clip: true, 
					Behavior: CONTROL.FieldScrollerBehavior, 
					contents: [
						Label($, { 
							left: 0, top: 0, bottom: 0, skin: THEME.fieldLabelSkin, style: THEME.fieldLabelStyle, editable: true, string: $.what, anchor: 'FIELD', 
							Behavior: class extends CONTROL.FieldLabelBehavior {
								onEdited(label) {
									label.container.next.active = label.string.length > 0;
								}
								onUnfocused(label) {
									label.string = this.data.what;
									this.onEdited(label);
								}
							}, 
						}),
					], 
				}),
				Content($, { right: 5, top: 0, bottom: 0, skin: THEME.fieldDeleterSkin, Behavior: CONTROL.FieldDeleterBehavior, }),
			], 
		}),
		Container($, { 
			width: 50, right: 0, top: 0, bottom: 0, active: true, skin: THEME.toolButtonSkin, 
			Behavior: class extends CONTROL.ButtonBehavior {
				onTap(container) {
					var data = this.data;
					data.what = "";
					container.invoke(new Message(data.action + encodeURIComponent(data.FIELD.string)));
				}
			}, 
			contents: [
				Content($, { width: 40, height: 40, skin: THEME.toolSkin, variant: THEME.SEARCH }),
			], 
		}),
	], 
}));

export var ToolHeader = EmptyHeader.template($ => ({ 
	contents: [
		TOOL.BackButton($, { }),
		TOOL.HeaderTitle($, { style: THEME.toolHeaderTitleStyle }),
		TOOL.ToolButton($, { }),
	], 
}));

export default {
	EmptyScreen, TabScreen, EmptyBody, ListBehavior, ListItemBehavior, BusyLine, EmptyLine, ErrorLine, MoreBehavior, MoreLine, TabLine, EmptyFooter, TabFooter, EmptyHeader, PlainHeader, SearchHeader, ToolHeader
}

