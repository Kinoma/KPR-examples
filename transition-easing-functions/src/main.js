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
import SCROLLER from  'scroller';

/* Skins and Styles */
var blueSkin = new Skin ({fill: 'blue'});
var buttonSkin = new Skin ({fill: 'green'});
var menuSkin = new Skin ({fill: '#EEAAAAAA'});
var redSkin = new Skin ({fill: 'red'});
var whiteSkin = new Skin ({fill: 'white'});

var buttonStyle = new Style ({font: '22px', color: 'white', horizontal: 'center', vertical: 'middle'})
var hugeStyle = new Style ({font: 'bold 75px', color: 'white', horizontal: 'center', vertical: 'middle'})
var menuStyle = new Style ({font: 'bold 18px', horizontal: 'center', color: ['white','yellow'] });
var titleStyle = new Style ({font: '22px', color: '#000'});

/* Globals */
var TransitionDuration = 1750;

var linearEase = function(fraction) {
	return fraction;
};
				
/* Main screen layout */
var MainContainer = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, active: false, skin: whiteSkin,
	contents: [
		Column ($, {left: 0, right: 0, top: 0, bottom: 0,
			contents: [
				Container($, {top: 5, left: 5, right: 5, height: 30,
		   			contents: [
   			            Label($, {left: 10, top: 0, string: $.menu[0].title, style: titleStyle,
   			            	behavior: Behavior({
   			            		updateTitle: function(container, title) {
   			            			container.string = title;
   			            		}
   			            	})
   			            }),
	   			   		Picture($, {top: 0, right: 0, width: 30, height: 30, url: 'assets/menu.png',
			   				active: true, name: 'menuButton',
							behavior: Behavior({
								onTouchEnded: function(container, id, x, y, ticks) {
									application.distribute("onMenu");
								}										
							})
				   		})
					]
		   		}),
		   		Container($, {top: 0, width: 150, height: 150, clip: true,
					behavior: Behavior({
						onCreate: function(container, data) {
							this.easingItem = data.menu[0];
						},
						onEasingChanged: function(container, data) {
							this.easingItem = data;
							container.previous.first.string = data.title;
						},
						onTransition: function(container) {
							if (container.transitioning) return;
							container.run(new TransitionOut, this.easingItem.easingOutFunction, this.easingItem.title);
							container.run(new TransitionIn, this.easingItem.easingInFunction, this.easingItem.title);
						},
					}),
					contents: [
						Label($, {left: 0, right: 0, top: 0, bottom: 0, skin: blueSkin, style: hugeStyle, string: 'A'}),
						Label($, {left: 0, right: 0, top: 150, height: 150, skin: redSkin, style: hugeStyle, string: 'B'})
					],
				}),
				Container($, {top: 10, width: 150, height: 40, active: true, skin: buttonSkin,
					contents: [
			            Label($, {left: 0, right: 0, string: 'Transition', style: buttonStyle, active: true,
							behavior: Behavior({
								onTouchEnded: function(container, id, x, y, ticks) {
									application.distribute("onTransition");
								}
							})
						}),
					],	
				}),
			]           
		}),
		EquationMenu($, {visible: false})
	]
}));

var EquationLine = Line.template($ => ({
	active: true, left: 0, right: 0, top: 10, height: 30,
	behavior: Behavior({
		onCreate: function(column, data) {
			this.data = data;
		},
		onTouchBegan: function(container, id, x, y, ticks) {
			container.first.state = 1;
		},
		onTouchCancelled: function(container, id, x, y, ticks) {
			container.first.state = 0;
		},
		onTouchEnded: function(container, id, x, y, ticks) {
			container.first.state = 0;
			application.distribute("onEasingChanged", this.data);
		}
	}),
	contents: [
		Label($, {left: 0, right: 0, style: menuStyle, string: $.title}),
	] 
}));

var EquationMenu = Container.template($ => ({ top: 0, left: 0, right: 0, bottom: 0, skin: menuSkin,
	behavior: Behavior({
		onMenu: function(container) {
			container.visible = true;
		},
		onEasingChanged: function(container, id, x, y, ticks) {
			container.visible = false;
		}
	}),
	contents: [
		SCROLLER.VerticalScroller($, { 
			clip: true,
   			contents: [
      			Column($, { left: 0, right: 0, top: 0, 
      				contents: $.menu.map(function(item) {
      					return new EquationLine(item);
      				})
  				})
      		],
   		})
	]
}));

class TransitionOut extends Transition {
	constructor() {
		super(TransitionDuration);
	}
	onBegin(container, easingFunction, title) {
		application.distribute("updateTitle", title + 'Out');
		var content = container.first; 
		var newContent = container.last; 
		this.easingFunction = easingFunction;
		this.distance = content.height;
		this.layer = new Layer();
		this.layer.attach(content);
		this.newLayer = new Layer();
		this.newLayer.attach(newContent);
	}
	onEnd(container, easingFunction, title) {
		this.layer.detach();
		this.newLayer.detach();
		application.distribute("updateTitle", title);
	}
	onStep(fraction) {
		this.newLayer.translation = this.layer.translation = {x:0, y: (-this.distance * this.easingFunction(fraction, 0, 0))};
	}
};	   

class TransitionIn extends Transition {
	constructor() {
		super(TransitionDuration);
	}
	onBegin(container, easingFunction, title) {
		application.distribute("updateTitle", title + 'In');
		var content = container.first; 
		var newContent = container.last;		
		this.easingFunction = easingFunction;
		this.distance = content.height;
		this.layer = new Layer();
		this.layer.attach(content);
		this.layer.translation = {x:0, y: -this.distance};
		this.newLayer = new Layer();
		this.newLayer.attach(newContent);
	}
	onEnd(container, easingFunction, title) {
		this.layer.detach();
		this.newLayer.detach();
		application.distribute("updateTitle", title);
	}
	onStep(fraction) {
		this.newLayer.translation = this.layer.translation = {x:0, y: -this.distance+ (this.distance * this.easingFunction(fraction, 0, 0))};		
	}
};	
	
/* Application definition */
class AppBehavior extends Behavior {
	onLaunch(application) {
    	var data = this.data = {menu: [
			{ title:'linearEase', easingOutFunction:linearEase, easingInFunction:linearEase },
			{ title:'quadEase', easingOutFunction:Math.quadEaseOut, easingInFunction:Math.quadEaseIn },
			{ title:'cubicEase', easingOutFunction:Math.cubicEaseOut, easingInFunction:Math.cubicEaseIn },
			{ title:'quartEase', easingOutFunction:Math.quartEaseOut, easingInFunction:Math.quartEaseIn },
			{ title:'quintEase', easingOutFunction:Math.quintEaseOut, easingInFunction:Math.quintEaseIn },
			{ title:'sineEase', easingOutFunction:Math.sineEaseOut, easingInFunction:Math.sineEaseIn },
			{ title:'circularEase', easingOutFunction:Math.circularEaseOut, easingInFunction:Math.circularEaseIn },
			{ title:'exponentialEase', easingOutFunction:Math.exponentialEaseOut, easingInFunction:Math.exponentialEaseIn },
			{ title:'backEase', easingOutFunction:Math.backEaseOut, easingInFunction:Math.backEaseIn },
			{ title:'bounceEase', easingOutFunction:Math.bounceEaseOut, easingInFunction:Math.bounceEaseIn },
			{ title:'elasticEase', easingOutFunction:Math.elasticEaseOut, easingInFunction:Math.elasticEaseIn },
		]};
    	application.add(new MainContainer(data));
	}
}	
application.behavior = new AppBehavior();
