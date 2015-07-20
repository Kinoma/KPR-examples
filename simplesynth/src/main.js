//@program
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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

// ---------------------------------------------------------------------------------------------------------
// Global Vars
// ---------------------------------------------------------------------------------------------------------
// Global for synth type
synthoption = "";
// Global for analogvalue
aval = 2048;

// ---------------------------------------------------------------------------------------------------------
// Skins
// ---------------------------------------------------------------------------------------------------------
var keyBoardSkin = new Skin({fill: [ "#59C92C"]});//Kinoma Green!
var keySkin = new Skin({ fill: ["white", "silver"], stroke:"silver", borders: {left: 1, right: 1, top: 1, bottom: 1} });
var halfkeySkin = new Skin({ fill: ["black", "silver"], stroke:"silver", borders: {left: 1, right: 1, top: 1, bottom: 1}});

// ---------------------------------------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------------------------------------
var synthTexture = new Texture("./assets/synthiconsborder.png");
var synthStates = new Skin({ texture: synthTexture,  x:0, y:0, width:80, height:80, states:80, variants:80 });

// ---------------------------------------------------------------------------------------------------------
// UI elements
// ---------------------------------------------------------------------------------------------------------
// White keys template
var Key = Content.template(function($) { return {
    top: 2, width: 38, height: 150, skin: keySkin,
    behavior: Behavior({
        onCreate: function(container, data) {
            this.frequency = data;
        },
    }),
}});

// Black keys template
var halfKey = Content.template(function($) { return {
    top: 2, width: 18, height: 90, skin: halfkeySkin,
    behavior: Behavior({
        onCreate: function(container, data) {
            this.frequency = data;
        }, 
    }),
}});

// Synth mode buttons template 
var synthButton = Content.template(function($) { return {
	top:0, width:78, height:78, skin: synthStates, variant: $, state: "OFF", 
	behavior: Behavior({
		onCreate: function(container, data){
			this.name = data;
		},
	}),
}});

// Button tray container template
var buttonTray = Container.template(function($) { return {
	left: 0, right: 0, top: 160, bottom: 0, active: true, 
	behavior: Behavior({
		// Calculate index of button of touched based on x-y
		 hitIndex: function(container, x, y) {
            y -= container.y;
            if ((0 <= y) && (y < 80)) {     	
	           		x -= container.x;
	                return Math.floor(x / 80);	            
            }
            return -1;
        },
        // Determines current touch index, compares to current, switches modes accordingly
        hitTouch: function(container, id, current) {
            var former = this.touches;
            if (former != current && current != -1) {
            	if(former >=0)
                	container.content(former).state = 0;               
                if(current>=0)
                	container.content(current).state = 1;
                	if(current == 0) synthoption = "";
                	if(current == 1) synthoption = "violin";
                	if(current == 2) synthoption = "bell";
                	if(current == 3) synthoption = "laser";
                this.touches = current;           
            }	
        },
        // Initialize touch value -> default synth option
        onCreate: function(container, data) {
            this.touches = 0;
            container.first.state = 1;
            synthoption = "";
        },
        // Fires on a touch
        onTouchBegan: function(container, id, x, y, tick) {
            this.hitTouch(container, id, this.hitIndex(container, x, y));
        },		
    }),
    // Map synthesizer mode buttons
    contents: $.map(function(name, index) {
    	return new synthButton(name, {left: index*80});     	
	}),	
}})

// Keyboard container template
var Keyboard = Container.template(function($) { return {
    left: 0, right: 0, top: 0, bottom: 0, active: true, multipleTouch: true, skin: keyBoardSkin,
    behavior: Behavior({
        // Hit based on x-y coords
        hitIndex: function(container, x, y) {
            y -= container.y;
            if ((2 <= y) && (y < 150)) {
            	if( y < 90) {    
            		x -= container.x;
		            // Black key hitbox
		            if( 30 < x && x < 50) return 8; 
		            if( 70 < x && x < 90) return 9;
		            if( 150 < x && x < 170) return 10;
		            if( 190 < x && x < 210) return 11;
		            if( 230 < x && x < 250) return 12;
		            if( 300 < x ) return 13;
		            else return Math.floor(x/40);
	            }
	            // Else white key hitbox
	           	else {
	           		x -= container.x;
	                return Math.floor(x / 40);
	            }
            }
            return -1;
        },
        // Determines current touch ids, sends to update frequencies
        hitTouch: function(container, id, current) {
            var former = this.touches[id];
	            if (former != current) {
	                if (former >= 0)
	                    container.content(former).state = 0;
	                if (current >= 0)
	                    container.content(current).state = 1;
	                this.touches[id] = current;
	                this.updateFrequencies(container);
	            }	    
        },
        // Tracks analog sensor value
        onAnalogValueChanged: function(container, result) {
        	// Function defines how analog value(0-1) changes audio amplitude(loudness)
            var test = (2*result+.5) *aval;
            // Change Amplitude with analog input values 
            application.invoke(new MessageWithObject("pins:/audio/setAmplitude", test));
		},
        // Initialize array for multi touch
        onCreate: function(container, data) {
            this.touches = [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        },
        // Fires on a touch
        onTouchBegan: function(container, id, x, y, tick) {
            this.hitTouch(container, id, this.hitIndex(container, x, y));
        },
        // Send -1 flag to hittouch
        onTouchEnded: function(container, id, x, y, tick) {
            this.hitTouch(container, id, -1);
        },
        // Fires on a touch position change
        onTouchMoved: function(container, id, x, y, tick) {
            this.hitTouch(container, id, this.hitIndex(container, x, y));
        },       
		// Runs after detecting touch(es) 
        updateFrequencies: function(container) {
            var frequencies = [];
            var capped = [];                  
            // For each key currently being touched	
            for (var content = container.first; content; content = content.next){
	                if (content.state){           	
	                	// Assigns frequency to the active frequency array. 
	                	frequencies.push(content.behavior.frequency );
	                	// Caps complex modes to one frequency
	                	capped[0] = frequencies[0];	
	                }   
            }
            // Uses synthoption global variable to determine synthesizer mode
            if(synthoption == "violin"){
           		application.invoke(new MessageWithObject("pins:/audio/setFrequenciesViolin", capped));	
            }
            else if(synthoption == "bell"){
           		application.invoke(new MessageWithObject("pins:/audio/setFrequenciesBell", capped));
            }
            else if(synthoption == "laser"){
           		application.invoke(new MessageWithObject("pins:/audio/setFrequenciesLaser", capped));
            }
            else
            	// Restrict total # of keys pressed to 5
            	if(frequencies.length > 5){
           			var filtered = frequencies.slice(0,5);
           			application.invoke(new MessageWithObject("pins:/audio/setFrequencies", filtered));  
           		}
           		else 
           			application.invoke(new MessageWithObject("pins:/audio/setFrequencies", frequencies));      		
        },
    }),
    // Maps keys. white keys are 0-7 index, black keys after
    contents: $.map(function(frequency, index) {
    	if ( index < 8) return new Key(frequency, { left: index * 40 });
    	else if ( index < 10) return new halfKey(frequency, { left: 30 + (index-8) * 40 });
       	else if ( index < 13) return new halfKey(frequency, { left: 150 + (index-10) * 40 });
       	else return new halfKey(frequency, { left: 310});
    }),
}});

// ---------------------------------------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------------------------------------
// Callback handler for analog input
Handler.bind("/gotAnalogResult", Behavior({
	onInvoke: function(handler, message){
		var result = message.requestObject;  
        application.distribute( "onAnalogValueChanged", result ); 	
	},
}));

// ---------------------------------------------------------------------------------------------------------
// Application behavior
// ---------------------------------------------------------------------------------------------------------
// Construct instances of preceding templates/prototypes
application.behavior = Behavior({
	// Checks for configuration errors
	onComplete: function(application, message) {
		// If config error
        if (0 != message.error) {
            application.skin = new Skin({ fill: "#f78e0f" });
            var style = new Style({ font:"bold 36px", color:"white", horizontal:"center", vertical:"middle" });
            application.add(new Label({ left:0, right:0, top:0, bottom:0, style: style, string:"Error " + message.error }));
            return;
        }
		
        /* Use the initialized analogSensor object and repeatedly 
	   	call its read method with a given interval(20ms).  */
		application.invoke(new MessageWithObject("pins:/analogSensor/read?repeat=on&interval=20&callback=/gotAnalogResult"));	
		// Initialized keyboard, data passed are notes C,D,E,F,G,A,B,C scale, plus all half steps added in order at the end.
		application.add(new Keyboard([523, 587, 660, 698, 783, 880, 988, 1046, 554, 622, 740, 831, 932, 1109]));
		// Initialized buttons to the variants defined in theme.xml
        application.add(new buttonTray([0,1,2,3]));     
		/* Use the initialized audio object and repeatedly 
    	   call its synthesize method with a given interval.  */
        application.invoke(new MessageWithObject("pins:/audio/synthesize?repeat=on&timer=speaker&callback=/getSamples"));
        // Starts audio output hardware 
        application.invoke(new MessageWithObject("pins:/audio/start"));  
   },
   // Configures Audio, and analog pins on start
   onLaunch: function(application,message) {       
		// Configure audio, and sound
        application.invoke(new MessageWithObject("pins:configure", {
            audio: {
                require: "synthOut",
                pins: {
                /* Lowered sampleRate from 8k to 4k, to allow for more 
                   simultaneous tones (to support synth modes). You get ~5 at 4k, and ~3 at 8k.*/
                    speaker: {sampleRate: 4000, amplitude: aval}
                    }
            },
            // Configuration for analog sensor. 
            analogSensor: {
			    require: "analog",
			    pins: {
		       	 analog: { pin: 54 }
		      	} 
		    },	
		  
        }),Message.JSON);              	
    }
});