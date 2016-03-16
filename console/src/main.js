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

 ---------------------------------------------------------------------------
 
  This sample application demonstrates how to display a simple console for logging debugging messages on Kinoma Create.
  New messages are added to the end of the console log and auto-scrolled into view.
  To add a message to the console log, simply call the console function, passing the string to be logged, e.g.:
  
  console("callback invoked, x=" + this.x);
  
  The console can also be driven remotely by invoking a HTTP /console request to the built-in server.
  The server IP address and port are displayed in the footer. To send a debugging message remotely, invoke the /console message from your app:
  
  application.invoke(new Message("http://<ip address:port>/console?message=" + "Hello console!"));
  
  Lastly, the full console log can be displayed in a web browser:
  
  http://<ip address:port>/console
*/

THEME = require('themes/sample/theme');
let SCROLLER = require('mobile/scroller');

/* ASSETS */

let graySkin = new Skin({ fill:'gray' });
let headerSkin = new Skin({ fill:'#c2c2c2' });
let whiteSkin = new Skin({ fill:'white' });


let applicationStyle = new Style({ font:'16px Fira Sans' });
let consoleStyle = new Style({ font:'18px Fira Mono', color:'black', left:5, right:5, top:5 });
let headerButtonStyle = new Style({ font:'bold 24px', horizontal:'right', vertical:'middle', color:['white', '#5ab021'] });
let headerTitleStyle = new Style({ font:'bold 25px', color:'black', horizontal:'center', vertical:'middle' });
let serverStyle = new Style({ font:'bold 25px', color:'white', horizontal:'center', vertical:'middle' });

/* HANDLERS */

Handler.bind("/console", Behavior({
	onInvoke(handler, message) {
		let query = parseQuery(message.query);
        if ("message" in query)
            application.distribute("onConsoleLog", query.message);
        else if (consoleURL) {
            let CONSOLE = application.first.behavior.data.CONSOLE;
            let result = new Array(CONSOLE.length + 1);
            let i = 0;
            for (let content of CONSOLE)
            	result[i++] = content.string; 
            
            result[i] = "\n\n\n(Use " + consoleURL + "?message=hello to append to console)\n";
            message.responseText = result.join("\n");
        }
	}
}));

/* TEMPLATES */

let ConsoleLogLabel = Label.template($ => ({
	left:0, height:consoleStyle.size, string:$
}));

let ConsoleContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, active:true, skin:whiteSkin,
	behavior: Behavior({
		onConsoleClear(container, data) {
			this.data.CONSOLE.empty();
		},
		onConsoleLog(container, message) {
			this.data.CONSOLE.add(new ConsoleLogLabel(message));
			this.data.SCROLLER.scrollTo(0, 0x7FFFF);
		},
		onCreate(container, data) {
			this.data = data;
		},
		onDisplayed(container) {
			this.onConsoleLog(container, new Date().toLocaleTimeString() + ' Console started');
		}
	}),
	contents: [
		Container($, {
			anchor:'HEADER', left:0, right:0, top:0, height:32, skin:headerSkin,
			contents: [
				Label($, { right:16, active:true, style:headerButtonStyle, string:'Clear',
					behavior: Behavior({
						onTouchBegan(label) {
							label.state = 1;
						},
						onTouchEnded(label) {
							label.state = 0;
							label.bubble("onConsoleClear");
						}
					})
				}),
				Label($, { left:0, right:0, style:headerTitleStyle, string:'Console' })
			]
		}),
		Container($, {
			anchor:'BODY', left:0, right:0, top:32, bottom:32, clip:true,
			contents: [
				SCROLLER.VerticalScroller($, { anchor:'SCROLLER', left:0, right:0, top:0, bottom:0,
					contents: [
						SCROLLER.HorizontalScroller($, { left:0, right:0, top:0, bottom:undefined,
							contents: [
								Column($, { anchor:'CONSOLE', left:0, top:0, style:consoleStyle }),
								SCROLLER.HorizontalScrollbar($, {
									behavior: SCROLLER.HorizontalScrollbarBehavior({
										onScrolled(scrollbar) {
											SCROLLER.HorizontalScrollbarBehavior.prototype.onScrolled.call(this, scrollbar);
											let container = scrollbar.container.container;
											scrollbar.y = container.y + container.height - scrollbar.height;
										}
									})
								})
							]
						}),
						SCROLLER.VerticalScrollbar($)
					]
				})
			]
		}),
		Container($, {
			anchor:'FOOTER', left:0, right:0, bottom:0, height:32, skin:graySkin,
			behavior: Behavior({
				onDisplaying(container) {
					let message = new Message("xkpr://wifi/status");
					let promise = message.invoke(Message.JSON);
					promise.then(json => {
						if (json && ("ip_address" in json))
							container.first.string = consoleURL = 'http://' + json.ip_address + ':' + application.serverPort + '/console';
					});				
				}
			}),
			contents: [
				Label($, { left:0, right:0, style:serverStyle })
			]
		}),
	]
}));

/* APPLICATION */

application.style = applicationStyle;
application.shared = true;

var console = function(message) {
	application.distribute("onConsoleLog", message);
}
var consoleURL = null;

application.add(new ConsoleContainer({}));

