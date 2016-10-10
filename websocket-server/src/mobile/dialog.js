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
import THEME from 'theme';
import CONTROL from 'control';
import SCROLLER from 'scroller';

export class BoxBehavior extends Behavior{
	onCancel(layout) {
		layout.container.delegate("onCancel");
		application.behavior.closeDialog(layout.container);
		return true;
	}
	onCancelBegan(layout) {
		if ('cancelButton' in this && this.cancelButton)
			this.cancelButton.delegate('onTouchBegan');
	}
	onCancelEnded(dialog) {
		if ('cancelButton' in this && this.cancelButton)
			this.cancelButton.delegate('onTouchEnded');
	}
	onChanged(layout) {
		if ('okButton' in this && this.okButton)
			this.okButton.active = layout.container.delegate("canOK");
		return true;
	}
	onCreate(layout, data) {
		this.data = data;
		this.query = data.query;
		var header = layout.first;
		var scroller = header.next;
		var footer = scroller.next;
		var column = scroller.first;
		var headerHeight = 0;;
		var footerHeight = 0;;
		if ('title' in data && data.title) {
			headerHeight = THEME.dialogHeaderHeight;
			header.coordinates = { left:0, right: 0, top:0, height:headerHeight };
			header.add(new Title(data.title));
		}
		var items = data.items;
		var c = items.length;
		var labelWidth = 0;
		for (var i = 0; i < c; i++) {
			var item = items[i];
			if ("label" in item) {
				var size = THEME.dialogLabelStyle.measure(item.label);
				if (labelWidth < size.width)
					labelWidth = size.width;
			}
		}
		column.add(new Spacer());
		for (var i = 0; i < c; i++) {
			var item = items[i];
			if ('id' in item && item.id && item.id in this.query)
				item.value = this.query[item.id];
			if (!('value' in item) || item.value === undefined)
				item.value = "";
			if ('Item' in item && item.Item) {
				item.labelWidth = labelWidth;
				column.add(new item.Item(item));
			}
		}
		column.add(new Spacer());

		var canCancel = ('cancel' in data && data.cancel);
		var canOK = ('ok' in data && data.ok);
		if (canCancel || canOK) {
			footerHeight = THEME.dialogFooterHeight;
			footer.coordinates = { left:0, right: 0, height:footerHeight, bottom:0 };
			if (canCancel) {
				this.cancelButton = new Cancel(data.cancel);
				footer.add(this.cancelButton);
			}
			if (canOK) {
				this.okButton = new OK(data.ok);
				footer.add(this.okButton);
			}
		}
		scroller.coordinates = { left:0, right: 0, top:headerHeight, bottom:footerHeight };
	}
	onDisplaying(layout) {
		this.former = layout.focus();
		this.onChanged(layout);
	}
	onKeyDown(layout, key, repeat, ticks) {
		var code = key.charCodeAt(0);
		if ((code == 8) || (code == 0xF0001))
			this.onCancelBegan(layout);
		else if ((code == 3) || (code == 13))
			this.onOKBegan(layout);
			if ((Event.FunctionKeyPower == code) || (0xF000C == code))
    		return false;
		return true;
	}
	onKeyUp(layout, key, repeat, ticks) {
		var code = key.charCodeAt(0);
		if ((code == 8) || (code == 0xF0001))
			this.onCancelEnded(layout);
		else if ((code == 3) || (code == 13))
			this.onOKEnded(layout);
			if ((Event.FunctionKeyPower == code) || (0xF000C == code))
    		return false;
		return true;
	}
	onOK(layout) {
		var data = this.data;
		var items = data.items;
		var c = items.length;
		var query = this.query;
		for (var i = 0; i < c; i++) {
			var item = items[i];
			if ('id' in item && item.id) 
				query[item.id] = item.value;
		}
		layout.container.delegate("onOK", query);
		application.behavior.closeDialog(layout.container);
		return true;
	}
	onOKBegan(layout) {
		var button = this.okButton;
		if (button)
			button.behavior.onTouchBegan(button);
	}
	onOKEnded(dialog) {
		var button = this.okButton;
		if (button)
			button.behavior.onTouchEnded(button);
	}
	onMeasureHorizontally(layout) {
		return Math.min(application.width - 40, 480);
	}
	onMeasureVertically(layout) {
		var header = layout.first;
		var scroller = header.next;
		var footer = scroller.next;
		var column = scroller.first;
		var size = column.measure();
		var height = header.height + size.height + footer.height;
		return Math.min(height, application.height);
		return height;
	}
	onScreenBegan(layout) {
		layout.distribute("onAutofocus", this);
	}
	onUndisplayed(layout) {
		if (this.former)
			this.former.focus();
	}
}

export var Box = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	active: true, skin: THEME.cancellerSkin,
	contents: [
		Layout($, { 
			active: true, skin: THEME.dialogBoxSkin, 
			Behavior: BoxBehavior, 
			contents: [
				Line($, { left: 0, right: 0, top: 0, height: 0, skin: THEME.dialogHeaderSkin, }),
				Scroller($, { 
					left: 0, right: 0, top: 0, bottom: 0, 
					active: true, skin: THEME.dialogScrollerSkin, 
					Behavior: SCROLLER.VerticalScrollerBehavior, clip: true, 
					contents: [
						Column($, { left: 0, right: 0, top: 0, }),
						SCROLLER.TopScrollerShadow($, { }),
						SCROLLER.BottomScrollerShadow($, { }),
					], 
				}),
				Line($, { left: 0, right: 0, height: 0, bottom: 0, skin: THEME.dialogFooterSkin, }),
			]
		}),
	]
}));


export var Busy = Container.template($ => ({ 
	left: 0, right: 0, 
	contents: [
		Content($, { left: 10, width: 40, height: 60, skin: THEME.busySkin, Behavior: CONTROL.BusyBehavior }),
		Text($, { left: 50, right: 0, style: THEME.dialogCommentStyle, anchor: 'TEXT', string: $.string, }),
	], 
}));


export var Spinner = Container.template($ => ({ 
	left: 0, right: 0, contents: [
		Content($, { width: 80, height: 80, skin: THEME.spinnerSkin, Behavior: CONTROL.SpinnerBehavior }),
	]
}));

export var Cancel = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	active: true, skin: THEME.dialogButtonSkin, 
	Behavior: class extends CONTROL.ButtonBehavior {
		onTouchEnded(container) {
			container.bubble("onCancel");
		}
	}, 
	contents: [
		Content($, { left: 0, skin: THEME.dialogButtonsSkin, variant: THEME.CANCEL }),
		Label($, { left: 40, right: 0, top: 0, bottom: 0, style: THEME.dialogCancelStyle, string: $ }),
	]
}));

export var OK = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, 
	active: true, skin: THEME.dialogButtonSkin, 
	Behavior: class extends CONTROL.ButtonBehavior {
		onTouchEnded(container) {
			container.bubble("onOK");
		}
	}, 
	contents: [
		Label($, { left: 0, right: 40, top: 0, bottom: 0, style: THEME.dialogOKStyle, string: $ }),
		Content($, { right: 0, skin: THEME.dialogButtonsSkin, variant: THEME.OK }),
	]
}));

export var Comment = Line.template($ => ({ 
	left: 0, right: 0, 
	contents: [
		Text($, { left: 0, right: 0, style: THEME.dialogCommentStyle, string: $.string }),
	]
}));

export var Caption = Line.template($ => ({ 
	left: 0, right: 0, 
	contents: [
		Text($, { left: 0, right: 0, style: THEME.dialogCaptionStyle, string: $.string }),
	]
}));

export var Subtitle = Line.template($ => ({ 
	left: 0, right: 0, 
	contents: [
		Text($, { left: 0, right: 0, style: THEME.dialogSubtitleStyle, string: $.string }),
	]
}));

export var Field = Line.template($ => ({ 
	left: 0, right: 0, height: 44, active: true, 
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
		}
	}, 
	contents: [
		Label($, { 
			left: 0, width: $.labelWidth, top: 0, bottom: 0, active: true, style: THEME.dialogLabelStyle, string: 'label' in $ ? $.label : '', 
			Behavior: class extends Behavior {
				onTouchBegan(label, id, x, y, ticks) {
					label.next.first.first.focus();
				}
			}, 
		}),
		Container($, { 
			left: 0, right: 10, top: 5, bottom: 5, skin: THEME.fieldScrollerSkin, 
			contents: [
				Scroller($, { 
					left: 0, right: 30, top: 0, bottom: 0, active: true, clip: true, 
					Behavior: CONTROL.FieldScrollerBehavior,
					contents: [
						Label($, { 
							left: 0, top: 0, bottom: 0, skin: THEME.fieldLabelSkin, style: THEME.fieldLabelStyle, editable: true, string: $.value,
							Behavior: class extends CONTROL.FieldLabelBehavior {
								onAutofocus(label) {
									label.focus();
									return true;
								}
								onEdited(label) {
									var string = label.string;
									this.data.value = string;
									label.container.next.visible = string.length > 0;
									label.bubble("onChanged");
								}
								onFocused(label) {
									super.onFocused(label);
									//label.container.next.active = true;
								}
								onUnfocused(label) {
									//label.container.next.active = false;
									super.onUnfocused(label);
								}
							}
						}),
					]
				}),
				Content($, { right: -5, top: 0, bottom: 0, active: true, skin: THEME.fieldDeleterSkin, Behavior: CONTROL.FieldDeleterBehavior }),
			]
		}),
	]
}));

export var fieldHintStyle = new Style({ color: 'silver', font: 'bold 20px', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5, });
export var FieldHint = Line.template($ => ({ 
	left: 0, right: 0, height: 44, active: true, 
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
		}
	}, 
	contents: [
		Container($, { 
			left: 10, right: 10, top: 5, bottom: 5, skin: THEME.fieldScrollerSkin, 
			contents: [
				Scroller($, { 
					left: 0, right: 30, top: 0, bottom: 0, active: true, clip: true, 
					Behavior: CONTROL.FieldScrollerBehavior,
					contents: [
						Label($, { left: 0, top: 0, bottom: 0, skin: THEME.fieldLabelSkin, style: THEME.fieldLabelStyle, editable: true, string: $.value,
							Behavior: class extends CONTROL.FieldLabelBehavior {
								onAutofocus(label) {
									label.focus();
									return true;
								}
								onEdited(label) {
									var string = label.string;
									this.data.value = string;
									label.container.next.next.visible = string.length == 0;
									label.bubble("onChanged");
								}
								onFocused(label) {
									super.onFocused(label);
								}
								onUnfocused(label) {
									super.onUnfocused(label);
								}
							}
						})
					],
				}),
				Content($, { right: -5, top: 0, bottom: 0, active: true, skin: THEME.fieldDeleterSkin, Behavior: CONTROL.FieldDeleterBehavior }),
				Label($, { left: 0, top: 0, bottom: 0, visible: ($.value.length == 0), style: fieldHintStyle, string: $.hint }),
			], 
		}),
	]
}));

export var Password = Field.template($ => ({ 
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
			container.last.first.first.hidden = true;
		}
	}
}));

export var PasswordHint = FieldHint.template($ => ({ 
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
			container.last.first.first.hidden = true;
		}
	}
}));

export var Checkbox = Container.template($ => ({ 
	left: 0, right: 0, height: 44, active: true, 
	Behavior: CONTROL.CheckboxBehavior, 
	contents: [
		CONTROL.Checkbox($, { left: 12, }),
		Label($, { left: 40, right: 12, top: 0, bottom: 0, style: THEME.dialogLabelStyle, string: $.label }),
	]
}));

export var CheckboxRight = Container.template($ => ({ 
	left: 0, right: 0, height: 44, active: true, 
	Behavior: CONTROL.CheckboxBehavior, 
	contents: [
		Label($, { left: 12, right: 40, top: 0, bottom: 0, style: THEME.dialogLabelRightStyle, string: $.label }),
		CONTROL.Checkbox($, { right: 6, }),
	]
}));

export var ProgressBar = Container.template($ => ({ 
	left: 0, right: 0, height: 20, 
	contents: [
		Container($, { 
			left: 5, right: 5, top: 0, bottom: 0, skin: THEME.progressBarSkin, anchor: 'BAR', 
			Behavior: class extends Behavior {
				onChanged(container) {
					var bar = container.first;
					var comb = container.last;
					var value = this.data.value;
					if (value < 0) {
						bar.visible = false;
						comb.visible = true;
					}
					else {
						bar.visible = true;
						comb.visible = false;
						bar.width = 12 + Math.round((container.width - 12) * value);
					}
				}
				onCreate(container, data) {
					this.data = data;
				}
				onDisplaying(container) {
					this.onChanged(container);
				}
			}, 
			contents: [
				Content($, { left: 0, width: 0, top: 0, bottom: 0, skin: THEME.progressBarSkin, state: 1 }),
				Scroller($, { 
					left: 6, right: 6, top: 0, bottom: 0, clip: true, loop: true,
					Behavior: CONTROL.HorizontalTickerBehavior, 
					contents: [
						Content($, { left: 0, width: 600, top: 0, bottom: 0, skin: THEME.progressCombSkin }),
					]
				}),
		], }),
	]
}));

export var Slider = Container.template($ => ({ 
	left: 0, right: 0, height: 60, 
	contents: [
		Label($, { left: 0, right: 0, top: 5, height: 20, style: THEME.dialogLabelStyle, string: $.label }),
		Label($, { left: 0, right: 0, top: 5, height: 20, style: THEME.dialogValueStyle }),
		CONTROL.HorizontalSlider($, {
			left: 0, right: 0, top: 20, height: 40, bottom: 0, 
			Behavior: class extends CONTROL.HorizontalSliderBehavior{
				onValueChanged(container) {
					super.onValueChanged(container);
					var data = this.data;
					if ("toString" in data)
						container.previous.string = data.toString(data.value);
					else
						container.previous.string = data.value;
				}
			}, 
		}),
	]
}));

export var Spacer = Container.template($ => ({ left: 0, right: 0, height: 5 }));
export var Field2 = Line.template($ => ({ 
	left: 0, right: 0, height: 44 * $.lines, active: true, 
	Behavior: class extends Behavior {
		onCreate(container, data) {
			this.data = data;
			this.multipleLines = true;
		}
	}, 
	contents: [
		Container($, { left: 10, right: 10, top: 5, bottom: 5, skin: THEME.fieldScrollerSkin, contents: [
			Scroller($, { 
				left: 0, right: 0, top: 0, bottom: 0, active: true, clip: true,
				Behavior: CONTROL.FieldScrollerBehavior, 
				contents: [
					Text($, { 
						left: 0, right: 0, top: 0, active: true, editable: true,
						skin: THEME.fieldLabelSkin, style: THEME.fieldLabelStyle, string: $.value, 
						Behavior: class extends CONTROL.FieldLabelBehavior{
							onAutofocus(label) {
								label.focus();
								return true;
							}
							onEdited(label) {
								var string = label.string;
								this.data.value = string;
								label.bubble("onChanged");
							}
							onFocused(label) {
								super.onFocused(label);
								//label.container.next.active = true;
							}
							onUnfocused(label) {
								//label.container.next.active = false;
								super.onUnfocused(label);
							}
						}
					})
				]
			}),
		], }),
	]
}));

export var Title = Scroller.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, skin: THEME.headerTitleSkin, clip: true, loop: true, 
	Behavior: CONTROL.HorizontalTickerBehavior, 
	contents: [
		Label($, { left: 0, right: 0, top: 0, bottom: 0, style: THEME.dialogTitleStyle, string: $, }),
	], 
}));

class MenuLayoutBehavior extends Behavior {
	onCancel(layout) {
		application.run(new THEME.MenuCloseTransition, application.last, this.data.button);
	}
	onCreate(layout, data) {
		this.data = data;
		var content = layout.first.first.content(data.selection);
		content.first.visible = true;
	}
	onDisplaying(layout) {
		this.former = layout.focus();
	}
	onKeyDown(layout, key, repeat, ticks) {
		var code = key.charCodeAt(0);
			if ((Event.FunctionKeyPower == code) || (0xF000C == code))
    		return false;
		return true;
	}
	onKeyUp(layout, key, repeat, ticks) {
		var code = key.charCodeAt(0);
		if ((code == 8) || (code == 0xF0001))
			this.onCancel(layout);
			if ((Event.FunctionKeyPower == code) || (0xF000C == code))
    		return false;
		return true;
	}
	onMeasureHorizontally(layout) {
		var size = layout.first.first.measure();
		return size.width;
	}
	onMeasureVertically(layout) {
		var size = layout.first.first.measure();
		return Math.min(size.height, application.height - 46);
	}
	onUndisplayed(layout) {
		if (this.former)
			this.former.focus();
	}
}
export var Menu = Container.template($ => ({ 
	left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.cancellerSkin, 
	Behavior: class extends Behavior {
		onTouchEnded(container, id, x, y, ticks) {
			var layout = container.first;
			if (!layout.hit(x, y))
				layout.behavior.onCancel(layout);
		}
	}, 
	contents: [
		Layout($, { 
			skin: THEME.dialogBoxSkin, 
			Behavior: MenuLayoutBehavior, 
			contents: [
				Scroller($, { 
					left: 0, right: 0, top: 0, bottom: 0, active: true, skin: THEME.whiteSkin, clip: true,
					Behavior: SCROLLER.VerticalScrollerBehavior, 
					contents: [
						Column($, {
							left: 0, right: 0, top: 0, anchor: 'LIST', 
							contents: [
								($.items) ? $.items.map(function($) { var $$ = this; return [
									Line($, { 
										left: 0, right: 0, active: true, skin: THEME.menuItemSkin, 
										Behavior: class extends CONTROL.ButtonBehavior {
											onTap(content) {
												var data = content.container.container.container.behavior.data;
												application.run(new THEME.MenuCloseTransition, application.last, data.button);
												data.selection = content.index;
												if ("button" in data)
													data.button.first.last.string = this.data.title;
												content.invoke(new Message(data.action + this.data.value));
											}
										}, 
										contents: [
											Content($, { width: 30, height: 44, visible: false, skin: THEME.menuBulletSkin, }),
											Label($, { left: 0, top: 4, bottom: 4, style: THEME.menuItemStyle, string: $.title, }),
										], 
									}),
								]}, $) : null, 
							], 
						}),
						SCROLLER.TopScrollerShadow($, { }),
						SCROLLER.BottomScrollerShadow($, { }),
					], 
				}),
			]
		})
	]
}));

export default {
	BoxBehavior,
	Box,
	Busy,
	Spinner,
	Cancel,
	OK,
	Comment,
	Caption,
	Subtitle,
	Field,
	fieldHintStyle,
	FieldHint,
	Password,
	PasswordHint,
	Checkbox,
	CheckboxRight,
	ProgressBar,
	Slider,
	Spacer,
	Field2,
	Title,
	Menu
}
