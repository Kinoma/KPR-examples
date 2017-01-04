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
import MODEL from 'mobile/model';
import SCREEN from 'mobile/screen';
import SCROLLER from 'mobile/scroller';
import CONTROL from 'mobile/control';

import BALLS from './balls';

/* Skins, styles, and textures */
let whiteSkin = new Skin({ fill: 'white' });
let separatorSkin = new Skin({ fill: 'silver' });

let tabTexture = new Texture('assets/tabs.png', 1);
let tabSkin = new CONTROL.DynamicSkin(tabTexture, THEME.tabDisabledEffect, THEME.tabEnabledEffect, THEME.tabSelectedEffect);

let ballsTexture = new Texture('./assets/balls.png', 1);
let ballsSkin = new Skin({ texture: ballsTexture, width: 30, height: 30, variants: 30 });

let itemNameStyle = new Style({  font: 'bold', lines: 1 });
let headerTitleStyle = new Style({  font: 'bold 24px', horizontal: 'center', vertical: 'middle', lines: 1 });

/* Handlers */
class MainHandlerBehavior extends MODEL.ScreenBehavior {
	hasSelection(data, delta) {
		let tab = data.tabs[data.selection];
		let selection = tab.selection + delta;
		return (0 <= selection) && (selection < tab.items.length)
	}
	getSelection(data, delta) {
		let tab = data.tabs[data.selection];
		let selection = tab.selection + delta;
		return tab.items[selection];
	}
	onDescribe(query, selection) {
		return {
			Screen: MainScreen,
			selection: 0,
			skin: tabSkin,
			tabs: [
				{
					Header: Header,
					Pane: ListPane,
					items: [
						{name: "Brian", variant: 0},
						{name: "Debbie", variant: 1},
						{name: "Colin", variant: 2},
						{name: "Kaitlyn", variant: 3},
					],
					more: false,
					scroll: {x: 0, y:0},
					selection: -1,
					variant: 2,
					title: "List",
				},
				{
					Header: Header,
					Pane: GridPane,
					items: null,
					more: false,
					scroll: {x: 0, y:0},
					selection: -1,
					variant: 0,
					title: "Grid",
				},
				{
					Header: Header,
					Pane: BallsPane,
					scroll: {x: 0, y:0},
					selection: -1,
					variant: 1,
					title: "Balls",
				},
			],
		};
	}
}
Handler.bind("/main", new MainHandlerBehavior());

/* UI templates */
let Header = SCREEN.EmptyHeader.template($ => ({ 
	contents: [
		Label($, { left: 0, right: 0, top: 0, bottom: 0, style: headerTitleStyle, anchor: 'TITLE', string: $.title }),
	], 
}));

let Body = SCREEN.EmptyBody.template($ => ({ skin: whiteSkin }));

let ListItemLine = Line.template($ => ({ 
	left: 0, right: 0, active: true, skin: THEME.lineSkin, 
	Behavior: class extends SCREEN.ListItemBehavior {
		onTouchEnded(line, id, x, y, ticks) {
			this.onTouchCancelled(line, id, x, y, ticks);
		}
	}, 
	contents: [
		Column($, { left: 0, right: 0, 
			contents: [
				Line($, { left: 0, right: 0, height: 1, skin: separatorSkin, }),
				Line($, { left: 2, right: 2, height: 52, 
					contents: [
						Content($, { width: 40, height: 40, skin: ballsSkin, variant: $.variant }),
						Text($, { left: 4, right: 0, blocks: [ { style: itemNameStyle, string: $.name, } ] }),
					]
				}),
			]
		}),
	], 
}));

let ListPane = Body.template($ => ({ 
	contents: [
		SCROLLER.VerticalScroller($, { 
			contents: [
				Column($, { 
					left: 0, right: 0, top: 0, anchor: 'LIST', 
					Behavior: class extends SCREEN.ListBehavior {
						addItemLine(list, item) {
							list.add(new ListItemLine(item));
						}
					}, 
				}),
				SCROLLER.VerticalScrollbar($, { }),
				SCROLLER.TopScrollerShadow($, { }),
				SCROLLER.BottomScrollerShadow($, { }),
			], 
		}),
	], 
}));

let PhotoCell = Container.template($ => ({ 
	left: 0, width: $.width, top: 0, height: $.height, active: true, 
	contents: [ Thumbnail($, { left: 2, right: 2, top: 2, bottom: 2, url: $.media.m }) ] 
}));

let thumbnailWidth = 100;
let thumbnailHeight = 100;

class GridPaneBehavior extends SCREEN.ListBehavior {
	addLines(list, items, more) {
		let c = Math.floor( application.width / thumbnailWidth );
		let width = Math.floor( application.width / c );
		if ( width & 1 ) width--;
		c = items.length;
		for ( let i = 0; i < c; i++ ) {
			let photo = items[ i ];
			photo.width = width;
			let height = width;
			if ( height & 1 ) height--;
			photo.height = height;
			list.add( new PhotoCell( photo ) );
		}
		list.adjust();
	}
	createMessage(list, data) {
		let url = "http://api.flickr.com/services/feeds/groups_pool.gne?" + serializeQuery( { id: "80641914@N00", format: "json", nojsoncallback: 1 } );
		return new Message( url );
	}
	load(list, more) {
		this.addBusyLine(list);
		list.invoke(this.createMessage(list, this.data), "TEXT");
		return false
	}
	getItems(list, message, result) {
		result = result.replace(/\\/g, ""); //Remove all backslashes
		result = result.replace(/\<.+\>/g, ""); // Remove all html tags, i.e. <p>, <a href="...">
		result = JSON.parse(result);
		return ( result && ( "items" in result ) ) ? result.items : null;
	}
	onMeasureHorizontally(container) {
		let total = application.width;
		
		let c = Math.floor( total / thumbnailWidth );
		let width = Math.floor( total / c );
		if ( width & 1 ) width--;
		let dx = ( application.width - ( c * width ) ) >> 1;
		let coordinates = { left:0, width: width, top:0, height: 0 };
		let xs = new Array( c );
		let ys = new Array( c );
		for ( let i = 0; i < c; i++ ) {
			xs[ i ] = dx + ( i * width );
			ys[ i ] = dx;
		}
		let content = container.first;
		let items = this.data.items;
		if ( items ) {
			let index = 0;
			let count = items.length;
			while ( content && ( index < count ) ) {
				let photo = items[ index ];
				let min = 0x7FFFFFFF;
				let j = 0;
				for ( let i = 0; i < c; i++ ) {
					let y = ys[ i ];
					if ( y < min ) {
						min = y;
						j = i;
					}
				}
				coordinates.left = xs[ j ];
				coordinates.top = min;
				coordinates.height = thumbnailHeight;
				if ( coordinates.height & 1 ) coordinates.height--;
				content.coordinates = coordinates;
				ys[ j ] = min + coordinates.height;
				content = content.next;
				index++;
			}
		}
		let max = 0;
		for ( let i = 0; i < c; i++ ) {
			let y = ys[ i ];
			if ( y > max )
				max = y;
		}
		if ( content ) {
			coordinates.left = 0;
			coordinates.right = 0;
			coordinates.top = max;
			coordinates.height = 50;
			content.coordinates = coordinates;
			max += coordinates.height;
		}
		this.max = max;
		return total;
	}
	onMeasureVertically(container) {
		return this.max;
	}
}
let GridPane = Body.template($ => ({ 
	contents: [
		SCROLLER.VerticalScroller($, { 
			contents: [
				Layout($, { left: 0, right: 0, top: 0, active: true, anchor: 'LIST', Behavior: GridPaneBehavior }),
				SCROLLER.VerticalScrollbar($, { }),
				SCROLLER.TopScrollerShadow($, { }),
				SCROLLER.BottomScrollerShadow($, { }),
			], 
		}),
	], 
}));


let BallsPane = Body.template($ => ({ 
	Behavior: class extends Behavior {
		onCreate(container, data) {
			BALLS.build(container);
		}
	}
}));

let MainScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [
		$.tabs[$.selection].Pane($.tabs[$.selection], { anchor: 'BODY' }),
		SCREEN.TabFooter($, { anchor: 'FOOTER' }),
		$.tabs[$.selection].Header($.tabs[$.selection], { anchor: 'HEADER' }),
	], 
}));

/* Application set-up */
let model = application.behavior = new MODEL.ApplicationBehavior(application);
