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
var DIALOG = require('mobile/dialog');
var MODEL = require('mobile/model');
THEME = require('themes/sample/theme');
KEYBOARD = require('mobile/keyboard');

var backgroundSkin = new Skin({ fill: '#eee' });
var buttonSkin = new Skin({ fill: '#ccf' });

var buttonStyle = new Style({ color: 'blue', font: 'bold 24px', horizontal: 'center', vertical: 'middle' });
var headerStyle = new Style({ color: '#444', font: 'bold 18px', horizontal: 'center', vertical: 'middle' });

Handler.bind("/dialog", MODEL.DialogBehavior({
	onDescribe: function(query) {
		return {
            Dialog: DIALOG.Box,
            title: "What is your name?",
            action: "/traceResult",
            items: [
                {
                    Item: DIALOG.Field,
                    id: "first_name",
                    label: "First",
                },
                {
                    Item: DIALOG.Field,
                    id: "last_name",
                    label: "Last",
                },
                {
                    id: "secret",
                },
                {
                    Item: DIALOG.Caption,
                    string: query.greeting
                },
            ],
            ok: "OK",
            cancel: "Cancel",
		};
	}
}));

Handler.bind("/traceResult", {
	onInvoke: function(handler, message) {
		data = parseQuery(message.query);
		for (var key in data) {
			trace(key + ": " + data[key] + "\n");
		}
	}
});

var MainScreen = Container.template(function($) { return { left: 0, right: 0, top: 0, bottom: 0, skin: backgroundSkin,
	contents: [
		Label($, { left: 0, right: 0, top: 4, style: headerStyle, string: 'Basic Dialog Sample' }),
		Label($, { height: 35, left: 25, right: 25, active: true, string: 'Show Simple Dialog', skin: buttonSkin, style: buttonStyle,
			behavior: Behavior({
				onTouchEnded: function(label, x, y, id, ticks) {			
					var dialogData = {first_name: 'Will', greeting: 'Welcome to KinomaJS', secret: '42'};
					label.invoke(new Message("/dialog?" + serializeQuery(dialogData)));
				}
			})
		})
 	]
}});

application.behavior = new MODEL.ApplicationBehavior( application );
application.add(new MainScreen({}));

