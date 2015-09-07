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

/* Modules */
var THEME = require('themes/sample/theme');
var SCROLLER = require('mobile/scroller');
var SCREEN = require('mobile/screen');

/* Skins and Styles */
var smallStyle = new Style ({ font: 'bold 18px', color: '#FFF' });
var titleStyle = new Style ({font: '24px', color: '#000'});
var whiteBox = new Skin ({fill: 'white'});
var blueBox = new Skin ({fill: 'blue'});
var menuSkin = new Skin ({fill: '#EEAAAAAA'});
var buttonSkin = new Skin ({fill: 'Green'});
var buttonStyle = new Style({font: '22px', color: 'white', horizontal: 'center'})

/* Globals */
var FadeDuration = 1500;
var WhiteContent = new Content({height: 150, width: 150, skin: whiteBox});
var EasingFunctionOut = function(fraction) {
							return fraction;
						};
var EasingFunctionIn = function(fraction) {
							return fraction;
						};					
/* Main screen layout */
var mainContainer = new Container({
	left: 0, right: 0, top: 0, bottom: 0, active: false, skin: whiteBox, name: 'mainCon',
	contents: [
		new Column ({left: 0, right: 0, top: 0, bottom: 0, name: 'contentColumn',
			contents: [
			   		new Container({top: 5, left: 5, right: 5, height: 30, name: 'header',
			   			contents: [
			   			            new Label({left: 10, top: 0, string: "Linear (none)", style: titleStyle, name: 'title'}),
				   			   		new Picture({top: 0, right: 0, width: 30, height: 30, url: 'assets/menu.png',
						   				active: true, name: 'menuButton',
										behavior: Behavior({
											onTouchEnded: function(container, id, x, y, ticks) {
												mainContainer.add(EquationMenu, mainContainer.contentColumn);
											}						
										})
							   		})
	   			           ]
			   		
			   		}),
			   		new Container({left: 0, right: 0, height: 160, skin: whiteBox, name: 'coloredBoxHolder',
						contents: [
					           new Content({width: 150, height: 150, skin: blueBox, name: 'coloredBox'})
				          ]	
					}),
					new Container( { left: 20, height: 40, right: 20,
						contents: [
					           new Label({width: 125, height: 40, string: 'Transition', skin: buttonSkin, style: buttonStyle, active: true,
									behavior: Behavior({
										onTouchEnded: function(container, id, x, y, ticks) {
											mainContainer.contentColumn.coloredBoxHolder.run(new FadeOut, mainContainer.contentColumn.coloredBoxHolder.coloredBox, WhiteContent);
											mainContainer.contentColumn.coloredBoxHolder.run(new FadeIn, WhiteContent, mainContainer.contentColumn.coloredBoxHolder.coloredBox);
										}
									})
								}),
						],	
					}),          
	           ]
		})
	]
});

var EquationLine = Label.template(function ($) { return {style: smallStyle, string: $.title, active: true, top: 10}});

var EquationMenu = new Container({ top: 0, left: 0, right: 0, skin: menuSkin,
	contents: [
		   		SCROLLER.VerticalScroller({}, { 
		   			name: 'scroller', clip: true,
		   			contents: [
	              			Column({}, { left: 0, right: 0, top: 0, name: 'menu', 
	              				contents: [
	              				         new EquationLine({title: 'None (Linear)'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return fraction;
													};
													EasingFunctionIn = function(fraction) {
														return fraction;
													};
													mainContainer.contentColumn.header.title.string = 'None (Linear)'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
          				        		 
	              				         }),
	              				         new EquationLine({title: 'Quad'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.quadEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.quadEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Quad'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })         				        		 
	              				         }),
	              				         new EquationLine({title: 'Cubic'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.cubicEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.cubicEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Cubic'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),
	              				         new EquationLine({title: 'Quart'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.quartEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.quartEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Quart'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),
	              				         new EquationLine({title: 'Quint'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.quintEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.quintEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Quint'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),	      
	              				         new EquationLine({title: 'Sine'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.sineEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.sineEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Sine'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),	              				         
	              				         new EquationLine({title: 'Circular'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.circularEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.circularEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Circular'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })         				        		 
	              				         }),
	              				         new EquationLine({title: 'Exponetial'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.exponetialEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.exponentialEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Exponetial'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),
	              				         new EquationLine({title: 'Back'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.backEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.backEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Back'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }), 
	              				         new EquationLine({title: 'Bounce'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.bounceEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.bounceEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Bounce'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),
	              				         new EquationLine({title: 'Elastic'}, {
	              				        	 behavior: Behavior({
	              				        		 onTouchEnded: function(container, id, x, y, ticks) {
	     											EasingFunctionOut = function(fraction) {
														return Math.elasticEaseOut(fraction);
													};
													EasingFunctionIn = function(fraction) {
														return Math.elasticEaseIn(fraction);
													};
													mainContainer.contentColumn.header.title.string = 'Elastic'
													mainContainer.remove(EquationMenu);
	              				        		 }
	              				        	 })
	              				         }),	              				         
          				           ]
              				}),
              				SCROLLER.VerticalScrollbar({}, {}),
              			]
		   		})	           
       ]
});
var FadeOut = function() {
	   Transition.call(this, FadeDuration);
	};
	FadeOut.prototype = Object.create(Transition.prototype, {
	   onBegin: { value: 
	      function(content, oldContent, newContent) {
		   	 content.add(newContent);
		   	 this.newContent = newContent;
		   	 this.origHeight = this.newContent.coordinates.height;
		   	 this.newContent.coordinates = {top: 5, width: this.newContent.coordinates.width,
		   			height: this.newContent.coordinates.height}
	      }
	   },
	   onEnd: { value: 
	      function(content, oldContent, newContent) {
			content.remove(oldContent);
	      }
	   },
	   onStep: { value: 
	      function(fraction) {
		   this.newContent.coordinates = {top: 5, width:this.newContent.coordinates.width,
				   height: 0 + (this.origHeight * EasingFunctionOut(fraction))}
	      }
	   }
   });	   

	var FadeIn = function() {
		   Transition.call(this, FadeDuration);
		};
		FadeIn.prototype = Object.create(Transition.prototype, {
		   onBegin: { value: 
		      function(content, oldContent, newContent) {
			   	 content.add(newContent);
			   	 this.newContent = newContent;
			   	 this.origHeight = this.newContent.coordinates.height;
			   	 this.newContent.coordinates = {top: 5, width: this.newContent.coordinates.width,
			   			 height: this.newContent.coordinates.height}
		      }
		   },
		   onEnd: { value: 
		      function(content, oldContent, newContent) {
				content.remove(oldContent);
		      }
		   },
		   onStep: { value: 
		      function(fraction) {
			   this.newContent.coordinates = {top: this.origHeight + 5 - (this.origHeight * EasingFunctionOut(fraction)),
		   				width: this.newContent.coordinates.width, 
		   				height: 0 + (this.origHeight * EasingFunctionOut(fraction))}
		      }
		   }
	   });	
	
/* Application definition */
application.behavior = {
	onLaunch: function() { 
		application.add(mainContainer);
	}
}