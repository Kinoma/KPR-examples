/*
  Copyright 2011-2016 Marvell Semiconductor, Inc.

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

/* ASSETS */

var recordButtonColor = "ff0000";
var playButtonColor = "000000";
var buttonBackgroundColor = "B2B2B2";

var getColorWithTransparency = function(color, percentage) {
	var alpha = Math.floor( 255 * percentage / 100 );
	alpha = alpha.toString( 16 );
	return "#" + alpha + color;
};

/* BEHAVIORS */

export class PlayButtonBehavior extends Behavior {
	draw( canvas, pressed ) {
		var ctx = canvas.getContext( "2d" );
		var w = canvas.width;
		var h = canvas.height;	
		var backgroundFillStyle;
		var fillStyle; 
		if ( pressed ){
			backgroundFillStyle = getColorWithTransparency( buttonBackgroundColor, 100 );
			fillStyle = getColorWithTransparency( playButtonColor, 100 );
		} else{
			backgroundFillStyle = getColorWithTransparency( buttonBackgroundColor, 80 );
			fillStyle = getColorWithTransparency( playButtonColor, 80 );
		}
		ctx.fillStyle = backgroundFillStyle;
		ctx.clearRect( 0, 0, w, h );
        ctx.fillRect( 0, 0, w, h );
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = fillStyle;
        ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo( w / 3, h / 4 )
		ctx.lineTo( w / 3, ( 3 * h ) / 4  );
		ctx.lineTo( ( 2 * w ) / 3, h / 2 );
		ctx.lineTo( w / 3, h / 4 )
        ctx.stroke();
        ctx.fill();
	}
	onDisplaying( canvas ) {
		this.draw( canvas, false );
		canvas.interval = 70;
		canvas.start();
		this.playCompleteTime = false;		
		this.runTime = false;
	}
	onTimeChanged( canvas ){
		if ( this.playCompleteTime ){
			if (  Date.now() > this.playCompleteTime ){
				this.draw( canvas, false );
				this.playCompleteTime = false;
			}
		}
	}
	onTouchBegan( canvas ){	
		if ( ! canvas.container[0].behavior.isRecording ){
			if( this.runTime ){ 
				this.draw( canvas, true );
				this.playCompleteTime = Date.now() + this.runTime;
				canvas.delegate( "onButtonTouchBegan" );
			}
		}
	}
	setRunTime( canvas, runTime ){
		this.runTime = runTime * 1000; //convert to millis
	}
};

export class RecordButtonBehavior extends Behavior {
	draw( canvas, pressed ) {
		var ctx = canvas.getContext( "2d" );
		var w = canvas.width;
		var h = canvas.height;	
		var backgroundFillStyle;
		var fillStyle; 
		if ( pressed ){
			backgroundFillStyle = getColorWithTransparency( buttonBackgroundColor, 100 );
			fillStyle = getColorWithTransparency( recordButtonColor, 100 );
		} else{
			backgroundFillStyle = getColorWithTransparency( buttonBackgroundColor, 80 );
			fillStyle = getColorWithTransparency( recordButtonColor, 80 );
		}
		ctx.fillStyle = backgroundFillStyle;
		ctx.clearRect( 0, 0, w, h );
        ctx.fillRect( 0, 0, w, h );
		var radius;
		if ( w > h ){
			radius = h / 4;
		}
		else{
			radius = w / 4; 
		}
		ctx.beginPath();
		ctx.arc( w / 2, h / 2, radius, 0, 360 );
		ctx.fillStyle = fillStyle;
		ctx.fill();
	}
	onDisplayed( canvas ) {
		canvas.interval = 100;
		canvas.start();
		this.TIMEOUT = 30000; //30 sec max
		this.startTime = false; 
		this.isRecording = false; 
		this.container = canvas;
		this.eventRoot = canvas;
		this.draw( canvas, false ); //initialize button to unpressed 		
	}
	onRecordingComplete( canvas, runTime ){
		application.distribute( "setRunTime",  runTime );
	}
	onTimeChanged( canvas ){
		if ( this.isRecording && this.startTime ){
			if (  Date.now() - this.startTime > this.TIMEOUT ){
				this.isRecording = false;
				this.draw( canvas, false );
				canvas.delegate( "onButtonTouchEnded" );		
			}
		}
	}
	onTouchBegan( canvas ){
		if ( ! canvas.container[1].behavior.playCompleteTime ){
			this.isRecording = !this.isRecording;
			if ( this.isRecording ){	
				/*	
					Reset start time to false to cover the period in which the touch is 
					still occuring. The recording (and the timer) begin when the touch 
					ends. 
				*/
				this.startTime = false; 		
				this.draw( canvas, true );
			}
			else {
				this.draw( canvas, false );
			}
		}
	}
	onTouchEnded( canvas ){
		if ( this.isRecording ){			
			this.startTime = Date.now() ;
			canvas.delegate( "onButtonTouchBegan" );	
		}
		else {	
			canvas.delegate( "onButtonTouchEnded" );	
		}
	}		
};
