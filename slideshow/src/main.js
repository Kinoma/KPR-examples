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

let blackSkin = new Skin({ fill: 'black'});

class SlideShowPictureBehavior extends Behavior{
  onCreate(container, data, startOnLoad){
    this.data = data;
    this.container = container;
    this.startOnLoad = startOnLoad;
    this.startedTransition = false;
    this.endedTransition = false;

    this.transition = { totalDuration: 8000, fadeInDuration: 1500, fadeOutDuration: 1500, scaleFactor: 0.5 };

    this.transitionCount = 10;
    this.transition.index = Math.floor( Math.random() * this.transitionCount );
  }
  onLoaded(picture){
    if ( !picture.ready ) {
      application.distribute( "onSlideShowPictureFailed", picture );
      return;
    }
    this.originalSize = { width: picture.width, height: picture.height };
    this.containerSize = { width: this.container.width, height: this.container.height };
    this.scaledSize = this.getScaledSize( picture );
    this.scale = this.scaledSize.scale;

    picture.visible = false;
    picture.opacity = 0;
    picture.subPixel = true;
    picture.aspect = 'draw';

    application.distribute( "onSlideShowPictureLoaded", picture );
  }
  startTransition(picture){
    picture.visible = true;
    picture.duration = this.transition.totalDuration;
    picture.start();
  }
  onTimeChanged(picture){
    var time = picture.time;
    var fraction = picture.fraction / 2;
    var scale = this.scale;
    var scaledSize = this.scaledSize;
    var containerSize = this.containerSize;
    var tx, ty = 0;

    if ( !this.startedTransition ) {
      this.startedTransition = true;
      application.distribute( "onSlideShowPictureStarting", picture );
      if ( 0 == this.transition.index || 4 == this.transition.index ) {	// The transition index tested here matches the pan transitions below
      	var scaleBump = 1.1;
      	// Adjust the scale for pan transitions to ensure that there's horizontal space to pan
      	if ( this.scaledSize.width < (scaleBump * this.containerSize.width) ) {
          this.containerSize.width *= scaleBump;
          this.containerSize.height *= scaleBump;
          this.scaledSize = this.getScaledSize( picture );
          this.containerSize.width /= scaleBump;
          this.containerSize.height /= scaleBump;
          this.scale = scale = this.scaledSize.scale;
      	}
      }
    }

    if ( time <= this.transition.fadeInDuration ) picture.opacity = time / this.transition.fadeInDuration
    else if ( time >= ( this.transition.totalDuration - this.transition.fadeOutDuration ) ) {
      picture.opacity = 1 - ( ( time - ( this.transition.totalDuration - this.transition.fadeOutDuration ) ) / this.transition.fadeOutDuration );
      if ( !this.endedTransition ) {
        this.endedTransition = true;
        application.distribute( "onSlideShowPictureEnding", picture );
      }
    }
    else
      picture.opacity = 1;

    switch( this.transition.index ) {
      case 0:	// Picture anchored at bottom/right, pan right
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { right: 0, bottom: 0 };
        picture.origin = { x: this.originalSize.width, y: this.originalSize.height };
        tx = ( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 1:	// Picture anchored at bottom/right, zoom in, pan left
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { right: 0, bottom: 0 };
        picture.origin = { x: this.originalSize.width, y: this.originalSize.height };
        break;
      case 2:	// Picture anchored at bottom/right, zoom in
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { right: 0, bottom: 0 };
        picture.origin = { x: this.originalSize.width, y: this.originalSize.height };
        tx = ( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 3:	// Picture anchored at bottom/right, zoom out
        fraction = 1 - fraction;
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { right: 0, bottom: 0 };
        picture.origin = { x: this.originalSize.width, y: this.originalSize.height };
        tx = ( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 4:	// Picture anchored at left/top, pan left
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { left: 0, top: 0 };
        picture.origin = { x: 0, y: 0 };
        tx = -( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 5:	// Picture anchored at left/top, zoom in, pan right
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { left: 0, top: 0 };
        picture.origin = { x: 0, y: 0 };
        break;
      case 6:	// Picture anchored at left/top, zoom in
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { left: 0, top: 0 };
        picture.origin = { x: 0, y: 0 };
        tx = -( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 7:	// Picture anchored at left/top, zoom out
        fraction = 1 - fraction;
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { left: 0, top: 0 };
        picture.origin = { x: 0, y: 0 };
        tx = -( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 8:	// Picture anchored at left/bottom, zoom out
        fraction = 1 - fraction;
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { left: 0, bottom: 0 };
        picture.origin = { x: 0, y: this.originalSize.height };
        tx = -( ( scaledSize.width - containerSize.width ) * fraction );
        picture.translation = { x: tx, y: ty };
        break;
      case 9:	// Picture anchored at left/bottom, zoom in, pan right
        scale *= 1 + ( fraction * this.transition.scaleFactor );
        picture.scale = { x: scale, y: scale };
        picture.coordinates = { left: 0, bottom: 0 };
        picture.origin = { x: 0, y: this.originalSize.height };
        break;
    }
  }
  onFinished(picture){
    application.distribute( "onSlideShowPictureEnded", picture );
  }
  getScaledSize(picture){
    var hScale = this.containerSize.width / this.originalSize.width;
    var vScale = this.containerSize.height / this.originalSize.height;
    var scale = hScale > vScale ? hScale : vScale;
    return { width: Math.round( this.originalSize.width * scale ), height: Math.round( this.originalSize.height * scale ), scale: scale };
  }
};

let BusyPicture = Picture.template($ => ({ url: './assets/waiting.png',
  Behavior: class extends Behavior{
    onLoaded(picture){
      picture.origin = { x:picture.width >> 1, y:picture.height>>1 };
      picture.scale = { x:0.5, y:0.5 };
      picture.rotation = 0;
      picture.start();
    }
    onTimeChanged(picture){
      var rotation = picture.rotation;
      rotation -= 5;
      if (rotation < 0) rotation = 360
      picture.rotation = rotation;
    }
  }
}));

let MainContainer = Container.template($ => ({ left: 0, right: 0, top: 0, bottom: 0, skin: blackSkin,
  Behavior: class extends Behavior{
    onCreate(container, data){
      this.container = container;
      this.data = data;
      this.images = {index: 0, data: []};
      this.nextPicture = null;
      this.startedSlideShow = false;

      var uri = "https://api.flickr.com/services/feeds/groups_pool.gne?" + serializeQuery( { id: "80641914@N00", format: "json", nojsoncallback: 1 } );
      container.invoke( new Message( uri ), Message.TEXT );
    }
    onComplete(container, message, text){
      if (text) {
        var json = JSON.parse(text.replace(/\\'/g, "'"))
        var items = json.items;
        this.images.data.length = items.length;
        this.images.data.index = 0;
        for ( var i = 0, c = items.length; i < c; ++i ) {
          var uri = items[ i ].media.m.replace( "_m.jpg", "_b.jpg" );
          this.images.data[ i ] = { uri: uri, seed: Math.random() };
        }
        this.images.data.sort(function numericalOrder( a, b ) { return a.seed - b.seed });
      }
      if ( this.images.data.length ) {
        var picture = this.picture = new Picture();
        picture.behavior = new SlideShowPictureBehavior( this.container, this.data );
        picture.url = this.images.data[ this.images.index ].uri;
      }
    }
    getNextImage(){
      if ( !this.images.data.length ) return
      if ( ++this.images.index >= this.images.data.length ) this.images.index = 0
      return this.images.data[ this.images.index ];
    }
    onSlideShowPictureLoaded(container, picture){
      if ( !this.startedSlideShow || picture.behavior.startOnLoad ) {
        this.data.BUSY.visible = false;
        container.insert( picture, this.data.BUSY );
        picture.behavior.startTransition.call( picture.behavior, picture );
        this.startedSlideShow = true;
      }
    }
    onSlideShowPictureStarting(container, picture){
      var nextImage = this.getNextImage();
      if (!nextImage) return;

      this.nextPicture = new Picture();
      this.nextPicture.behavior = new SlideShowPictureBehavior( this.container, this.data );
      this.nextPicture.url = nextImage.uri;
    }
    onSlideShowPictureEnding(container, picture){
      if ( !this.nextPicture || !this.nextPicture.ready ) {
        //trace("Next picture not ready, fetching another and restarting...\n");
        if ( this.nextPicture ) this.nextPicture.url = null

        var nextImage = this.getNextImage();
        if ( !nextImage ) return;

        this.nextPicture = new Picture();
        this.nextPicture.behavior = new SlideShowPictureBehavior( container, this.data, true );
        this.nextPicture.url = nextImage.uri;
        this.picture = null;
        return;
      }
      this.container.insert( this.nextPicture, picture );
      this.nextPicture.behavior.startTransition.call( this.nextPicture.behavior, this.nextPicture );

      this.nextPicture = null;
      this.picture = null;
    }
    onSlideShowPictureEnded(container, picture){
      if ( picture && picture.container ) container.remove( picture )

      if  ( !( "transition" in container.first.behavior ) ) this.data.BUSY.visible = true

      this.picture = null;
    }
    onSlideShowPictureFailed(container, failed){
      var nextImage = this.getNextImage();
      if ( !nextImage ) return

      var picture = this.picture = new Picture();
      picture.behavior = new SlideShowPictureBehavior( container, this.data, true );
      picture.url = nextImage.uri;
      if ( failed == this.nextPicture ) this.nextPicture = picture
    }
    onUndisplayed(container){
      if ( this.nextPicture ) this.nextPicture.url = null
    }
  },
  contents: [
    BusyPicture($, { anchor:'BUSY' })
  ]
}));

application.add(new MainContainer({}));
