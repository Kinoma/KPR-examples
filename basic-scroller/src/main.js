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
 import {    VerticalScroller,    VerticalScrollbar,    TopScrollerShadow,    BottomScrollerShadow} from 'scroller';

/* ASSETS */
let lineSkin = new Skin({ 
	fill: [ 'white', 'yellow' ],
    borders: { left: 0, right: 0, top: 0, bottom: 1 },     stroke: 'silver'	
});
var blueSkin = new Skin({fill: 'blue' });

/* STYLES */
var productDescriptionStyle = new Style({  font: '18px', horizontal: 'left', vertical: 'middle', left: 1, color: 'white' });
var productNameStyle = new Style({  font: 'bold 22px', horizontal: 'left', vertical: 'middle', lines: 1, color: 'black' });

/* STATIC */
/* A simple array of objects. Each will be used as an
 * entry in our scrollable list. */
var menuItems = [
	{title: 'Pentium', button: 'P5'},
	{title: 'Pentium MMX', button: 'Tillamook'},
	{title: 'Pentium Pro', button: 'P6'},
	{title: 'Pentium II', button: 'Klamath'},
	{title: 'Pentium III', button: 'Coppermine'},
	{title: 'Pentium IV', button: 'Prescott'},
	{title: 'Pentium M', button: 'Dothan'},
	{title: 'Core Duo', button: 'Yonah'},
	{title: 'Core 2 Duo', button: 'Penryn'},
	{title: 'Core i7', button: 'Sandy Bridge'}
];

/* Changing the state in the touch events gives the user
 * visual feedback on which entry they have tapped by changing
 * the background color of the line. Note that the skin turns 
 * yellow when the state is 1 (while it's being tapped)
 * and reverts back to white when the state is 0. */
class ProcessorLineBehavior extends Behavior {
	/* data is an object from the menuItems array */
	onCreate(line, data) {
		this.data = data;
	}	 	onTouchBegan(line, id, x,  y, ticks) {
		line.state = 1;	}	onTouchCancelled(line, id, x,  y, ticks) {		line.state = 0;	}
	/* Traces out the value of the first Label's string, which we 
	 * get by referencing this.data.title */	onTouchEnded(line, id, x,  y, ticks) {	
		line.state = 0;
		trace(this.data.title+"\n");	}
}

/* The 'button' property of each item in the menuItems array
 * is used as the string of a label. Each of those labels 
 * is assigned an instance of the following behavior. */
class ProductDescriptionButtonBehavior extends Behavior {
	/* When this label is touched, simply trace out its string. */
	onTouchEnded(label, id, x,  y, ticks) {	
		trace(label.string+"\n");
	}
}

/* This is a template that will be used to for each entry populating the list. 
 * Note that it is anticipating an object each time it is instantiated; the
 * object it gets is an item from the menuItems array. */
var ProcessorLine = Line.template($ =>  ({
	left: 0, right: 0, height: 52, active: true, skin: lineSkin, 
    behavior: new ProcessorLineBehavior($),
	contents: [
		/* This label expects that the object passed to ProcessorLine 
		 * includes a value for title.  Note that this Label is not marked
		 * as active. Touches registered here will bubble back up through
		 * the parent objects until it hits one which is active. */
		Label($, { left: 14, right: 0, style: productNameStyle, string: $.title,}),
						
		/* This label is expecting a value for button.  Note that this Label
		 * is marked active. Touches registered here will be handled by its
		 * own behavior */
		Label($, { 
			right: 14, style: productDescriptionStyle, skin: blueSkin, 
			active: true, string: $.button, behavior: new ProductDescriptionButtonBehavior()
		})							
     ]
 }));

/* This is a template for a container which takes up the
 * whole screen.  It contains only a single object,
 * a VerticalScroller. */
var ScreenContainer = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0,
	contents: [
		VerticalScroller($, { 
			name: 'scroller',
			contents: [
				Column($, { 
					left: 0, right: 0, top: 0, name: 'menu',
					/* Add a ProcessorLine object for each item in the menuItems array */
					contents: menuItems.map(element => new ProcessorLine(element))
				})             			
			]
		})
	]
}));

/* When the application is launched, add an instance of ScreenContainer
 * to the application to display a scrolling menu of items */
class AppBehavior extends Behavior {
	onLaunch(application) {
		application.add(new ScreenContainer());
	}
}
application.behavior = new AppBehavior();