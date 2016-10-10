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
	DynamicSkin
} from 'control';

export var DISABLED = 0;
export var ENABLED = 1;
export var SELECTED = 2;

export var mainTexture = new Texture('assets/main.png', 1);
export var blackSkin = new Skin({ fill: 'black',});
export var redSkin = new Skin({ fill: 'red',});
export var whiteSkin = new Skin({ fill: 'white',});

export var applicationSkin = new Skin({ fill: 'black',});
export var applicationStyle = new Style({ color: 'black', font: '18px', horizontal: 'left', vertical: 'middle', });
if ( application != null ) application.style = applicationStyle;

export var screenFooterHeight = 50;
export var screenHeaderHeight = 50;
export var headerSkin = new Skin({ fill: '#D0000000',});
export var headerStyle = new Style({ color: 'white', font: 'bold 22px', horizontal: 'left' });
export var headerTitleSkin = null;
export var plainHeaderTitleStyle = new Style({ right: 50 });
export var toolHeaderTitleStyle = new Style({ left: 10, right: 10 });
export var backButtonSkin = new Skin({ texture: mainTexture, width: 50, height: 50, states: 50, });
export var headerTitleSkin = null;
export var headerTitleStyle = new Style({ color: 'white', font: 'bold 22px', horizontal: 'left', left: 10, right: 10, });
export var toolButtonSkin = null;
export var searchTitleSkin = new Skin({ texture: mainTexture, x: 50, width: 100, height: 50, tiles: { left:25, right:25 }, });
export var footerSkin = headerSkin;

export var toolTexture = new Texture('assets/tools.png', 2);
export var toolDisabledEffect = null;
export var toolEnabledEffect = new Effect();
toolEnabledEffect.colorize('white', 1);
export var toolSelectedEffect = new Effect();
toolSelectedEffect.colorize('#acd473', 1);
export var toolSkin = new DynamicSkin(toolTexture, toolDisabledEffect, toolEnabledEffect, toolSelectedEffect);

export var STOP = 0;
export var PLAY = 1;
export var PAUSE = 2;
export var NEXT = 3;
export var PREVIOUS = 4;
export var FULL = 5;
export var NOT_FULL = 6;
export var SEARCH = 7;

export var buttonStyle = new Style({ color: ['white', 'white', '#acd473'],  font: 'bold 20px', horizontal: 'center' });
export var buttonLineMiddleSkin = null;
export var buttonLineLeftSkin = buttonLineMiddleSkin;
export var buttonLineRightSkin = buttonLineMiddleSkin;
export var cancellerSkin = new Skin({ fill: ['transparent', '#A0000000'], });

export var dialogBoxTexture = new Texture('assets/dialogBox.png', 1);
export var dialogBoxSkin = new Skin({ texture: dialogBoxTexture, width: 70, height: 70, tiles: { left:30, right:30, top:30, bottom:30 }, margins: { left:20, right:20, top:20, bottom:20 } });
export var dialogDisabledEffect = new Effect();
export var dialogEnabledEffect = new Effect();
dialogEnabledEffect.colorize('#404040', 1);
export var dialogSelectedEffect = new Effect();
dialogSelectedEffect.colorize('#598527', 1);
export var dialogButtonsTexture = new Texture('assets/dialogButtons.png', 2);
export var dialogButtonsSkin = new DynamicSkin(dialogButtonsTexture, dialogDisabledEffect, dialogEnabledEffect, dialogSelectedEffect);

export var CANCEL = 0;
export var OK = 1;
export var CHECK_OFF = 2;
export var CHECK_ON = 3;
export var RADIO_OFF = 4;
export var RADIO_ON = 5;
export var RETRY = 6;

export var dialogHeaderSkin = new Skin({ borders: { bottom:1 }, fill: '#eaeaea',stroke: '#9b9b9b',});
export var dialogScrollerSkin = new Skin({ fill: '#eaeaea',});
export var dialogFooterSkin = new Skin({ borders: { top:1 }, fill: '#eaeaea',stroke: '#9b9b9b',});
export var dialogButtonSkin = null;
export var dialogButtonStyle = new Style({ color: ['white', 'white', '#acd473'],  font: 'bold 20px', horizontal: 'center', left: 10, right: 10, });
export var dialogCancelStyle = new Style({ color: ['transparent', '#404040', '#598527'],  font: 'bold 20px', horizontal: 'left' });
export var dialogCommentStyle = new Style({ color: '#404040', font: '20px', horizontal: 'left', vertical: 'middle', left: 10, right: 10, top: 10, bottom: 10, });
export var dialogFieldSkin = new Skin({ fill: ['transparent', 'transparent', 'transparent', '#acd473'], });
export var dialogLabelStyle = new Style({ color: '#404040', font: '20px', horizontal: 'left', vertical: 'middle', left: 10, right: 5, });
export var dialogLabelRightStyle = new Style({ color: '#404040', font: '20px', horizontal: 'right', vertical: 'middle', left: 5, right: 10, });
export var dialogValueStyle = new Style({ color: '#404040', font: 'bold 20px', horizontal: 'right', vertical: 'middle', left: 5, right: 10, });
export var dialogOKStyle = new Style({ color: ['transparent', '#404040', '#598527'],  font: 'bold 20px', horizontal: 'right' });
export var dialogTitleStyle = new Style({ color: '#404040', font: 'bold 22px', horizontal: 'center', left: 10, right: 10, });
export var dialogSubtitleStyle = new Style({ color: '#404040', font: 'bold 20px', horizontal: 'center', left: 10, right: 10, });
export var dialogCaptionStyle = new Style({ color: '#404040', font: '20px', horizontal: 'center', left: 10, right: 10, });
export var dialogFooterHeight = 40;
export var dialogHeaderHeight = 44;
export var dialogItemHeight = 40;

export var fieldDeleterTexture = new Texture('assets/fieldDeleter.png', 1);
export var fieldDeleterSkin = new Skin({ texture: fieldDeleterTexture, width: 40, height: 40, states: 40, });
export var fieldLabelSkin = new Skin({ fill: ['transparent', 'transparent', '#C0C0C0', '#acd473'], });
export var fieldLabelStyle = new Style({ color: 'black', font: 'bold 20px', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5, });
export var fieldScrollerSkin = new Skin({ fill: 'white',});

export var defaultLineHeight = 40;
export var lineSkin = new Skin({ fill: ['white', '#acd473'], });
export var busyTexture = new Texture('assets/busy.png', 1);
export var busySkin = new Skin({ texture: busyTexture, width: 40, height: 40, variants: 40, });
export var busyCount = 16;
export var emptySkin = new Skin({ texture: mainTexture, x: 50, y: 150, width: 50, height: 50, });
export var errorStyle = new Style({ color: 'black', font: 'bold 14px', horizontal: 'center', });
export var errorSkin = new Skin({ texture: busyTexture, x: 640, width: 40, height: 40, });
export var moreSkin = new Skin({ texture: mainTexture, x: 150, width: 50, height: 50, states: 50, });

export var mediaButtonBackgroundSkin = new Skin({ texture: mainTexture, y: 150, width: 50, height: 50, });
export var mediaSeekerBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 }, });
export var mediaSeekerButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50, });
export var mediaSeekerLabelSkin = new Skin({ texture: mainTexture, x: 150, y: 150, width: 50, height: 50, });
export var mediaSeekerStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'center' });
export var mediaSeekerLeftStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'left' });
export var mediaSeekerRightStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'right' });
export var mediaSeekerTopStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'center' });
export var mediaSeekerBottomStyle = new Style({ color: 'white', font: 'bold 16px', horizontal: 'center' });
export var mediaSeekerTopSkin = new Skin({ borders: { left:1, right:1, top:1 }, stroke: '#959595' });
export var mediaSeekerBottomSkin = new Skin({ fill: '#959595' });

export var horizontalSliderBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 }, });
export var horizontalSliderButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50, });
export var verticalSliderBarSkin = new Skin({ texture: mainTexture, x: 200, y: 95, width: 50, height: 60, states: 50, tiles: { top:15, bottom:25 }, });
export var verticalSliderButtonSkin = new Skin({ texture: mainTexture, x: 250, y: 110, width: 50, height: 30, states: 50, });
export var scrollerSkin = null;
export var horizontalScrollbarTexture = new Texture('assets/horizontalScrollbar.png', 1);
export var horizontalScrollbarSkin = new Skin({ texture: horizontalScrollbarTexture, width: 40, height: 10, tiles: { left:10, right:10 }, });
export var horizontalScrollerShadowTexture = new Texture('assets/horizontalScrollerShadow.png', 1);
export var leftScrollerShadowSkin = new Skin({ texture: horizontalScrollerShadowTexture, width: 20, height: 40, tiles: { top:0, bottom:0 }, });
export var rightScrollerShadowSkin = new Skin({ texture: horizontalScrollerShadowTexture, x: 20, width: 20, height: 40, tiles: { top:0, bottom:0 }, });
export var verticalScrollbarTexture = new Texture('assets/verticalScrollbar.png', 1);
export var verticalScrollbarSkin = new Skin({ texture: verticalScrollbarTexture, width: 10, height: 40, tiles: { top:10, bottom:10 }, });
export var verticalScrollerShadowTexture = new Texture('assets/verticalScrollerShadow.png', 1);
export var topScrollerShadowSkin = new Skin({ texture: verticalScrollerShadowTexture, width: 40, height: 20, tiles: { left:0, right:0 }, });
export var bottomScrollerShadowSkin = new Skin({ texture: verticalScrollerShadowTexture, y: 20, width: 40, height: 20, tiles: { left:0, right:0 }, });

export var menusTexture = new Texture('assets/menus.png', 1);
export var menuArrowSkin = new Skin({ texture: menusTexture, width: 30, height: 30, states: 30 });
export var menuBulletSkin = new Skin({ texture: menusTexture, x: 30, width: 30, height: 30, states: 30, });
export var menuItemSkin = new Skin({ fill: ['white', 'white', '#acd473'], });
export var menuItemStyle = new Style({ color: 'black', font: 'bold 20px', horizontal: 'left', vertical: 'middle', right: 15, });
export var menuButtonStyle = new Style({ color: ['white', 'white', '#acd473'],  font: 'bold', horizontal: 'center' });
export var menuButtonSkin = null;

export var progressBarTexture = new Texture('assets/progressBar.png', 1);
export var progressBarSkin = new Skin({ texture: progressBarTexture, width: 60, height: 20, states: 20, tiles: { left:6, right:6 }, });
export var progressCombSkin = new Skin({ texture: progressBarTexture, y: 40, width: 60, height: 20, tiles: { left:0, right:0 }, });

export var tabDisabledEffect = new Effect();
tabDisabledEffect.colorize('#acd473', 1);
export var tabEnabledEffect = new Effect();
tabEnabledEffect.colorize('white', 1);
export var tabSelectedEffect = new Effect();
tabSelectedEffect.colorize('#acd473', 1);

export var tabBarHeight = 50;
export var tabBarMiddleSkin = new Skin({ fill: ['#80000000', 'transparent', 'transparent'] });
export var tabBarLeftSkin = tabBarMiddleSkin;
export var tabBarRightSkin = tabBarMiddleSkin;
export var tabBarStyle = new Style({ color: ['#acd473', 'white', '#acd473'],  font: 'bold 14px', horizontal: 'center' });
export var tabLineMiddleSkin = new Skin({ fill: ['white', '#D0000000', '#D0000000'] });
export var tabLineLeftSkin = tabLineMiddleSkin;
export var tabLineRightSkin = tabLineMiddleSkin;
export var tabLineStyle = new Style({ color: ['black', 'white', '#acd473'],  font: 'bold 18px', horizontal: 'center' });

export var spinnerTexture = new Texture('assets/spinner-strip-80px-24cell-blue.png', 1);
export var spinnerSkin = new Skin({ texture: spinnerTexture, width: 80, height: 80, variants: 80, });
export var spinnerCount = 24;

let theme = {
	DISABLED, ENABLED, SELECTED, mainTexture, blackSkin, redSkin, whiteSkin, applicationSkin, applicationStyle, screenFooterHeight, screenHeaderHeight, headerSkin, headerStyle, headerTitleSkin, plainHeaderTitleStyle, toolHeaderTitleStyle, backButtonSkin, headerTitleStyle, toolButtonSkin, searchTitleSkin, footerSkin, toolTexture, toolDisabledEffect, toolEnabledEffect, toolSelectedEffect, toolSkin, STOP, PLAY, PAUSE, NEXT, PREVIOUS, FULL, NOT_FULL, SEARCH, buttonStyle, buttonLineMiddleSkin, buttonLineLeftSkin, buttonLineRightSkin, cancellerSkin, dialogBoxTexture, dialogBoxSkin, dialogDisabledEffect, dialogEnabledEffect, dialogSelectedEffect, dialogButtonsTexture, dialogButtonsSkin, CANCEL, OK, CHECK_OFF, CHECK_ON, RADIO_OFF, RADIO_ON, RETRY, dialogHeaderSkin, dialogScrollerSkin, dialogFooterSkin, dialogButtonSkin, dialogButtonStyle, dialogCancelStyle, dialogCommentStyle, dialogFieldSkin, dialogLabelStyle, dialogLabelRightStyle, dialogValueStyle, dialogOKStyle, dialogTitleStyle, dialogSubtitleStyle, dialogCaptionStyle, dialogFooterHeight, dialogHeaderHeight, dialogItemHeight, fieldDeleterTexture, fieldDeleterSkin, fieldLabelSkin, fieldLabelStyle, fieldScrollerSkin, defaultLineHeight, lineSkin, busyTexture, busySkin, busyCount, emptySkin, errorStyle, errorSkin, moreSkin, mediaButtonBackgroundSkin, mediaSeekerBarSkin, mediaSeekerButtonSkin, mediaSeekerLabelSkin, mediaSeekerStyle, mediaSeekerLeftStyle, mediaSeekerRightStyle, mediaSeekerTopStyle, mediaSeekerBottomStyle, mediaSeekerTopSkin, mediaSeekerBottomSkin, horizontalSliderBarSkin, horizontalSliderButtonSkin, verticalSliderBarSkin, verticalSliderButtonSkin, scrollerSkin, horizontalScrollbarTexture, horizontalScrollbarSkin, horizontalScrollerShadowTexture, leftScrollerShadowSkin, rightScrollerShadowSkin, verticalScrollbarTexture, verticalScrollbarSkin, verticalScrollerShadowTexture, topScrollerShadowSkin, bottomScrollerShadowSkin, menusTexture, menuArrowSkin, menuBulletSkin, menuItemSkin, menuItemStyle, menuButtonStyle, menuButtonSkin, progressBarTexture, progressBarSkin, progressCombSkin, tabDisabledEffect, tabEnabledEffect, tabSelectedEffect, tabBarHeight, tabBarMiddleSkin, tabBarLeftSkin, tabBarRightSkin, tabBarStyle, tabLineMiddleSkin, tabLineLeftSkin, tabLineRightSkin, tabLineStyle, spinnerTexture, spinnerSkin, spinnerCount
}

import TRANSITION from './transition';
for (var i in TRANSITION) theme[i] = TRANSITION[i];

export default theme;
