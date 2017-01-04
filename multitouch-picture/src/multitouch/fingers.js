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
export class TouchBehavior extends Behavior {
	onCreate(content) {
		this.callbackTarget = null
		this.callback = null
	}
	onDisplaying(content) {
		this.content = content
		this.buildHandlers()
		this.touchEvents = {}
		this.touchStateMachine = this.buildTouchStateMachine(content)
		this.touchStateMachine.behavior = this
	}
	onStateChanged() {
		this.touchHandlers.oneFingerHandler.onStateChanged()
		this.touchHandlers.twoFingerHandler.onStateChanged()
	}
	buildTouchStateMachine(content) {
		// subclass must override
	}
	buildHandlers() {
		var oneFingerHandler = new OneFingerHandler(this)
		var twoFingerHandler = new TwoFingerHandler(this)
		this.touchHandlersArray = [ oneFingerHandler, twoFingerHandler ]
		this.touchHandlers = { oneFingerHandler : oneFingerHandler, twoFingerHandler : twoFingerHandler }
	}
	onTouchBegan(content, id, x, y, ticks) {
		if (this.touchEvents.hasOwnProperty(id))
			delete this.touchEvents[id]
		this.addTouchEventForID(id, x, y, ticks)
		this.touchStateMachine.onTouchBegan(this.touchHandlersArray, content, id, x, y, ticks)
	}
	onTouchMoved(content, id, x, y, ticks) {
		this.addTouchEventForID(id, x, y, ticks)
		this.touchStateMachine.onTouchMoved(this.touchHandlersArray, content, id, x, y, ticks)
	}
	onTouchEnded(content, id, x, y, ticks) {
		this.addTouchEventForID(id, x, y, ticks)
		this.touchStateMachine.onTouchEnded(this.touchHandlersArray, content, id, x, y, ticks)
	}
	onTimeChanged(content) {
		this.touchStateMachine.onTimeChanged()
	}
	addTouchEventsForID(id) {
		var touchEvents = this.touchEvents
		var points = touches.peek(id)
		for (var i = 0, c = points.length; i < c; i++) {
			var point = points[i]
			if (! touchEvents.hasOwnProperty(id)) {
				touchEvents[id] = {}
				touchEvents[id].first = touchEvents[id].last = { previous: null, x : point.x, y: point.y, ticks: point.ticks }
			}
			else {
				if (point.ticks != touchEvents[id].last.ticks)
					touchEvents[id].last = { previous: touchEvents[id].last,  x : point.x, y: point.y, ticks: point.ticks }
			}
		}
	}
	addTouchEventForID(id, x, y, ticks) {
		var touchEvents = this.touchEvents
		if (! touchEvents.hasOwnProperty(id)) {
			touchEvents[id] = {}
			touchEvents[id].first = touchEvents[id].last = { previous: null, x :x, y: y, ticks: ticks }
		}
		else {
			if (ticks != touchEvents[id].last.ticks)
				touchEvents[id].last = { previous: touchEvents[id].last,  x : x, y: y, ticks: ticks }
		}
	}
	printVector(name, v) {
		trace("\n vector " + name + "x: " + v.x + " y: " + v.y)
	}
	getTouchEventPairForID(id, lookbackWindow) {										
		var touchEvents = this.touchEvents[id]
		var lastEvent = touchEvents.last
		var event = lastEvent
		var former = event
		if (event && event.previous) {
			var MIN_V0_LENGTH = 5
			var length = 0
			var deltaTime = 0
			var v0, v
			
			// first find v0 with minimum length within lookbackWindow
			while (event.previous && deltaTime < lookbackWindow && length < MIN_V0_LENGTH) {
				former = event
				event = event.previous
				v0 = subtractPoints2D(lastEvent, event)
				length = vectorLength2D(v0)
				deltaTime = lastEvent.ticks - event.ticks
			}
			if (length >= MIN_V0_LENGTH) {
				// now keep extending by previous constrained by time window and by similar direction (dotProduct of v0 and v >= 0)
				var dotProduct = 1
				var lastPrevious = null
				while (event.previous && deltaTime < lookbackWindow && dotProduct >= 0) {
					if (pointDistance2D(event, event.previous)) {
						v = subtractPoints2D(event, event.previous)
						dotProduct = dotVector2D(v0, v)
					}
					former = event
					event = event.previous
					deltaTime = lastEvent.ticks - event.ticks
				}
			}
			
			// interpolate last deltas to match desired lookbackWindow
			if (deltaTime > lookbackWindow) {
				var formerDeltaTime = deltaTime - (former.ticks - event.ticks)
				var fraction = (lookbackWindow - formerDeltaTime) / (former.ticks - event.ticks)
				var x = former.x + fraction * (event.x - former.x)
				var y = former.y + fraction * (event.y - former.y)
				var ticks = former.ticks + fraction * (event.ticks - former.ticks)
				event = { x: x, y: y, ticks: ticks }
			}
		}
		return { first : event, last : lastEvent }
	}
	getTouchEventsLinkedListForID(id) {
		return this.touchEvents[id].last
	}
	printTouchEventPairForID(id, lookbackWindow) {
		var pair = this.getTouchEventPairForID(id, lookbackWindow)
		var first = pair.first
		var last = pair.last
		if (first)
			print("first event x: " + first.x + " y: " + first.y + " ticks: " + first.ticks)
		else
			print("first event null")
		if (last)
			print("last event x: " + last.x + " y: " + last.y + " ticks: " + last.ticks)
		else
			print("last event null")
	}
	printTouchEvents() {
		var touchEvents = this.touchEvents
		var count = 0
		for (p in touchEvents) {
			print("touch events for: " + p)
			var event = touchEvents[p].last
			while (event) {
				print("event x: " + event.x + " y: " + event.y + " ticks: " + event.ticks)
				count++
				event = event.previous
			}
		}
		print("total: " + count)
	}
	requestCallback(callbackTarget, callback, time) {
		this.callbackTarget = callbackTarget
		this.callback = callback
		this.content.invoke(new Message("/delay?duration=" + time), Message.TEXT)
	}
	cancelCallback() {
		this.callbackTarget = null
		this.callback = null
	}
	onComplete(container) {
		if (this.callback)
			this.callback.call(this.callbackTarget)
	}
}


export class TouchStateVisualTransition extends Transition {
	constructor(duration) {
		if (!duration) duration = 500;
		super(duration);
	}
	onBegin(content, touchState) {
		this.touchState = touchState;
		touchState.onBeginTransition();
	}
	onStep(fraction) {
		this.touchState.onStepTransition(fraction);
	}
	onEnd(content) {
		this.touchState.onEndTransition();
	}
}

Handler.bind("/delay", {
    onInvoke: function(handler, message){
		let query = parseQuery(message.query);
		let duration = query.duration;
		handler.wait(duration);
    }
});

let print = function(msg) { trace(msg + "\n") }
let printPoint = function(name, p) { trace("Point " + name + " x: " + p.x + " y: " + p.y + "\n") }
let printScaler = function(name, s) { trace(name + ": " + s + "\n") }


/* =-====================================================================-= */
/* =-======================== 2D VECTOR UTILS ===========================-= */
/* =-====================================================================-= */
var mypot = function(x, y) { return Math.sqrt(x * x + y * y); }
var pointDistance2D = function(p0, p1) { return mypot(p1.x - p0.x, p1.y - p0.y); }
var vectorLength2D = function(v) { return mypot(v.x, v.y); }
var crossVector2D = function(v0, v1) { return v0.x * v1.y - v1.x * v0.y; }

var scaleVector2D = function(scale, v) {
    v.x *= scale;
    v.y *= scale;
}

var subtractPoints2D = function(p1, p0) { return {x: p1.x - p0.x, y: p1.y - p0.y}; }
var dotVector2D = function(v0, v1) { return v0.x * v1.x + v0.y * v1.y; }

var normalizedVector2D = function(v, n) {
    var d = vectorLength2D(v);
    n.x = v.x, n.y = v.y;
    if (d > 0)
        scaleVector2D(1 / d, n);
    return d;
}

var angleBetween = function(v1, v2) {
	var dotProd = dotVector2D(v1, v2)
	var lenProd = vectorLength2D(v1) * vectorLength2D(v2)
	var divOperation = dotProd / lenProd
	return Math.acos(divOperation) * (180.0 / Math.PI)
}
		
/*
	A TouchHandler may be a single, two, three etc finger handler, or a gesture recognizer
	Each TouchHandler instance is associated with one KPR content / behavior

	TouchHandlers are all updated in parallel and analyze the physical nature of the touch events
	and may be asked for information about physics, gestures, and current state
	
	Multiple TouchBehaviors may delegate to a single TouchStateMachine
	A TouchStateMachine manages a state machine graph consisting of TouchStates and TouchStateTransitions
	
	TouchStates are actuators that may act upon a target (a content, an object instance etc) when they are the current state. 
	They base their actions on information gathered from their behavior's TouchHandlers.
*/		
export class TwoFingerHandler {
	constructor(behavior) {
		this.behavior = behavior
		this.firstID = null
		this.secondID = null
		this.pinching = false
		this.pinchedOpen = false
		this.pinchedClosed = false
	}
	onStateChanged() {}
	onTouchBegan(content, id, x, y, ticks) {
		content.multipleTouch = true
		if (undefined == this.firstID) {
			this.firstID = id
			this.firstPoint =  { x : x, y : y } 
		}
		else if (undefined == this.secondID && id != this.firstID) {
			this.secondID = id
			this.secondPoint = { x : x, y : y }
		}
		if ((! this.pinching) && (this.firstID != undefined) && (this.secondID != undefined)) {
			this.pinching = true
			this.pinchedOpen = false
			this.pinchedClosed = false
			this.firstAnchor = { x : this.firstPoint.x, y : this.firstPoint.y }
			this.secondAnchor = { x : this.secondPoint.x, y : this.secondPoint.y }
			this.centerAnchor = this.midPoint(this.firstAnchor, this.secondAnchor)						
			this.centerPoint = this.midPoint(this.firstAnchor, this.secondAnchor)		
			this.distanceAnchor = this.calcDistance(this.firstAnchor, this.secondAnchor)
			this.distance = this.distanceAnchor
			this.angleAnchor = this.calcAngle(this.firstAnchor, this.secondAnchor)
			this.angle = this.angleAnchor
			this.translation = { x : 0, y : 0 }
			this.frameDeltaTranslation = { x : 0, y : 0 }
			this.scale = 1
			this.frameDeltaScale = 0
			this.rotation = 0
			this.frameDeltaRotation = 0
		}
	}
	onTouchMoved(content, id, x, y, ticks) {
		switch(id) {
			case this.firstID:
				this.firstPoint = { x : x, y : y }
				break
			case this.secondID:
				this.secondPoint = { x : x, y : y }
				break
		}
		if (this.pinching == true) {
			this.centerPoint = this.midPoint(this.firstPoint, this.secondPoint)
			var lastTranslationX = this.translation.x
			var lastTranslationY = this.translation.y
			this.translation.x = this.centerPoint.x - this.centerAnchor.x
			this.translation.y = this.centerPoint.y - this.centerAnchor.y
			this.frameDeltaTranslation.x = this.translation.x - lastTranslationX
			this.frameDeltaTranslation.y = this.translation.y - lastTranslationY
			this.distance = this.calcDistance(this.firstPoint, this.secondPoint)
			this.angle = this.calcAngle(this.firstPoint, this.secondPoint)

			this.lastScale = this.scale
			this.scale = this.distance / this.distanceAnchor
			this.frameDeltaScale = this.scale - this.lastScale
			
			this.lastRotation = this.rotation
			this.rotation = this.angle - this.angleAnchor
			this.frameDeltaRotation = this.rotation - this.lastRotation
		}			
	}
	onTouchEnded(content, id, x, y, ticks) {
		switch (id) {
			case this.firstID:
				this.firstID = undefined
				this.oneFingerEnded()
				break
			case this.secondID:
				this.secondID = undefined
				this.oneFingerEnded()
				break
		}
	}
	oneFingerEnded() {
		if (this.pinching) {
			this.pinching = false
			if (this.distanceAnchor < this.distance) //* improve this when frames implemented
				this.pinchedOpen = true
			else
				this.pinchedClosed = true
		}
	}
	midPoint(first, second) {
		return { x : (first.x + second.x) / 2, y : (first.y + second.y) / 2 }
	}
	calcDistance(first, second) {
		return Math.sqrt( Math.pow((second.x - first.x), 2) + Math.pow((second.y - first.y), 2) )
	}
	calcAngle(first, second) {
		return Math.atan2(first.y - second.y, first.x - second.x) * 180 / Math.PI
	}
}

export class OneFingerHandler {
	constructor(behavior) {
		this.behavior = behavior
		this.fingerID = null
		this.lastFingerID = null
		this.lastTapDownTime = 0
	
		this.doubleTapThreshold = 500 // max time between taps
		this.beginDragThreshold = 10 // min pixels translated before dragging kicks in
	
		this.isDragging = false
		this.isLongPress = false
		this.isHorizontalDrag = false
		this.isSingleTapDown = false
		this.isSingleTapUp = false
		this.isDoubleTapDown = false
		this.isDoubleTapUp = false
	
		this.isTossLeft = false
		this.isTossRight = false
		this.isTossUp = false
		this.isTossDown = false
		
		this.allowFingerSwapping = true	// if true then when f0 down, f1 down, f0 up, we begin tracking f1 from it's current position
		this.LONG_PRESS_THRESH = 525
	}
	onStateChanged() {
		this.isSingleTapDown = false
		this.isSingleTapUp = false
		this.isDoubleTapDown = false
		this.isDoubleTapUp = false
	}
	onTouchBegan(content, id, x, y, ticks) {
		if (this.fingerID == null) {
			this.isSingleTapUp = false
			this.isDoubleTapUp = false
			this.isTossLeft = false
			this.isTossRight = false
			this.isTossUp = false
			this.isTossDown = false
			this.fingerID = id
			this.velocity = { x : 0, y : 0 }
			this.anchorPoint = { x : x, y : y }
			this.point = { x : x, y : y }
			this.translation = { x : 0, y : 0 }
			this.deltaTranslation = { x : 0, y : 0 }
			this.isDragging = false
			this.isLongPress = false
			
			var tapLength = (ticks - this.lastTapDownTime)						
			if ((ticks - this.lastTapDownTime) < this.doubleTapThreshold)
				this.isDoubleTapDown = true
			else
				this.isSingleTapDown = true
			this.lastTapDownTime = ticks
			
			this.behavior.requestCallback(this, this.longPressBeginCallback, this.LONG_PRESS_THRESH)
		}
    }
	onTouchMoved(content, id, x, y, ticks) {	
		if (id == this.fingerID) {
			this.updateTranslation(x, y)
			if (! this.isDragging) {
				var xDistance = Math.abs(this.translation.x)
				var yDistance = Math.abs(this.translation.y)
				if ((xDistance > this.beginDragThreshold) || (yDistance > this.beginDragThreshold)) {
					this.behavior.cancelCallback()
					this.isLongPress = false
					this.isDragging = true
					this.isSingleTapDown = false
					this.isDoubleTapDown = false
					this.isHorizontalDrag = (xDistance >= yDistance)
				}
			}
		}
    }
	onTouchEnded(content, id, x, y, ticks) {
		if (id == this.fingerID) {
			this.deltaTranslation = { x : 0, y : 0 }
			this.behavior.cancelCallback()
			this.isLongPress = false
			if (this.isDragging) {
				this.isDragging = false
				if (this.isHorizontalDrag) { // * needs improvement
					if (this.translation.x > 0)
						this.isTossLeft = true
					else
						this.isTossRight = true
				}
				else {
					if (this.translation.y > 0)
						this.isTossDown = true
					else
						this.isTossUp = true
				}
			}
			if (this.isSingleTapDown) {
				this.isSingleTapDown = false
				this.isSingleTapUp = true
			}
			if (this.isDoubleTapDown) {
				this.isDoubleTapDown = false
				this.isDoubleTapUp = true
			}
			this.lastFingerID = this.fingerID
			this.fingerID = null
			
			if (this.allowFingerSwapping) {
				var swapToID = null, swapToX, swapToY
				var twoFingerHandler = this.behavior.touchHandlers.twoFingerHandler
				if (twoFingerHandler.firstID != null && twoFingerHandler.firstID != id) {
					swapToID = twoFingerHandler.firstID
					swapToX = twoFingerHandler.firstPoint.x
					swapToY = twoFingerHandler.firstPoint.y
				}
				else if (twoFingerHandler.secondID != null  && twoFingerHandler.secondID != id) {
					swapToID = twoFingerHandler.secondID
					swapToX = twoFingerHandler.secondPoint.x
					swapToY = twoFingerHandler.secondPoint.y
				}
				if (swapToID != null)
					this.onTouchBegan(content, swapToID, swapToX, swapToY, ticks)
			}
		}
    }
	updateTranslation(x, y) {
		var translation = this.translation
		this.point.x = x; this.point.y = y
		var lastTranslationX = translation.x
		var lastTranslationY = translation.y
		translation.x = this.point.x - this.anchorPoint.x
		translation.y = this.point.y - this.anchorPoint.y
		this.deltaTranslation.x = translation.x - lastTranslationX // * should name this frameDeltaTranslation to sync with twoFingerHandler
		this.deltaTranslation.y = translation.y - lastTranslationY
    }
	getVelocity(lookbackWindow) {
		if (undefined == lookbackWindow)
			lookbackWindow = 100
		var fingerID = (null != this.fingerID) ? this.fingerID : this.lastFingerID
		var pair = this.behavior.getTouchEventPairForID(fingerID, lookbackWindow)
		var first = pair.first
		var last = pair.last
		if (first != null && last != null) {
			var dt = last.ticks - first.ticks
			var dx = last.x - first.x
			var dy = last.y - first.y
			return { x : dx / dt * 1000, y : dy / dt * 1000 }
		}
    }
	longPressBeginCallback() {
		this.isLongPress = true
		this.behavior.touchStateMachine.updateCurrentState()
    }
}

export class TouchState {
	constructor(content, target) {	
		this.content = content
		this.target = target
		this.behavior = content.behavior
		var touchHandlers = this.behavior.touchHandlers
		this.oneFingerHandler = touchHandlers.oneFingerHandler
		this.twoFingerHandler = touchHandlers.twoFingerHandler
		this.active = false
		this.animating = false
		this.transitions = []
		this.id = "TouchState"
		this.stateMachine = null
	}
	onEnter() {}
	onTouchChanged() {}
	onTimeChanged() {}
	onBeginTransition() {}
	onStepTransition(fraction) {}
	onEndTransition() {
		this.finished()
		this.stateMachine.onEndTransition()
	}
	onExit() {
		if (this.animating)
			this.endAnimating()
	}
	activate() { // called by state machine
		this.active = true
	}
	finished() { // may be called by self
		this.active = false
		this.stateMachine.updateCurrentState()
	}
	addTransition(transition, stateMachine) {
		this.transitions.push(transition)
		this.stateMachine = stateMachine
	}
	runVisualTransition(content, duration) {
		var transition = new TouchStateVisualTransition()
		transition.duration = duration
		content.container.run(transition, this) // can't call run() on a content
	}
	beginAnimating(interval) {
		this.animating = true
		var content = this.content
		content.time = 0
		content.duration = 0
		if (undefined != interval)
			content.interval = interval
		content.start()
	}
	endAnimating() {
		this.content.stop()
		this.animating = false
	}
}

export class TouchStateTransition  {
	constructor(fromState, toState, condition, callbackClient, callback) { // callback and callbackClient are optional
		this.fromState = fromState
		this.toState = toState
		this.condition = condition
		this.callback = callback
		this.callbackClient = callbackClient
	}
	conditionSatisfied() {
		return this.condition(this.fromState)
	}
}

export class TouchStateMachine {
	constructor(defaultState, touchStateTransitions) {
		this.defaultState = defaultState
		this.touchStateTransitions = touchStateTransitions
		this.installTransitions()
		this.currentState = null
		this.behavior = null
		this.enterState(defaultState, undefined)
	}
	installTransitions() {
		var transitions = this.touchStateTransitions
		for (var i=0, c=transitions.length; i<c; i++)
			transitions[i].fromState.addTransition(transitions[i], this)
	}
	enterState(state, transition) {
		if (state !== this.currentState) {
			if (null != this.behavior)
				this.behavior.onStateChanged()
			var fromState = null
			if (this.currentState) {
			//print("exit state: " + this.currentState.id)
				this.currentState.onExit()								
				fromState = this.currentState
			}
			this.currentState = state
			state.activate()
			//print("enter state: " + state.id)
			state.onEnter(fromState)

			if (transition != undefined && transition.callbackClient != undefined)
				transition.callbackClient[transition.callback]()
		}
	}
	updateCurrentState() {
		var transitions = this.currentState.transitions
		for (var i=0, c=transitions.length; i<c; i++) {
			var transition = transitions[i]
			if (transition.conditionSatisfied()) {
				this.enterState(transition.toState, transition)
				return
			}
		}
	}
	onTouchBegan(handlers, content, id, x, y, ticks) {
		for (var i=0, c=handlers.length; i<c; i++)
			handlers[i].onTouchBegan(content, id, x, y, ticks)
		this.currentState.onTouchChanged()
		this.updateCurrentState()
	}
	onTouchMoved(handlers, content, id, x, y, ticks) {
		for (var i=0, c=handlers.length; i<c; i++)
			handlers[i].onTouchMoved(content, id, x, y, ticks)
		this.currentState.onTouchChanged()
		this.updateCurrentState()
	}
	onTouchEnded(handlers, content, id, x, y, ticks) {
		for (var i=0, c=handlers.length; i<c; i++)
			handlers[i].onTouchEnded(content, id, x, y, ticks)
		this.currentState.onTouchChanged()
		this.updateCurrentState()
	}
	onTimeChanged() {
		this.currentState.onTimeChanged()
		this.updateCurrentState()
	}
	onEndTransition() {
		this.updateCurrentState()
	}
}

export default {
	TouchBehavior,
	TouchStateVisualTransition,
	TouchState,
	TouchStateTransition,
	TouchStateMachine,
}