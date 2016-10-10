/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
export class CircleSliderBehavior extends Behavior {
	getMax( canvas ) {
		return this.data.max;
	}
	getMin( canvas ) {
		return this.data.min;
	}
	getOffset( canvas, size ) {
		var min = this.getMin( canvas );
		var max = this.getMax( canvas );
		var value = this.getValue( canvas );
		return Math.round( ( ( value - min ) * size ) /
			( max - min ) );
	}
	getValue( canvas ) {
		return this.data.value;
	}
	onCreate( canvas, data ) {
		this.data = data;
		this.tracking = false;
	}
	onDisplaying( canvas ) {
		this.size = ( canvas.width - canvas.height );
		this.redraw( canvas );
	}
	onTouchBegan( canvas, id, x, y, ticks ) {
		canvas.captureTouch( id, x, y, ticks );
		this.tracking = true;
		this.onTouchMoved( canvas, id, x, y, ticks );
	}
	onTouchEnded( canvas, id, x, y, ticks ) {
		this.tracking = false;

		canvas.container.distribute( "onChanged", this.getValue(),
			this.data.label );
	}
	onTouchMoved( canvas, id, x, y, ticks ) {
		var offset = this.positionToOffset(canvas, x);
		this.setOffset( canvas, offset );
		this.redraw( canvas );
	}
	redraw( canvas ) {
		var ctx = canvas.getContext( "2d" );
		var width = canvas.width - 2;
		var height = canvas.height;
		var size = ( width - ( this.data.radius * 2 ) );
		var x = this.data.radius;
		var y = height >> 1;
		var delta = height / 3;

		ctx.lineWidth = this.data.strokeWidth;
		ctx.clearRect( 0, 0, width + 2, height );
		ctx.beginPath();
		ctx.moveTo( x, y );
		ctx.lineTo( width - x, y );
		ctx.strokeStyle = this.data.strokeColor;
		ctx.stroke();
		x = x + this.getOffset( canvas, size );

		ctx.beginPath();
		ctx.arc( x, y, this.data.radius, 0, 360 );
		ctx.fillStyle = this.data.circleColor;
		ctx.fill();
	}
	positionToOffset(canvas, x) {
		var offset = ( x - ( canvas.height >> 1 ) - canvas.x );
		return offset;
	}
	setOffset( canvas, offset ) {
		var min = this.getMin( canvas );
		var max = this.getMax( canvas );
		var value = min + ( ( offset * (max - min) ) / this.size );
		if ( value < min ) {
			value = min;
		}
		else if ( value > max ) {
			value = max;
		}
		this.data.value = value;
	}
	setValue( canvas, value ) {
		if (this.tracking) return;
		this.data.value = value;
		this.redraw( canvas );
	}
}

export var CircleSlider = Canvas.template($ => ({ active: true, Behavior: CircleSliderBehavior}));

export default {
	CircleSliderBehavior, CircleSlider
}