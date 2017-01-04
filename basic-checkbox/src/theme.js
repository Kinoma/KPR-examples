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

/*
*
* This is the JavaScript equivalent of the flat theme module used by the Controls library
* https://github.com/Kinoma/kinomajs/tree/master/kinoma/kpr/libraries/Controls/src/themes/flat
*
*/
let DynamicSkin = function(texture, disabledEffect, enabledEffect, selectedEffect, variantWidth, tiles, margins, aspect) {
	let saveEffect = texture.effect;
	let srcScale = texture.scale;
	let srcWidth = texture.width;
	let srcHeight = texture.height;
	let dstScale = screenScale;
	let dstWidth = Math.round(srcWidth / dstScale);
	let dstHeight = Math.round(srcHeight / dstScale);
	let port = new Port({width: dstWidth, height: dstHeight * 3});
	port.behavior = {
		onDraw: function(port) {
			port.effect = disabledEffect;
			port.drawImage(texture, 0, 0, dstWidth, dstHeight, 0, 0, srcWidth, srcHeight);
			port.effect = enabledEffect;
			port.drawImage(texture, 0, dstHeight, dstWidth, dstHeight, 0, 0, srcWidth, srcHeight);
			port.effect = selectedEffect;
			port.drawImage(texture, 0, dstHeight << 1, dstWidth, dstHeight, 0, 0, srcWidth, srcHeight);
		}
	}
	let result = new Texture(port, srcScale);
	let height = Math.round(srcHeight / srcScale);
	let width = (variantWidth == undefined) ? height : Math.round(variantWidth / scale);
	Skin.call(this, result, {x:0, y:0, width:height, height:height}, width, height, tiles, margins, aspect);
	result.effect = saveEffect;
};
DynamicSkin.prototype = Skin.prototype;

let disabledEffect = new Effect();
disabledEffect.colorize('#9d9d9d', 1);
let enabledEffect = new Effect();
enabledEffect.colorize('gray', 1);
let selectedEffect = new Effect();
selectedEffect.colorize('#88a4ee', 1);
let buttonTexture = new Texture('assets/core-button-2x.png', 2);
let buttonSkin = new DynamicSkin( buttonTexture, disabledEffect, enabledEffect, selectedEffect, undefined, { left : 10, top : 10, right : 10, bottom : 10 });
let buttonStyle = new Style({ color: ['black', 'black', 'black'],  font: 'bold 20px', horizontal: 'center' });
let labeledButtonStyle = new Style({ color: ['gray', 'gray', '#88a4ee'],  font: 'bold 20px', horizontal: 'left' });

let glyphTexture = new Texture('assets/core-glyph-strip-60px.png', 2);
let glyphSkin = new DynamicSkin(glyphTexture, disabledEffect, enabledEffect, selectedEffect);

let CHECKBOX_UNSELECTED = 0;
let CHECKBOX_SELECTED = 1;
let RADIO_UNSELECTED = 2;
let RADIO_SELECTED = 3;

let mainTexture = new Texture('assets/main.png', 1);
let horizontalSliderBarSkin = new Skin({ texture: mainTexture, x: 45, y: 50, width: 60, height: 50, states: 50, tiles: { left:15, right:25 } });
let horizontalSliderButtonSkin = new Skin({ texture: mainTexture, x: 110, y: 50, width: 30, height: 50, states: 50 });
let verticalSliderBarSkin = new Skin({ texture: mainTexture, x: 200, y: 95, width: 50, height: 60, states: 50, tiles: { top:15, bottom:25 } });
let verticalSliderButtonSkin = new Skin({ texture: mainTexture, x: 250, y: 110, width: 50, height: 30, states: 50 });

let switchButtonTexture = new Texture('assets/toggle-switch.png', 2);
let switchBarSkin = new Skin({ texture: switchButtonTexture, x: 100, width: 60, height: 40, states: 40, tiles: { left:20, right:20 } });
let switchButtonSkin = new Skin({ texture: switchButtonTexture, x: 160, width: 40, height: 40, states: 40 });
let switchTextSkin = new Skin({ texture: switchButtonTexture, x: 200, width: 40, height: 40, states: 40 });

export var THEME = {
	DynamicSkin,
	buttonStyle, buttonTexture, buttonSkin, labeledButtonStyle,
	glyphTexture, glyphSkin,
	CHECKBOX_SELECTED, CHECKBOX_UNSELECTED, RADIO_SELECTED, RADIO_UNSELECTED,
	mainTexture, horizontalSliderBarSkin, horizontalSliderButtonSkin, verticalSliderBarSkin, verticalSliderButtonSkin,
	switchButtonTexture, switchBarSkin, switchButtonSkin, switchTextSkin
}