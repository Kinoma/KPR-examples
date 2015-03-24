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

var THEME = require ("themes/sample/theme");
var SLIDES = require('slidePictureTouchStates');

var SlideBrowser = Container.template(function($) { return { 
	anchor: 'SLIDE_BROWSER', 
	clip: true,
	skin: new Skin( { fill: "black" } ),

	behavior : SLIDES.SlideBrowserBehavior({
		onCreate: function(container, data) {
			this.data = data;
			this.getSlides(container);
			this.onBrowsable(container, 0);
		},
		getSlides: function(container) {
			var data = this.data;
			var imagesPath = mergeURI(application.url, "../images/");								
			var slides = [
				imagesPath + "image1.png",
				imagesPath + "image2.png",
				imagesPath + "image3.png",
				imagesPath + "image4.png"
			]
			data.slides = slides;
			data.slideCount = slides.length;
		},
		onSlideDisplayed: function() {
			var string =  (this.data.slideIndex + 1) + " of " + this.data.slideCount
			trace(string + "\n");
		}
	}),
	
	contents: [
		SLIDES.SlideViewer($, { left: 0, right: 0, top: 0, bottom: 0, anchor: 'SCROLLER', }),
	], 
}});

var data = { 
	slideIndex: 0
};

var myBackground = new Content( { left: 0, top: 0, right: 0, bottom: 0, skin: new Skin( { fill: "#7ec0ee" } ) } );
application.add(myBackground);
var mySlideBrowser = SlideBrowser(data, { left: 20, right: 20, top: 20, bottom: 20});
application.add( mySlideBrowser );
