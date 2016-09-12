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
 
/*Skins and Styles*/
var buttonSkin = new Skin ({fill: 'green'});
var whiteSkin = new Skin ({fill: 'white'});

var buttonStyle = new Style({font: '22px', color: 'white'});
var smallStyle = new Style ({font: '20px', color: 'black'});

/* Main screen layout */
var MainContainer = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		Label($, { anchor: 'UPDATED_LABEL', left:0, right:0, active: false, style: smallStyle, string: $.originalText }),
		Container($, { bottom: 20, height: 40, width: 160, skin: buttonSkin, active: true,
			behavior: Behavior({
				onTouchEnded(container, id, x, y, ticks) {
					var url = 'http://api.service.cloud.kinoma.com/0/sample/hash';
					var message = new Message(url);
					message.method = "POST";
					message.requestText = JSON.stringify({algorithm: "MD5", string: $.originalText});
					message.invoke(Message.TEXT).then(text => {
						if (0 == message.error && 200 == message.status) {
							try {
								var responseObject = JSON.parse(text);
								if (responseObject.success == true)
									data.UPDATED_LABEL.string = responseObject.result; 
								else {
									trace('Request Failed - Raw Response Body: *'+text+'*'+'\n');
									data.UPDATED_LABEL.string = "Request Failed: " + responseObject.message;
								}						
							}
							catch (e) {
								throw('Web service responded with invalid JSON!\n');
							}
						}
						else {
							data.UPDATED_LABEL.string = "Request Failed: " + message.status;
							trace('Request Failed - Raw Response Body: *'+text+'*'+'\n');
						}
					});
				},
			}),
			contents: [
				Label($, {string: 'Send Request', style: buttonStyle})
			]
		}) 
	]
}));

/* Application definition */
var data = {
	originalText: 'thequickbrownfoxjumpedoverthelazydog'
}
class AppBehavior extends Behavior {
	onLaunch(application) {
		application.add(new MainContainer(data));
	}
}
application.behavior = new AppBehavior();
