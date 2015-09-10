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
var whiteSkin = new Skin ({fill: 'white'});
var blueSkin = new Skin ({fill: 'blue'});
var menuSkin = new Skin ({fill: '#EEAAAAAA'});
var buttonSkin = new Skin ({fill: 'Green'});
var buttonStyle = new Style({font: '22px', color: 'white', horizontal: 'center'})

/* Globals */
var TransitionDuration = 1500;

var EasingFunctionOut = function(fraction) {
	return fraction;
};
var EasingFunctionIn = function(fraction) {
	return fraction;
};	
var linearEase = function(fraction) {
	return fraction;
};
				
/* Main screen layout */
var mainContainer = Container.template(function($) { return {
	left: 0, right: 0, top: 0, bottom: 0, active: false, skin: whiteSkin, name: 'mainContainer',
	contents: [
		Column ($, {left: 0, right: 0, top: 0, bottom: 0, name: 'contentColumn',
			contents: [
			   		Container($, {top: 5, left: 5, right: 5, height: 30, name: 'header',
			   			contents: [
			   			            Label($, {left: 10, top: 0, string: $[0].title, style: titleStyle, name: 'title'}),
				   			   		Picture($, {top: 0, right: 0, width: 30, height: 30, url: 'assets/menu.png',
						   				active: true, name: 'menuButton',
										behavior: Behavior({
											onTouchEnded: function(container, id, x, y, ticks) {
												application.mainContainer.add(new EquationMenu($), application.mainContainer.contentColumn);
											}										
										})
							   		})
	   			           ]
			   		
			   		}),
			   		Container($, {left: 0, right: 0, height: 160, skin: whiteSkin, name: 'coloredBoxHolder',
						contents: [
						           Content($, {height: 150, width: 150, skin: blueSkin, name: 'coloredBox'})
				          ],
				          behavior: Behavior({
				        	  colorBoxTransitionOut: function(container) {
				        		  container.run(new TransitionOut);
				        	  },
				        	  colorBoxTransitionIn: function(container) {
				        		  container.run(new TransitionIn);
				        	  }
				          })
					}),
					Container($, {left: 20, height: 40, right: 20,
						contents: [
					            Label($, {width: 125, height: 40, string: 'Transition', skin: buttonSkin, style: buttonStyle, active: true,
									behavior: Behavior({
										onTouchEnded: function(container, id, x, y, ticks) {
											application.distribute("colorBoxTransitionOut", container.container)
											application.distribute("colorBoxTransitionIn", container.container)
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
	behavior: Behavior({
		onCreate: function(column, data) {
			this.data = data;
		},
		onTouchEnded: function(container, id, x, y, ticks) {
			EasingFunctionOut = this.data.easingFunctionOut;
			EasingFunctionIn = this.data.easingFunctionIn;
			application.mainContainer.contentColumn.header.title.string = this.data.title;
			application.mainContainer.remove(application.mainContainer.menu);
		}
	}),
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
      				contents: $.map(function(item) {
      					return new EquationLine(item);
      				})
  				})
      		],
   		})
	]
}});

var TransitionOut = function() {
	Transition.call(this, TransitionDuration);
};
TransitionOut.prototype = Object.create(Transition.prototype, {
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
			this.layer.translation = {x:0, y: (-150 * EasingFunctionOut(fraction, 0, 0))};
		}
	}
});	   

var TransitionIn = function() {
	Transition.call(this, TransitionDuration);
};
TransitionIn.prototype = Object.create(Transition.prototype, {
	onBegin: { value: 
		function(container) {
			this.layer = new Layer();
			this.layer.attach(container.first);
			this.layer.translation = {x:0, y: -150};
		}
	},
	onEnd: { value: 
		function(container) {
			this.layer.detach();
		}
	},
	onStep: { value: 
		function(fraction) {
			this.layer.translation = {x:0, y: -150+(150 * EasingFunctionIn(fraction, 0, 0))};
		}
	}
});	
	
/* Application definition */
var ApplicationBehavior = function(application, data, context) {
	MODEL.ApplicationBehavior.call(this, application, data, context);
}
ApplicationBehavior.prototype = Object.create(MODEL.ApplicationBehavior.prototype, {
	onLaunch: { value: function() {
		var data = this.data = [
			{ title:'None (Linear)', easingFunctionOut:linearEase, easingFunctionIn:linearEase },
			{ title:'Quad', easingFunctionOut:Math.quadEaseOut, easingFunctionIn:Math.quadEaseIn },
			{ title:'Cubic', easingFunctionOut:Math.cubicEaseOut, easingFunctionIn:Math.cubicEaseIn },
			{ title:'Quart', easingFunctionOut:Math.quartEaseOut, easingFunctionIn:Math.quartEaseIn },
			{ title:'Quint', easingFunctionOut:Math.quintEaseOut, easingFunctionIn:Math.quintEaseIn },
			{ title:'Sine', easingFunctionOut:Math.sineEaseOut, easingFunctionIn:Math.sineEaseIn },
			{ title:'Circular', easingFunctionOut:Math.circularEaseOut, easingFunctionIn:Math.circularEaseIn },
			{ title:'Exponential', easingFunctionOut:Math.exponetialEaseOut, easingFunctionIn:Math.exponentialEaseIn },
			{ title:'Back', easingFunctionOut:Math.backEaseOut, easingFunctionIn:Math.backEaseIn },
			{ title:'Bounce', easingFunctionOut:Math.bounceEaseOut, easingFunctionIn:Math.bounceEaseIn },
			{ title:'Elastic', easingFunctionOut:Math.elasticEaseOut, easingFunctionIn:Math.elasticEaseIn },
		];
		application.add(new mainContainer(data));
	}}
})

var model = application.behavior = new ApplicationBehavior(application);
