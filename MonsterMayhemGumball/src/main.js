//@program

var Pictures = {}; 				// cache of KinomaJS pictures
var KinomaGreen = new Skin({ fill: "#76b321" });
var NFC = {token: undefined};	// NFC token found
var MatchToWin;					// character id needed to win
var GameSpeed;					// length of time character shown
var GameCharacters;				// length of time character shown
var PreviousCharacterShowing;	// last character id shown
var CharacterShowing;			// character id showing

// load pictures into memory
function loading()
{
	// makePicture() is a helper function at the bottom of the script
	Pictures.characters = [];
	for (var i = 1; i <= 16; i++)
		Pictures.characters.push(makePicture("assets/things/NFCGuys-" + i + ".png"));

	Pictures.wrong = makePicture("assets/wrong.png")
	Pictures.correct = makePicture("assets/correct.png")
	Pictures.instructions = makePicture("assets/instructions.png")

	return instructions();
}

// show intructions where to put NFC card 
function instructions()
{
	// strip is a port object
	var stripBehavior = Behavior({
		onCreate: function(strip) {
			this.forward = true;
			this.index = 0;
			this.previousIndex = undefined;
			strip.duration = 300;
		},
		onDisplayed: function(strip) {
			// start() starts object's clock
			strip.start();
		},
		onFinished: function(strip) {
			this.previousIndex = this.index;
			if (this.forward) {
				if (7 == this.index) {
					this.forward = false;
					this.index = 6;
				}
				else
					this.index += 1;
			}
			else {
				if (0 == this.index) {
					this.forward = true;
					this.index = 1;
				}
				else
					this.index -= 1;
			}
			strip.time = 0;
			strip.start();
		},
		onNFCFound: function(strip, data) {
			show(setupGame);
		},
		onTimeChanged: function(strip) {
			// invalidate() invokes onDraw event
			strip.invalidate();
		},
		onDraw: function(strip) {
			var h = Pictures.instructions.height / 8;
			strip.drawImage(Pictures.instructions, 0, 0, 320, 240, 0, h * this.index, Pictures.instructions.width, h);
			if (undefined != this.previousIndex) {
				if (strip.fraction < 0.5) {
					strip.opacity = 1 - strip.fraction;
					strip.drawImage(Pictures.instructions, 0, 0, 320, 240, 0, h * this.previousIndex, Pictures.instructions.width, h);
					strip.opacity = 1;
				}
			} 
		}
	});

	return new Port({top: 0, left: 0, bottom: 0, right: 0, behavior: stripBehavior}); 
}
var settings;
// validate card. check number of plays.
function setupGame()
{
	// runs when NFC found
	
	try {
		if (NFC.commandData) {
			settings = JSON.parse(NFC.commandData);
			
			settings.tokenID = NFC.token;
		}
	}
	catch (e) {
	}
	/*if ("gum" in settings && settings.gum) {
		//clear card
		application.invoke(new MessageWithObject("pins:/nfc/mifare_WriteString",
		    		{page: 16, token: NFC.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], data: JSON.stringify({})}));
		 application.invoke(new MessageWithObject("pins:/gumball/dispense"));
		 return info("Enjoy your gumball!");
	}*/
	if ((typeof settings != "object") || !("id" in settings) || !("tries" in settings)) {
//@@		settings = {id: (Math.random() * Pictures.characters.length + 1) | 0, plays: 2};
		return info("bad card");
	}

	if (settings.tries <= 0)
		return info("No plays left!");

	return ready(settings);
}

// get user ready. select difficulty. show number of plays.
function ready(settings)
{
	var attempt = [undefined, "Last try", "Second try", "First try"];
	var levels = [undefined, "Easy", "Difficult", "Very difficult"];
	var times = [undefined, 1500, 900, 650];
	var characterCount = [undefined, 5, 11, 15];
	var behavior = Behavior({
		onDisplayed: function(container) {
			container.duration = 4 * 1000;
			container.start();
		},
		onFinished: function(container) {
			// Reduce play count stored on card by 1
			settings.tries -= 1;
		    application.invoke(new MessageWithObject("pins:/nfc/mifare_WriteString",
		    		{page: 16, token: NFC.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], data: JSON.stringify(settings)}));

			// start game
			show(game);
		},
		onNFCLost: function(container) {
			container.stop();
		},
		onNFCFound: function(container) {
			container.start();
		},
		onRemove: function(container) {
			container.empty();
		}
	});

	var countDownBehavior = Behavior({
		onDisplayed: function(label) {
			label.duration = 10 * 1000;
			label.start();
			this.running = true;
		},
		onTimeChanged: function(label) {
			if (this.running)
				label.string = (Math.round((1 - label.container.fraction) * 100) / 10).toPrecision(2);
		},
		onFinished: function(label) {
			show(instructions);
		},
		onNFCLost: function(label) {
			this.running = false;
			label.string = "Put card back!";
		},
		onNFCFound: function(label) {
			this.running = true;
			this.onTimeChanged(label);
			label.time = 0;		// reset timeout activity counter
		}
	});

	GameSpeed = times[settings.tries];
	GameCharacters = characterCount[settings.tries];
	MatchToWin = settings.id;

	var container = new Container({top: 0, left: 0, bottom: 0, right: 0, behavior: behavior, skin: new Skin({ fill: "white" })});
	if (settings.tries < 3) {
		var picturePort = new Port({top: 0, left: 0, bottom: 0, right: 0, behavior: behavior, skin: new Skin({ fill: "white" }),
			behavior: Behavior({
				onDisplayed: function(port) {
					port.duration = 3 * 1000;
					port.start();
				},
				onTimeChanged: function(port) {
					port.invalidate();
				},
				onDraw: function(port) {
					if (1 == settings.tries)
						port.drawImage(Pictures.characters[MatchToWin], -320 + port.fraction * 640, 130 + 8 - 16 * Math.sin(18 * Math.PI * port.fraction), 160, 120);
					else {
						if (port.fraction < 0.2)
							;
						else if (port.fraction < 0.4)
							port.drawImage(Pictures.characters[MatchToWin], 0, 240 - ((port.fraction - 0.2) * 5) * 160, 320, 240);
						else if (port.fraction < 0.6)
							port.drawImage(Pictures.characters[MatchToWin], 0, 240 - 160 + ((port.fraction - 0.4) * 5) * 140, 320, 240);
					}
				},
			})});
		container.add(picturePort);
	}
	
	container.add( new Label({
		left: 0, right: 0, top: 0, height: 50,
		style: new Style({color: "white", font: "bold 40px fira sans", horizontal: "center", vertical: "center"}),
		string: "Grab your monster!",
		skin: new Skin ({fill: "#76b321", stroke: "#f78e0f", borders: {bottom: 5}})
	}))
	
	container.add( new Text({
		left: 0, right: 0, top: 80, height: 80,
		style: new Style({ font:"bold 35px", color:"#76b321", horizontal:"center", vertical:"middle" }),
		string: attempt[settings.tries] + ":\n" + levels[settings.tries]
	})); 
	container.add( new Label({
		left: 0, right: 0, top: 175, height: 50,
		style: readyStyle,
		behavior: countDownBehavior,
	}));

	return container;
}

// play the game
function game()
{
	var gameBehavior = Behavior ({
		onDisplayed: function(game) {
			CharacterShowing = PreviousCharacterShowing = undefined;

			game.duration = GameSpeed;

			// shuffle characters, reduce count based on level
			var characters = this.characters = Pictures.characters.slice();
			var winner = characters.splice(MatchToWin, 1)[0];
			shuffle(characters);
			characters.length = GameCharacters;
			characters.push(winner);
			shuffle(characters);

			this.nextCharacter(game);
			game.start();
		},
		onFinished: function(game) {
			if (0 == this.characters.length) {
				CharacterShowing = PreviousCharacterShowing = undefined;
				show(gameOver(false));
				return;
			}
			this.nextCharacter(game);
			game.time = 0;
			game.start();
		},
		nextCharacter: function(game) {
			var character = this.characters.shift();
			var url = character.url;
			var parts = url.split("/");
			path = parts[parts.length - 1];
			parts = path.split("-");
			PreviousCharacterShowing = CharacterShowing; 
			CharacterShowing = parseInt(parts[parts.length - 1]) - 1;
			game.run(new CharacterTransition, game.first, character); 
		},
		onNFCLost: function(game) {
			game.empty();
			if (game.time < (game.duration * 0.25))
				CharacterShowing = PreviousCharacterShowing;
			show(gameOver(MatchToWin == CharacterShowing));
		},
		onRemove: function(game, win) {
			game.empty();
		}
	});
	return new Container({top: 0, left: 0, bottom: 0, right: 0, behavior: gameBehavior});
}
var winningID = [];
// someone won or lost
function gameOver(win)
{
	var picture = win ? Pictures.correct : Pictures.wrong;


	picture.behavior = Behavior({
		onFinished: function(picture) {
			if (winningID.length == 0) {
				picture.stop();
				show(instructions);
			}
		},
		onNFCFound: function(picture, data) {
			
			//considered checking id to make sure the put down card is the same but probably irrelevant, would make
			//restart required if the winning card got lost somewhere
			if (equalArrays(winningID, data.token)) {
			 application.invoke(new MessageWithObject("pins:/nfc/mifare_WriteString",
		   		{page: 16, token: NFC.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], data: JSON.stringify({id:1, tries:0})}));
		   		application.invoke(new MessageWithObject("pins:/gumball/dispense"));
		   		show(info("Enjoy your gum!"));
		   		return;
			} 
			if (winningID.length == 0) {
				show(setupGame);
			}
		}
	});

	picture.duration = 5000;
	picture.time = 0;
	picture.start();
	var wrapper = new Column({left:0, bottom:0, right:0, top:0});
	var container = new Container({top: 0, left: 0, bottom: 0, right: 0, clip:true, behavior: Behavior({
		onRemove: function(container) {
			container.empty();
		}})});
	var titleText = new Style({color: "black", font: "bold 35px fira sans", horizontal: "center", vertical: "center"});
	var subtitleText = new Style({color: "black", font: "bold 30px fira sans", horizontal: "center", vertical: "center"});
	if (undefined !== CharacterShowing) {
		container.add(Pictures.characters[CharacterShowing]);
		Pictures.characters[CharacterShowing].coordinates = {left: 0, top: 0, bottom:0, right:0};
	}
	else
		container.add(new Content({left:0, right:0, top:0, bottom:0, skin: new Skin({fill: "white"})}));
	
	container.add(picture);
	//wrapper.add(container);
	//layering -> put on top of picture
	if (win) {
		container.add(new Label({left:0, right:0,  top:0, string:"Congratulations!", style:titleText}));
		container.add(new Label({left:0, right:0,  bottom:0, string:"Put down card for a gumball", style:subtitleText}));
		winningID = settings.tokenID;
		//settings.gum = true;
		//application.invoke(new MessageWithObject("pins:/nfc/mifare_WriteString",
		 //   		{page: 16, token: NFC.token, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], data: JSON.stringify(settings)}));
	} else {
		winningID = [];
		container.add(new Label({left:0, right:0,  top:0, string:"Try again!", style:titleText}));
	}
	return container;
}

// show a message until an NFC event
function info(message)
{
	
	var screen = new InfoScreen(message); // InfoScreen is a container template
	screen.behavior = Behavior({
		onNFCLost: function() {
			
			show(instructions);
		},
		onNFCFound: function() {
			
			show(instructions);
		}
	});
	return screen;
}

// receiver for NFC events
Handler.bind("/nfcChanged", {
	onInvoke: function(handler, message) {
		NFC = message.requestObject;
		if (NFC.token)
			application.distribute("onNFCFound", NFC);
		else
			application.distribute("onNFCLost");
	}
});

application.behavior = Behavior({
	onComplete: function(application, message, text) {
		if (0 != message.error) {
			show(message("NFC initialization failed (" + message.error + ")"));
			return;
		}

		show(loading);

        application.invoke(new MessageWithObject("pins:/nfc/poll?repeat=on&callback=/nfcChanged&interval=100",
        			{command: "mifare_ReadString", commandParams: {page: 16, token: null, key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]}}));
	},
	onLaunch: function(application) {
        var message = new MessageWithObject("pins:configure", {
            nfc: {
                require: "PN532",
                pins: {
                    data: {sda: 27, clock: 29}
                }
            },
            gumball: {
                require: "gumball",
                pins: {
                    transistorBase: {pin: 23}
                }
            }
            });
        application.invoke(message, Message.TEXT);

		show(info("Initializing NFC"));
	}
});

/*
	etc
*/

// bounce in character transition
var CharacterTransition = function() {
   Transition.call(this, 600);
};
CharacterTransition.prototype = Object.create(Transition.prototype, {
   onBegin: { value: 
      function(game, lastCharacter, nextCharacter) {
         game.add(nextCharacter);
         this.nextCharacter = nextCharacter;
         this.onStep = [this.fromLeft, this.fromRight, this.fromTop, this.fromBottom][Math.floor(Math.random() * 4)];
      }
   },
   onEnd: { value: 
      function(game, lastCharacter, nextCharacter) {
         if (lastCharacter)
         	game.remove(lastCharacter);
      }
   },
   fromTop: { value: 
      function(fraction) {
      	this.nextCharacter.coordinates = {top: -Math.bounceEaseIn(1 - fraction) * 240, left: 0};
      }
   },
   fromBottom: { value: 
      function(fraction) {
      	this.nextCharacter.coordinates = {top: 240 * Math.bounceEaseIn(1 - fraction), left: 0};
      }
   },
   fromLeft: { value: 
      function(fraction) {
      	this.nextCharacter.coordinates = {top: 0, left: -Math.bounceEaseIn(1 - fraction) * 320};
      }
   },
   fromRight: { value: 
      function(fraction) {
      	this.nextCharacter.coordinates = {top: 0, left: 320 * Math.bounceEaseIn(1 - fraction)};
      }
   },
});

// switch to a new screen
function show(screen)
{
	application.distribute("onRemove");
	application.empty();
	application.add(typeof screen == "function" ? screen() : screen)
}

// Screen to show information message
var infoStyle = new Style({ font:"bold 40px", color:"white", horizontal:"center", vertical:"middle" });
var readyStyle = new Style({ font:"bold 40px", color:"#76b321", horizontal:"center", vertical:"middle" });
var InfoScreen = Container.template(function($) { return {
	left:0, right:0, top:0, bottom:0, skin: KinomaGreen,
	contents: [
		Label($, { left:0, right:0, top:0, bottom:0, style: infoStyle, string: $ })
	]
}});

// container filling picture from relative path
function makePicture(path, aspect) {
	return new Picture({top: 0, left: 0, bottom: 0, right: 0,
					aspect: aspect ? aspect : "fill",
					url: mergeURI(application.url, path)
				});
}

// shuffle array
function shuffle(characters)
{
	for (var i = 0; i < characters.length; i++) {
		var j = (Math.random() * characters.length) | 0;
		var temp = characters[i];
		characters[i] = characters[j];
		characters[j] = temp;
	}
}
function equalArrays(a, b)
{
    if (!Array.isArray(a) || !Array.isArray(b))
        return false;

    if (a.length != b.length)
        return false;

    for (var i = 0; i < a.length; i++)
        if (a[i] != b[i])
            return false;

    return true;
}

