/*
 *     Copyright (C) 2010-2016 Marvell International Ltd.
 *     Copyright (C) 2002-2010 Kinoma, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */
import {
	TouchState,
	TouchBehavior,
	TouchStateTransition,
	TouchStateMachine
} from 'fingers';

let busyTexture = new Texture('assets/busy.png', 1);
let busySkin = new Skin({ texture: busyTexture, width: 40, height: 40, variants: 40, });

let busyCount = 16;
export class BusyBehavior extends Behavior {
	onCreate(target) {
		target.duration = 125;
		target.variant = 0;
	}
	onDisplayed(target) {
		target.start();
	}
	onFinished(target) {
		let variant = target.variant + 1;
		if (variant == busyCount) variant = 0;
		target.variant = variant;
		target.time = 0;
		target.start();
	}
}

/* =-====================================================================-= */
/* =-=========================== UTILITIES ==============================-= */
/* =-====================================================================-= */
var calcFitScaleAndOrigin = function(target) { 
	var origin = { x : target.width / 2, y : target.height / 2 }
	var scale = calcFitScale(target)
	var fitScale = { x : scale, y : scale }
	return { scale : fitScale, origin : origin }
}

var calcFitOriginTranslationScale = function(content, rotation, containerWidth, containerHeight) {
	rotation = cleanRotation(rotation)
	var container = content.container;
	var containerWidth = (containerWidth == undefined) ? container.width : containerWidth
	var containerHeight = (containerHeight == undefined) ? container.height : containerHeight
	var dstWidth = containerWidth, srcWidth
	var dstHeight = containerHeight, srcHeight
	if ((rotation == 90) || (rotation == 270)) {
		srcWidth = content.height
		srcHeight = content.width
	}
	else {
		srcWidth = content.width
		srcHeight = content.height
	}
	var scale = dstWidth / srcWidth
	if ((srcHeight * scale) > dstHeight)
		scale = dstHeight / srcHeight
	var origin = { x: content.width / 2, y: content.height / 2 }
	var translation = { x: (containerWidth - content.width) / 2,  y: (containerHeight - content.height) / 2 }
	var scale = { x: scale, y: scale }
	var result = { origin : origin, translation : translation, scale : scale }
	return result
	}

var calcFitScale = function(target) {
	var rotation = calcNearestNinetyRotation(target)
	var swap = (rotation != 0 && rotation != 180 && rotation != 360)		
	var width = swap ? target.height : target.width
	var height = swap ? target.width : target.height
	var containerWidth = target.container.width
	var containerHeight = target.container.height
	var scaleX = containerWidth / width
	var scaleY = containerHeight / height
	var scale = Math.min(scaleX, scaleY)
	return scale
}	

var calcNearestNinetyRotation = function(content) {
	var r = content.rotation
	r = cleanRotation(r)
	if (r >= 315)
		return 360
	if (r <= 45)
		return 0
	if (r >= 45 && r <= 135)
		return 90
	if (r >= 135 && r <= 225)
		return 180
	return 270
}	

var updateOriginAndTranslation = function(target, point) {
	var centerPoint = point
	var t = target.transformTouch(centerPoint.x, centerPoint.y)
	var newOriginX = t.x - target.x
	var newOriginY = t.y - target.y
	var lastOriginX = target.origin.x
	var lastOriginY = target.origin.y
	var deltaOriginX = lastOriginX - newOriginX
	var deltaOriginY = lastOriginY - newOriginY
	var windowDeltaOriginX = deltaOriginX + target.x
	var windowDeltaOriginY = deltaOriginY + target.y
	var inverseOriginDelta = target.transformTouch(windowDeltaOriginX, windowDeltaOriginY)
	var localInverseOriginDelta = { x: inverseOriginDelta.x - target.x, y : inverseOriginDelta.y - target.y }
	// translate by the correct amount to nullify the change of origin
	var oldOrigin = { x : lastOriginX, y : lastOriginY }
	var newOrigin = { x : newOriginX, y : newOriginY }
	var translation = calcTranslationForChangeOfOrigin(target.translation, target.scale, target.rotation, oldOrigin, newOrigin)
	target.translation = { x : translation.x, y : translation.y }
	target.origin = { x: newOriginX, y: newOriginY }
}

var updateOriginAndTranslationForNewOrigin = function(target, newOrigin) {
	// translate by the correct amount to nullify the change of origin
	var oldOrigin = { x : target.origin.x, y : target.origin.y }
	var translation = calcTranslationForChangeOfOrigin(target.translation, target.scale, target.rotation, oldOrigin, newOrigin)
	target.translation = { x : translation.x, y : translation.y }
	target.origin = { x: newOrigin.x, y: newOrigin.y }
}

var calcTranslationForChangeOfOrigin = function(translation, scale, rotation, oldOrigin, newOrigin) {		//TX = O2^-1 R^-1 S^-1 O2 O^-1 S R O T
	var invNewOrigin = invertTranslation(newOrigin)
	var invRotation = invertRotation(rotation)
	var invScale = invertScale(scale)
	var invOldOrigin = invertTranslation(oldOrigin)
	var p = rotatePoint(invNewOrigin, invRotation)
	p = scalePoint(p, invScale)
	p = translatePoint(p, newOrigin)
	p = translatePoint(p, invOldOrigin)
	p = scalePoint(p, scale)
	p = rotatePoint(p, rotation)
	p = translatePoint(p, oldOrigin)
	p = translatePoint(p, translation)
	return p
}

var translatePoint = function(p, t) {
	return { x : p.x + t.x, y : p.y + t.y }
}

var scalePoint = function(p, s) {
	return { x : p.x * s.x, y : p.y * s.y }
}

var rotatePoint = function(p, degrees) {
	var r = (degrees / 180) * Math.PI
	var cos = Math.cos(r), sin = Math.sin(r)
	var rx = p.x * cos - p.y * sin
	var ry = p.x * sin + p.y * cos
	return { x : rx, y : ry }
}

var invertTranslation = function(t) {
	return { x: -t.x, y: -t.y }
}

var invertScale = function(s) {
	return { x : 1 / s.x, y : 1 / s.y }
}

var invertRotation = function(r) {
	return -r
}

var transformPoint = function(picture, p) {
	p = scalePoint(p, picture.scale)
	p = rotatePoint(p, picture.rotation)
	p = translatePoint(p, picture.translation)
	return p
}

var getDisplayBounds = function(picture) {
	var p0 = { x : 0, y : 0 }
	var p1 = { x : picture.width, y : 0 }
	var p2 = { x : picture.width, y : picture.height }
	var p3 = { x : 0, y : picture.height }
	var p0t = transformPoint(picture, p0)
	var p1t = transformPoint(picture, p1)
	var p2t = transformPoint(picture, p2)
	var p3t = transformPoint(picture, p3)
	var left = Math.min(p0t.x, Math.min(p1t.x, Math.min(p2t.x, p3t.x)))
	var top = Math.min(p0t.y, Math.min(p1t.y, Math.min(p2t.y, p3t.y)))
	var right = Math.max(p0t.x, Math.max(p1t.x, Math.max(p2t.x, p3t.x)))
	var bottom = Math.max(p0t.y, Math.max(p1t.y, Math.max(p2t.y, p3t.y)))
	var db = { x : left, y : top, width : right - left, height : bottom - top }
	return db
}

var cleanRotation = function(rotation) {
	while (rotation < 0)
		rotation += 360
	while (rotation > 360)
		rotation -= 360
	return rotation
}

var clamp = function(val, min, max) {
	return Math.max(min, Math.min(max, val))
}  

var smoothlyDamp = function(currentValue, targetValue, currentVelocity, smoothTime, maxSpeed, deltaTime) {
	smoothTime = Math.max (0.0001, smoothTime)
	var num = 2 / smoothTime
	var num2 = num * deltaTime
	var num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2)
	var num4 = currentValue - targetValue
	var num5 = targetValue
	var num6 = maxSpeed * smoothTime
	num4 = Math3D.prototype.clamp(num4, -num6, num6)
	targetValue = currentValue - num4
	var num7 = (currentVelocity.value + num * num4) * deltaTime
	currentVelocity.value = (currentVelocity.value - num * num7) * num3
	var num8 = targetValue + (num4 + num7) * num3
	if (num5 - currentValue > 0 == num8 > num5) {
	   num8 = num5
	   currentVelocity.value = (num8 - num5) / deltaTime
	}
	return num8
}

var constrainX = function(container, picture, translationX) {	// picture origin must be 0,0
	switch (cleanRotation(picture.rotation)) {
		case 0:
			var maxTranslationX = 0
			if (translationX > maxTranslationX)
				return maxTranslationX
			var pictureWidth = picture.scale.x * picture.width
			var minTranslationX = container.width - pictureWidth
			if (translationX < minTranslationX)
				return minTranslationX
			return translationX
		case 270:
			var maxTranslationX = 0
			if (translationX > maxTranslationX)
				return maxTranslationX
			var pictureHeight = picture.scale.y * picture.height
			var minTranslationX = container.width - pictureHeight
			if (translationX < minTranslationX)
				return minTranslationX
			return translationX
		case 90:
			var pictureHeight = picture.scale.y * picture.height
			var maxTranslationX = pictureHeight
			if (translationX > maxTranslationX)
				return maxTranslationX
			var minTranslationX = container.width
			if (translationX < minTranslationX)
				return minTranslationX
			return translationX
		case 180:
			var pictureWidth = picture.scale.x * picture.width
			var maxTranslationX = pictureWidth
			if (translationX > maxTranslationX)
				return maxTranslationX
			var minTranslationX = container.width
			if (translationX < minTranslationX)
				return minTranslationX
			return translationX
	}					
}

var leftConstrained = function(picture) {	// picture origin must be 0,0
	var container = picture.container
	var translationX = picture.translation.x
	switch (cleanRotation(picture.rotation)) {
		case 0:
				var maxTranslationX = 0
			if (translationX > maxTranslationX)
				return { is : true, value : maxTranslationX }
			return { is : false, value : translationX }
		case 270:
			var maxTranslationX = 0
			if (translationX > maxTranslationX)
				return { is : true, value : maxTranslationX }
			return { is : false, value : translationX }
		case 90:
			var pictureHeight = picture.scale.y * picture.height
			var maxTranslationX = pictureHeight
			if (translationX > maxTranslationX)
				return { is : true, value : maxTranslationX }
			return { is : false, value : translationX }
		case 180:
			var pictureWidth = picture.scale.x * picture.width
			var maxTranslationX = pictureWidth
			if (translationX > maxTranslationX)
				return { is : true, value : maxTranslationX }
			return { is : false, value : translationX }
	}					
}

var rightConstrained = function(picture) {	// picture origin must be 0,0
	var container = picture.container
	var translationX = picture.translation.x
	switch (cleanRotation(picture.rotation)) {
		case 0:
			var pictureWidth = picture.scale.x * picture.width
			var minTranslationX = container.width - pictureWidth
			if (translationX < minTranslationX)
				return { is : true, value : minTranslationX }
			return { is : false, value : translationX }
		case 270:
			var pictureHeight = picture.scale.y * picture.height
			var minTranslationX = container.width - pictureHeight
			if (translationX < minTranslationX)
				return { is : true, value : minTranslationX }
			return { is : false, value : translationX }
		case 90:
				var minTranslationX = container.width
			if (translationX < minTranslationX)
				return { is : true, value : minTranslationX }
			return { is : false, value : translationX }
		case 180:
				var minTranslationX = container.width
			if (translationX < minTranslationX)
				return { is : true, value : minTranslationX }
			return { is : false, value : translationX }
	}					
}

var constrainY = function(container, picture, translationY) {	// picture origin must be 0,0
	switch (cleanRotation(picture.rotation)) {
		case 0:
			var maxTranslationY = 0
			if (translationY > maxTranslationY)
				return maxTranslationY
			var pictureHeight = picture.scale.y * picture.height
			var minTranslationY = container.height - pictureHeight
			if (translationY < minTranslationY)
				return minTranslationY
			return translationY
		case 90:
			var maxTranslationY = 0
			if (translationY > maxTranslationY)
				return maxTranslationY
			var pictureWidth = picture.scale.x * picture.width
			var minTranslationY = container.height - pictureWidth
			if (translationY < minTranslationY)
				return minTranslationY
			return translationY
		case 180:
			var pictureHeight = picture.scale.y * picture.height
			var maxTranslationY = pictureHeight
			if (translationY > maxTranslationY)
				return maxTranslationY
			var minTranslationY = container.height
			if (translationY < minTranslationY)
				return minTranslationY
			return translationY
		case 270:
			var pictureWidth = picture.scale.x * picture.width
			var maxTranslationY = pictureWidth
			if (translationY > maxTranslationY)
				return maxTranslationY
			var minTranslationY = container.height
			if (translationY < minTranslationY)
				return minTranslationY
			return translationY
	}
}

var topConstrained = function(picture) {	// picture origin must be 0,0
	var container = picture.container
	var translationY = picture.translation.y
	switch (cleanRotation(picture.rotation)) {
		case 0:
			var maxTranslationY = 0
			if (translationY > maxTranslationY)
				return { is : true, value : maxTranslationY }
			return { is : false, value : translationY }
		case 90:
			var maxTranslationY = 0
			if (translationY > maxTranslationY)
				return { is : true, value : maxTranslationY }
			return { is : false, value : translationY }
		case 180:
			var pictureHeight = picture.scale.y * picture.height
			var maxTranslationY = pictureHeight
			if (translationY > maxTranslationY)
				return { is : true, value : maxTranslationY }
			return { is : false, value : translationY }
		case 270:
			var pictureWidth = picture.scale.x * picture.width
			var maxTranslationY = pictureWidth
			if (translationY > maxTranslationY)
				return { is : true, value : maxTranslationY }
			return { is : false, value : translationY }
	}
}

var bottomConstrained = function(picture) {	// picture origin must be 0,0
	var container = picture.container
	var translationY = picture.translation.y
	switch (cleanRotation(picture.rotation)) {
		case 0:
			var pictureHeight = picture.scale.y * picture.height
			var minTranslationY = container.height - pictureHeight
			if (translationY < minTranslationY)
				return { is : true, value : minTranslationY }
			return { is : false, value : translationY }
		case 90:
			var pictureWidth = picture.scale.x * picture.width
			var minTranslationY = container.height - pictureWidth
			if (translationY < minTranslationY)
				return { is : true, value : minTranslationY }
			return { is : false, value : translationY }
		case 180:
			var minTranslationY = container.height
			if (translationY < minTranslationY)
				return { is : true, value : minTranslationY }
			return { is : false, value : translationY }
		case 270:
			var minTranslationY = container.height
			if (translationY < minTranslationY)
				return { is : true, value : minTranslationY }
			return { is : false, value : translationY }
		}
}

/* =-====================================================================-= */
/* =-==================== TOSSING HELPER FUNCTIONS ======================-= */
/* =-====================================================================-= */
var computeDistance = function(v0, v1, k) { return (v0 - v1) / k }
var computeDuration = function(v0, v1, k) { return Math.log(v0 / v1) / k }

var evaluateBounceback = function(v0, duration, time) {
	if (time >= duration)	
		return 0
	else if (time >= 0)		
		return v0 * time * Math.exp(-10.0 * time / duration)
	else 													
		return NaN											
}

var evaluatePositionAtTime = function(v0, v1, k, t) {
	if (t >= computeDuration(v0, v1, k))
		return computeDistance(v0, v1, k)
	else if (t <= 0)					
		return 0
	else								
		return (1.0 - Math.exp(-k * t)) * v0 / k
}

var evaluateTimeAtPosition = function(v0, v1, k, position) {
	var distance = computeDistance(v0, v1, k)
	if (Math.abs(position) > Math.abs(distance))
		return NaN
	else if (position == 0)								
		return NaN
	else												
		return - Math.log(1.0 - k * position / v0) / k
}

var evaluateVelocityAtTime = function(v0, v1, k, time) {
	if (time >= computeDuration(v0, v1, k))
		return 0
	else if (time < 0)						
		return 0
	else								
		return Math.exp(-k * time) * v0
}

var print = function(msg) { trace(msg + "\n") }

var printTransform = function(target) {
	print("\n")
	print("source width: " + target.width + "height: " + target.height)
	print("origin x: " +  target.origin.x + " y: " +  target.origin.y)
	print("translation x: " +  target.translation.x + " y: " +  target.translation.y)
	print("scale x: " +  target.scale.x + " y: " +  target.scale.y)
	print("scaled width: " +  (target.scale.x * target.width) + " scaled height: " +  (target.scale.y * target.height))
	print("rotation: " + target.rotation)
}      

var printPoint = function(name, p) {
	print(name + " x: " + p.x + " y: " + p.y)
}

var printRect = function(name, r) {
	print(name + " x: " + r.x + " y: " + r.y + " width: " + r.width + " height: " + r.height)
}
        	

/* =-====================================================================-= */
/* =-========================= TOUCH STATES =============================-= */
/* =-====================================================================-= */
class SnapbackYState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.scroller = scroller
		this.id = "SnapbackY"
		this.duration = 1000
	}
	onEnter(fromState) {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		var translation = picture.translation
		this.fromY = translation.y
		this.toY = constrainY(picture.container, picture, translation.y)
		this.runVisualTransition(picture, this.duration)
	}
	onStepTransition(fraction) {
		fraction = Math.exponetialEaseOut(fraction)					
		var y = this.fromY + fraction * (this.toY - this.fromY)				
		var picture = this.picture
		picture.translation = { x : picture.translation.x, y : y }
	}
}

class SnapbackState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.scroller = scroller
		this.id = "Snapback"
		this.duration = 300
	}
	onEnter(fromState) {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		var fitScale = calcFitScale(picture)
			
		updateOriginAndTranslationForNewOrigin(picture, { x : 0, y : 0 })
		var translation = picture.translation
		this.fromX = translation.x
		this.fromY = translation.y
		var displayBounds = getDisplayBounds(picture)
		var centerX = displayBounds.width < picture.container.width
		var centerY = displayBounds.height < picture.container.height
		
		if (centerX)
			this.toX = (picture.container.width - displayBounds.width) / 2
		else
			this.toX = constrainX(picture.container, picture, translation.x)
		if (centerY)
			this.toY = (picture.container.height - displayBounds.height) / 2
		else
			this.toY = constrainY(picture.container, picture, translation.y)
		
		if (this.fromX != this.toX || this.fromY != this.toY) {
			this.runVisualTransition(picture, this.duration)
		}
		else
			this.finished()
	}
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)					
		var x = this.fromX + fraction * (this.toX - this.fromX)
		var y = this.fromY + fraction * (this.toY - this.fromY)		
		this.picture.translation = { x : x, y : y }
	}
}	

class SlideIdleState extends TouchState {
	constructor(scroller) {
		super(scroller)
		this.scroller = scroller
		this.id = "SlideIdle"
	}
	onEnter(fromState) {
		this.picture = this.getFocusedPicture()
		this.imageIsFitted = this.isImageFitted()
		this.imageWidthLessThanContainer = this.isImageWidthLessThanContainer()
	}
	getFocusedPicture () {
		return this.scroller.behavior.getFocusedPicture()
	}
	isImageFitted() {
		var isFitted = true
		var picture = this.getFocusedPicture()
		if (picture && picture.ready) {
			var fit = calcFitOriginTranslationScale(picture, picture.rotation)
			if (fit.scale.x == picture.scale.x && fit.scale.y == picture.scale.y
					&& fit.origin.x == picture.origin.x && fit.origin.y == picture.origin.y 
					&& fit.translation.x == picture.translation.x && fit.translation.y == picture.translation.y)
				isFitted = true
			else
				isFitted = false
		}
		return isFitted
	}
	isImageWidthLessThanContainer() {
		var isLess = false
		var picture = this.getFocusedPicture()
		if (picture) {
			var displayBounds = getDisplayBounds(picture)
			if (displayBounds.width < picture.container.bounds.width)
				isLess = true
		}
		return isLess
	}
}

class ZoomedDraggingState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "ZoomedDragging"
		this.scroller = scroller
	}
	getPicture() {
		return this.scroller.behavior.getFocusedPicture()
	}
	onEnter(fromState) {
		var picture = this.getPicture()
		updateOriginAndTranslationForNewOrigin(picture,  { x : 0, y : 0 })
		this.onTouchChanged()
	}
	onTouchChanged() {
		var picture = this.getPicture()
		var saveTx = picture.translation.x
		var saveTy = picture.translation.y
		var deltaTranslation = this.oneFingerHandler.deltaTranslation
		var dx = deltaTranslation.x
		var dy = deltaTranslation.y
		var newTx

		var needsSnapback = false, needsLeftScrolling = false, needsRightScrolling = false
		
		var isFirst = this.scroller.behavior.isFirstPicture()
		var leftC = leftConstrained(picture)
		if (leftC.is) {
			if (isFirst)
				needsSnapback = true
			else
				needsRightScrolling = true
		}
		var isLast = this.scroller.behavior.isLastPicture()
		var rightC = rightConstrained(picture)
		if (rightC.is) {
			if (isLast)
				needsSnapback = true
			else
				needsLeftScrolling = true
		}

		if (needsSnapback)
			dx /= 3
		if (needsLeftScrolling || needsRightScrolling)
			newTx = needsLeftScrolling ? rightC.value : leftC.value
		else
			newTx = picture.translation.x + dx
		if (this.isYConstrained()) {
			dy /= 3
			needsSnapback = true
		}

		picture.translation = { x : newTx, y : picture.translation.y + dy }
		
		this.needsSnapback = needsSnapback
		this.needsLeftScrolling = needsLeftScrolling
		this.needsRightScrolling = needsRightScrolling
	}
	isXConstrained() {
		var picture = this.getPicture()
		var tx = picture.translation.x
		if (tx != constrainX(picture.container, picture, tx))
			return true
		return false
	}
	isYConstrained() {
		var picture = this.getPicture()
		var ty = picture.translation.y
		if (ty != constrainY(picture.container, picture, ty))
			return true
		return false
	}
}

class VDraggingState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "VDragging"
		this.scroller = scroller
	}
	onEnter(fromState) {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		updateOriginAndTranslationForNewOrigin(picture,  { x : 0, y : 0 })
		this.needsSnapback = false
	}
	onTouchChanged() {
		var picture = this.picture
		var dy = this.oneFingerHandler.deltaTranslation.y
		var needsSnapback = this.needsSnapback = this.isYConstrained()
		if (needsSnapback)
			dy /= 3
		picture.translation = { x : picture.translation.x, y : picture.translation.y + dy }
	}
	isYConstrained() {
		var picture = this.picture
		var ty = picture.translation.y
		if (ty != constrainY(picture.container, picture, ty))
			return true
		return false
	}
}

class HScrollingState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "HScrolling"
		this.scroller = scroller
	}
	onEnter(fromState) {
		var scroller = this.scroller
		var scrollerBehavior = scroller.behavior
		this.startScrollX = scrollerBehavior.HScrollingState_startScroll = scroller.scroll.x
		var fromZoomedDragging = this.fromZoomedDragging = fromState.id == "ZoomedDragging"
		this.neededLeftScrolling = fromZoomedDragging && fromState.needsLeftScrolling
		this.neededRightScrolling = fromZoomedDragging && fromState.needsRightScrolling
		scrollerBehavior.HScrollingState_startScrollPicture = scroller.behavior.getFocusedPicture()							
		this.beginResistX = null
		this.needsFirstSnapback = this.needsLastSnapback = false
		var picture = scrollerBehavior.getFocusedPicture()
		this.translationXOnEnter = picture.translation.x
		this.needsZoomedDragging = false
		this.onTouchChanged()							// to set state transition conditionals even if we don't move 
	}
	onTouchChanged() {
		var scroller = this.scroller
		var deltaTranslation = this.oneFingerHandler.deltaTranslation
		if (deltaTranslation.x == 0)
			return

		var isFirst = scroller.behavior.isFirstPicture()
		var isLast = scroller.behavior.isLastPicture()
		var newScrollX = scroller.scroll.x - deltaTranslation.x
		var resistDX = deltaTranslation.x / 3
		var picture = scroller.behavior.getFocusedPicture()
		var resisted = false
		var minScrollX = scroller.behavior.getMinScrollX()
		var maxScrollX = scroller.behavior.getMaxScrollX()
		
		this.needsFirstSnapback = this.needsLastSnapback = false
		
		if (isFirst) {
			if (newScrollX < minScrollX) {
				if (this.beginResistX == null)
					this.beginResistX = picture.translation.x
				picture.translation = { x : picture.translation.x + resistDX, y : picture.translation.y }
				scroller.scrollTo(minScrollX, 0)
				resisted = this.needsFirstSnapback = true
			}
		}
		if (! resisted && isLast) {
			if (newScrollX > maxScrollX) {
				if (this.beginResistX == null)
					this.beginResistX = picture.translation.x
				picture.translation = { x : picture.translation.x + resistDX, y : picture.translation.y }
				scroller.scrollTo(maxScrollX, 0)
				resisted = this.needsLastSnapback = true
			}
		}
		if (! resisted) {
			if (this.beginResistX != null) {
				picture.translation = { x : this.beginResistX, y : picture.translation.y }
				this.beginResistX = null
			}
			
			this.needsZoomedDragging = false
			if (this.fromZoomedDragging) {
				var newScrollX = scroller.scroll.x - deltaTranslation.x
				if (this.neededRightScrolling && (newScrollX > this.startScrollX))
					this.needsZoomedDragging = true
				else if (this.neededLeftScrolling && (newScrollX < this.startScrollX))
					this.needsZoomedDragging = true
			}
			if (this.needsZoomedDragging)
				scroller.scrollTo(this.startScrollX, 0)
			else {
				scroller.scrollBy(-deltaTranslation.x, 0)
				if (this.fromZoomedDragging) {
					var dampen = true
					var dy = dampen ? deltaTranslation.y / 2 : deltaTranslation.y
					picture.translation = { x : picture.translation.x, y : picture.translation.y + dy }
				}
			}
		}
	}
	onExit() {
		var direction
		var v = this.oneFingerHandler.getVelocity()
		var speed =  Math.abs(v.x)
		var TOSS_THRESHOLD = 200
		if (speed < TOSS_THRESHOLD) { 
			var trayWidth = this.scroller.first.first.width			// go to closest if velocity was lower than threshold
			var fromScroll = this.scroller.scroll.x
			var modScroll = fromScroll % trayWidth
			direction = (modScroll > (trayWidth / 2)) ? 1 : -1
		}
		else
			direction = (v.x < 0) ? 1 : -1							// otherwise use direction of toss
		this.scroller.behavior.HScrollingState_direction = direction
	}
}

class SnapbackScrollState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.scroller = scroller
		this.id = "SnapbackScroll"
		this.duration = 300
	}
	onEnter(fromState) {
		this.picture = this.scroller.behavior.getFocusedPicture()
		if (fromState.needsFirstSnapback || fromState.needsLastSnapback) {
			this.fromX = this.picture.translation.x
			this.toX = fromState.translationXOnEnter
			this.runVisualTransition(this.picture, this.duration)
		}
		else
			this.finished()
	}
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)					
		var x = this.fromX + fraction * (this.toX - this.fromX)
		this.picture.translation = { x : x, y : this.picture.translation.y }
	}
}			

class QuickScrollState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "QuickScroll"
		this.scroller = scroller
		this.direction = 0
		this.duration = 250
	}
	onEnter(fromState) {
		var picture = this.scroller.behavior.getFocusedPicture()
		if (picture) {
			var v = this.oneFingerHandler.getVelocity()
			var trayWidth = picture.container.container.container.first.width
			var fromScroll = this.fromScroll = this.scroller.scroll.x
			var toScroll
			
			this.direction = this.scroller.behavior.HScrollingState_direction
			if (this.direction == 1) {								// next page
				toScroll = this.fromScroll + trayWidth
				toScroll -= (toScroll % trayWidth)
			}
			else {												// previous page
				toScroll = this.fromScroll - trayWidth
				toScroll += (trayWidth - (this.fromScroll % trayWidth))		
			}
			this.toScroll = toScroll
			
			// if we have changed pages, we need to re-fit previous picture and browsePicture
			this.needYTranslation = false
			this.needPictureFit = false
			var changedPage = (toScroll != this.scroller.behavior.HScrollingState_startScroll)
			if (changedPage) {
				this.needPictureFit = true	
				this.scroller.behavior.onBrowsePicture(this.direction)
			}
			else if (picture.origin.y == 0) {
				var topC = topConstrained(picture)
				var bottomC = bottomConstrained(picture)
				this.needYTranslation = topC.is || bottomC.is
				if (this.needYTranslation) {
					this.fromTranslationY = picture.translation.y
					this.toTranslationY = topC.is ? topC.value : bottomC.value
				}
			}
					
			if (this.fromScroll == this.toScroll)
				this.finished()
			else
				this.beginAnimating()
		}
		else
			this.finished()
	}
	onTimeChanged() {
		var time = this.content.time
		if (time > this.duration)
			time = this.duration

		var picture = this.scroller.behavior.getFocusedPicture()
		if (time < this.duration) {
			var fraction = time / this.duration
			fraction = Math.quadEaseOut(fraction)
			var scroll = this.fromScroll + fraction * (this.toScroll - this.fromScroll)
			this.scroller.scrollTo(scroll, 0)
			if (this.needYTranslation) {
				var ty = this.fromTranslationY + fraction * (this.toTranslationY - this.fromTranslationY)
				picture.translation = { x : picture.translation.x, y : ty }
			}
		}
		else {
			this.scroller.scrollTo(this.toScroll, 0)
			if (this.needYTranslation)
				picture.translation = { x : picture.translation.x, y : this.toTranslationY }
			this.finished()
		}
	}
	onExit() {
		if (this.needPictureFit) {
			var picture = this.scroller.behavior.HScrollingState_startScrollPicture
			picture.behavior.fitPicture()
			
			this.scroller.behavior.onPicturePageScrolled(this.direction)
		}
	}
}

/*
	A two finger pinch that translates, and scales about the midpoint of the fingers
*/
class PanZoomState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "PanZoom"
		this.scroller = scroller
	}
	onEnter(fromState) {
		this.needsSnapback = false
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		if (picture) {
			var fit = calcFitScaleAndOrigin(picture)
			this.fitScaleX = fit.scale.x
			this.scaleAnchor = picture.scale.x
			this.centerPoint = { x : this.twoFingerHandler.centerPoint.x, y : this.twoFingerHandler.centerPoint.y }
			updateOriginAndTranslation(picture, this.centerPoint)
		}
	}
	onTouchChanged() {
		var picture = this.picture
		if (picture) {
			var h = this.twoFingerHandler
			var dx = h.frameDeltaTranslation.x
			var dy = h.frameDeltaTranslation.y
		
			updateOriginAndTranslationForNewOrigin(picture, { x : 0, y : 0 })
			
			var needsSnapback = this.needsSnapback = this.isConstrained()
			if (needsSnapback) {
				dx /= 3
				dy /= 3
			}

			updateOriginAndTranslation(picture, this.centerPoint)

			picture.translation =  { x: picture.translation.x + dx, y: picture.translation.y + dy }
			picture.scale = { x: this.scaleAnchor * h.scale, y: this.scaleAnchor * h.scale }
			
			this.needsZoomToFit = (picture.scale.x < this.fitScaleX)
		}
	}
	isConstrained() {
		var picture = this.picture
		var tx = picture.translation.x
		if (tx != constrainX(picture.container, picture, tx))
			return true
		var ty = picture.translation.y
		if (ty != constrainY(picture.container, picture, ty))
			return true
		return false
	}
}
	
class ZoomInAboutPointState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "ZoomInAboutPoint"
		this.scroller = scroller
	}
	onEnter() {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		
		// translate by the correct amount to nullify the change of origin
		var newOrigin = { x : this.oneFingerHandler.point.x, y : this.oneFingerHandler.point.y }
		updateOriginAndTranslation(picture, newOrigin)
		
		this.fromScale = picture.scale.x
		var scaleBy = 2
		this.toScale = this.fromScale * scaleBy
		var duration = 500
		this.runVisualTransition(picture, duration)
	}					
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)
		var picture = this.picture
		var scale = this.fromScale + fraction * (this.toScale - this.fromScale)
		picture.scale = { x: scale, y : scale }
	}
}

class ZoomHoldingAboutPointState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "ZoomHoldingAboutPoint"
		this.scroller = scroller
		this.maxScale = 4
	}
	onEnter() {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		// translate by the correct amount to nullify the change of origin
		var newOrigin = { x : this.oneFingerHandler.point.x, y : this.oneFingerHandler.point.y }
		updateOriginAndTranslation(picture, newOrigin)
		this.lastTime = 0
		this.beginAnimating()
	}					
	onTimeChanged() {
		var picture = this.picture
		var time = this.content.time
		var deltaTime = time - this.lastTime
		this.lastTime = time
		var scaleBy =  (1.05 / deltaTime)
		var scale = picture.scale.x + (deltaTime / 1000) * 0.5	// consider using log()
		if (scale > this.maxScale)
			scale = this.maxScale
		picture.scale = { x: scale, y : scale }
	}
}

class AnimateZoomToFitState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.id = "AnimateZoomToFit"
		this.scroller = scroller
	}
	onEnter(fromState) {
		var picture = this.scroller.behavior.getFocusedPicture()
		var rotation = 0
		var fitTransform = calcFitOriginTranslationScale(picture, rotation)
		
		updateOriginAndTranslationForNewOrigin(picture, fitTransform.origin)

		this.fromTranslation = picture.translation
		this.toTranslation = fitTransform.translation
		this.fromScale = picture.scale.x
		this.toScale = fitTransform.scale.x

		var duration = 300
		this.runVisualTransition(picture, duration)
	}					
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)
		var picture = this.scroller.behavior.getFocusedPicture()
		var scale = this.fromScale + fraction * (this.toScale - this.fromScale)
		picture.scale = { x: scale, y : scale }
		var tx = this.fromTranslation.x + fraction * (this.toTranslation.x - this.fromTranslation.x)
		var ty = this.fromTranslation.y + fraction * (this.toTranslation.y - this.fromTranslation.y)
		picture.translation = { x: tx, y : ty }
	}
}

/*
	Note:  v0, v1, and duration should all be either positive or negative
	
	v0	:	initial velocity
	v1	:	terminating velocity
	k	:	coefficient of kinetic friction
*/

class TossAndBouncebackState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.scroller = scroller
		this.id = "TossAndBounceback"
		this.absV1 = 0.005				
		this.k = 0.00205 // tuneable (larger values => more friction)
		this.stillMode = 0
		this.tossingMode = 1
		this.bouncebackMode = 2
		this.bouncebackDuration = 1200
	}
	onEnter(fromState) {
		this.xMode = this.stillMode
		this.yMode = this.stillMode
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		var v = this.oneFingerHandler.getVelocity()
		var xSpeed = Math.abs(v.x)
		var ySpeed = Math.abs(v.y)
		var TOSS_THRESHOLD = 200
		if (xSpeed >= TOSS_THRESHOLD || ySpeed >= TOSS_THRESHOLD) {
			this.v0x = v.x / 1000
			this.v0y = v.y / 1000
			
			this.v1x = (this.v0x < 0) ? -this.absV1 : this.absV1
			this.v1y = (this.v0y < 0) ? -this.absV1 : this.absV1 

			var startX = picture.translation.x
			var startY = picture.translation.y
			
			// shaving off one percent below works around a roundoff error leading to NaN values for the x and y durations below
			var xDistance = this.computeDistance(this.v0x, this.v1x, this.k) * 0.99		
			var yDistance = this.computeDistance(this.v0y, this.v1y, this.k) * 0.99
			
			var stopX = startX - xDistance
			var stopY = startY - yDistance
			var xDuration = 0, yDuration = 0;
			if (startX != stopX)
				xDuration = this.evaluateTimeAtPosition(this.v0x, this.v1x, this.k, startX - stopX)

			if (startY != stopY)
				yDuration = this.evaluateTimeAtPosition(this.v0y, this.v1y, this.k, startY - stopY)

			if (xDuration === NaN)
				xDuration = 0
			if (yDuration === NaN)
				yDuration = 0

			if (xDuration > 0 || yDuration > 0) {
				var maxDuration = Math.max(xDuration, yDuration)
				this.duration = maxDuration
				this.xMode = this.tossingMode
				this.yMode = this.tossingMode
				this.startTranslation = { x : picture.translation.x, y : picture.translation.y }
				this.beginAnimating()
			}
			else {
				this.finished()
			}
		}
		else {
			this.finished()
		}
	}
	onTimeChanged() {
		var time = this.content.time
		var translationX, translationY
		var picture = this.picture
		
		switch (this.xMode) {
			case this.stillMode:
				translationX = picture.translation.x
			break
			case this.tossingMode:
				var xFraction = time / this.duration
				if (xFraction > 1) {
					xFraction = 1
					this.xMode = this.stillMode
				}
 						var xOffset = this.evaluatePositionAtTime(this.v0x, this.v1x, this.k, time)
				translationX = this.startTranslation.x + xOffset
				var constrainedX = constrainX(picture.container, picture, translationX)	// * constrainLeft / Right / v.x / v.y
				if (constrainedX != translationX ) {
					var isLeft = constrainedX < translationX
					var vx = this.oneFingerHandler.getVelocity().x
					if ((isLeft && (vx > 0)) || ((false == isLeft) && (vx < 0))) {
						this.xBeginBouncebackVelocity = this.evaluateVelocityAtTime(this.v0x, this.v1x, this.k, time)
						this.xBeginBouncebackTranslation = constrainedX
						this.xBeginBouncebackTime = time
						this.xBouncebackDuration = this.bouncebackDuration
						this.xMode = this.bouncebackMode
						translationX = constrainedX
					}
				}
			break
			case this.bouncebackMode:
				var bouncebackTime = time - this.xBeginBouncebackTime
				var xFraction = bouncebackTime / this.xBouncebackDuration
				if (xFraction > 1) {
					xFraction = 1
					this.xMode = this.stillMode
				}
				var bouncebackOffsetX = this.evaluateBounceback(this.xBeginBouncebackVelocity, this.xBouncebackDuration, bouncebackTime)
				translationX = this.xBeginBouncebackTranslation + bouncebackOffsetX
			break
		}
		switch (this.yMode) {
			case this.stillMode:
				translationY = picture.translation.y
			break
			case this.tossingMode:
				var yFraction = time / this.duration
				if (yFraction > 1) {
					yFraction = 1
					this.yMode = this.stillMode
				}
 						var yOffset = this.evaluatePositionAtTime(this.v0y, this.v1y, this.k, time)
				translationY = this.startTranslation.y + yOffset
				var constrainedY = constrainY(picture.container, picture, translationY)
				if (constrainedY != translationY) {
					this.yBeginBouncebackVelocity = this.evaluateVelocityAtTime(this.v0y, this.v1y, this.k, time)
					this.yBeginBouncebackTranslation = constrainedY
					this.yBeginBouncebackTime = time
					this.yBouncebackDuration = this.bouncebackDuration
					this.yMode = this.bouncebackMode
					translationY = constrainedY
				}
			break
			case this.bouncebackMode:
				var bouncebackTime = time - this.yBeginBouncebackTime
				var yFraction = bouncebackTime / this.yBouncebackDuration

				if (yFraction > 1) {
					yFraction = 1
					this.yMode = this.stillMode
				}
				var bouncebackOffsetY = this.evaluateBounceback(this.yBeginBouncebackVelocity, this.yBouncebackDuration, bouncebackTime)
				translationY = this.yBeginBouncebackTranslation + bouncebackOffsetY
			break
		}
		
		picture.translation = { x : translationX, y : translationY }
		
		if (this.xMode == this.stillMode && this.yMode == this.stillMode)
			this.finished()					
	}
	computeDistance(v0, v1, k) {
		return (v0 - v1) / k
	}
	computeDuration(v0, v1, k) {
		return Math.log(v0 / v1) / k
	}
	evaluateBounceback(v0, duration, time) {
		if (time >= duration)	
			return 0
		else if (time >= 0)		
			return v0 * time * Math.exp(-10.0 * time / duration)
		else 													
			return NaN											
	}
	evaluatePositionAtTime(v0, v1, k, t) {
		if (t >= this.computeDuration(v0, v1, k))
			return this.computeDistance(v0, v1, k)
		else if (t <= 0)					
			return 0
		else								
			return (1.0 - Math.exp(-k * t)) * v0 / k
	}
	evaluateTimeAtPosition(v0, v1, k, position) {
		var distance = this.computeDistance(v0, v1, k)
		if (Math.abs(position) > Math.abs(distance))
			return NaN
		else if (position == 0)								
			return NaN
		else												
			return - Math.log(1.0 - k * position / v0) / k
	}
	evaluateVelocityAtTime(v0, v1, k, time) {
		if (time >= this.computeDuration(v0, v1, k))
			return 0
		else if (time < 0)						
			return 0
		else								
			return Math.exp(-k * time) * v0
	}
}
/*
	A two finger pinch that translates, and scales about the midpoint of the fingers
	It also rotates, but only if the image scale is smaller than the fit scale
	The target may be a layer or picture, content should be the targets container
*/
class PinchPictureState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.scroller = scroller
		this.id = "PinchPicture"
	}
	onEnter() {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		if (picture) {
			var fit = calcFitScaleAndOrigin(picture)
			this.scaleThreshold = 0.95 * fit.scale.x
			this.rotating = false
			this.rotateTearThreshold = 10
			this.scaleAnchor = target.scale.x
			updateOriginAndTranslation(picture, this.twoFingerHandler.centerPoint)
		}
	}
	onTouchChanged() {
		var target = this.picture
		var h = this.twoFingerHandler
		picture.translation =  { x: picture.translation.x + h.frameDeltaTranslation.x, y: picture.translation.y + h.frameDeltaTranslation.y }
		picture.scale = { x: this.scaleAnchor * h.scale, y: this.scaleAnchor * h.scale }
		if (this.rotating)
			picture.rotation = picture.rotation + h.frameDeltaRotation
		else if (picture.scale.x < this.scaleThreshold) {
			this.rotating = true
			picture.rotation = picture.rotation + h.frameDeltaRotation
		}
	}
}

class AnimateRotationToNearestQuarterTurnState extends TouchState {
	constructor(scroller) {
		super(scroller);
		this.scroller = scroller
		this.id = "AnimateRotationToNearestQuarterTurn"
	}
	onEnter() {
		var picture = this.picture = this.scroller.behavior.getFocusedPicture()
		if (picture) {
			this.fromRotation = picture.rotation
			this.fromScale = picture.scale.x
			this.toRotation = calcNearestNinetyRotation(picture)			
			this.toScale = calcFitScale(picture, this.toRotation)
			var duration = 500 // TO DO: Tune duration based on angle rotated
			this.runVisualTransition(this.scroller, duration)
		}
	}			
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)
		var picture = this.picture
		picture.rotation = this.fromRotation + fraction * (this.toRotation - this.fromRotation)
		var scale = this.fromScale + fraction * (this.toScale - this.fromScale)
		picture.scale = { x: scale, y : scale }
	}
}

var buildSlideViewerStateMachine = function(scroller) {
	var idleState = new SlideIdleState(scroller)

	var hScrollingState = new HScrollingState(scroller)
	var panZoomState = new PanZoomState(scroller)

	var zoomInAboutPointState = new ZoomInAboutPointState(scroller)
	var zoomHoldingAboutPointState = new ZoomHoldingAboutPointState(scroller)

	var animateZoomToFitState = new AnimateZoomToFitState(scroller)
	var quickScrollState = new QuickScrollState(scroller)
	
	var zoomedDraggingState = new ZoomedDraggingState(scroller)
	var snapbackYState = new SnapbackYState(scroller)

	var snapbackState = new SnapbackState(scroller)
	var snapbackScrollState = new SnapbackScrollState(scroller)
	var vDraggingState = new VDraggingState(scroller)

	var tossAndBouncebackState = new TossAndBouncebackState(scroller)
	var animateZoomToFitState = new AnimateZoomToFitState(scroller)

	// Touch Transition Conditions

	var idleToHScrollingCondition = function(state) {
		return state.oneFingerHandler.isDragging && state.imageIsFitted && state.getFocusedPicture() && ! state.twoFingerHandler.pinching
	}
	var idleToHScrolling = new TouchStateTransition(idleState, hScrollingState, idleToHScrollingCondition)

	var idleToZoomedDraggingCondition = function(state) {
		return state.oneFingerHandler.isDragging && ! state.isImageFitted() && state.getFocusedPicture()
	}
	var idleToZoomedDragging = new TouchStateTransition(idleState, zoomedDraggingState, idleToZoomedDraggingCondition)

	var zoomedDraggingToHScrollingCondition = function(state) {
		return (state.needsLeftScrolling && state.oneFingerHandler.translation.x < 0 && ! state.scroller.behavior.isLastPicture()) 		
				|| (state.needsRightScrolling && state.oneFingerHandler.translation.x > 0 && ! state.scroller.behavior.isFirstPicture()) 
	}
	var zoomedDraggingToHScrolling = new TouchStateTransition(zoomedDraggingState, hScrollingState, zoomedDraggingToHScrollingCondition)

	var hScrollingToZoomedDraggingCondition = function(state) {
		return state.needsZoomedDragging 
	}
	var hScrollingToZoomedDragging = new TouchStateTransition(hScrollingState, zoomedDraggingState, hScrollingToZoomedDraggingCondition)

	var zoomedDraggingToPanZoomCondition = function(state) {
		return state.twoFingerHandler.pinching
	}
	var zoomedDraggingToPanZoom = new TouchStateTransition(zoomedDraggingState, panZoomState, zoomedDraggingToPanZoomCondition)

	var zoomedDraggingToSnapbackCondition = function(state) {
		return ! state.oneFingerHandler.isDragging && state.needsSnapback
	}
	var zoomedDraggingToSnapback = new TouchStateTransition(zoomedDraggingState, snapbackState, zoomedDraggingToSnapbackCondition)

	var snapbackYToIdleCondition = function(state) {
		return ! state.active
	}
	var snapbackYToIdle = new TouchStateTransition(snapbackYState, idleState, snapbackYToIdleCondition)

	var idleToVDraggingCondition = function(state) {
		return 	state.oneFingerHandler.isDragging && ! state.oneFingerHandler.isHorizontalDrag 
				&& ! state.imageIsFitted && state.imageWidthLessThanContainer && state.picture
	}
	var idleToVDragging = new TouchStateTransition(idleState, vDraggingState, idleToVDraggingCondition)

	var vDraggingToSnapbackCondition = function(state) {
		return ! state.oneFingerHandler.isDragging && state.needsSnapback
	}
	var vDraggingToSnapback = new TouchStateTransition(vDraggingState, snapbackState, vDraggingToSnapbackCondition)

	var vDraggingToIdleCondition = function(state) {
		return ! state.oneFingerHandler.isDragging && ! state.needsSnapback
	}
	var vDraggingToIdle = new TouchStateTransition(vDraggingState, idleState, vDraggingToIdleCondition)

	var hScrollingToSnapbackScrollCondition = function(state) {
		return ! state.oneFingerHandler.isDragging && (state.needsFirstSnapback || state.needsLastSnapback)
	}
	var hScrollingToSnapbackScroll = new TouchStateTransition(hScrollingState, snapbackScrollState, hScrollingToSnapbackScrollCondition)

	var snapbackScrollToIdleCondition = function(state) {
		return ! state.active
	}
	var snapbackScrollToIdle = new TouchStateTransition(snapbackScrollState, idleState, snapbackScrollToIdleCondition)

	var hScrollingToQuickScrollCondition = function(state) {
		return ! state.oneFingerHandler.isDragging
	}
	var hScrollingToQuickScroll = new TouchStateTransition(hScrollingState, quickScrollState, hScrollingToQuickScrollCondition)

	var quickScrollToIdleCondition = function(state) {
		return ! state.active
	}
	var quickScrollToIdle = new TouchStateTransition(quickScrollState, idleState, quickScrollToIdleCondition)

	var panZoomToAnimateZoomToFitCondition = function(state) {
		return ! state.twoFingerHandler.pinching && state.needsZoomToFit
	}
	var panZoomToAnimateZoomToFit = new TouchStateTransition(panZoomState, animateZoomToFitState, panZoomToAnimateZoomToFitCondition)

	var animateZoomToFitToIdleCondition = function(state) {
		return ! state.active
	}
	var animateZoomToFitToIdle = new TouchStateTransition(animateZoomToFitState, idleState, animateZoomToFitToIdleCondition)


	var idleToPanZoomCondition = function(state) {
		return state.twoFingerHandler.pinching && state.getFocusedPicture() && state.getFocusedPicture().ready
	}
	var idleToPanZoom = new TouchStateTransition(idleState, panZoomState, idleToPanZoomCondition)

	var panZoomToIdleCondition = function(state) {
		return ! state.twoFingerHandler.pinching
	}
	var panZoomToIdle = new TouchStateTransition(panZoomState, idleState, panZoomToIdleCondition)

	var panZoomToSnapbackCondition = function(state) {
		return ! state.twoFingerHandler.pinching && state.needsSnapback && ! state.needsZoomToFit
	}
	var panZoomToSnapback = new TouchStateTransition(panZoomState, snapbackState, panZoomToSnapbackCondition)

	var snapbackToIdleCondition = function(state) {
		return ! state.active
	}
	var snapbackToIdle = new TouchStateTransition(snapbackState, idleState, snapbackToIdleCondition)

	var idleToAnimateZoomToFitCondition = function(state) {
		return state.oneFingerHandler.isSingleTapUp && ! state.imageIsFitted && state.getFocusedPicture()
	}
	var idleToAnimateZoomToFit = new TouchStateTransition(idleState, animateZoomToFitState, idleToAnimateZoomToFitCondition)

	var animateZoomToFitToIdleCondition = function(state) {
		return ! state.active
	}
	var animateZoomToFitToIdle = new TouchStateTransition(animateZoomToFitState, idleState, animateZoomToFitToIdleCondition)		

	var idleToZoomInAboutPointCondition = function(state) {
		return state.oneFingerHandler.isSingleTapUp && state.imageIsFitted && state.getFocusedPicture()
	}
	var idleToZoomInAboutPoint = new TouchStateTransition(idleState, zoomInAboutPointState, idleToZoomInAboutPointCondition)

	var zoomInAboutPointToIdleCondition = function(state) {
		return ! state.active
	}
	var zoomInAboutPointToIdle = new TouchStateTransition(zoomInAboutPointState, idleState, zoomInAboutPointToIdleCondition)		

	var idleToZoomHoldingAboutPointCondition = function(state) {
		return state.oneFingerHandler.isLongPress && state.getFocusedPicture()
	}
	var idleToZoomHoldingAboutPoint = new TouchStateTransition(idleState, zoomHoldingAboutPointState, idleToZoomHoldingAboutPointCondition)

	var zoomHoldingAboutPointToIdleCondition = function(state) {
		return state.oneFingerHandler.fingerID == null
	}
	var zoomHoldingAboutPointToIdle = new TouchStateTransition(zoomHoldingAboutPointState, idleState, zoomHoldingAboutPointToIdleCondition)		

	var zoomedDraggingToTossAndBouncebackCondition = function(state) {
		return state.oneFingerHandler.fingerID == null
	}
	var zoomedDraggingToTossAndBounceback = new TouchStateTransition(zoomedDraggingState, tossAndBouncebackState, zoomedDraggingToTossAndBouncebackCondition)

	var tossAndBouncebackToIdleCondition = function(state) {
		return ! state.active || state.oneFingerHandler.fingerID != null
	}
	var tossAndBouncebackToIdle = new TouchStateTransition(tossAndBouncebackState, idleState, tossAndBouncebackToIdleCondition)

	var touchStateTransitions = [ 											
		idleToHScrolling,
		
		hScrollingToSnapbackScroll,
		snapbackScrollToIdle,
								
		hScrollingToQuickScroll,
		quickScrollToIdle,
								
		idleToVDragging,
		vDraggingToSnapback,
		vDraggingToIdle,
	
		idleToZoomedDragging,
		zoomedDraggingToHScrolling,
		zoomedDraggingToPanZoom,
		zoomedDraggingToSnapback,
		snapbackYToIdle,
		hScrollingToZoomedDragging,
	
		idleToPanZoom,
		panZoomToSnapback,
		snapbackToIdle,
	
		panZoomToAnimateZoomToFit,
		animateZoomToFitToIdle,
		
		panZoomToIdle,
		
		idleToZoomInAboutPoint,
		zoomInAboutPointToIdle,
		
		idleToZoomHoldingAboutPoint,
		zoomHoldingAboutPointToIdle,
		
		idleToAnimateZoomToFit,
		animateZoomToFitToIdle,
		
		zoomedDraggingToTossAndBounceback,
		tossAndBouncebackToIdle
	]				
	var machine = new TouchStateMachine(idleState, touchStateTransitions)
	return machine
}

var getFirstPicture = function (data) {	return data.FIRST_PICTURE_CONTAINER.first }
var getSecondPicture = function(data) {	return data.SECOND_PICTURE_CONTAINER.first }
var getThirdPicture = function (data) { return data.THIRD_PICTURE_CONTAINER.first }
var getFirstBusy = function (data) { return data.FIRST_PICTURE_CONTAINER.last }
var getSecondBusy = function (data) { return data.SECOND_PICTURE_CONTAINER.last }
var getThirdBusy = function (data) { return data.THIRD_PICTURE_CONTAINER.last }

export var SlideViewer = Scroller.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, 
	Behavior: SlideScrollerBehavior,
	contents: [
		Line($, { left: 0, top: 0, bottom: 0, contents: [
			Container($, { left: 0, top: 0, bottom: 0, behavior: new TrayAdaptBehavior, contents: [
				Container($, { left: 0, top: 0, anchor: 'FIRST_PICTURE_CONTAINER', behavior: new PageAdaptBehavior, contents: [
					Picture($, { left: 0, top: 0, active: true, behavior: new SlidePictureBehavior, }),
					Content($, { visible: false, skin: busySkin, anchor: 'FIRST_BUSY', Behavior: BusyBehavior, }),
				], }),
			], }),
			Container($, { left: 0, top: 0, bottom: 0, behavior: new TrayAdaptBehavior, contents: [
				Container($, { left: 0, top: 0, anchor: 'SECOND_PICTURE_CONTAINER', behavior: new PageAdaptBehavior, contents: [
					Picture($, { left: 0, top: 0, active: true, behavior: new SlidePictureBehavior, }),
					Content($, { visible: false, skin: busySkin, anchor: 'SECOND_BUSY', Behavior: BusyBehavior, }),
				], }),
			], }),
			Container($, { left: 0, top: 0, bottom: 0, behavior: new TrayAdaptBehavior, contents: [
				Container($, { left: 0, top: 0, anchor: 'THIRD_PICTURE_CONTAINER', behavior: new PageAdaptBehavior, contents: [
					Picture($, { left: 0, top: 0, active: true, behavior: new SlidePictureBehavior, }),
					Content($, { visible: false, skin: busySkin, anchor: 'THIRD_BUSY', Behavior: BusyBehavior, }),
				], }),
			], }),
		], }),
	], 
}));

export class SlideScrollerBehavior extends TouchBehavior {
	buildTouchStateMachine(scroller) {
		return buildSlideViewerStateMachine(scroller)
	}
	onCreate(scroller, data) {
		super.onCreate.call(this, scroller)
		this.scroller = scroller
		this.data = data
	}
	onDisplaying(scroller) {
		super.onDisplaying.call(this, scroller)
		this.scrollToPageIndex(1) // second page, first and third are used for prev / next swipes, then things are reset so new page is second	
	}
	getFocusedPicture() {
		return this.data.SECOND_PICTURE_CONTAINER.first
	}
	scrollToPageIndex(pageIndex) {
		this.scroller.scrollTo(pageIndex * this.getTrayWidth(), 0)
	}
	getTrayWidth() {
		return this.scroller.first.first.width
	}
	getTrayCount() {
		return this.data.slides.length
	}
	getMinScrollX() {
		return this.getTrayWidth()
	}
	getMaxScrollX() {
		return this.getTrayWidth()
	}
	isFirstPicture() {
		return this.data.slideIndex == 0
	}
	isLastPicture() {
		return this.data.slideIndex == (this.data.slideCount - 1)
	}
	onPictureLoaded(picture) {
	}
	onBrowsePicture(direction) {
		this.data.SLIDE_BROWSER.behavior.onBrowsePicture(direction)
	}
	onPicturePageScrolled(direction) {
		var data = this.data
		data.SLIDE_BROWSER.behavior.onPicturePageScrolled(direction)
		
		var firstPictureContainer = data.FIRST_PICTURE_CONTAINER
		var secondPictureContainer = data.SECOND_PICTURE_CONTAINER
		var thirdPictureContainer = data.THIRD_PICTURE_CONTAINER
		
		var firstPicture = getFirstPicture(data)
		var secondPicture = getSecondPicture(data)
		var thirdPicture = getThirdPicture(data)
		var firstBusy = getFirstBusy(data)
		var secondBusy = getSecondBusy(data)
		var thirdBusy = getThirdBusy(data)
		
		firstPictureContainer.remove(firstPicture)
		firstPictureContainer.remove(firstBusy)
		secondPictureContainer.remove(secondPicture)
		secondPictureContainer.remove(secondBusy)
		thirdPictureContainer.remove(thirdPicture)
		thirdPictureContainer.remove(thirdBusy)
		
		if (direction == 1) { // cycle the images so that the new one is inside the second container
			firstPictureContainer.add(secondPicture)
			firstPictureContainer.add(secondBusy)
			secondPictureContainer.add(thirdPicture)
			secondPictureContainer.add(thirdBusy)
			thirdPictureContainer.add(firstPicture)
			thirdPictureContainer.add(firstBusy)
		}
		else if (direction == -1) {
			firstPictureContainer.add(thirdPicture)
			firstPictureContainer.add(thirdBusy)
			secondPictureContainer.add(firstPicture)
			secondPictureContainer.add(firstBusy)
			thirdPictureContainer.add(secondPicture)
			thirdPictureContainer.add(secondBusy)
		}
		
		var firstPicture = getFirstPicture(data) // refresh after cycling
		var thirdPicture = getThirdPicture(data)
		var firstBusy = getFirstBusy(data)
		var thirdBusy = getThirdBusy(data)

		this.scrollToPageIndex(1) // and scroll back to the second in the container (so we can scroll either way again)
		
		var index = data.slideIndex	// now prefetch next and previous images if needed ( we have one already )			
		if (direction == 1) {
			var nextIndex = index + 1												
			if (nextIndex < data.slides.length) {
				thirdPicture.url = data.slides[nextIndex];
				thirdBusy.visible = true
				thirdBusy.start()
			}
		}
		else if (direction == -1) {
			var prevIndex = index - 1											
			if (prevIndex >= 0) {
				firstPicture.url = data.slides[prevIndex];
				firstBusy.visible = true
				firstBusy.start()
			}
		}
	}
}

export class SlidePictureBehavior extends Behavior {
	onCreate(picture, data) {
		this.picture = picture
	}
	fitPicture(width, height) {
		var picture = this.picture
		var container = picture.container
		var containerWidth = (width == undefined) ? container.width : width
		var containerHeight = (height == undefined) ? container.height : height
		var transform = calcFitOriginTranslationScale(picture, picture.rotation, containerWidth, containerHeight)
		picture.origin = transform.origin
		picture.translation = transform.translation
		picture.scale = transform.scale
	}
	onLoaded(picture) {
		picture.subPixel = true										
		this.fitPicture()
		this.busy = picture.container.last
		picture.opacity = 0;
		picture.duration = 360;
		picture.time = 0;
		picture.start();
	}
	onTimeChanged(picture) {
		picture.opacity = picture.fraction;
	}
	onFinished(picture) {
		this.busy.visible = false
		this.busy.stop()
	}
}

export class SlideBrowserBehavior extends Behavior {
	getSlides(container) {
		//debugger
	}
	onBrowsable(container) {
		var data = this.data;
		if (data.slideCount)
			this.onBrowse(container, 0);
		else {
			data.FIRST_BUSY.visible = false
			data.FIRST_BUSY.stop()
			data.SECOND_BUSY.visible = false
			data.SECOND_BUSY.stop()
			data.THIRD_BUSY.visible = false
			data.THIRD_BUSY.stop()
			data.NOSLIDES.visible = true;
		}
	}
	onBrowse(container, direction) {
		var data = this.data;
		var index = data.slideIndex + direction;
		if (index < 0 || index > data.slides.length) {
			trace("\n out of range browse request")
			return
		}
		data.slideDirection = direction;
		data.slideIndex = index;
		
		if (direction == 0) {
			var firstPicture = getFirstPicture(data)
			var secondPicture = getSecondPicture(data)
			var thirdPicture = getThirdPicture(data)
			var firstBusy = getFirstBusy(data)
			var secondBusy = getSecondBusy(data)
			var thirdBusy = getThirdBusy(data)

			secondPicture.url = data.slides[index];
			secondBusy.visible = true
			secondBusy.start()
			
			var prevIndex = index - 1 // initial prefetch previous if needed
			if (prevIndex >= 0) {
				firstPicture.url = data.slides[prevIndex];
				firstBusy.visible = true
				firstBusy.start()
			}
			var nextIndex = index + 1 // intial prefetch next if needed
			if (nextIndex < data.slides.length) {
				thirdPicture.url = data.slides[nextIndex];
				thirdBusy.visible = true
				thirdBusy.start()
			}
		}
	}
	onCreate(container, data) {
		this.data = data;
		if (data.slides)
			this.onBrowsable(container);
		else
			this.getSlides(container);
	}
	onBrowsePicture(direction) {
		this.onBrowse(null, direction)
	}
	onDisplayed(container) {
		this.onSlideDisplayed()
	}
	onPicturePageScrolled(direction) {
		var data = this.data;
		this.onSlideDisplayed()
		application.purge();
	}
	onSlideDisplayed() {}
}

export class TrayAdaptBehavior extends Behavior {
	onDisplaying(tray) {
		var slideshow = tray.container.container;
		var width, height;
		if (tray.container.last !== tray)
		    width = slideshow.width + 60
		else
		    width = slideshow.width;
		height = slideshow.height;        		
		tray.coordinates = { left : 0, top :0, width : width, height : height };
	}
}

export class PageAdaptBehavior extends Behavior {
	onDisplaying(page) {
		var slideshow = page.container.container.container;
		var width = slideshow.width;
		var height = slideshow.height;
		page.coordinates = { left : 0, top :0, width : width, height : height };
   		page.first.behavior.fitPicture(width, height);
   		page.container.container.container.behavior.scrollToPageIndex(1);
	}
}

export default {
	SlideViewer,
	SlideScrollerBehavior,
	SlidePictureBehavior,
	SlideBrowserBehavior,
	TrayAdaptBehavior,
	PageAdaptBehavior,
}