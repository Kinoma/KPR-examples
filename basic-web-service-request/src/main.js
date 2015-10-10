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

/*Skins and Styles*/
var buttonSkin = new Skin ({fill: 'green'});
var whiteSkin = new Skin ({fill: 'white'});

var buttonStyle = new Style({font: '22px', color: 'white'});
var smallStyle = new Style ({font: '20px', color: 'black'});

/* Globals */
var originalText = 'thequickbrownfoxjumpedoverthelazydog';


/* Main screen layout */
var MainContainer = new Container({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		new Label({ left:0, right:0, active: false, name:'output', style: smallStyle, string: originalText }),
		new Container( { bottom: 20, height: 40, width: 160, skin: buttonSkin, active: true,
			behavior: Behavior({
				onTouchEnded: function(container, id, x, y, ticks) {
					var url = 'http://api.service.cloud.kinoma.com/0/sample/hash';
					var message = new Message(url);
					message.method = "POST";
					message.requestText = JSON.stringify({algorithm: "MD5", string: originalText});
					container.invoke(message, Message.TEXT);
				},
				onComplete: function(container, message, text) {
					if (0 == message.error && 200 == message.status) {
						var responseObject;
						try {
							var responseObject = JSON.parse(text);
						}
						catch (e) {
							trace('Web service responded with invalid JSON!\n');
						}
						if (responseObject.success == true)
							MainContainer.output.string = responseObject.result; 
						else {
							trace('Request Failed - Raw Response Body: *'+text+'*'+'\n');
							MainContainer.output.string = "Request Failed: " + responseObject.message;
						}						
					}
					else {
						MainContainer.output.string = "Request Failed: " + message.status;
						trace('Request Failed - Raw Response Body: *'+text+'*'+'\n');
					}
				}
			}),
			contents: [
				new Label({string: 'Send Request', style: buttonStyle})
			]
		}) 
	]
});

/* Application definition */
application.behavior = {
	onLaunch: function() { 
		application.add(MainContainer);
	}
}