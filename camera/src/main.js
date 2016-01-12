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
THEME = require('themes/sample/theme');
var CONTROL = require('mobile/control');
var TRANSITIONS = require('transitions');

/* ASSETS */

let blackSkin = new Skin({ fill:'black' });
let buttonSkin = new Skin({
	texture: new Texture('assets/button.png'),
	x:0, y:0, width:60, height:60,
	tiles:{ left:20, right:20, top:20, bottom:20},
	states:60
});

let labelStyle = new Style({ font:'18px', horizontal:'center', vertical:'middle' });

/* BEHAVIORS */

class CameraScreenBehavior extends Behavior {
	capture() {
		this.photo_track.set( FskMediaProperty.enabled, true );
	}
	load(container) {
		let mime, uri = "";
		if ( this.use_camera )
			mime = "video/x-kinoma-capture";
		else {
			let buffer = Files.readBuffer( this.data.uri_preview );
			mime = FskMediaReader.canHandle( buffer );
			uri = this.data.uri_preview;
		}
		
		let reader = this.reader = new FskMediaReader( uri, mime );
		if ( !reader ) throw "Unable to create media reader";
		
		reader.refresh   = this.refresh.bind(this, container);
		reader.onMediaDataArrived = this.onMediaDataArrived.bind(this, container);
		
		let track, trackIndex = 0;
		while ( track = reader.getTrack( trackIndex++ ) ) {
			let mediaType = track.get( FskMediaProperty.mediaType );
			if ( "video-preview" == mediaType )
				break;
		}
		if ( !track )
			throw "No video preview track";
		else
			this.video_preview_track = track;
		
		trackIndex = 0;
		while ( track = reader.getTrack( trackIndex++ ) ) {
			if ( "image" == track.get( FskMediaProperty.mediaType ) )
				break;
		}
		if ( !track )
			throw "No photo track";
		else
			this.photo_track = track;
		
		this.formatInfo = this.video_preview_track.get( FskMediaProperty.formatInfo );
		this.format = this.video_preview_track.get( FskMediaProperty.format );
		this.dimensions = this.video_preview_track.get( FskMediaProperty.dimensions );
	}
	onCreate(container, data) {
		this.data = data;
		this.use_camera = ("linux" != system.platform);
		this.video_track = null;
		this.photo_track = null;
		this.reader = null;
		this.load(container);
	}
	onDisplaying(container) {
		this.reader.start();
		
		container.coordinates = { width: this.dimensions.width, height: this.dimensions.height };
		container.origin = { x: this.dimensions.width >> 1, y: this.dimensions.height >> 1 };
		this.onOrientationChange( container );
		
		if ( !this.use_camera ) {
			container.time = 0;
			container.interval = 16;
			container.start();
		}
	}
	onLoaded(container) {
		this.onOrientationChange( container );
	}
	onMediaDataArrived(container) {
		this.refresh( container );
	}
	onOrientationChange(container, data) {
		let x_scale, y_scale;
		
		if ( application.width > application.height ) {
			x_scale = application.width / this.dimensions.width;
			y_scale = application.height / this.dimensions.height;
			container.rotation = 0;
		}
		else {
			x_scale = application.height / this.dimensions.width;
			y_scale = application.width / this.dimensions.height;
			container.rotation = 90;
		}
		
		let scale = x_scale > y_scale ? y_scale : x_scale;
		if ( container.scale.x != scale || container.scale.y != scale )
			container.scale = { x: scale, y: scale };
	}
	onTimeChanged(container) {
		this.onMediaDataArrived( container );
	}
	onUndisplayed(container) {
		if ( this.reader ) {
			this.reader.stop();
			this.reader.close();
			this.reader = null;
		}
	}
	refresh(container) {
		while ( true ) {
			let data = this.reader.extract();
			if ( !data || !data.info )
				break;
		
			if ( this.photo_track == data.track ) {
				this.photo_track.set( FskMediaProperty.enabled, false );
				container.bubble( "onPhotoCaptured", data.buffer );
				continue;
			}
	
			var info = data.info[0];
			if ( ( 1 != info.samples ) || ( 1 != data.info.length ) )
				throw "Unexpected sample info";
			
			container.load( data.buffer, this.format, this.formatInfo );
			
			break;
		}
	}
};

class CameraShutterBehavior extends Behavior {
	draw(canvas) {
		let centerX = canvas.width >> 1;
		let centerY = canvas.height >> 1;
		let radius = this.radius;
		let ctx = canvas.getContext( "2d" );
		ctx.clearRect( 0, 0, canvas.width, canvas.height );
		ctx.beginPath();
		ctx.arc( centerX, centerY, radius, 0, 2 * Math.PI );
		ctx.closePath();
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'white';
		ctx.stroke();
		if ( !this.pressed ) {
			radius -= 5;
			ctx.beginPath();
			ctx.arc( centerX, centerY, radius, 0, 2 * Math.PI );
			ctx.closePath();
			ctx.fillStyle = 'white';
			ctx.fill();
		}
	}
	onCreate(canvas, data) {
		this.data = data;
		this.pressed = false;
		this.radius = ( canvas.width >> 1 ) - 5;
		this.shutterSound = new Sound( mergeURI( application.url, "assets/Shutter-02.wav" ) );
		this.onOrientationChange( canvas );
		this.draw( canvas );
	}
	onOrientationChange(canvas) {
		if ( application.width > application.height )
			canvas.coordinates = { right: 5, top: ( application.height >> 1 ) - ( canvas.height >> 1 ), width: canvas.width, height: canvas.height };
		else
			canvas.coordinates = { bottom: 5, left: ( application.width >> 1 ) - ( canvas.width >> 1 ), width: canvas.width, height: canvas.height };
	}
	onTouchBegan(canvas) {
		this.pressed = true;
		this.draw( canvas );
	}
	onTouchCancelled(canvas) {
		this.pressed = false;
		this.draw( canvas );
	}
	onTouchEnded(canvas) {
		this.pressed = false;
		this.draw( canvas );
		this.shutter( canvas );
	}
	shutter(canvas) {
		this.shutterSound.play();
		canvas.container.run( new ShutterOpenTransition, this.data.MASK );
		canvas.container.run( new ShutterCloseTransition, this.data.MASK );
		this.data.PREVIEW.delegate( "capture" );
	}
};

/* TEMPLATES */

let MainContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, skin:blackSkin,
	contents: [
		PreviewContainer($)
	]
}));

let PhotoContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	behavior: Behavior({
		onBack(container) {
			container.container.run( new TRANSITIONS.Flip(), container, new PreviewContainer( this.data ), { direction : "down", easeType : "sineEaseOut", duration : 500 } );
		},
		onCreate(container, data) {
			this.data = data;
		}
	}),
	contents: [
		Picture($, {
			left:0, right:0, top:0, bottom:0,
			behavior: Behavior({
				onCreate(picture, data) {
					picture.load(data.buffer);
				}
			})
		}),
		Container($, {
			bottom:10, width:80, height:30, active:true, skin:buttonSkin,
			behavior: CONTROL.ButtonBehavior({
				onTap(container) {
					container.bubble("onBack");
				}
			}),
			contents: [
				Label($, { left:10, right:10, string:'Back', style:labelStyle }),
			]
		}),
	]
}));

let PreviewContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0,
	behavior: Behavior({
		onComplete(container) {
			container.container.run( new TRANSITIONS.Flip(), container, new PhotoContainer( this.data ), { direction : "up", easeType : "sineEaseOut", duration : 500 } );
		},
		onCreate(container, data) {
			this.data = data;
		},
		onPhotoCaptured(container, buffer) {
			this.data.buffer = buffer;
			
			if (system.platform == "iphone" || system.platform == "android" || system.platform == "mac") {
				var message = new Message("xkpr://library/pictures/save");
				message.requestBuffer = buffer;	// the JPEG photo buffer corresponding to the captured image
				message.method = "POST"
				container.invoke(message, Message.BUFFER);
			}
			else {
				Files.deleteFile( this.data.uri_capture );
				Files.writeBuffer( this.data.uri_capture, buffer );
				container.wait( 100 );	// let the transition complete
			}				
		}
	}),
	contents: [
		Picture($, { left:0, right:320, top:0, bottom:0, anchor:'PREVIEW', Behavior:CameraScreenBehavior }),
		Container($, { left:0, right:0, top:0, bottom:0, anchor:'MASK', skin:blackSkin, visible:false }),
		Canvas($, { width:50, height:50, active:true, Behavior:CameraShutterBehavior }),
	]
}));

/* TRANSITIONS */

class ShutterTransition extends Transition {
	constructor() {
		super(30);
	}
}

class ShutterCloseTransition extends ShutterTransition {
    onBegin(container, mask) {
		this.layer = new Layer;
		this.layer.attach( mask );
		this.layer.opacity = 1;
    }
    onEnd(container, mask) {
		this.layer.detach();
		mask.visible = false;
    }
    onStep(fraction) {
		this.layer.opacity = 1 - fraction;
    }
}

class ShutterOpenTransition extends ShutterTransition {
    onBegin(container, mask) {
		this.layer = new Layer;
		mask.visible = true;
		this.layer.attach( mask );
		this.layer.opacity = 0;
    }
    onEnd(container, mask) {
 		this.layer.detach();
    }
    onStep(fraction) {
		this.layer.opacity = fraction;
    }
}

/* APPLICATION */

Sound.volume = 1.0;

application.behavior = Behavior({
	onAdapt(application) {
		let width = application.width;
		if ( this.width != width ) {
			this.width = width;
			application.distribute( "onOrientationChange" );
		}
	},
	onLaunch(application) {
		let data = {
			uri_preview: mergeURI( application.url, "assets/preview.yuv" ),
			uri_capture: mergeURI( Files.picturesDirectory, application.di + ".photo.jpg")
		};
		this.width = application.width;
		application.add(new MainContainer(data));
	}
});
