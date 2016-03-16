//@program
/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
      
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
THEME = require("themes/sample/theme");
let SCROLLER = require("mobile/scroller");

/* ASSETS */

let backgroundSkin = new Skin({ fill:'black' });
let maskSkin = new Skin({ fill:'#7f000000' });
let whiteFrameSkin = new Skin({ stroke:'white', borders: { left:1, right:1, top:1, bottom:1 } });

let authorStyle = new Style({ font:'bold 16px', color:'white', horizontal:'left', vertical:'top', left:5, right:5, lines:1 });
let noItemsStyle = new Style({ font:'bold 28px', color:'white', horizontal:'center', vertical:'middle' });
let titleStyle = new Style({ font:'14px', color:'white', horizontal:'left', vertical:'top', left:5, right:5, lines:1 });

/* HANDLERS */

Handler.bind("/flickr/top100", Behavior({
	onComplete(handler, message, text) {
		if (text) {
			var json = JSON.parse(text.replace(/\\'/g, "'"));
			if (json.items && json.items.length) {
				let items = json.items;
				let result = { success:true, items:new Array(items.length) };
				for ( let i = 0, c = items.length; i < c; ++i ) {
					let item = items[i];
					let uri = item.media.m;
					let match = item.author.match( /\(([^)]+)\)/ );
					let author = ( match && match[ 1 ] ) ? match[ 1 ] : "";
					let title = item.title;
					result.items[i] = { uri:uri, title:title, author:author };
				}
				handler.message.responseText = JSON.stringify(result);
			}
			else {
				handler.message.responseText = JSON.stringify({ success:false });
			}
		}
		else {
			handler.message.responseText = JSON.stringify({ success:false });
		}
	},
	onInvoke(handler, message) {
		let uri = "https://api.flickr.com/services/feeds/groups_pool.gne?" + serializeQuery({ id:'80641914@N00', format:'json', nojsoncallback:1 });
		handler.invoke(new Message(uri), Message.TEXT);
	}
}));

/* TEMPLATES */

let BusyPicture = Picture.template($ => ({
	url:'./assets/waiting.png',
	Behavior: class extends Behavior {
		onLoaded(picture) {
			picture.origin = { x:picture.width >> 1, y:picture.height >> 1 };
			picture.scale = { x:0.5, y:0.5 };
			picture.start();
		}
		onTimeChanged(picture) {
			let rotation = picture.rotation;
			rotation -= 5;
			if (rotation < 0) rotation = 360;
			picture.rotation = rotation;
		}
	}
}));

let NoItemsLabel = Label.template($ => ({ left:0, right:0, style:noItemsStyle, string:'No Items' }));

let PhotoItem = Container.template($ => ({
	width:application.width>>1, height:application.height>>1,
	contents: [
		Container($, {
			left:5, right:5, top:5, bottom:5, skin:whiteFrameSkin,
			contents: [
				Container($, {
					left:5, right:5, top:5, bottom:5,
					contents:[
						Thumbnail($, { left:0, right:0, top:0, bottom:0, url:$.uri, aspect:'fill' }),
						Text($, {
							left:0, right:0, bottom:0, skin:maskSkin,
							blocks: [
								{ style:authorStyle, string:$.author },
								{ style:titleStyle, string:$.title },
							]
						})
					]
				})
			]
		})
	]
}));

let PhotosContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	contents: [
		SCROLLER.HorizontalScroller($, {
			loop:true,
			Behavior: class extends Behavior {
				onDisplaying(scroller) {
					scroller.interval = 5;
					scroller.start();
				}
				onTimeChanged(scroller) {
					scroller.scrollBy(1, 0);
				}
			},
			contents: [
				Line($, {
					left:0, top:0, bottom:0,
					Behavior: class extends Behavior {
						onCreate(line, data) {
							let items = data.items;
							for ( let i = 0, c = items.length; i < c; i++ )
								line.add(new PhotoItem(items[i]));
						}
					}
				})
			]
		})
	]
}));

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	Behavior: class extends Behavior {
		onComplete(container, message, text) {
			let result = JSON.parse(text);
			if (false == result.success || 0 == result.items.length)
				container.replace( container.last, new NoItemsLabel );
			else
				container.replace( container.last, new PhotosContainer({ items: result.items }));
		}
		onDisplaying(container) {
			container.add(new BusyPicture);
			container.invoke(new Message("/flickr/top100"), Message.TEXT);
		}
	}
}));

/* APPLICATION */

application.add(new MainScreen);
