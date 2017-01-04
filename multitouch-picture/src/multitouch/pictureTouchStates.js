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
	TouchStateTransition,
	TouchStateMachine
} from 'fingers';

/* =-====================================================================-= */
/* =-=========================== UTILITIES ==============================-= */
/* =-====================================================================-= */
var calcFitScaleAndOrigin = function(target) {
	var origin = { x : target.width / 2, y : target.height / 2 }
	var scale = calcFitScale(target)
	var fitScale = { x : scale, y : scale }
	return { scale : fitScale, origin : origin }
}

var calcFitOriginTranslationScale = function(content, rotation, fitType, width, height) { // fitType = "fit" | "fill"
	if (undefined == rotation)
		rotation = 0
	if (undefined == fitType)
		fitType = "fit"
	rotation = cleanRotation(rotation)
	var containerWidth = (width == undefined) ? content.container.width : width
	var containerHeight = (height == undefined) ? content.container.height : height
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
	
	var widthScale = dstWidth / srcWidth
	var heightScale = dstHeight / srcHeight
	var widthScaleLarger = widthScale > heightScale
	var scale
	if (fitType == "fill")
		scale = widthScaleLarger ? widthScale : heightScale
	else 
		scale = widthScaleLarger ? heightScale : widthScale
		
	var origin = { x: content.width / 2, y: content.height / 2 }
	var translation = { x: (containerWidth - content.width) / 2,  y: (containerHeight - content.height) / 2 }
	var scale = { x: scale, y: scale }
	var result = { origin : origin, translation : translation, scale : scale }
	return result
}

var calcFitScale = function(target, fitType) { // fitType = "fit" | "fill"
	if (undefined == fitType)
		fitType = "fit"
	var rotation = calcNearestNinetyRotation(target)
		var swap = (rotation != 0 && rotation != 180 && rotation != 360)		
	var width = swap ? target.height : target.width
	var height = swap ? target.width : target.height
		var containerWidth = target.container.width
	var containerHeight = target.container.height
	var scaleX = containerWidth / width
	var scaleY = containerHeight / height
	var scale = (fitType == "fit") ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY)
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

export var updateOriginAndTranslationForNewOrigin = function(target, newOrigin) {
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
var translatePoint = function(p, t) { return { x : p.x + t.x, y : p.y + t.y } }
var scalePoint = function(p, s) { return { x : p.x * s.x, y : p.y * s.y } }
var rotatePoint = function(p, degrees) {
	var r = (degrees / 180) * Math.PI
	var cos = Math.cos(r), sin = Math.sin(r)
	var rx = p.x * cos - p.y * sin
	var ry = p.x * sin + p.y * cos
	return { x : rx, y : ry }
}
var invertTranslation = function(t) { return { x: -t.x, y: -t.y } }
var invertScale = function(s) { return { x : 1 / s.x, y : 1 / s.y } }
var invertRotation = function(r) { return -r }
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
        	
export var fitPicture = function(picture, rotation, fitType, containerWidth, containerHeight) {	// containerWidth and containerHeight optional, will use picture.container if not provided
	var fit = calcFitOriginTranslationScale(picture, rotation, fitType, containerWidth, containerHeight)
	picture.origin = fit.origin
	picture.translation = fit.translation
	picture.scale = fit.scale
}
			
/* =-====================================================================-= */
/* =-========================= TOUCH STATES =============================-= */
/* =-====================================================================-= */
var MAX_SCALE = 4 * screenScale;
       	
class LoadingState extends TouchState {
	constructor(container, picture) {
		super(container, picture) 
		this.picture = picture
		this.id = "Loading"
	}
	onEnter(fromState) {
		this.beginAnimating()
	}
	onTimeChanged() {
		if (this.picture.behavior.loaded)
			this.finished()
	}
}
	
class ShowingState extends TouchState {
	constructor(container, picture) {
		super(container, picture) 
		this.container = container
		this.picture = picture
		this.id = "Showing"
		this.duration = 1000
	}
	onEnter(fromState) {
		var picture = this.picture
		picture.opacity = 0
		this.runVisualTransition(picture, this.duration)
	}
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)		
		this.picture.opacity = fraction			
	}
	onExit() {
		this.container.delegate("onShowingStateComplete");
	}
}		

class IdleState extends TouchState {
	constructor(container, picture) {
		super(container, picture)
		this.container = container
		this.picture = picture
		this.id = "Idle"
	}
	onEnter(fromState) {
		this.imageIsFitted = this.isImageFitted()
		this.container.delegate("onPhotoViewChanged", this.imageIsFitted);
	}
	onTouchChanged() {
		if (	this.oneFingerHandler.isDragging || 
				this.twoFingerHandler.pinching || 
				this.oneFingerHandler.isLongPress ||
				this.oneFingerHandler.isSingleTapUp ) {
			this.container.delegate("onIdleInteraction");
		}
	}
	isImageFitted() {
		var isFitted = true
		var picture = this.picture
		if (picture && picture.ready) {
			var fit = calcFitOriginTranslationScale(picture, picture.rotation, picture.behavior.fitType)
			if (fit.scale.x == picture.scale.x && fit.scale.y == picture.scale.y
					&& fit.origin.x == picture.origin.x && fit.origin.y == picture.origin.y 
					&& fit.translation.x == picture.translation.x && fit.translation.y == picture.translation.y)
				isFitted = true
			else
				isFitted = false
		}
		return isFitted
	}
}

class DraggingState extends TouchState {
	constructor(container, picture) {
		super(container, picture)
		this.id = "Dragging"
		this.picture = picture
	}
	onEnter(fromState) {
		var picture = this.picture
		updateOriginAndTranslationForNewOrigin(picture,  { x : 0, y : 0 })
		this.onTouchChanged()
	}
	onTouchChanged() {
		var picture = this.picture
		var deltaTranslation = this.oneFingerHandler.deltaTranslation
		var dx = deltaTranslation.x
		var dy = deltaTranslation.y
		var needsSnapback = false
		if (this.isXConstrained()) {
			dy /= 3
			needsSnapback = true
		}
		if (this.isYConstrained()) {
			dy /= 3
			needsSnapback = true
		}
		var newTx = picture.translation.x + dx
		picture.translation = { x : newTx, y : picture.translation.y + dy }
		this.needsSnapback = needsSnapback
	}
	isXConstrained() {
		var picture = this.picture
		var tx = picture.translation.x
		if (tx != constrainX(picture.container, picture, tx))
			return true
		return false
	}
	isYConstrained() {
		var picture = this.picture
		var ty = picture.translation.y
		if (ty != constrainY(picture.container, picture, ty))
			return true
		return false
	}
}

// SnapbackState handles snapping back when dragged or 2 finger panned such that edge needs to be realigned with side of view
// and additionally handles the case where the 2 finger zoom leaves the image at a greater than max allowed scale
// if both conditions are true, then both snapping and zooming will occur at the same time

class SnapbackState extends TouchState {
	constructor(container, picture) {
		super(container, picture)
		this.picture = picture
		this.id = "Snapback"
		this.duration = 300
	}
	onEnter(fromState) {
		this.needsSnapback = fromState.needsSnapback
		this.needsZoomToMaxScale = (fromState.id == "PanZoom" && fromState.needsZoomToMaxScale)
		
		var picture = this.picture

		if (this.needsSnapback) {
			updateOriginAndTranslationForNewOrigin(picture, { x : 0.5, y : 0.5 })
			var translation = picture.translation
			this.fromX = translation.x
			this.fromY = translation.y
			var displayBounds = getDisplayBounds(picture)
			var centerX = displayBounds.width < picture.container.width
			var centerY = displayBounds.height < picture.container.height
		
			var rotation = cleanRotation(picture.rotation)
			if (centerX) {
				this.toX = (picture.container.width - displayBounds.width) / 2
				if (rotation == 90 || rotation == 180) {
					this.toX += displayBounds.width
				}							
			}
			else
				this.toX = constrainX(picture.container, picture, translation.x)
				
			if (centerY) {
				this.toY = (picture.container.height - displayBounds.height) / 2
				if (rotation == 180 || rotation == 270) {
					this.toY += displayBounds.height
				}
			}
			else
				this.toY = constrainY(picture.container, picture, translation.y)
		}
		if (this.needsZoomToMaxScale) {
			this.fromScale = picture.scale.x
			this.toScale = MAX_SCALE
		}
		this.runVisualTransition(picture, this.duration)
	}
	onStepTransition(fraction) {
		fraction = Math.quadEaseOut(fraction)
		if (this.needsSnapback) {				
			var x = this.fromX + fraction * (this.toX - this.fromX)
			var y = this.fromY + fraction * (this.toY - this.fromY)		
			this.picture.translation = { x : x, y : y }
		}
		if (this.needsZoomToMaxScale) {
				var scale = this.fromScale + fraction * (this.toScale - this.fromScale)
			this.picture.scale = { x : scale, y : scale }
		}
	}
}		

class PanZoomState extends TouchState {
	constructor(container, picture, allowRotation) {
		super(container, picture)
		this.id = "PanZoom"
		this.picture = picture
		this.allowRotation = (allowRotation != undefined) && allowRotation
	}
	onEnter(fromState) {
		this.needsSnapback = false
		var picture = this.picture
		if (picture) {
			var fit = calcFitScaleAndOrigin(picture)
			this.fitScaleX = fit.scale.x
			this.scaleAnchor = picture.scale.x
			this.centerPoint = { x : this.twoFingerHandler.centerPoint.x, y : this.twoFingerHandler.centerPoint.y }

			if (this.allowRotation) {
				this.scaleThreshold = 0.95 * fit.scale.x // begin allowing rotation when scaled to or below 95 percent of fit scale
				this.rotating = false
				this.rotateTearThreshold = 10
			}
			
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
			this.needsZoomToMaxScale = (picture.scale.x > MAX_SCALE)

			if (this.allowRotation) {
				if (this.rotating)
					picture.rotation = picture.rotation + h.frameDeltaRotation
				else if (picture.scale.x < this.scaleThreshold) {
					this.rotating = true
					picture.rotation = picture.rotation + h.frameDeltaRotation
				}
				
				if (this.rotating)
					this.needsZoomToFit = true;
			}
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
	constructor(container, picture) {
		super(container, picture)
		this.id = "ZoomInAboutPoint"
		this.picture = picture
	}
	onEnter() {
		var picture = this.picture
		
		// translate by the correct amount to nullify the change of origin
		var newOrigin = { x : this.oneFingerHandler.point.x, y : this.oneFingerHandler.point.y }
		updateOriginAndTranslation(picture, newOrigin)
		
		this.fromScale = picture.scale.x
		var scaleBy = 2
		this.toScale = this.fromScale * scaleBy
		if (this.toScale > MAX_SCALE)
			this.toScale = MAX_SCALE
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
	constructor(container, picture) {
		super(container, picture)
		this.id = "ZoomHoldingAboutPoint"
		this.picture = picture
	}
	onEnter() {
		var picture = this.picture
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
		var scale = picture.scale.x + (deltaTime / 1000) * 0.5 // consider using log()
		if (scale > MAX_SCALE)
			scale = MAX_SCALE
		picture.scale = { x: scale, y : scale }
	}
}

/*
	Note:  v0, v1, and duration should all be either positive or negative
	
	v0	:	initial velocity
	v1	:	terminating velocity
	k	:	coefficient of kinetic friction
*/

class TossAndBouncebackState extends TouchState {
	constructor(container, picture) {
		super(container, picture)
		this.picture = picture
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
		var picture = this.picture
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
				var constrainedX = constrainX(picture.container, picture, translationX)
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

class AnimateZoomToFitState extends TouchState {
	constructor(container, picture) {
		super(container, picture)
		this.picture = picture
		this.id = "AnimateZoomToFit"
	}
	onEnter(fromState) {
		var picture = this.picture
		
		this.fromRotation = cleanRotation(picture.rotation)
		this.toRotation = calcNearestNinetyRotation(picture)
		
		var fitTransform = calcFitOriginTranslationScale(picture, this.toRotation, picture.behavior.fitType)
		
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
		var picture = this.picture
		picture.rotation = this.fromRotation + fraction * (this.toRotation - this.fromRotation)
		var scale = this.fromScale + fraction * (this.toScale - this.fromScale)
		picture.scale = { x: scale, y : scale }
		var tx = this.fromTranslation.x + fraction * (this.toTranslation.x - this.fromTranslation.x)
		var ty = this.fromTranslation.y + fraction * (this.toTranslation.y - this.fromTranslation.y)
		picture.translation = { x: tx, y : ty }
	}
	onEndTransition() {
		TouchState.prototype.onEndTransition.call(this);
		var picture = this.picture
		if (picture.rotation == 360)
			picture.rotation = 0
	}
}

export var buildPictureTouchStateMachine = function(container, picture, allowRotation) {
	// Touch States
	var loadingState = new LoadingState(container, picture)
	var showingState = new ShowingState(container, picture)
	var idleState = new IdleState(container, picture)
	var panZoomState = new PanZoomState(container, picture, allowRotation)
	var zoomInAboutPointState = new ZoomInAboutPointState(container, picture)
	var zoomHoldingAboutPointState = new ZoomHoldingAboutPointState(container, picture)
	var animateZoomToFitState = new AnimateZoomToFitState(container, picture)
	var draggingState = new DraggingState(container, picture)
	var snapbackState = new SnapbackState(container, picture)
	var tossAndBouncebackState = new TossAndBouncebackState(container, picture)

	// Touch Transition Conditions
	var loadingToShowingCondition = function(state) {
		return ! state.active
	}
	var loadingToShowing = new TouchStateTransition(loadingState, showingState, loadingToShowingCondition)

	var showingToIdleCondition = function(state) {
		return ! state.active
	}
	var showingToIdle = new TouchStateTransition(showingState, idleState, showingToIdleCondition)

	var idleToDraggingCondition = function(state) {
		return state.oneFingerHandler.isDragging
	}
	var idleToDragging = new TouchStateTransition(idleState, draggingState, idleToDraggingCondition)

	var draggingToPanZoomCondition = function(state) {
		return state.twoFingerHandler.pinching
	}
	var draggingToPanZoom = new TouchStateTransition(draggingState, panZoomState, draggingToPanZoomCondition)

	var draggingToSnapbackCondition = function(state) {
		return ! state.oneFingerHandler.isDragging && state.needsSnapback
	}
	var draggingToSnapback = new TouchStateTransition(draggingState, snapbackState, draggingToSnapbackCondition)

	var panZoomToAnimateZoomToFitCondition = function(state) {
		return ! state.twoFingerHandler.pinching && state.needsZoomToFit
	}
	var panZoomToAnimateZoomToFit = new TouchStateTransition(panZoomState, animateZoomToFitState, panZoomToAnimateZoomToFitCondition)

	var animateZoomToFitToIdleCondition = function(state) {
		return ! state.active
	}
	var animateZoomToFitToIdle = new TouchStateTransition(animateZoomToFitState, idleState, animateZoomToFitToIdleCondition)

	var idleToPanZoomCondition = function(state) {
		return state.twoFingerHandler.pinching
	}
	var idleToPanZoom = new TouchStateTransition(idleState, panZoomState, idleToPanZoomCondition)

	var panZoomToDraggingCondition = function(state) {
		return ! state.twoFingerHandler.pinching && state.oneFingerHandler.fingerID != null
	}
	var panZoomToDragging = new TouchStateTransition(panZoomState, draggingState, panZoomToDraggingCondition)

	var panZoomToIdleCondition = function(state) {
		return ! state.twoFingerHandler.pinching
	}
	var panZoomToIdle = new TouchStateTransition(panZoomState, idleState, panZoomToIdleCondition)

	var panZoomToSnapbackCondition = function(state) {
		return ! state.twoFingerHandler.pinching && ! state.needsZoomToFit && (state.needsSnapback || state.needsZoomToMaxScale)
	}
	var panZoomToSnapback = new TouchStateTransition(panZoomState, snapbackState, panZoomToSnapbackCondition)

	var snapbackToIdleCondition = function(state) {
		return ! state.active
	}
	var snapbackToIdle = new TouchStateTransition(snapbackState, idleState, snapbackToIdleCondition)

	var idleToAnimateZoomToFitCondition = function(state) {
		return state.oneFingerHandler.isSingleTapUp && ! state.imageIsFitted
	}
	var idleToAnimateZoomToFit = new TouchStateTransition(idleState, animateZoomToFitState, idleToAnimateZoomToFitCondition)

	var animateZoomToFitToIdleCondition = function(state) {
		return ! state.active
	}
	var animateZoomToFitToIdle = new TouchStateTransition(animateZoomToFitState, idleState, animateZoomToFitToIdleCondition)		

	var idleToZoomInAboutPointCondition = function(state) {
		return state.oneFingerHandler.isSingleTapUp && state.imageIsFitted
	}
	var idleToZoomInAboutPoint = new TouchStateTransition(idleState, zoomInAboutPointState, idleToZoomInAboutPointCondition)

	var zoomInAboutPointToIdleCondition = function(state) {
		return ! state.active
	}
	var zoomInAboutPointToIdle = new TouchStateTransition(zoomInAboutPointState, idleState, zoomInAboutPointToIdleCondition)		

	var idleToZoomHoldingAboutPointCondition = function(state) {
		return state.oneFingerHandler.isLongPress
	}
	var idleToZoomHoldingAboutPoint = new TouchStateTransition(idleState, zoomHoldingAboutPointState, idleToZoomHoldingAboutPointCondition)

	var zoomHoldingAboutPointToIdleCondition = function(state) {
		return state.oneFingerHandler.fingerID == null
	}
	var zoomHoldingAboutPointToIdle = new TouchStateTransition(zoomHoldingAboutPointState, idleState, zoomHoldingAboutPointToIdleCondition)		

	var draggingToTossAndBouncebackCondition = function(state) {
		return state.oneFingerHandler.fingerID == null
	}
	var draggingToTossAndBounceback = new TouchStateTransition(draggingState, tossAndBouncebackState, draggingToTossAndBouncebackCondition)

	var tossAndBouncebackToDraggingCondition = function(state) {
		return state.oneFingerHandler.fingerID != null
	}
	var tossAndBouncebackToDragging = new TouchStateTransition(tossAndBouncebackState, draggingState, tossAndBouncebackToDraggingCondition)

	var tossAndBouncebackToIdleCondition = function(state) {
		return ! state.active || state.oneFingerHandler.fingerID != null
	}
	var tossAndBouncebackToIdle = new TouchStateTransition(tossAndBouncebackState, idleState, tossAndBouncebackToIdleCondition)

	// Touch Transitions
	var touchStateTransitions = [ 			
		loadingToShowing,
		showingToIdle,
										
		idleToDragging,
		draggingToPanZoom,
		draggingToSnapback,

		idleToPanZoom,
		panZoomToSnapback,
		snapbackToIdle,

		panZoomToAnimateZoomToFit,
		animateZoomToFitToIdle,												
		
		panZoomToDragging,
		panZoomToIdle,

		idleToZoomInAboutPoint,
		zoomInAboutPointToIdle,
		
		idleToZoomHoldingAboutPoint,
		zoomHoldingAboutPointToIdle,
		
		idleToAnimateZoomToFit,
		animateZoomToFitToIdle,
		
		draggingToTossAndBounceback,
		tossAndBouncebackToDragging,
		tossAndBouncebackToIdle
	]
								
	// Touch State Machine
	var machine = new TouchStateMachine(loadingState, touchStateTransitions)
	return machine
}

export default {
	updateOriginAndTranslationForNewOrigin,
	fitPicture,
	buildPictureTouchStateMachine,
}