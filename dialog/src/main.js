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

KEYBOARD = require('mobile/keyboard');
THEME = require('themes/sample/theme');
let MODEL = require('mobile/model');
let DIALOG = require('mobile/dialog');

/* ASSETS */

let backgroundSkin = new Skin({ fill:'#eee' });
let buttonSkin = new Skin({ fill:'#ccf' });
let dummySkin = new Skin({ fill:'red' });
let hiliteSkin = new Skin({ fill:'#88c' });

let buttonStyle = new Style({ font:'bold 24px', color:'blue', horizontal:'center', vertical:'middle' });
let headerStyle = new Style({ font:'bold 18px', color:'#444', horizontal:'center', vertical:'middle' });

/* HANDLERS */

// Simple dialog
Handler.bind("/simple", MODEL.DialogBehavior({
	onDescribe(query) {
        return {
            Dialog: DIALOG.Box,
            title: "What is your name?",
            action: "/printResult",
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
                    // This item has not displayed in the dialog,
                    // but the value will be passed to the action.
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

// Checkbox dialog
Handler.bind("/checkbox", MODEL.DialogBehavior({
	onDescribe(query) {
        return {
            Dialog: DIALOG.Box,
            title: "Checkbox Sample",
            action: "/printResult",
            items: [
                {
                    Item: DIALOG.Checkbox,
                    id: "left_check",
                    label: "Left side checkbox",
                },
                {
                    Item: DIALOG.CheckboxRight,
                    id: "right_check",
                    label: "Right side checkbox",
                },
            ],
            ok: "OK",
            cancel: "Cancel",
        };
	}
}));

// Showcase dialog
Handler.bind("/showcase", MODEL.DialogBehavior({
	onDescribe(query) {
        return {
            Dialog: DIALOG.Box,
            items: [
                {
                    Item: DIALOG.Field,
                    id: "name",
                    label: "Field",
                },
                {
                    Item: DIALOG.Field,
                    id: "name2",
                },
                {
                    Item: DIALOG.Caption,
                    string: "Initial value is passed by the query",
                },
                {
                    Item: DIALOG.Password,
                    id: 'password',
                    label: "PIN",
                },
                {
                    Item: DIALOG.Spacer,
                },
                {
                    Item: DIALOG.FieldHint,
                    id: "name3",
                    value: "",
                    hint: "Nickname",
                    
                },
                {
                    Item: DIALOG.Slider,
                    id: "slider",
                    label: "Score",
                    min: 0,
                    max: 100,
                    value: 0,
                    toString: function(val) { return Math.floor(val); }, 
                },
                {
                    Item: DIALOG.Spacer,
                },
                {
                    Item: DIALOG.Subtitle,
                    string: "This is Subtitle.",
                },
                {
                    Item: DIALOG.Caption,
                    string: "This is Caption.",
                },
                {
                    Item: DIALOG.Comment,
                    string: "This is Comment.",
                },
            ],
            ok: "Go!",
            cancel: "Close",
            action: "/printResult",
        };
	}
}));

// Spinner and Busy items dialog
Handler.bind("/busy", MODEL.DialogBehavior({
	onDescribe(query) {
        return {
            Dialog: DIALOG.Box,
            title: "I am busy.",
            items: [
                {
                    Item: DIALOG.Spinner,
                },
                {
                    Item: DIALOG.Busy,
                    string: "I said I'm busy!",
                },
            ],
            cancel: "Cancel",
        };
	}
}));

// Progress bar
Handler.bind("/progressing", MODEL.DialogBehavior({
	onCancel(dialog) {
		let dummy_task = this.data.dummy_task;
		dummy_task.stop();

		application.remove(dummy_task);
	},
	onDescribe(query) {
        let data = {
            Dialog: DIALOG.Box,
            items: [
                {
                    Item: DIALOG.Comment,
                    string: "Wasting your battery...",
                },
                {
                    // This is the progress bar data.
                    // After dialog is instanciated, this object has
                    // reference slot to the bar object with a name "BAR".
                    Item: DIALOG.ProgressBar,
                    value: -0.3, // negative value displays barber pole.
                },
            ],
            cancel: "Stop!",
        };

        let dummy_task = new Periodical({interval: 500, dialog: data});
        dummy_task.start();
        application.add(dummy_task);

        // keep the reference for the task to clean it up later.
        data.dummy_task = dummy_task;

        return data;
	}
}));

Handler.Bind("/printResult", class extends MODEL.CommandBehavior {
	onQuery(handler, query) {
        for (let key in query) {
            trace(key + ": " + query[key] + "\n");
        }
	}
});

/* BEHAVIORS */

class ButtonBehavior extends Behavior {
	onCreate(label) {
		super.onCreate(label);
        label.coordinates = {top:4, bottom:4, left:4, right:4, height:32};
        label.skin = buttonSkin;
        label.style = buttonStyle;
        label.active = true;
	}
	onTap(label) {
		debugger;
	}
	onTouchBegan(label) {
		label.skin = hiliteSkin;
	}
	onTouchEnded(label) {
		label.skin = buttonSkin;
		this.onTap(label);
	}
};

/* TEMPLATES */

let MainScreen = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:backgroundSkin,
	contents: [
		Label($, { left:0, right:0, top:4, style:headerStyle, string:$.title }),
		Column($, {
			width:300,
			contents: [
				Label($, {
					string:'Simple Dialog',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
                        	label.invoke(new Message("/simple?" + serializeQuery({ secret:42, greeting:'Sayonara' })));
						}
					}
				}),
				Label($, {
					string:'Checkbox Sample',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
							label.invoke(new Message("/checkbox"));
						}
					}
				}),
				Label($, {
					string:'Dialog Item Sampler',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
                        	label.invoke(new Message("/showcase?" + serializeQuery({ name2:'James Bond' })));
						}
					}
				}),
				Label($, {
					string:'Busy Dialog',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
                        	label.invoke(new Message("/busy"));
						}
					}
				}),
				Label($, {
					string:'Progress Bar',
					Behavior: class extends ButtonBehavior {
						onTap(label) {
                        	label.invoke(new Message("/progressing"));
						}
					}
				}),
			]
		})
	]
}));

let Periodical = Content.template($ => ({
	width:32, height:32, bottom:4, right:4, skin:dummySkin,
	behavior: Behavior({
		onCreate(content, data) {
            this.dialog = data.dialog;
            content.duration = data.interval;
		},
		onDisplayed(content) {
			content.start();
		},
		onFinished(content) {
            let progressBar = this.dialog.items[1];
            progressBar.value += 0.1;
            progressBar.BAR.delegate("onChanged");

            if (progressBar.value >= 1.0) {
                // to close dialog with "onCancel" invocation
                progressBar.BAR.bubble("onCancel");
            } else {
                // loop again
                content.time = 0;
                content.start();
            }
		}
	})
}));

/* APPLICATION */

application.behavior = new MODEL.ApplicationBehavior( application );

var data = {
    title: 'dialog maniacs',
};
application.add( new MainScreen(data) );

