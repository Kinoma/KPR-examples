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
import SCROLLER from 'mobile/scroller';
import MTRANSITION from 'mobile/transition';
import KEYBOARD from 'mobile/keyboard';
import MODEL from 'mobile/model';
import SCREEN from 'mobile/screen';
import TOOL from 'mobile/tool';

/* Skins, styles, and textures */
let applicationIconTexture = new Texture('icon.png', 1);
let applicationIconSkin = new Skin({ texture: applicationIconTexture, width: 80, height: 80, aspect: 'fit' });
let blackSkin = new Skin({ fill: 'black' });
let serviceURL = "https://api.flickr.com/services/feeds/photos_public.gne?";

/* Handlers */
class SearchHandlerBehavior extends MODEL.CommandBehavior {
	onQuery(handler, query) {
		let context = this.context.get();
		let data = context.data;
		let list = data.LIST;
		data.what = query.what;
		list.behavior.reload( list );
	}
}
Handler.bind("/searchPhotos", new SearchHandlerBehavior({}));

class PhotoHandlerBehavior extends MODEL.ScreenBehavior {
	onDescribe(query, selection) {
		return {
			Screen: PhotoScreen,
			CloseTransition: ZoomOutTransition,
			OpenTransition: ZoomInTransition,
			pictureURL: selection.media.m.replace( "_m.jpg", "_b.jpg" ),
			thumbnailURL: selection.media.m,
			title: selection.title,
		};
	}	
}
Handler.bind("/photo", new PhotoHandlerBehavior({}));

class MainHandlerBehavior extends MODEL.ScreenBehavior {
	hasSelection(data, delta) {
		let selection = data.selection + delta;
		return ( 0 <= selection ) && ( selection < data.items.length );
	}
	getSelection(data, delta) {
		data.selection += delta;
		return data.items[ data.selection ];
	}
	onDescribe(query, selection) {
		return {
			Screen: MainScreen,
			action: "/searchPhotos?what=",
			items: null,
			more: false,
			scroll: {
				x: 0,
				y: 0
			},
			selection: -1,
			what: "",
			applicationIconSkin
		};
	}	
}
Handler.bind("/main", new MainHandlerBehavior({}));

/* UI templates */
let displayHeaderFooter = true;
let thumbnailWidth = 100;
let thumbnailHeight = 100;

class MainScreenListBehavior extends SCREEN.ListBehavior {
	addLines(list, items, more) {
		var c = Math.floor( application.width / thumbnailWidth );
		var width = Math.floor( application.width / c );
		if ( width & 1 ) width--;
		var c = items.length;
		for ( var i = 0; i < c; i++ ) {
			var photo = items[ i ];
			photo.width = width;
			var height = width;
			if ( height & 1 ) height--;
			photo.height = height;
			photo.action = "/photo";
			list.add( new MainCell( photo ) );
		}
		if (more)
			this.addMoreLine(list);
		list.adjust();
	}
	createMessage(list, data) {
		var tags = data.what.split( /[ ,]+/ ).join( ',' );
		var url = serviceURL + serializeQuery({
			format: "json",
			nojsoncallback: 1,
			tags: tags
		});
		let message = new Message( url );
		return message;
	}
	getItems(list, message, text) {
		if (text) {
			var json = JSON.parse(text.replace(/\\'/g, "'"));
			return ("items" in json ? json.items : null);
		}
	}
	load(list, more) {
		if ( this.data.what ) {
			KEYBOARD.hide();
			this.addBusyLine(list);
			list.invoke(this.createMessage(list, this.data), "TEXT");
			list.adjust();
		}
	}
	onFocused(container) {
		KEYBOARD.hide();
	}
	onMeasureHorizontally(container) {
		var total = application.width;	
		var c = Math.floor( total / thumbnailWidth );
		var width = Math.floor( total / c );
		if ( width & 1 ) width--;
		var dx = ( application.width - ( c * width ) ) >> 1;
		var coordinates = { left:0, width: width, top:0, height: 0 };
		var xs = new Array( c );
		var ys = new Array( c );
		for ( var i = 0; i < c; i++ ) {
			xs[ i ] = dx + ( i * width );
			ys[ i ] = dx;
		}
		var content = container.first;
		var items = this.data.items;
		if ( items ) {
			var index = 0;
			var count = items.length;
			while ( content && ( index < count ) ) {
				var photo = items[ index ];
				var min = 0x7FFFFFFF;
				var j = 0;
				for ( var i = 0; i < c; i++ ) {
					var y = ys[ i ];
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
		var max = 0;
		for ( var i = 0; i < c; i++ ) {
			var y = ys[ i ];
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
	onScreenBegan(container, backwards, delta) {
		if (!backwards)
			this.data.FIELD.focus();
	}
	onTouchBegan(container) {
		displayHeaderFooter = false;
		container.focus();
	}	
}

let MainScreen = SCREEN.EmptyScreen.template($ => ({ 
	skin: blackSkin, 
	contents: [
		SCREEN.EmptyBody($, { anchor: 'BODY', contents: [
			SCROLLER.VerticalScroller($, { 
				contents: [
					Layout($, { 
						left: 0, right: 0, top: 0, active: true, backgroundTouch: true, anchor: 'LIST', 
						Behavior: MainScreenListBehavior, 
					}),
					SCROLLER.VerticalScrollbar($, { }),
					SCROLLER.TopScrollerShadow($, { }),
					SCROLLER.BottomScrollerShadow($, { }),
				]
			}),
		], }),
		SCREEN.SearchHeader($, { anchor: 'HEADER', }),
	], 
}));

let MainCell = Container.template($ => ({ 
	left: 0, width: $.width, top: 0, height: $.height, active: true, 
	Behavior: class extends SCREEN.ListItemBehavior {
		changeState(container, data) {}
	},
	contents: [ Thumbnail($, { left: 2, right: 2, top: 2, bottom: 2, url: $.media.m, }) ] 
}));

var PhotoScreen = SCREEN.EmptyScreen.template($ => ({ 
	contents: [
		Container($, { 
			left: 0, right: 0, top: 0, bottom: 0, active: true, anchor: 'BODY', 
			Behavior: class extends Behavior {
				onDisplaying(container) {
					container.focus();
				}
				onScreenBegan(container, backwards, delta) {
					if (!delta) {
						var header = container.next;
						var footer = header.next;
						displayHeaderFooter = true;
						application.run( new MTRANSITION.HeaderFooterShowHideTransition, header, footer, displayHeaderFooter );
					}
				}
				onTouchBegan(container, id, x, y, ticks) {
					if ( container == container.hit( x, y ) ) {
						container.captureTouch( id, x, y, ticks );
						this.anchor = x;
					}
				}
				onTouchEnded(container, id, x, y, ticks) {
					if ( x > this.anchor ) {
						if (application.behavior.canGoBy( -1 ))
							application.behavior.doGoBy( -1 );
					}
					else if (x < this.anchor) {
						if (application.behavior.canGoBy( 1 ))
							application.behavior.doGoBy( 1 );
					}
					else {
						var header = container.next;
						var footer = header.next;
						displayHeaderFooter = !displayHeaderFooter;
						application.run( new MTRANSITION.HeaderFooterShowHideTransition, header, footer, displayHeaderFooter );
					}
				}
				onTouchMoved(container, id, x, y, ticks) {
					if ( Math.abs( x - this.anchor ) > 8 ) {
						container.captureTouch( id, x, y, ticks );
					}
				}
			}, 
			contents: [
				Picture($, { left: 0, right: 0, top: 0, bottom: 0, url: $.thumbnailURL, }),
				Content($, { skin: THEME.busySkin, Behavior: CONTROL.BusyBehavior }),
				Picture($, { 
					left: 0, right: 0, top: 0, bottom: 0, url: $.pictureURL,
					Behavior: class extends Behavior {
						onLoaded(picture) {
							var container = picture.container;
							container.remove( container.first );
							container.remove( container.first );
						}
					}
				}),
			], 
		}),
		SCREEN.PlainHeader($, { active: displayHeaderFooter, visible: displayHeaderFooter, anchor: 'HEADER', }),
		SCREEN.EmptyFooter($, { active: displayHeaderFooter, visible: displayHeaderFooter, anchor: 'FOOTER', contents: [
			Line($, { top: 0, bottom: 0, contents: [
				TOOL.PreviousButton($, { }),
				TOOL.NextButton($, { }),
			], }),
		], }),
	], 
}));

/* Transitions */
class ZoomTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
	prepare(container, list, revealIt) {
		var data = list.behavior.data;
		var cell = list.content( data.selection );
		var layer = this.layer = new Layer;
		if ( revealIt ) {
			var bounds = {
				x: cell.x - list.x,
				y: cell.y - list.y,
				width: cell.width,
				height: cell.height,
			}
			list.container.reveal( bounds );
			list.container.adjust();
		}
		layer.capture( cell );
		container.add( layer );
		layer.position = cell.position;
		var containerWidth = container.width;
		var containerHeight = container.height;
		var srcWidth = cell.width;
		var srcHeight = cell.height;
		var dstWidth = container.width;
		var dstHeight = Math.round( srcHeight * containerWidth / srcWidth );
		if ( dstHeight > containerHeight ) {
			dstHeight = containerHeight;
			dstWidth = Math.round( srcWidth * containerHeight / srcHeight );
		}
		this.scale = { 
			x: ( dstWidth / srcWidth ) - 1, 
			y: ( dstHeight / srcHeight ) - 1
		}; 
		this.translation = { 
			x: ( ( containerWidth - dstWidth ) >> 1 ) - ( layer.x - container.x ), 
			y: ( ( containerHeight - dstHeight ) >> 1 ) - ( layer.y - container.y ), 
		};
	}
	transform(layer, fraction) {
		layer.scale = { x: 1 + ( this.scale.x * fraction ), y: 1 + ( this.scale.y * fraction ) };
		layer.translation = { x: this.translation.x * fraction, y: this.translation.y * fraction };
	}
};

class ZoomInTransition extends ZoomTransition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
	onBegin(container, former, current, formerData, currentData) {
		this.prepare( container, formerData.LIST );
	}
	onEnd(container, former, current) {
		container.remove( this.layer );
		container.replace( former, current );
	}
	onStep(fraction) {
		this.transform( this.layer, Math.quadEaseOut( fraction ) );
	}
};

class ZoomOutTransition extends ZoomTransition {
	constructor(duration) {
		if (!duration) duration = 0;
		super(duration);
	}
	onBegin(container, former, current, formerData, currentData) {
		container.replace( former, current );
		container.adjust();
		this.prepare( container, currentData.LIST, true );
	}
	onEnd(container, former, current) {
		container.remove( this.layer );
	}
	onStep(fraction) {
		this.transform( this.layer, Math.quadEaseIn( 1 - fraction ) );
	}
};


/* Application set-up */
let model = application.behavior = new MODEL.ApplicationBehavior( application );
