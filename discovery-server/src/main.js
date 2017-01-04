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
 
/* Skins and styles */
var whiteSkin = new Skin({ fill: 'white' });
var titleStyle = new Style({ color: 'black', font: '18px', horizontal: 'center', vertical: 'middle' });

/* Handlers */
Handler.bind("/color", {
	onInvoke(handler, message) {
		var red = Math.floor( Math.random() * 255 ).toString( 16 );
		if ( 1 == red.length ) red = '0' + red;
		var green = Math.floor( Math.random() * 255 ).toString( 16 );
		if ( 1 == green.length ) green = '0' + green;
		var blue = Math.floor( Math.random() * 255 ).toString( 16 );
		if ( 1 == blue.length ) blue = '0' + blue;
		var color = '#' + red + green + blue;
		message.responseText = JSON.stringify({ color: color });
		message.status = 200;
	}
});

/* UI templates */
var MainContainer = Label.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin, style: titleStyle, string: $.title
}));

/* Application set-up */
class ApplicationBehavior extends Behavior {
	onLaunch(application) {
		application.shared = true;
		application.add( new MainContainer({ title: application.id }) );
	}
	onQuit(application) {
		application.shared = false;
	}
}
application.behavior = new ApplicationBehavior();