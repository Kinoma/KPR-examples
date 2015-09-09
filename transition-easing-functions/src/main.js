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
var MODEL = require('mobile/model');

/* Skins and Styles */
var smallStyle = new Style ({ font: 'bold 18px', horizontal: 'center', color: '#FFF' });
var titleStyle = new Style ({font: '24px', color: '#000'});
var whiteBox = new Skin ({fill: 'white'});
var blueBox = new Skin ({fill: 'blue'});
var menuSkin = new Skin ({fill: '#EEAAAAAA'});
var buttonSkin = new Skin ({fill: 'Green'});
var buttonStyle = new Style({font: '22px', color: 'white', horizontal: 'center'})

/* Globals */
var FadeDuration = 1500;

var EasingFunctionOut = function(fraction) {
							return fraction;
						};
var EasingFunctionIn = function(fraction) {
							return fraction;
						};					
/* Main screen layout */
var mainContainer = Container.template(function($) { return {
	left: 0, right: 0, top: 0, bottom: 0, active: false, skin: whiteBox, name: 'mainCon',
	contents: [
		Column ($, {left: 0, right: 0, top: 0, bottom: 0, name: 'contentColumn',
			contents: [
			   		Container($, {top: 5, left: 5, right: 5, height: 30, name: 'header',
			   			contents: [
			   			            Label($, {left: 10, top: 0, string: "Linear (none)", style: titleStyle, name: 'title'}),
				   			   		Picture($, {top: 0, right: 0, width: 30, height: 30, url: 'assets/menu.png',
						   				active: true, name: 'menuButton',
										behavior: Behavior({
											onTouchEnded: function(container, id, x, y, ticks) {
												//this.data = $;
												//debugger;
												mainCon.add(new EquationMenu($), mainCon.contentColumn);
											}						
										})
							   		})
	   			           ]
			   		
			   		}),
			   		Container($, {left: 0, right: 0, height: 160, skin: whiteBox, name: 'coloredBoxHolder',
						contents: [
						           Content($, {height: 150, width: 150, skin: blueBox, name: 'coloredBox'})
				          ]	
					}),
					Container($, {left: 20, height: 40, right: 20,
						contents: [
					            Label($, {width: 125, height: 40, string: 'Transition', skin: buttonSkin, style: buttonStyle, active: true,
									behavior: Behavior({
										onTouchEnded: function(container, id, x, y, ticks) {
											mainCon.contentColumn.coloredBoxHolder.run(new FadeOut);
											mainCon.contentColumn.coloredBoxHolder.run(new FadeIn);
										}
									})
								}),
						],	
					}),          
	           ]
		})
	]
}});

var EquationLine = Line.template(function ($) { return {
	active: true, left: 0, right: 0, top: 10, height: 30,
	contents: [
	           Text($, {left: 0, right: 0, height: 30, style: smallStyle, string: $.title}),
           ] 
}});

var EquationMenu = Container.template(function($) { return { top: 0, left: 0, right: 0, bottom: 0, skin: menuSkin, name: 'menu',
	contents: [
			          SCROLLER.VerticalScroller($, { 
			   			name: 'scroller', clip: true,
			   			contents: [
		              			Column($, { left: 0, right: 0, top: 0, name: 'menu', 
		              				contents: [
		              				         EquationLine({title: 'None (Linear)'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return fraction;
														};
														EasingFunctionIn = function(fraction) {
															return fraction;
														};
														mainCon.contentColumn.header.title.string = 'None (Linear)'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })        				        		 
		              				         }),
		              				         EquationLine({title: 'Quad'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.quadEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.quadEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Quad'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })         				        		 
		              				         }),
		              				         EquationLine({title: 'Cubic'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.cubicEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.cubicEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Cubic'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),
		              				         EquationLine({title: 'Quart'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.quartEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.quartEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Quart'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),
		              				         EquationLine({title: 'Quint'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.quintEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.quintEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Quint'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),	      
		              				         EquationLine({title: 'Sine'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.sineEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.sineEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Sine'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),	              				         
		              				         EquationLine({title: 'Circular'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.circularEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.circularEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Circular'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })         				        		 
		              				         }),
		              				         EquationLine({title: 'Exponetial'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.exponetialEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.exponentialEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Exponetial'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),
		              				         EquationLine({title: 'Back'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.backEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.backEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Back'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }), 
		              				         EquationLine({title: 'Bounce'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.bounceEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.bounceEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Bounce'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),
		              				         EquationLine({title: 'Elastic'}, {
		              				        	 behavior: Behavior({
		              				        		 onTouchEnded: function(container, id, x, y, ticks) {
		     											EasingFunctionOut = function(fraction) {
															return Math.elasticEaseOut(fraction);
														};
														EasingFunctionIn = function(fraction) {
															return Math.elasticEaseIn(fraction);
														};
														mainCon.contentColumn.header.title.string = 'Elastic'
														mainCon.remove(mainCon.menu);
		              				        		 }
		              				        	 })
		              				         }),	              				         
	          				           ]
	              				})
	              			]
			   		})
       ]
}});
var FadeOut = function() {
	   Transition.call(this, FadeDuration);
	};
	FadeOut.prototype = Object.create(Transition.prototype, {
	   onBegin: { value: 
	      function(container) {	   	 
		   	 this.layer = new Layer();
		   	 this.layer.attach(container.first);	   	 
	      }
	   },
	   onEnd: { value: 
	      function(container) {
		   this.layer.detach();
	      }
	   },
	   onStep: { value: 
	      function(fraction) {
		   this.layer.translation = {x:1, y: (-150 * EasingFunctionOut(fraction))};
	      }
	   }
   });	   

	var FadeIn = function() {
		   Transition.call(this, FadeDuration);
		};
		FadeIn.prototype = Object.create(Transition.prototype, {
		   onBegin: { value: 
		      function(container) {
			     this.layer = new Layer();
			   	 this.layer.attach(container.first);
			   	 this.layer.translation = {x:1, y: -150};
		      }
		   },
		   onEnd: { value: 
		      function(container) {
				this.layer.detach();
		      }
		   },
		   onStep: { value: 
		      function(fraction) {
			    this.layer.translation = {x:1, y: -150+(150 * EasingFunctionOut(fraction))};
		      }
		   }
	   });	
	
/* Application definition */
var mainCon;
var ApplicationBehavior = function(application, data, context) {
			MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	onLaunch: { value: function() {
		var data = this.data = {};
		mainCon = new mainContainer(data)
		application.add(mainCon);
	}}
})

var model = application.behavior = new ApplicationBehavior(application);
