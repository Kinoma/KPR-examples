### <a href="https://github.com/Kinoma/KPR-examples/tree/master/balls">balls</a>
<a href="https://github.com/Kinoma/KPR-examples/tree/master/balls"><img src="http://kinoma.github.io/KPR-examples/images/balls-example.jpg" height="100" alt=""/></a>

<x-app-info id="balls.example.kinoma.marvell.com"></x-app-info>

Bouncing ball animation example. Each ball is created as a content using different variants from an image skin. The balls travel by changing the content coordinates over time. This example is written using the KPR ECMAScript programming APIs and demonstrates how to use image skins and content timers.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### bing-images				
<a href="https://github.com/Kinoma/KPR-examples/tree/master/bing-images"><img src="http://kinoma.github.io/KPR-examples/images/bing-example.jpg" height="100" alt=""/></a>

<x-app-info id="bing.example.kinoma.marvell.com" platform="mac,win,android,iphone"></x-app-info>

Phone application which implements a Bing Image search. Image thumbnail search results displayed in a photo grid. Tapping an image thumbnail expands to full size. Note - This example requires the 'accountKey' variable set to a valid Windows Azure Marketplace account key associated with a Bing Search API subscription.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### bll-repeat
<a href="https://github.com/Kinoma/KPR-examples/tree/master/bll-repeat"><img src="http://kinoma.github.io/KPR-examples/images/bbl-repeat-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="bllrepeat.example.kinoma.marvell.com"></x-app-info>

A sample that demonstrates how to repeatedly run a Kinoma Blinking Light Library (BLL). This is useful when, for instance, polling a sensor. The example calls a BLL that traces to the console 10 times and the stops the repetition.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### bll-run
<a href="https://github.com/Kinoma/KPR-examples/tree/master/bll-run"><img src="http://kinoma.github.io/KPR-examples/images/bbl-run-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="bllrun.example.kinoma.marvell.com"></x-app-info>

A sample that demonstrates how to run a Kinoma Blinking Light Library (BLL) once. This sample shows how to pass parameters to a BLL, receive them in the BLL, and get results back from a BLL.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### browser
<a href="https://github.com/Kinoma/KPR-examples/tree/master/browser"><img src="http://kinoma.github.io/KPR-examples/images/browser-example.jpg" height="100" alt=""/></a>

<x-app-info id="browser.example.kinoma.marvell.com" platform="mac,win,iphone,android"></x-app-info>

This example demonstrates how to implement an embedded web view container. The code embeds the web view with a browser container. This example demonstrates how to display a web page in the browser, support browser forward/backwards navigation, implement callbacks when the web page is loading/loaded, display a busy indicator using the mobile framework and use anchor references to containers. Note that the browser container is not available on Windows or Kinoma Create.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### camera
<a href="https://github.com/Kinoma/KPR-examples/tree/master/camera"><img src="http://kinoma.github.io/KPR-examples/images/camera-example.jpg" height="100" alt=""/></a>

<x-app-info id="camera.example.kinoma.marvell.com" platform="mac,win,iphone,android"></x-app-info>

A simple camera app supporting live preview and capture. This example demonstrates how to integrate the camera media reader with a picture container, use the Files object to write the captured image to storage, implement screen transitions, detect the platform at runtime, adapt container layouts to device orientation changes, use canvas to implement a button and play one-shot sounds. Note - camera support is currently not supported on Kinoma Create, but this app includes a mockup implementation for the Kinoma Studio desktop simulator.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### canvas
<a href="https://github.com/Kinoma/KPR-examples/tree/master/canvas"><img src="http://kinoma.github.io/KPR-examples/images/canvas-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="canvas.example.kinoma.marvell.com"></x-app-info>

This mobile framework example demonstrates how to use the HTML 2D Canvas API. Tap the settings icon to select the drawing color and line thickness. The main container provides a 2D canvas to draw on. Select the 'Play' option from the settings menu to replay your drawing. This example shows how to use the Kinoma ECMAScript API to build and draw on a HTML Canvas 2D Context.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### controls-buttons
<a href="https://github.com/Kinoma/KPR-examples/tree/master/controls-buttons"><img src="http://kinoma.github.io/KPR-examples/images/controls-example.jpg" height="100" alt=""/></a>

<x-app-info id="controls.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to integrate mobile framework buttons and behaviors into your application. Button types include push, checkbox, radio and radio group.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### dialog
<a href="https://github.com/Kinoma/KPR-examples/tree/master/dialog"><img src="http://kinoma.github.io/KPR-examples/images/dialogs-example.jpg" height="100" alt=""/></a>

<x-app-info id="dialog.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to setup and display mobile framework dialogs. Various common controls are integrated into the dialog samples and selected values are output when the dialogs are dismissed. Dialogs are built from a list of items returned by the onDescribe() dialog behavior handler function.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### discovery-client
<a href="https://github.com/Kinoma/KPR-examples/tree/master/discovery-client"><img src="http://kinoma.github.io/KPR-examples/images/discoveryclient-example.jpg" height="100" alt=""/></a>

<x-app-info id="discoveryclient.example.kinoma.marvell.com"></x-app-info>

This client app is intended to be run simultaneously with the "Device Discovery Server" example and demonstrates how to build a companion app that discovers and interacts with a device. The client discovers all "com.marvell.kinoma.example.discoveryserver" servers on the same network. For each server discovered, the client displays a color swatch in a vertically scrolling container. The color is requested from the server by invoking the server's /color handler. The list is updated on-the-fly as servers are discovered and lost. KPR provides device discovery via built-in SSDP support. This example shows how to discover servers using the built-in SSDP support, create and invoke a cross-application message, and how to dynamically build a scrolling container of items.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### discovery-server
<a href="https://github.com/Kinoma/KPR-examples/tree/master/discovery-server"><img src="http://kinoma.github.io/KPR-examples/images/discoveryserver-example.jpg" height="100" alt=""/></a>

<x-app-info id="discoveryserver.example.kinoma.marvell.com"></x-app-info>

This server app is intended to be run simultaneously with the "Device Discovery Client" example and demonstrates how to implement a discoverable device. The app/device is made discoverable by setting the "shared" application property to true. The "color" handler is called remotely by the client and returns a JSON object containing a CSS color string.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### effects
<a href="https://github.com/Kinoma/KPR-examples/tree/master/effects"><img src="http://kinoma.github.io/KPR-examples/images/effects-example.jpg" height="100" alt=""/></a>

<x-app-info id="effects.example.kinoma.marvell.com"></x-app-info>

This mobile framework example demonstrates how to build and apply a variety of effects to KPR layers and pictures. Tap the settings icon to display and select from a scrolling menu of effect types. The effect is applied to the ‘Effect’ layer. Tap the ‘Play’ button at the bottom of the menu to apply the selected effect to a bouncing balls animation. This example shows how to build and apply KPR effects using the Kinoma ECMAScript API.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### file-explorer
<a href="https://github.com/Kinoma/KPR-examples/tree/master/file-explorer"><img src="http://kinoma.github.io/KPR-examples/images/file-explorer-example.jpg" height="100" alt=""/></a>

<x-app-info id="fileexplorer.example.kinoma.marvell.com"></x-app-info>

This mobile framework example demonstrates how to use the global KPR Files object to iterate local files and directories. The application displays the results in a scrolling list view and provides for deep browsing into nested directories. In addition, previews are supported for image, audio and video files. This example is useful for understanding how to use the Files iterator to iterate over a directory, distinguish between file and directory results, command and screen handler behaviors and building scrolling list based views.

<div style="clear:both; margin-bottom: 16px;"></div>
***

### flickr-grid
<a href="https://github.com/Kinoma/KPR-examples/tree/master/flickr-grid"><img src="http://kinoma.github.io/KPR-examples/images/flickr-example.jpg" height="100" alt=""/></a>

<x-app-info id="flickrgrid.example.kinoma.marvell.com"></x-app-info>

This sample code demonstrates how to implement an interactive scrolling photo thumbnail grid. Tapping the photo thumbnail opens the full size image using a zoom transition. The image thumbnails are retrieved from a Flickr public feed using a tag search. The resulting data set is delivered in JSON format. This is a good example of how to display images, adapt the layout to device orientation changes, use tool buttons or swipe to navigate between photos, invoke a message to fetch data from a REST API and mobile framework screen open/close transitions.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### hello
<a href="https://github.com/Kinoma/KPR-examples/tree/master/hello"><img src="http://kinoma.github.io/KPR-examples/images/hello-kpr-example.jpg" height="100" alt=""/></a>

<x-app-info id="hello.example.kinoma.marvell.com"></x-app-info>

A minimal application that creates a full-screen container and displays the text "Hello, KPR". Tapping the container changes the background color. Useful for understanding how to build a basic KPR application.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### kangaroo-disco
<a href="https://github.com/Kinoma/KPR-examples/tree/master/kangaroo-disco"><img src="http://kinoma.github.io/KPR-examples/images/kangaroo-disco-example.jpg" height="100" alt=""/></a>

<x-app-info id="kangaroo.disco.example.douzen.com"></x-app-info>

This ECMAScript API example displays a synchronized animation built with 256 balls/sprites. Each sprite’s position and size is changed every screen update. A content clock is used to update the display every screen refresh. Tap the screen to change the animation mode. This example shows how to use KPR content clocks, textures/skins, behaviors and content coordinates to achieve full frame rate animations.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### kangaroo-text
<a href="https://github.com/Kinoma/KPR-examples/tree/master/kangaroo-text"><img src="http://kinoma.github.io/KPR-examples/images/kangaroo-text-example.jpg" height="100" alt=""/></a>

<x-app-info id="kangaroo.text.example.douzen.com"></x-app-info>

This ECMAScript API example displays a synchronized vortex animation built with text sprites. Each sprite’s position and text size is changed every screen update. A content clock is used to update the display every screen refresh. Tap the screen to change the animation mode. This example shows how to use KPR content clocks, textures/skins, styles, behaviors and content coordinates to achieve full frame rate animations.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### kinoma-graph
<a href="https://github.com/Kinoma/KPR-examples/tree/master/kinoma-graph"><img src="http://kinoma.github.io/KPR-examples/images/spirograph-example.jpg" height="100" alt=""/></a>

<x-app-info id="kinomagraph.example.kinoma.marvell.com"></x-app-info>

Uses Canvas 2D to implement a virtual hypotrochoid device. Custom sliders control the radius and steps. This application demonstrates how to use canvas containers to render 2D drawing contexts, delegate and notify behaviors using container.distribute, and implement a basic touch slider control.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### layers
<a href="https://github.com/Kinoma/KPR-examples/tree/master/layers"><img src="http://kinoma.github.io/KPR-examples/images/layers-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="layers.example.kinoma.marvell.com"></x-app-info>

Uses Canvas 2D to implement a virtual hypotrochoid device. Custom sliders control the radius and steps. This application demonstrates how to use canvas containers to render 2D drawing contexts, delegate and notify behaviors using container.distribute, and implement a basic touch slider control.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### media-library
<a href="https://github.com/Kinoma/KPR-examples/tree/master/media-library"><img src="http://kinoma.github.io/KPR-examples/images/media-library-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="medialibrary.example.kinoma.marvell.com" platform="mac,iphone,android"></x-app-info>

This mobile framework application demonstrates how to access the core media library on iOS, Android and Mac OS platforms to display photos and play media files. The application uses a tabbed view to display photo/video thumbnails and songs. Tapping a media item opens a dedicated media viewer screen. KPR messages are used to request the media items. Note that media library support is not currently available for Kinoma Create or Windows.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### menu-button
<a href="https://github.com/Kinoma/KPR-examples/tree/master/menu-button"><img src="http://kinoma.github.io/KPR-examples/images/menu-button-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="menubutton.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to use a mobile framework menu button. The menu button displays the currently selected item in an active label. When tapped a modal menu of choices is displayed. The newly selected item is returned to the caller using a handler.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### multitouch-picture
<a href="https://github.com/Kinoma/KPR-examples/tree/master/multitouch-picture"><img src="http://kinoma.github.io/KPR-examples/images/multitouch-picture-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="multitouchpicture.example.kinoma.marvell.com" platform="mac,iphone,android,linux"></x-app-info>

This example demonstrates how to use features of the MultiTouch Library to create an interactive image viewer suitable for selecting a cropping area from an image. The image may be panned, zoomed, rotated, tossed, with some animated constraints applied. Interactive gestures include tapping, press and hold, drag, toss, and two finger pinching. The sample's comments discuss the framework used including the TouchStateMachine, and TouchBehavior.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### oauth
<a href="https://github.com/Kinoma/KPR-examples/tree/master/oauth"><img src="http://kinoma.github.io/KPR-examples/images/oauth-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="oauth.example.kinoma.marvell.com" platform="mac,iphone,android"></x-app-info>

This example demonstrates how to implement OAuth 1.0a (Twitter) and OAuth 2.0 (Google) browser-based login and authentication. The browser is embedded in a web view container. The sample code is useful for understanding how to use a browser container, mobile framework buttons, handlers to invoke HTTP requests and parse responses and how to implement pure ECMAScript modules with exported methods. Note that the browser container is not available on Windows or Kinoma Create.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### orientation
<a href="https://github.com/Kinoma/KPR-examples/tree/master/orientation"><img src="http://kinoma.github.io/KPR-examples/images/screen-orientation-example.jpg" height="100" alt=""/></a>

<x-app-info id="orientation.example.kinoma.marvell.com"></x-app-info>

This example uses a layout container to demonstrate how to adapt layouts to device orientation changes. KPR calls the onMeasureVertically and onMeasureHorizontally methods in layout containers when the device orientation changes. The example dynamically changes the container contents based on the current orientation.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### periodic-fetch
<a href="https://github.com/Kinoma/KPR-examples/tree/master/periodic-fetch"><img src="http://kinoma.github.io/KPR-examples/images/periodic-update-example.jpg" height="100" alt=""/></a>

<x-app-info id="periodic.example.kinoma.marvell.com"></x-app-info>

Basic digital clock driven by a periodic update implemented by a pair of handlers. The time handler notifies the application of the time change and then invokes the delay handler to wait 1/2 second. Once the delay has completed the time handler is invoked again. The technique is commonly used by applications that require periodic polling of a resource.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### platform-identifier
<a href="https://github.com/Kinoma/KPR-examples/tree/master/platform-identifier"><img src="http://kinoma.github.io/KPR-examples/images/platform-example.jpg" height="100" alt=""/></a>

<x-app-info id="platform.example.kinoma.marvell.com"></x-app-info>

A minimal application that reads and displays the host platform string read from system.platform. Applications can query the platform string to wrap platform specific code.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### port
<a href="https://github.com/Kinoma/KPR-examples/tree/master/port"><img src="http://kinoma.github.io/KPR-examples/images/port-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="port.example.kinoma.marvell.com"></x-app-info>

This application demonstrates how to use a KPR port object to implement a simple toggle switch. Tap the switch to toggle between the on and off states. The toggle state is displayed as text by another KPR port object. Various KPR port APIs are covered by this example, including drawImage, drawLabel, fillColor and invalidate.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### preferences
<a href="https://github.com/Kinoma/KPR-examples/tree/master/preferences"><img src="http://kinoma.github.io/KPR-examples/images/preferences-example.jpg" height="100" alt=""/></a>

<x-app-info id="preferences.example.kinoma.marvell.com"></x-app-info>

This sample demonstrates how to implement preferences that persist across application launches. The selected color swatch is stored across runs. The model.readPreferences function reads stored preferences. The optional third parameter can be used to initialize the preference value the first time. The model.writePreferences function saves the preferences. This example is also useful for learning how to build a container hierarchy using the KPR ECMAScript programming interface.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### project-3d
<a href="https://github.com/Kinoma/KPR-examples/tree/master/project-3d"><img src="http://kinoma.github.io/KPR-examples/images/project-3d-example.jpg" height="100" alt=""/></a>

<x-app-info id="project3d.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to use the projectImage function of the port object. The projectImage function allows a 3D projection to be defined in an intuitive way. Imagine holding a sheet of paper in one hand and a camera in the other. The paper would correspond to a 2D texture, and what the virtual camera sees is projected onto the port. The projectImage function takes 3 parameters: a texture, a billboard description, and a camera description. The billboard description includes the size of the texture, 3D position, and 3D orientation. The camera description is similar to the billboard, but also includes a field of view. Orientations are described as quaternions, which are complex, but the sample includes conversion to and from angles expressed in degrees. The sample presents sliders allowing the various billboard (b) and camera (c) parameters to be exercised.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### proxy-handler
<a href="https://github.com/Kinoma/KPR-examples/tree/master/proxy-handler"><img src="http://kinoma.github.io/KPR-examples/images/proxy-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="proxyhandler.example.kinoma.marvell.com"></x-app-info>

Photo images are fetched from a Flickr feed using a proxy handler which returns array of photo objects. A proxy handler is often used to filter data returned from a web service into a simplified format for use by the host application.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### slideshow
<a href="https://github.com/Kinoma/KPR-examples/tree/master/slideshow"><img src="http://kinoma.github.io/KPR-examples/images/slideshow-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="slideshow.example.kinoma.marvell.com"></x-app-info>

Displays a slideshow of images animating picture scaling, panning and opacity settings to implement Ken Burns style transitions. This example demonstrates how to dynamically add picture containers into the container hierarchy, distribute events to container behaviors, use a content timer to drive animations, display a busy indicator and invoke a HTTP request to fetch a photo collection from a public Flickr feed.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### sound
<a href="https://github.com/Kinoma/KPR-examples/tree/master/sound"><img src="http://kinoma.github.io/KPR-examples/images/sound-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="sound.example.kinoma.marvell.com"></x-app-info>

Displays a mockup camera preview with shutter button. Tapping the button plays a shutter sound. The application calls sound.play to play a WAVE file. This application also demonstrates how to use a transition to simulate the shutter closing and opening.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### spinner
<a href="https://github.com/Kinoma/KPR-examples/tree/master/spinner"><img src="http://kinoma.github.io/KPR-examples/images/spinner-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="spinner.example.kinoma.marvell.com"></x-app-info>

Displays a spinning busy indicator by rotating a custom graphic using a periodic timer. The indicator is displayed half size by setting the graphic's picture scale and origin properties.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### ssdp
<a href="https://github.com/Kinoma/KPR-examples/tree/master/ssdp"><img src="http://kinoma.github.io/KPR-examples/images/ssdp-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="ssdp.example.kinoma.marvell.com"></x-app-info>

A simple application that shows SSDP usage. The application starts a HTTP server on port 1234, registers it with the name service named "KPR Server". It also looks for available HTTP servers on the local network.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### states
<a href="https://github.com/Kinoma/KPR-examples/tree/master/states"><img src="http://kinoma.github.io/KPR-examples/images/states-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="states.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to use content states to change a button's background and text colors when tapped. The text color is defined by the text style states. The button background color is defined by the skin states.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### style-inheritance
<a href="https://github.com/Kinoma/KPR-examples/tree/master/style-inheritance"><img src="http://kinoma.github.io/KPR-examples/images/style-inheritance-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="styleInheritance.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how KPR cascades styles in the container hierarchy. A content inherits the characteristics of its container style when the characteristics are undefined in the content style. In this example, the applicationStyle defines a style for the root of the container hierarchy and nested containers build on the applicationStyle by overriding various style characteristics, including point size, alignment and color. Note: This example is best viewed on a tablet-sized screen or simulator.

<div style="clear:both; margin-bottom: 16px;"></div>
***

### styles
<a href="https://github.com/Kinoma/KPR-examples/tree/master/styles"><img src="http://kinoma.github.io/KPR-examples/images/styles-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="styles.example.kinoma.marvell.com"></x-app-info>

This example displays a vertical scrolling column of text formatted with a wide variety of styles. Usage of all the common text style attributes are demonstrated, including font, text style, point size, alignment, leading, color and margins.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### tabs
<a href="https://github.com/Kinoma/KPR-examples/tree/master/tabs"><img src="http://kinoma.github.io/KPR-examples/images/tabs-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="tabs.example.kinoma.marvell.com"></x-app-info>

This mobile framework example demonstrates how to build a tabbed UI screen. Each tab opens a different style pane. The tabs are placed in the screen footer area and built using the mobile framework screen's TabFooter object and skinned using the default sample theme tab skins. The tab-to-tab transition is managed by the mobile framework TabListSwapTransition. You can customize the tab look and behaviors by replacing and/or overriding these objects. For example, you can use the mobile framework screen's TabLine object to implement a tab bar that can be placed anywhere on the screen and without icons.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### text
<a href="https://github.com/Kinoma/KPR-examples/tree/master/text"><img src="http://kinoma.github.io/KPR-examples/images/text-example.jpg" height="100" alt=""/></a>

<x-app-info id="text.example.kinoma.marvell.com"></x-app-info>

This mobile framework example demonstrates how to use the ECMAScript API to get and set various KPR Text and Style properties, including font, point size, style, alignment, indentation and margins. The example also shows how to implement tappable text links and use text spans to display multi-styled text blocks. Tap the settings button to choose from a scrolling menu of text and style options.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### tiled-skins
<a href="https://github.com/Kinoma/KPR-examples/tree/master/tiled-skins"><img src="http://kinoma.github.io/KPR-examples/images/tiled-skins-example.jpg" height="100" alt=""/></a>

<x-app-info id="tiledskins.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to use tiled skins to fill content. Examples of nine part and three part horizontal/vertical tiled skins are provided. The nine part container is a button that changes color (state) when tapped. Additionally this example shows how to use a layer to display rotated text.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### timers
<a href="https://github.com/Kinoma/KPR-examples/tree/master/timers"><img src="http://kinoma.github.io/KPR-examples/images/timers-example.jpg" height="100" alt=""/></a>

<x-app-info id="timers.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to use different timer techniques: One-shot, interval, repeating, handler.wait and container.wait. An interval timer is used to animate skin states.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### transitions
<a href="https://github.com/Kinoma/KPR-examples/tree/master/transitions"><img src="http://kinoma.github.io/KPR-examples/images/transistion-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="transitions.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to use the Transitions library to configure and use a variety of transitions. The host application can further customize each transition by overriding the duration, easing function used for pacing time and specifying whether or not the former content should be removed once the transition completes.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### websocket-client
<a href="https://github.com/Kinoma/KPR-examples/tree/master/websocket-client"><img src="http://kinoma.github.io/KPR-examples/images/websocket-client-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="websocketclient.example.kinoma.marvell.com"></x-app-info>

This mobile framework application demonstrates how to implement a web socket client in KPR. Coupled with the websocket-server example, this application implements a web socket based chat client. The client discovers and connects to the server using SSDP and exchanges text messages with the server. This application is useful for understanding how to integrate web sockets, use SSDP to discover server devices, build UIs with editable text fields and transitions.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### websocket-server
<a href="https://github.com/Kinoma/KPR-examples/tree/master/websocket-server"><img src="http://kinoma.github.io/KPR-examples/images/websocket-server-example.jpg" height="100" alt=""/></a>
					
<x-app-info id="websocketserver.example.kinoma.marvell.com"></x-app-info>

This application demonstrates how to implement a web socket server in KPR. Coupled with the websocket-client example, this application implements a web socket based chat server. The client discovers and connects to the server using SSDP. Once the connection is established, the client exchanges text messages with the server. This application is useful for understanding how to build a web socket server and use KPR Text and Scroller objects to display a scrolling list of messages.

<div style="clear:both; margin-bottom: 16px;"></div>			
***

### xml-dom
<a href="https://github.com/Kinoma/KPR-examples/tree/master/xml-dom"><img src="http://kinoma.github.io/KPR-examples/images/xml-dom-example.jpg" height="100" alt=""/></a>

<x-app-info id="xmldom.example.kinoma.marvell.com"></x-app-info>

This example demonstrates how to issue an HTTP request to the Open Weather Map service and use the KPR DOM parsing APIs to parse the XML response. The temperature for the requested city is displayed. This example shows how to invoke a HTTP request to a web service, parse the XML response, display a busy indicator while waiting for the result and how to implement a tappable link which opens in the device browser. Note that browser support may not be available on all platforms.

<div style="clear:both; margin-bottom: 16px;"></div>			
***
These examples released under the <a href="http://www.apache.org/licenses/LICENSE-2.0.html" rel="license">Apache Foundation</a> license.
