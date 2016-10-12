/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
import THEME from 'mobile/theme';import MODEL from 'mobile/model';import SCREEN from 'mobile/screen';import SCROLLER from 'mobile/scroller';import TOOL from 'mobile/tool';

/* Skins, styles, and textures */let applicationIconTexture = new Texture('assets/icon.png', 1);let applicationIconSkin = new Skin({ texture: applicationIconTexture, width: 80, height: 80, aspect: 'fit', });

let blackSkin = new Skin({ fill: 'black' });let whiteSkin = new Skin({ fill: 'white' });let separatorSkin = new Skin({ fill: 'silver' });
let productNameStyle = new Style({  font: 'bold 22px', horizontal: 'left', vertical: 'middle', lines: 1 });let productDescriptionStyle = new Style({  font: '18px', horizontal: 'justify', left: 5, right: 5, top: 5, bottom: 5 });

/* Handlers */
class MainHandlerBehavior extends MODEL.ScreenBehavior {	hasSelection(data, delta) {		let selection = data.selection + delta;		return (0 <= selection) && (selection < data.items.length)	}	getSelection(data, delta) {		data.selection += delta;		return data.items[data.selection];	}	onDescribe(query, selection) {		return {			Screen: MainScreen,			title: "Sushi",			items: null,			more: false,			scroll: {				x: 0,				y: 0			},			selection: -1,		}	}}
Handler.bind("/main", new MainHandlerBehavior);

class DetailsHandlerBehavior extends MODEL.ScreenBehavior {
	hasSelection(data, delta) {		let selection = data.selection + delta;		return (0 <= selection) && (selection < data.items.length)	}	getSelection(data, delta) {		data.selection += delta;		return data.items[data.selection];	}	onDescribe(query, selection) {		return {			Screen: DetailsScreen,			title: selection.product_name_english,			description: selection.product_description_english,			image: selection.image_large_url		}	}
}Handler.bind("/details", new DetailsHandlerBehavior);

/* UI templates */
let SushiLine = Column.template($ => ({
	left: 0, right: 0, active: true, skin: THEME.lineSkin, 
	Behavior: SCREEN.ListItemBehavior, 
	contents: [		Line($, { left: 4, right: 4, height: 52, 
			contents: [				Thumbnail($, { width: 40, height: 40, aspect: 'fit', url: $.image_small_url }),				Label($, { left: 8, right: 0, style: productNameStyle, string: $.product_name_english }),			] 
		}),		Line($, { left: 0, right: 0, height: 1, skin: separatorSkin }),	], 
}));
let Header = SCREEN.EmptyHeader.template($ => ({ 
	skin: blackSkin, 
	contents: [		TOOL.BackButton({ applicationIconSkin }),		TOOL.HeaderTitle($, { style: THEME.plainHeaderTitleStyle, }),	]
}));

class RearrangingBehavior extends Behavior {
	onCreate(layout, data) {		this.data = data;		this.width = -1;	}	onMeasureVertically(container, height) {		if ( this.width != application.width ) {			this.width = application.width;			if ( application.width > application.height ) {				this.data.PICTURE.coordinates = {left:4, top: 4, width:application.width/2 - 8, bottom: 4};				this.data.BORDER.coordinates = {left:application.width/2 - 4, top:4, bottom:4, width:2};				this.data.DESCRIPTION.coordinates = {left:application.width/2, right:0, top:0, bottom:0};			}			else {				this.data.PICTURE.coordinates = {top:4, width:application.width - 8, height:application.height/2 - 8};				this.data.BORDER.coordinates = {left:4, right:4, top:application.height/2 - 4, height:2};				this.data.DESCRIPTION.coordinates = {left:0, right:0, top:application.height/2, bottom:0};			}		}		return height;	}
}
let DetailsScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [		SCREEN.EmptyBody($, { skin: whiteSkin, anchor: 'BODY', 
			contents: [				Layout($, { left: 0, right: 0, top: 0, bottom: 0, behavior: new RearrangingBehavior }),				Container($, { width: application.width - 8, top: 4, height: application.height/2 - 8, anchor: 'PICTURE', 
					contents: [ Picture($, { left: 0, right: 0, top: 0, bottom: 0, aspect: 'fit', url: $.image, }) ]
				}),				Content($, { left: 4, right: 4, top: application.height/2 - 4, height: 2, skin: separatorSkin, anchor: 'BORDER', }),				Container($, { left: 0, right: 0, top: application.height/2, bottom: 0, anchor: 'DESCRIPTION', clip: true, 
					contents: [						SCROLLER.VerticalScroller($, { 
							contents: [								Text($, { left: 0, right: 0, top: 0, style: productDescriptionStyle, string: $.description, }),								SCROLLER.VerticalScrollbar($, { }),								SCROLLER.BottomScrollerShadow($, { }),							]
						}),					], 
				}),			], 
		}),		Header($, { anchor: 'HEADER' }),	], 
}));

class ListItemBehavior extends SCREEN.ListBehavior {
	addItemLine(list, item) {		item.action = "/details";		list.add(new SushiLine(item));	}	createMessage(list, data) {		return new Message("http://www.douzencloud.com/JSON_data/tuna_data.json");	}	getItems(list, message, items) {		if (items) {			items.sort(this.sortNames);			return items;		}	}	sortNames(a, b) {		return a.product_name_english.toLowerCase().compare(b.product_name_english.toLowerCase());	}
}let MainScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [		SCREEN.EmptyBody($, { skin: whiteSkin, anchor: 'BODY', 
			contents: [				SCROLLER.VerticalScroller($, { 
					contents: [						Column($, { left: 0, right: 0, top: 0, anchor: 'LIST', 
							Behavior: ListItemBehavior
						}),						SCROLLER.VerticalScrollbar($, { }),					]
				}),			], 
		}),		Header($, { anchor: 'HEADER' }),	], 
}));

/* Application set-up */let model = application.behavior = new MODEL.ApplicationBehavior(application);