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
let whiteSkin = new Skin({ fill:'white' });

/* BEHAVIORS */
class PlotterCanvasBehavior extends Behavior {
	onCreate(canvas, data) {
		this.data = data;
		canvas.interval = this.data.interval;
		canvas.start();
		this.readings = [  ];
    	this.writeIndex = 0; 
    	this.firstReadingIndex = 0; 
    	this.totalReadings = 0; 
    	this.sensorReading = 0;
	}
	onReceivedValue(canvas, value) {
		if( value != null ){
			if ( this.data.complement ){
				this.sensorReading = 1 - value;  
			}
			else{
				this.sensorReading = value;  	
			}
		}
		let range = canvas.height;
    	let reading = range * this.sensorReading;
    	application.distribute( "onReceiveReading", this.sensorReading, this.data.name );
		this.readings[ this.writeIndex ] = reading;
		this.redraw(canvas);
		this.totalReadings ++; 
		this.writeIndex = ( this.writeIndex + 1 ) % this.data.buckets;
		if ( this.totalReadings > this.data.buckets ) {
			this.firstReadingIndex = ( this.writeIndex + 1 ) % this.data.buckets;
		}
	}
	redraw(canvas) {
		let ctx = canvas.getContext( "2d" );
		let w = canvas.width;
        let h = canvas.height;
        let offset = w / ( this.data.buckets - 1 );
        ctx.clearRect( 0, 0, w, h );
        ctx.fillStyle = this.data.background;
		ctx.fillRect( 0,0,w,h );
        ctx.strokeStyle = this.data.strokeStyle;
        ctx.lineWidth = this.data.lineWidth;
		ctx.beginPath();
		var dataIndex = this.firstReadingIndex;
		for ( let i = 0; i < this.data.buckets; i++ ){			
			if ( dataIndex + 1 > this.totalReadings) {
				break; 
			} 
			else if ( i == 0 ){  
				ctx.moveTo( i*offset, h - this.readings[ dataIndex ] )
			}
			else {
				ctx.lineTo( i*offset, h - this.readings[ dataIndex ]  );
			}
			dataIndex = ( dataIndex + 1 ) % this.data.buckets ;
		}
        ctx.stroke();
	}
};

/* LAYOUTS */
export var PlotterCanvas = Canvas.template($ => ({ left:0, right:0, top:0, bottom:0, skin:whiteSkin, Behavior:PlotterCanvasBehavior }));
