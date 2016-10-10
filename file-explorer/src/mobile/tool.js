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
import DIALOG from 'dialog';

export class BackBehavior extends CONTROL.ButtonBehavior {
	onTap(container) {
		container.invoke(new Message("/back"));
	}
}

export var BackButton = Container.template($ => ({ 
	width: 50, top: 0, bottom: 0, active: application.behavior.canGoBack(), skin: THEME.backButtonSkin, 
	Behavior: BackBehavior, 
	contents: [
		Content($, { left: 10, width: 40, height: 40, skin: $.applicationIconSkin }),
	]	
}));

export var HeaderTitle = Scroller.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.headerTitleSkin, clip: true, loop: true,
	Behavior: CONTROL.HorizontalTickerBehavior, 
	contents: [
		Label($, { top: 0, bottom: 0, anchor: 'TITLE', string: $.title, }),
	]
}));

export class MenuButtonBehavior extends CONTROL.ButtonBehavior {
	changeState(container, state) {
		super.changeState(container.first, state);
	}
	onCreate(button, data) {
		super.onCreate(button, data);
		button.first.last.string = data.items[data.selection].title
	}
	onTap(button) {
		this.data.button = button;
		application.run(new THEME.MenuOpenTransition, new DIALOG.Menu(this.data), button);
	}
}

export var MenuButton = Container.template($ => ({ 
	active: true, skin: THEME.menuButtonSkin, style: THEME.menuButtonStyle, 
	Behavior: MenuButtonBehavior, 
	contents: [
		Line($, { 
			top: 0, bottom: 0, 
			contents: [
				Content($, { width: 30, height: 30, skin: THEME.menuArrowSkin, }),
				Label($, { top: 0, bottom: 0, }),
			]
		}),
	]
}));

export var NextButton = Container.template($ => ({ 
	width: THEME.screenFooterHeight, height: THEME.screenFooterHeight, active: application.behavior.canGoBy(1), exclusiveTouch: true, 
	Behavior: class extends CONTROL.ButtonBehavior {
		onTap(container) {
			application.behavior.doGoBy(1);
		}
	}, 
	contents: [
		Content($, { skin: THEME.toolSkin, variant: THEME.NEXT, }),
	]
}));

export var PreviousButton = Container.template($ => ({ 
	width: THEME.screenFooterHeight, height: THEME.screenFooterHeight, active: application.behavior.canGoBy(-1), exclusiveTouch: true, 
	Behavior: class extends CONTROL.ButtonBehavior {
		onTap(container) {
			application.behavior.doGoBy(-1);
		}
	}, 
	contents: [
		Content($, { skin: THEME.toolSkin, variant: THEME.PREVIOUS }),
	]
}));

export var PreviousMediaButton = Container.template($ => ({ 
	width: THEME.screenFooterHeight, height: THEME.screenFooterHeight, active: true, exclusiveTouch: true, 
	Behavior: class extends CONTROL.ButtonBehavior {
		onTap(container) {
			var media = this.data.MEDIA;
			if ((media.time < 3000) && application.behavior.canGoBy(-1)) application.behavior.doGoBy(-1);
			else media.time = 0;
		}
	}, 
	contents: [
		Content($, { skin: THEME.toolSkin, variant: THEME.PREVIOUS }),
	]
}));

export class SearchBehavior extends CONTROL.ButtonBehavior {
	onTap(container) {
		container.invoke(new Message("/search"));
	}
}

export var SearchButton = Container.template($ => ({ 
	width: 50, top: 0, bottom: 0, active: true, skin: THEME.toolButtonSkin, 
	Behavior: SearchBehavior, 
	contents: [
		Content($, { skin: THEME.toolSkin, variant: THEME.SEARCH }),
	]
}));

export var ToolButton = Container.template($ => ({ 
	width: 50, right: 0, top: 0, bottom: 0, active: true, skin: THEME.toolButtonSkin, 
	Behavior: CONTROL.ButtonBehavior, 
	contents: [
		Content($, { skin: $.skin, variant: $.variant, anchor: 'TOOL', }),
	]
}));

export default {
	BackBehavior, BackButton, HeaderTitle, MenuButtonBehavior, MenuButton, NextButton, PreviousButton, PreviousMediaButton, SearchBehavior, SearchButton, ToolButton
}


