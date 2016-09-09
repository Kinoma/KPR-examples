//@program
/*
  Copyright 2011-2015 Marvell Semiconductor, Inc.
  
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

THEME = require("themes/sample/theme");
var SCROLLER = require("mobile/scroller");

/* ASSETS */

var mainSkin = new Skin({ fill:'white' });
var subtitleSkin = new Skin({ fill:'#888' });

var mainStyle = new Style({ font:"24px", color:"black", horizontal:"left", vertical:"middle" });
var subtitleStyle = new Style({ font:"bold 16px", color:"white", horizontal:"left", vertical:"middle" });
var titleStyle = new Style({ font:"36px", color:"gray", horizontal:"center", vertical:"middle" });

var fontSizeSample1 = new Style({ font: '16px' });
var fontSizeSample2 = new Style({ font: '32px' });
var fontSizeSample3 = new Style({ font: '48px' });

var fontStyleSample1 = new Style({ font: 'bold' });
var fontStyleSample2 = new Style({ font: 'italic' });
var fontStyleSample3 = new Style({ font: 'underline' });

var colorSample1 = new Style({ color: 'red' });
var colorSample2 = new Style({ color: 'blue' });
var colorSample3 = new Style({ color: '#e94' });

var hAlignSample1 = new Style({ horizontal: 'left' });
var hAlignSample2 = new Style({ horizontal: 'center' });
var hAlignSample3 = new Style({ horizontal: 'right' });
var hAlignSample4 = new Style({ horizontal: 'justify' });

var vAlignSample1 = new Style({ vertical: 'top' });
var vAlignSample2 = new Style({ vertical: 'middle' });
var vAlignSample3 = new Style({ vertical: 'bottom' });

var alignSampleMix = new Style({ horizontal: 'right', vertical: 'top' });
var indentationSample = new Style({ indentation: 40 });

var leadingSample1 = new Style({ leading: 24 });
var leadingSample2 = new Style({ leading: -10 });

var marginSample = new Style({ left: 20, right: 20, top: 10, bottom: 10 });

var extraSample1 = new Style({ extra:5 });
var extraSample2 = new Style({ extra:-2 });

/* TEMPLATES */

var LabelSample = Label.template($ => ({ left:8, right:8, style:$.style, string:$.label }));

var SubtitleSample = Container.template($ => ({
	left:0, right:0, height:20, skin:subtitleSkin,
	contents: [
		Label($, { left:4, right:4, top:4, bottom:4, style:subtitleStyle, string:$.string })
	]
}));

var TextSample = Text.template($ => ({ left:8, right:8, style:$.style, string:$.text }));

var StyleSamplerContainer = Container.template($ => ({
	left:0, right:0, top:0, bottom:0, style:mainStyle, skin:mainSkin,
	contents: [
		SCROLLER.VerticalScroller($, {
			contents: [
				Column($, {
					left:0, right:0, top:0,
					Behavior: class extends Behavior {
						onCreate(column, data) {
							var items = data.items;
							for ( var i = 0, c = items.length; i < c; i++ ) {
								var item = items[i];
								
								if ('comment' in item) 
									column.add(new SubtitleSample({string: item.comment}));
								if ('label' in item)
									column.add(new LabelSample(item));
								if ('text' in item)
									column.add(new TextSample(item));
							}
						}
					}
				})
			]
		})
	]
}));

/* APPLICATION */

var sample = "The quick brown fox jumps over the lazy dog. ";
var long_sample = sample + sample + sample + sample + sample + sample;

var data = {
	items: [
		{label:"Label Examples", style: titleStyle},
		
		{label:sample, comment: "font = 16px", style: fontSizeSample1},
		{label:sample, comment: "font = 32px", style: fontSizeSample2},
		{label:sample, comment: "font = 48px", style: fontSizeSample3},
		  
		{label:sample, comment: "font = bold", style: fontStyleSample1},
		{label:sample, comment: "font = italic", style: fontStyleSample2},
		{label:sample, comment: "font = underline", style: fontStyleSample3},
		
		{label:"Red is the hot color.", comment: "color = red", style: colorSample1},
		{label:"Blue is always cool.", comment: "color = blue", style: colorSample2},
		{label:"Color can be CSS color.", comment: "color = #e94", style: colorSample3},
		  
		{label:"Left aligned text.", comment: "align = left", style: hAlignSample1},
		{label:"Center aligned text.", comment: "align = center", style: hAlignSample2},
		{label:"Right aligned text.", comment: "align = right", style: hAlignSample3},
		{label:"Left and right justified text.", comment: "align = justify", style: hAlignSample4},
		
		{label:"Top aligned text.", comment: "align = top", style: vAlignSample1},
		{label:"Middle aligned text.", comment: "align = middle", style: vAlignSample2},
		{label:"Bottom aligned text.", comment: "align = bottom", style: vAlignSample3},
		
		{label:"Top and right aligned text.", comment: "align = right,top", style: alignSampleMix},
		
		{label:sample, comment: "indentation = 20", style: indentationSample},
		
		{label:sample, comment: "margins left=10 right=10 top=10 bottom=10", style: marginSample},
		
		{label:"Wider", comment: "extra = 5", style: extraSample1},
		{label:"Narrow", comment: "extra = -2", style: extraSample2},

		{label:"Text Examples", style: titleStyle},
		
		{text:sample, comment: "font = 16px", style: fontSizeSample1},
		{text:sample, comment: "font = 32px", style: fontSizeSample2},
		{text:sample, comment: "font = 48px", style: fontSizeSample3},
		  
		{text:long_sample, comment: "font = bold", style: fontStyleSample1},
		{text:long_sample, comment: "font = italic", style: fontStyleSample2},
		{text:long_sample, comment: "font = underline", style: fontStyleSample3},
		
		{text:"Red is the hot color. " + long_sample, comment: "color = red", style: colorSample1},
		{text:"Blue is always cool. " + long_sample, comment: "color = blue", style: colorSample2},
		{text:"Color can be CSS color. " + long_sample, comment: "color = #e94", style: colorSample3},
		  
		{text:"Left aligned text. " + long_sample, comment: "align = left", style: hAlignSample1},
		{text:"Center aligned text. " + long_sample, comment: "align = center", style: hAlignSample2},
		{text:"Right aligned text. " + long_sample, comment: "align = right", style: hAlignSample3},
		{text:"Left and right justified text. " + long_sample, comment: "align = justify", style: hAlignSample4},
		
		{text:long_sample, comment: "indentation = 40", style: indentationSample},
		
		{text:long_sample, comment: "leading = 24", style: leadingSample1},
		{text:long_sample, comment: "leading = -10", style: leadingSample2},
		  
		{text:long_sample, comment: "margins left=20 right=20 top=10 bottom=10", style: marginSample},
	]
};

application.add(new StyleSamplerContainer(data));
