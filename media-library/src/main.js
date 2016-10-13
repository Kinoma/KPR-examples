/*
Copyright 2011-2014 Marvell Semiconductor, Inc.

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

import THEME from 'mobile/theme';
import CONTROL from 'mobile/control';
import MODEL from 'mobile/model';
import SCREEN from 'mobile/screen';
import SCROLLER from 'mobile/scroller';
import TOOL from 'mobile/tool';

let applicationIconTexture = (screenScale == 2) ? new Texture('assets/icon.png', 1) : (screenScale == 1.5) ? new Texture('assets/icon.png', 1) : new Texture('assets/icon.png', 1);
let applicationIconSkin = new Skin({ texture: applicationIconTexture, width: 80, height: 80, aspect: 'fit', });
let blackSkin = new Skin({ fill: 'black',});
let cellSkin = new Skin({ fill: ['transparent', '#acd473'], });
let tabTexture = (screenScale == 2) ? new Texture('assets/tabs.png', 1) : (screenScale == 1.5) ? new Texture('assets/tabs.png', 1) : new Texture('assets/tabs.png', 1);
let tabSkin = new CONTROL.DynamicSkin(tabTexture, THEME.tabDisabledEffect, THEME.tabEnabledEffect, THEME.tabSelectedEffect);
let songTitleStyle = new Style({ color: 'white', font: '24px', horizontal: 'left', vertical: 'middle', });
let songSubtitleStyle = new Style({ color: 'white', font: '18px', horizontal: 'left', vertical: 'middle', });
let unsupportedStyle = new Style({ color: 'white', font: '24px', horizontal: 'center', vertical: 'middle', });

class GridLayoutBehavior extends SCREEN.ListBehavior{
  addLines(list, items, more){
    SCREEN.ListBehavior.prototype.addLines.call(this, list, items, more);
    list.adjust();
  }
  getCellGutter(){
    return 8;
  }
  getCellWidth(){
    return 100;
  }
  getCellHeight(width){
    return width;
  }
  getHeaderHeight(){
    return THEME.screenHeaderHeight;
  }
  onMeasureHorizontally(container, width){
    return width;
  }
  onMeasureVertically(container, height){
    let content = container.first;
    let items = this.data.items;
    if (items && items.length) {
      let total = container.width;
      let c = Math.floor(total / this.getCellWidth());
      let gutter = this.getCellGutter();
      let width = Math.floor((total - ((c - 1) * gutter)) / c);
      if (width & 1) width--;
      let height = this.getCellHeight(width);
      let coordinates = {left:0, width: width, top:0, height: height};
      let xs = new Array(c);
      let ys = new Array(c);
      for (let i = 0; i < c; i++) {
        xs[i] = i * (width + gutter);
        ys[i] = gutter;
      }
      while (content) {
        let min = 0x7FFFFFFF;
        let j = 0;
        for (let i = 0; i < c; i++) {
          let y = ys[i];
          if (y < min) {
            min = y;
            j = i;
          }
        }
        coordinates.left = xs[j];
        coordinates.top = min;
        content.coordinates = coordinates;
        ys[j] = min + coordinates.height + gutter;
        content = content.next;
      }
      height = 0;
      for (let i = 0; i < c; i++) {
        let y = ys[i];
        if (y > height) height = y;
      }
    }
    else if (content) {
      height = application.height - this.getHeaderHeight();
      content.coordinates =  {left:0, right: 0, top:0, bottom: 0};
    }
    return height;
  }
}
class MainBehavior extends MODEL.ScreenBehavior{
	hasSelection(data, delta){
		let tab = data.tabs[data.selection];
		let selection = tab.selection + delta;
		return (0 <= selection) && (selection < tab.items.length)
	}
	getSelection(data, delta){
		let tab = data.tabs[data.selection];
		let selection = tab.selection + delta;
		return tab.items[selection];
	}
	onDescribe(query, selection){
		if (!("win" == system.platform || "linux" == system.platform)) {
			return {
				Screen: MainScreen,
				selection: 0,
				skin: tabSkin,
				tabs: [
					{
  					Header: Header,
  					Pane: PhotosPane,
  					items: null,
  					more: false,
  					scroll: {x: 0, y:0},
  					selection: -1,
  					variant: 2,
  					title: "Photos",
					},
					{
						Header: Header,
						Pane: VideosPane,
						items: null,
						more: false,
						scroll: {x: 0, y:0},
						selection: -1,
						variant: 1,
						title: "Videos",
					},
					{
						Header: Header,
						Pane: SongsPane,
						items: null,
						more: false,
						scroll: {x: 0, y:0},
						selection: -1,
						variant: 0,
						title: "Songs",
					}
				]
			}
		}
		else {
			return {
				Screen: LibraryNotAvailableScreen,
				title: "Unsupported",
				prompt: "The media library is not supported on this platform",
				selection: -1,
				scroll: {x: 0, y:0}
			}
		}
  }
}
Handler.bind("/main", new MainBehavior);

class photoBehavior extends MODEL.ScreenBehavior{
  onDescribe(query, selection) {
		return {
			Screen: PhotoScreen,
			scroll: {x: 0, y:0},
			selection: -1,
			title: selection.title,
			url: selection.url
		}
	}
}
Handler.bind("/photo", new photoBehavior);

class videoBehavior extends MODEL.ScreenBehavior{
	onDescribe(query, selection) {
		return {
			Screen: VideoScreen,
			scroll: {x: 0, y:0},
			selection: -1,
			title: selection.title,
			url: selection.url
		}
	}
}
Handler.bind("/video", new videoBehavior);

class songBehavior extends MODEL.ScreenBehavior{
	onDescribe(query, selection) {
		return {
			Screen: SongScreen,
			scroll: {x: 0, y:0},
			selection: -1,
			album: selection.album,
			artist: selection.artist,
			title: selection.title,
			thumbnail: selection.thumbnail,
			url: selection.url
		}
	}
}
Handler.bind("/song", new songBehavior);

let Header = SCREEN.EmptyHeader.template( $ => ({ skin: blackSkin,
  contents: [
    TOOL.BackButton($, { }),

    TOOL.HeaderTitle($, { style: THEME.plainHeaderTitleStyle })
  ]
}));

let Body = SCREEN.EmptyBody.template( $ => ({ skin: blackSkin }));

let GridLayout = Layout.template( $ => ({ left: 0, right: 0, top: 0 }));

let GridCell = Container.template( $ => ({ active: true, skin: cellSkin,
  Behavior: class extends SCREEN.ListItemBehavior{
    changeState(container, state) {
      container.state = state;
      container.first.opacity = 1 - state / 2;
    }
  }, clip: true,
  contents: [
	   Thumbnail($, { left: 0, right: 0, top: 0, bottom: 0,
       behavior: CONTROL.ThumbnailBehavior,
       url: $.thumbnail
     })
  ]
}));

let PhotosPane = Body.template( $ => ({
  contents: [
    SCROLLER.VerticalScroller($, { clip: true,
      contents: [
        GridLayout($, { anchor: 'LIST',
          behavior: class extends GridLayoutBehavior{
          	addItemLine(list, item) {
          		list.add(new GridCell(item));
          	}
          	createMessage(list, data) {
          		return new Message("xkpr://library/movies?sort=date");
          	}
          	getItems(list, message, json) {
          		let action = "/video";
  						json.forEach(function(item) {
  							item.action = action;
  						});
  						return json;
          	}
          }
        }),
		    SCROLLER.VerticalScrollbar($, { })
      ]
    })
  ]
}));

var VideosPane = Body.template( $ => ({
  contents: [
  	SCROLLER.VerticalScroller($, { clip: true,
      contents: [
    		GridLayout($, { anchor: 'LIST',
          behavior: class extends GridLayoutBehavior{
            addItemLine(list, item){
          		list.add(new GridCell(item));
          	}
          	createMessage(list, data){
          		return new Message("xkpr://library/movies?sort=date");
          	}
          	getItems(list, message, json){
          		var action = "/video";
  						json.forEach(function(item){
  							item.action = action;
  						});
  						return json;
          	}
          }
        }),
    		SCROLLER.VerticalScrollbar($, { })
  	  ]
    })
  ]
}));

let SongCell = Line.template( $ => ({ left: 0, right: 0, height: 50, active: true, skin: cellSkin,
  behavior: Object.create((SCREEN.ListItemBehavior).prototype),
  contents: [
  	Container($, { width: 50, height: 50,
      contents: [
        Thumbnail($, { left: 4, right: 4, top: 4, bottom: 4,
          Behavior: class extends CONTROL.ThumbnailBehavior{
            onLoaded(thumbnail) {
  						if (!thumbnail.ready) {
  							thumbnail.url = mergeURI(application.url, "./assets/genericAlbum.png");
  						}
  					}
          },
          url: $.thumbnail
        })
  	  ]
    }),

  	Column($, { left: 8, right: 10, top: 0, contents: [

  		Label($, { left: 0, right: 0, style: songTitleStyle, string: $.title }),

  		Label($, { left: 0, right: 0, style: songSubtitleStyle, string: $.artist })
  	 ]
    })
  ]
}));

let SongsPane = Body.template( $ => ({
  contents: [
  	SCROLLER.VerticalScroller($, {
      contents: [
    		Column($, { left: 0, right: 0, top: 0, anchor: 'LIST',
          Behavior: class extends SCREEN.ListBehavior{
            addItemLine(list, item){
      		    list.add(new SongCell(item));
          	}
          	createMessage(list, data){
          		return new Message("xkpr://library/music/songs");
          	}
          	getItems(list, message, json){
          		let action = "/song";
  						json.forEach(function(item) {
  							item.action = action;
  						});
  						return json;
          	}
          }
        }),

    		SCROLLER.VerticalScrollbar($, { })
      ]
    })
  ]
}));

let MainScreen = SCREEN.EmptyScreen.template( $ => ({
  contents: [
  	$.tabs[$.selection].Pane($.tabs[$.selection], { anchor: 'BODY' }),

  	SCREEN.TabFooter($, { anchor: 'FOOTER' }),

  	$.tabs[$.selection].Header($.tabs[$.selection], { anchor: 'HEADER' })
  ]
}));

let PhotoScreen = SCREEN.EmptyScreen.template( $ => ({
  contents: [
  	Body($, { anchor: 'BODY',
      contents: [
  		  Picture($, { left: 0, right: 0, top: 0, bottom: 0, url: $.url })
  	  ]
    }),
  	Header($, { anchor: 'HEADER', }),
  ]
}));

let VideoScreen = SCREEN.EmptyScreen.template( $ => ({
  contents: [
  	Body($, { anchor: 'BODY',
      contents: [
  		    Media($, { left: 0, right: 0, top: 0, bottom: 0,
            behavior: class extends Behavior{
            	onLoaded(media){
            		media.start();
            	}
            },
            url: $.url
          })
  	  ]
    }),
  	Header($, { anchor: 'HEADER' })
  ]
}));

let SongScreen = SCREEN.EmptyScreen.template( $ => ({
  contents: [
  	Body($, { anchor: 'BODY',
      contents: [
		    Media($, { left: 0, right: 0, top: 0, bottom: 0,
          behavior: class extends Behavior{
            onLoaded(media){
          		media.start();
          	}
          },
          url: $.url
        })
  	  ]
    }),
  	Header($, { anchor: 'HEADER', }),
  ]
}));

let LibraryNotAvailableScreen = SCREEN.EmptyScreen.template( $ => ({
  contents: [
  	Body($, { anchor: 'BODY',
      contents: [
    		Text($, { left: 4, right: 4, top: 4, bottom: 4, style: unsupportedStyle, string: $.prompt })
    	]
    }),
  	Header($, { anchor: 'HEADER' })
  ]
}));

application.behavior = new MODEL.ApplicationBehavior(application);
application.invoke(new Message("xkpr://library/scan"));
