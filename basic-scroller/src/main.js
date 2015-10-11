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
THEME = require('themes/sample/theme');
var SCROLLER = require('mobile/scroller');

/* ASSETS */
var blackSkin = new Skin({ fill: 'black'});
var blueSkin = new Skin({fill: 'blue'})
var separatorSkin = new Skin({ fill: 'silver'});
var yellowSkin	= new Skin({ fill: 'yellow'});
var whiteSkin = new Skin({ fill: 'white'});

/* STYLES */
var productDescriptionStyle = new Style({  font: '18px', horizontal: 'left', vertical: 'middle', left: 1, color: 'white' });
var productNameStyle = new Style({  font: 'bold 22px', horizontal: 'left', vertical: 'middle', lines: 1 });

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

/* This is a template that will be used to for each entry populating the list. 
 * Note that it is anticipating an object each time in is instantiated */
var ProcessorLine = Line.template(function($) { return { left: 0, right: 0, active: true, skin: THEME.lineSkin, 
    behavior: Behavior({
    	/* Gives the user visual feedback on which entry they have tapped.
    	 * note that the skin is reverted to white in onTouchEnded and onTouchCanceled */    	 
    	onTouchBegan: function(container, id, x,  y, ticks) {
			container.skin = yellowSkin;
    	},
    	/* This catches touches that don't simply end
    	 * and resets the skin back to white.
    	 */
    	onTouchCancelled: function(container, id, x,  y, ticks) {
			container.skin = whiteSkin;
    	},
    	/* Traces out the value of the first Label's string. The
    	 * silly string of "first" in the trace can be thought of as
    	 * container.Column.Container.Label.string.  This pattern can
    	 * be seen reading down the contents of this object below */
    	onTouchEnded: function(container, id, x,  y, ticks) {	
			container.skin = whiteSkin;
			trace(container.first.first.first.string+"\n");
		}
	}),
	contents: [
		Column($, { left: 0, right: 0,
			contents: [
				Container($, { left: 4, right: 4, height: 52, 
					contents: [
						/* This label expects that the object passed to ProcessorLine 
						 * includes a value for title.  Note that this Label is not marked
						 * as active. Touches registered here will bubble back up through
						 * the parent objects until it hits one which is active. */
						Label($, { left: 10, style: productNameStyle, string: $.title,}),
						
						/* This label is expecting a value for button.  Note that this Label
						 * is marked active.  Touches registered here will be handled here */
						Label($, { right: 10, style: productDescriptionStyle, skin: blueSkin, active: true, string: $.button,
							behavior: Behavior({
								/* When this label is touched, simply trace out its string.
								 * Note that no chain of "first" is needed here because the
								 * touch happened in the object that contains the property
								 * we want to trace */
								onTouchEnded: function(label, id, x,  y, ticks) {	
									trace(label.string+"\n");
								}
							})
						})
					]
				}),
	     		Line($, { left: 0, right: 0, height: 1, skin: separatorSkin })
     		]
     	}),
     ]
 }});

/* This is a template for a container which takes up the
 * whole screen.  It contains only a single object,
 * a SCROLLER.VerticalScroller.  Although we are not
 * referencing any values from an object passed on creation,
 * an object is still required as the SCROLLER object uses it
 * internally. */
var ScreenContainer = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0,
	contents: [
		/* Note that the scroller is declared as having only an empty
		 * Column. All the entries will be added 
		 * programmatically to the colum. */ 
		SCROLLER.VerticalScroller($, { 
			name: 'scroller',
			contents: [
				Column($, { left: 0, right: 0, top: 0, name: 'menu' })             			
			]
		})
	]
}});

var data = new Object();
var screen = new ScreenContainer(data);

/* This simple function exists so we can call the "forEach" 
 * method of our array of list entries (menuItems).  It adds a new 
 * ProcessorLine object to the Column named "menu" in the
 * screen object's SCROLLER */
function ListBuilder(element, index, array) {
	screen.scroller.menu.add(new ProcessorLine(element));
}

application.behavior = Behavior({
	onLaunch: function(application) {
		/* Call the ListBuilder funciton for each element in our
		 * array of list entries.*/
		menuItems.forEach(ListBuilder);
		application.add(screen);
	}
});