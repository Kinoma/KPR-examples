/* *     Copyright (C) 2010-2016 Marvell International Ltd. *     Copyright (C) 2002-2010 Kinoma, Inc. * *     Licensed under the Apache License, Version 2.0 (the "License"); *     you may not use this file except in compliance with the License. *     You may obtain a copy of the License at * *      http://www.apache.org/licenses/LICENSE-2.0 * *     Unless required by applicable law or agreed to in writing, software *     distributed under the License is distributed on an "AS IS" BASIS, *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *     See the License for the specific language governing permissions and *     limitations under the License. */
 
 /*
	Touch State Machines

	A TouchStateMachine is useful when a container wants to handle touch events in a variety of ways depending on the current
	situation.  For example you may want to perform a combination of image mainpulations such as pinching to pan / zoom / rotate, dragging,
	tossing, and so on. Many times you'll want animation states to be applied in between these to animate a toss, a bounce,
	or even a transition to another image.
	
	A TouchStateMachine consists of a set of subclasses of TouchState, a set of condition functions that describe when to transition between states,
	and a set of TouchStateTransitions which bind a fromState, a toState, and a condition function.
	
	The TouchBehavior is used by a container that wants to implement a TouchStateMachine. The user should override the buildTouchStateMachine
	method and return a TouchStateMachine.

	The TouchBehavior creates a oneFingerHandler and a twoFingerHandler. The idea is that the TouchStates and condition functions themselves should not 
	usually have to do a lot of touch tracking and book keeping themselves, instead they may retreive interesting information from these finger handlers.
				
	For example a Drag state may be interested in 
		this.oneFingerHandler.deltaTranslation
	a Rotate state may be interested in
		this.twoFingerHandler.frameDeltaRotation
	and a Toss state may interested in
		this.oneFingerHandler.velocity
		
	Animated TouchStates may choose to perform a KPR transition and receive callbacks by calling the runVisualTransition method and handling the callbacks.

	Debugging tip: When creating and testing your own state machine it's often useful to uncomment the lines in fingers.xml that print out the
	enter and exit state information, specifically:
		//print("exit state: " + this.currentState.id)
		//print("enter state: " + state.id)
*/

/*
	The buildPictureTouchStateMachine function creates a TouchStateMachine that allows for manipulating pictures.	In particular the set of features it includes are suitable for selecting a cropping area from a photo.		Options include		- choose to "fit" or "fill" the picture within its container		- choose to allow rotation		Interactions include		- tap to zoom in about tapped location		- tap to zoom back to the fit size when zoomed in		- press and hold to progressively zoom in about location until released		- pinch to scale and pan about origin of pinch			- since it is geared towards photo cropping, releasing when scaled below the fit size will animate up to the fit size			- and releasing while scaled large enough to cover container will animate to edge to ensure coverage		- pinch to rotate the picture about origin of pinch (when allowRotation is true)			- rotation does not begin until the picture is scaled below 95 percent of fit size and rotated			- releasing while rotated will animate to the nearest 90 degree angle and to the fit size		- drag picture with a single finger		- drag and toss a picture, it will be constrained and bounce off edges		- transitions between dragging and pinching states are allowed			You may choose to modify the set of states, transitions, and transition conditions in order to achieve custom results.		To do so you could examine the buildPictureTouchStateMachine function, and create your own version. You may instantiate and 	make use of any of the existing states by creating one as in:			new TOUCH_STATES.ZoomInAboutPointState(container, picture);			This example loads a local picture; for async pictures you may want to add a loading / busy control	and hide it in the onShowingStateComplete callback.
*/	
import FINGERS from 'multitouch/fingers';
import TOUCH_STATES from 'multitouch/pictureTouchStates';
let whiteSkin = new Skin({ fill: 'white' });let PictureContainer = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, skin: whiteSkin, 
	active: true,
	contents: [		Picture($, { 
			left: 0, top: 0, name: 'picture', url: "./assets/garden-veggies.jpg",
			Behavior: class extends Behavior {				onLoaded(picture) {					this.loaded = true					this.fitType = "fill" // may be set to "fit" or "fill"					this.fitPicture(picture)				}				fitPicture(picture) {					if (this.loaded)						TOUCH_STATES.fitPicture(picture, 0, this.fitType)				}		
			} 
		}),	], 
	Behavior: class extends FINGERS.TouchBehavior {
		buildTouchStateMachine(container) {			var allowRotation = true;															return TOUCH_STATES.buildPictureTouchStateMachine(container, container.picture, allowRotation);	// note we pass both the container and the picture to be manipulated here		}		onCreate(container, data) {	
			super.onCreate(container, data);				this.data = data;			this.loaded = false			container.exclusiveTouch = true;			container.multipleTouch = true;		}		onShowingStateComplete(container) {			// could hide a busy indicator here for async pictures		}		onPhotoViewChanged(container) {			// this is called when the touch state machine returns to idle			// Kinoma Connect uses this oportunity send the latest cropped view of the image to the renderer		}
	},
}));

class AppBehavior extends Behavior {
	onLaunch(application) {
		application.add( new PictureContainer({}) );
	}
}
application.behavior = new AppBehavior();