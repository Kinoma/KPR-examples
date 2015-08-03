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
THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');


/*
levelSpeed stores dx values for levels to make sheep run at different speeds
set levelSpeeds to be faster (i.e. 20, 30, 40) if playing on actual Create; it's much easier with an actual button*/
var levelSpeed = {'easy': 4, 'medium': 8, 'hard': 12};

var times = []; //used to store player's reaction times
var level = "medium";
var reading = false; //true if game is in progress
var cheated = false;
var tooSlow = false;
var sheep, sheep2, sheep3, currentRunner;


////////// Skins, styles, and templates ////////// 
var blueSkin = new Skin({ fill: "#3399FF" });
var yellowSkin = new Skin({ fill: "#FFFF33", stroke:"#26A48F", borders: {left: 0, right: 3, top: 0, bottom: 3} });
var lightGreenSkin = new Skin({  fill: "#90B3FF49", stroke:"#9076b321", borders: {left: 0, right: 2, top: 0, bottom: 2} });
var selectedSkin = new Skin({ fill: "#B3FF49", stroke:"#76b321", borders: {left: 0, right: 2, top: 0, bottom: 2} });
var bigText = new Style({font:"bold 32px", color:"black"});
var timeText = new Style({font:"normal 28px", color:"black"});
var normalText = new Style({font:"normal 22px", color:"black"});

var FeedbackString = Label.template(function($){ return{
	name: "FeedbackString", duration: 1200, top:10,left: 0, right: 0, height: 40, string: $.string, style: bigText,
	behavior: Behavior({
		onCreate: function(container, data) {
			container.start();
		},
		onFinished: function(container, data){
			application.remove(container);
		},
	})
}});


var LevelButton = BUTTONS.Button.template(function($){ return{
	skin: lightGreenSkin, top:0, height:40, left:3, right:3,
	contents:[
		new Label({top:0,left: 0, right: 0, height: 40, string: $.string, style: normalText})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value:  function(button){
			LevelButtons[0].skin = lightGreenSkin;
			LevelButtons[1].skin = lightGreenSkin;
			LevelButtons[2].skin = lightGreenSkin;
			button.skin = selectedSkin;
 			level = $.string;
		}}
	})
}});

var LevelButtons = [new LevelButton({string: "easy"}), new LevelButton({string: "medium"}), new LevelButton({string: "hard"})];
LevelButtons[1].behavior.onTap(LevelButtons[1]);


var StartButton = BUTTONS.Button.template(function($){ return{
	skin:blueSkin, top:5, left:50, right:50, 
	contents:[
		new Label({ skin: yellowSkin, top:0,left: 0, right: 0, height: 55, string: $.string, style: bigText})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value:  function(button){
 			switchScreen($.screen);
		}}
	})
}});


var TimesPageLine = Line.template(function($){ return{
	left:0, right:0, top:$.top, 
	contents: [
  		new Label({left:0, right:0, height: 30, string: $.string, style: $.style})
  	]
}});



////////// Animal templates/behavior ////////// 
var MainScreenSheepBehavior = function (dx, dy) {
	this.dx = dx;
	this.dy = dy
}
MainScreenSheepBehavior.prototype = Object.create(Object.prototype, {
	onDisplaying: {
		value: function(animal) {
			animal.state = 0;
			animal.start();
		}
	},
	onTimeChanged: {
		value: function(animal) {
			if (this.dy <= -50) {
				this.dy = this.dy;
			} else {
				this.dy = this.dy-0.25;
			}
			animal.translation = {x: this.dx, y:this.dy};
		}
	},
});


var Animal =  Picture.template(function($) { return {
  name: $.name, left:$.leftMargin, top: $.topMargin, width:75, height:75, url:$.url
}});

var AnimalBehavior = function (dx, dy) {
	this.dx = dx;
	this.dy = dy
}
AnimalBehavior.prototype = Object.create(Object.prototype, {
	onDisplaying: {
		value: function(animal) {
			//animal.start();
		}
	},
	onStart: {
		value: function(animal) {
			animal.start();
			date = new Date();
			times[times.length] = date.getTime();
		}	
	},
	onTimeChanged: {
		value: function(animal) {
			animal.moveBy(this.dx, this.dy);
			var x = animal.x - animal.container.x;
			var y = animal.y - animal.container.y;		
			if (x >= animal.container.width+25) {
				//stop reading button and write penalty time (5s) into times
				times[times.length-1] = 5000;
				if (!cheated) {
					tooSlow = true;
					application.add(new FeedbackString({string:"Too slow!"}));
				}
				animal.stop();
				if (animal == currentRunner) startNextAnimal(animal);
			}		
		}
	},
	buttonClicked: {
		value: function(animal) {
			if (!cheated) animal.stop();
			reading = false;
			date = new Date();
			if (animal == currentRunner) {
				times[times.length-1] = date.getTime() - times[times.length-1];
				var x = animal.x - animal.container.x;
				if (x < animal.container.width/2) {
					application.add(new FeedbackString({string:"...not bad"}));
				} else if (x < animal.container.width+25) {
					application.add(new FeedbackString({string:"Be faster!"}));
				} 
			}
			startNextAnimal(animal);
		}
	}
});


var StationaryAnimal =  Picture.template(function($) { return {
	name: $.name, left:$.leftMargin, top: $.topMargin, width:75, height:75, url:$.url, behavior: new StationaryAnimalBehavior($.dx, $.dy) 
 }});
 
var StationaryAnimalBehavior = function (dx, dy) {
	this.dx = dx;
	this.dy = dy;
}
StationaryAnimalBehavior.prototype = Object.create(Object.prototype, {
	onDisplaying: {
		value: function(animal) {
			animal.subPixel = true;
			animal.start();
		}
	},
	onStart: {
		value: function(animal) {
			animal.state = 0;
		}	
	},
	onTimeChanged: {
		value: function(animal) {
			var dx = this.dx;
			var dy = this.dy;
			var x = animal.x - animal.container.x;
			var y = animal.y - animal.container.y;	
			switch(animal.name) {
				case "sheep1":
				// wait a bit, then move down and right
					animal.state += 1;
					if ((animal.state > 600) && (animal.state < 1600)) {
						this.dx = this.dx+0.1;
						this.dy = this.dy+0.05;
					} else {
						this.dx = this.dx;
						this.dy = this.dy;			
					}
					animal.translation = { x: this.dx, y: this.dy };		
					break;
				case "sheep2":
				// Jump up and down 3 times, pause, then jump until game is over
					if ((animal.state > 5) && (animal.state < 201)) { //standing still
						this.dx = this.dx;
						this.dy = this.dy;
						animal.state += 1;
					} else if ((animal.state)%2 == 0) { //going up
						if (this.dy < -5.25) animal.state += 1;
						if (this.dy < -5) {
							this.dy = this.dy-0.1;
						} else if (this.dy < -4) {
							this.dy = this.dy-0.25;
						} else {
							this.dy = this.dy-0.65;
						}
					} else { //going down
						if (this.dy > 0) animal.state += 1;
						if (this.dy < -5) {
							this.dy = this.dy+0.1;
						 } else if (this.dy < -4) {
							this.dy = this.dy+0.25;
						} else {
							this.dy = this.dy+0.65;
						}
					}
					animal.translation = { x: 0, y: this.dy };
					break;
				case "sheep3":
				// does nothing
					break;
				case "sheep4":
				// move right, pause, move left, pause, then move down and right
					animal.state += 1;
					if ((animal.state%500) < 250) {
						if ((this.dx <4) && (animal.state > 500)) {
							this.dy = this.dy-0.25;
							this.dx = this.dx+0.1;
						} else if (this.dx < 4) {
							this.dx = this.dx+0.1;
						} else {
							this.dx = 4;
						}
					} else if ((animal.state)%500 >= 251) {
						if (this.dx > 0) {
							this.dx = this.dx-0.1;
						} else {
							this.dx = 0;
						}					
					}
					animal.translation = {x: this.dx, y:this.dy};
					break;
				case "sheep5":
				//eyes move, so sheep doesn't do anything
					break;	
				case "sheep5eyes":
					animal.state += 1;
					if ((animal.state%1500) < 100) {
						this.dy = this.dy - 0.05;
					} else if ((animal.state%1500) < 200) {
						this.dy = this.dy + 0.05;
					} else {
						this.dy = this.dy;
					}
					animal.translation = {x: this.dx, y:this.dy};
					break;						
			}
		}
	},
});


// use the following to delay the current runner for a random amount of time
var TimerContainer = Container.template(function($) { return { width: 0, height: 0, behavior: Object.create(RandomRunBehavior.prototype) }});
var RandomRunBehavior = Behavior.template({
	onCreate: function(container, data) {
		reading = false;
		runDelay = getRandomIntInclusive(1000,6000);
		container.duration = runDelay;
		container.start();
	},
	onFinished: function(container) {
		currentRunner.behavior = new AnimalBehavior(levelSpeed[level],0);
		reading = true;
		tooSlow = false;
		currentRunner.behavior.onStart(currentRunner);
	},
});




////////// Handlers ////////// 
Handler.bind("/gotButtonResult", Object.create(Behavior.prototype, {
	onInvoke: { value: 
		function(handler, message) {            
             var readResult = message.requestObject;            
             if (( readResult == true ) && (reading) && (!cheated)) { //if button is clicked when no animal is running, nothing happens              
                application.distribute( "buttonClicked" );
             } else if ((readResult == true) && (currScreen.name = "gameScreen")) {
             	if ((!cheated) && (!tooSlow)){
             		application.add(new FeedbackString({string:"Stop cheating!"})); 
             		cheated = true;
             	} else if (!tooSlow){
             		application.add(new FeedbackString({string:"Cheaters never prosper"})); 
             	}
             }
		},
	},
}));




////////// Other functions ////////// 
function getRandomIntInclusive(min, max) {
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// returns a random int x such that min<=x<=max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function switchScreen(screen) {
	application.remove(currScreen);
	switch (screen) { 
		case "startScreen":
			mainScreenSheep.translation = {x:0, y:0};
			application.add(main);
			currScreen = main;
			break;
		case "game":
			currScreen = new gameScreen();
			application.add(currScreen);
			currScreen.add(new TimerContainer({animal: sheep}));
			break;
		case "times":
			application.add(timesScreen);
			currScreen = timesScreen;
			break;
	}
}

function startNextAnimal(thisAnimal) {
	cheated = false;
	switch(thisAnimal.name) {
		case "sheep":
			application.add(new TimerContainer());
			currentRunner = sheep2;
			break;
		case "sheep2":
			application.add(new TimerContainer());
			currentRunner = sheep3;		
			break;
		case "sheep3":
			currentRunner = "";
			// calculate average and put time strings on timesScreen
			overallAverage = Math.round((times[0]+times[1]+times[2])/3);
			average = new TimesPageLine({top:20, string: "Average: "+String(overallAverage/1000)+"s", style: bigText});
			try1 = new TimesPageLine({top:5, string: "Round 1: "+String(times[0]/1000)+"s", style: timeText});
			try2 = new TimesPageLine({top:5, string: "Round 2: "+String(times[1]/1000)+"s", style: timeText});
			try3 = new TimesPageLine({top:5, string: "Round 3: "+String(times[2]/1000)+"s", style: timeText});
			timesScreen.empty(0);
			timesScreen.add(average);
			timesScreen.add(try1);
			timesScreen.add(try2);
			timesScreen.add(try3);
			timesScreen.add(new StartButton({string:"Start Over", screen:'startScreen'}));
			newanimal = new Animal({name:"sheep", topMargin: -150, leftMargin: 5, url: "images/sheep2.png"});
			timesScreen.add(newanimal);
			newanimal = new Animal({name:"sheep", topMargin: -70, leftMargin: 240, url: "images/sheep3.png"});
			timesScreen.add(newanimal);		
			switchScreen("times");
			times = [];
	}
	thisAnimal.behavior = null;
}




////////// Screen templates and application set-up ////////// 
var mainScreenSheep = new Picture({name:"mainsheep", height:100, width:100, bottom: -100, left:0, right:0, url: "images/sheep3.png"});
mainScreenSheep.behavior = new MainScreenSheepBehavior(0, 0.1);
var main = new Container({left: 0, right: 0, top: 0, bottom: 0, skin: blueSkin,
	contents:[
		new Line({top:90, left:0, right:0, 
			contents: [
				new StartButton({string:"Start Game", screen:'game'}),
			]}),
		new Line({top:45, left:25, right:25, 
			contents: [
				LevelButtons[0],
				LevelButtons[1],
				LevelButtons[2],
			]}),
		mainScreenSheep,
	],
});

var currScreen = main;
application.add(main);

var gameScreen = Container.template(function($){ return{
	name: "gameScreen", left: 0, right: 0, top: 0, bottom: 0, skin: new Skin({ fill: "#8FCC3A" }),
	contents:[
		// 5 sheep that make subtle movements but don't run in somewhat random places on left side
		new StationaryAnimal({name: "sheep1", dx: 0, dy: 0.1, topMargin: 0, leftMargin: getRandomIntInclusive(-10, 5), url: "images/sheep2.png"}),
		new StationaryAnimal({name: "sheep2", dx: 0, dy: -1, topMargin: getRandomIntInclusive(30, 55), leftMargin: getRandomIntInclusive(-5, 5), url: "images/sheep5.png"}),
		new StationaryAnimal({name: "sheep3", dx: 0.5, dy: -0.5, topMargin: 80, leftMargin: getRandomIntInclusive(5, 10), url: "images/sheep5.png"}),
		new StationaryAnimal({name: "sheep4", dx: -1, dy: -1, topMargin: getRandomIntInclusive(110, 135), leftMargin: getRandomIntInclusive(0, 15), url: "images/sheep2.png"}),
		new StationaryAnimal({name: "sheep5", dx: -1, dy: 0, topMargin: 160, leftMargin: -5, url: "images/sheep6.png"}),
		new StationaryAnimal({name: "sheep5eyes", dx: -1, dy: 0, topMargin: 160, leftMargin:-5, url: "images/sheep6eyes.png"}),
	],
	behavior: Behavior({
		onCreate: function(container, data){
			// add 3 sheep that will run across the screen
			// these are global variables to make it easier to access them later
			sheep = new Animal({name:"sheep", topMargin: getRandomIntInclusive(0, 160), leftMargin: -75, url: "images/sheep2.png"});
			sheep2 = new Animal({name:"sheep2", topMargin: getRandomIntInclusive(0, 160), leftMargin:-75, url: "images/sheep2.png"});
			sheep3 = new Animal({name:"sheep3", topMargin: getRandomIntInclusive(0, 160), leftMargin: -75, url: "images/sheep2.png"});
			container.add(sheep3);
			container.add(sheep2);
			container.add(sheep);
			currentRunner = sheep;	
		},
	})
}});

var timesScreen = new Column({
// filled in switchScreen function
  left:0, right:0, top:0, bottom:0,
  skin: blueSkin,
  contents:[]
});


// Set up for communication with hardware pins.
application.invoke( new MessageWithObject( "pins:configure", {
	button: {
        require: "button",
        pins: {
            button: { pin: 52 }
        }
    }
}));

// Continuously check to see if button was pressed
application.invoke( new MessageWithObject( "pins:/button/wasPressed?" + serializeQuery({       
		repeat: "on",
		interval: 20,
		callback: "/gotButtonResult"
	})
));     
