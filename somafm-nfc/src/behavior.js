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
export class ButtonBehavior extends Behavior{	changeState(container, state) {		container.state = state;		var content = container.first;		while (content) {			content.state = state;			content = content.next;		}	}	onCreate(content, data) {		this.data = data;	}	onDisplaying(content) {		this.onStateChanged(content);	}	onStateChanged(container) {		this.changeState(container, container.active ? 1 : 0);	}	onTap(container) {		var data = this.data;		if (data && ("action" in data))			container.invoke(new Message(data.action));	}	onTouchBegan(container, id, x, y, ticks) {		this.changeState(container, 2);	}	onTouchCancelled(container, id, x, y, ticks) {		this.changeState(container, 1);	}	onTouchEnded(container, id, x, y, ticks) {		this.changeState(container, 1);		this.onTap(container);	}}

export class SliderBehavior extends Behavior {	changeState(container, state) {		container.last.state = state;	}	getMax(container) {		return this.data.max;	}	getMin(container) {		return this.data.min;	}	getOffset(container, size) {		var min = this.getMin(container);		var max = this.getMax(container);		var value = this.getValue(container);		return Math.round(((value - min) * size) / (max - min));	}	getValue(container) {		return this.data.value;	}	onAdapt(container) {		this.onLayoutChanged(container);	}	onCreate(container, data) {		this.data = data;	}	onDisplaying(container) {		this.onLayoutChanged(container);	}	onTouchBegan(container, id, x, y, ticks) {		container.captureTouch(id, x, y, ticks);		this.changeState(container, 1);		this.onTouchMoved(container, id, x, y, ticks);	}	onTouchEnded(container, id, x, y, ticks) {		this.changeState(container, 0);	}	setOffset(container, size, offset) {		var min = this.getMin(container);		var max = this.getMax(container);		var value = min + ((offset * (max - min)) / size);		if (value < min) value = min;		else if (value > max) value = max;		this.setValue(container, value);	}	setValue(container, value) {		this.data.value = value;	}}