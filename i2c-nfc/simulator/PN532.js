//@module
/*
  Copyright 2011-2014 Marvell Semiconductor, Inc.

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

var THEME = require ("themes/flat/theme");
var CONTROL = require ("mobile/control");
var PinsSimulators = require ("PinsSimulators");

var TOKENS = [  {uid: [99,84,25,153], pages: []},
                {uid: [115,227,24,153], pages: []},
                {uid: [227,104,22,208], pages: []}]

/*
    BLL interface
*/

exports.pins = {
    data: {type: "I2C", address: 0x24}
}

exports.configure = function(configuration) {
	this.data = {
		id: 'PN532',
		behavior: NFCBehavior,
		header : { 
			label : this.id, 
			name : "PN532",
			iconVariant : PinsSimulators.SENSOR_KNOB 
		},
		value: -1,
		last: undefined,
		authorized: false
	};
	this.container = shell.delegate("addSimulatorPart", this.data);
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.container);
}

exports.poll = function() {
    var data = this.data;
    if (data.last == data.value) return;

    data.last = data.value;
    return (-1 === data.value) ? [] : data.value;
}

exports.mifare_CmdAuthA = function(params) {
    if (6 != params.key.length)
        return -1;

    for (var i = 0; i < 6; i++)
        if (0xff != params.key[i])
            return -1;

    if (!equalArrays(params.token, this.data.token.uid))
        return -1;

    this.data.authorized = true;

    return 0;
}

exports.mifare_CmdRead = function(params) {
    if (false == this.data.authorized)
        return -1;

    if ((params.page < 0) || (params.page > 63))
        return -1;

    var page = this.data.token.pages[params.page];
    if (undefined == page)
        this.data.token.pages[params.page] = page = [];
    
    for (var i = page.length; i < 16; i++)
        page[i] = 0;

    return page;
}

exports.mifare_CmdWrite = function(params) {
    if (false == this.data.authorized)
        return -1;

    if (false == this.data.authorized)
        return -1;

    if ((params.page < 0) || (params.page > 63) || (params.data.length > 16))
        return -1;
    
    var page = params.data;
    for (var i = page.length; i < 16; i++)
        page[i] = 0;

    this.data.token.pages[params.page] = page;
    
    return 0;
}

/*
    parts simulator
*/

var NFCBehavior = function(column, data) {
	Behavior.call(this, column, data);
}
NFCBehavior.prototype = Object.create(Behavior.prototype, {
	onCreate: { value: function(column, data) {
        var list = new TokensList(data);
        for (var i = 0; i < TOKENS.length; i++)
            list.add(new NFCTokenButton({data: data, string: JSON.stringify(TOKENS[i].uid), value: TOKENS[i].uid}));
        column.partContentsContainer.add(list);
        column.distribute("onChanged");
	}},
});
var NFCTokenButton = Line.template(function($) { return {
	height:30, left: 30, active:true,
	behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
		onCreate: { value: function(container, $) {
			CONTROL.ButtonBehavior.prototype.onCreate.call(this, container, $.data);
			this.value = $.value;
		}},
		onChanged: { value: function(container) {
			container.first.variant = (this.data.value == this.value) ? THEME.RADIO_SELECTED : THEME.RADIO_UNSELECTED
		}},
		onTap: { value: function(container) {
			this.data.value = this.value;
            this.data.token = findToken(this.value);
            this.data.authorized = false;
			container.container.distribute("onChanged");
		}},
	}),
	contents: [
		Content($, { skin:THEME.glyphSkin }),
		Label($, { style:THEME.labeledButtonStyle, string:$.string }),
	]
}});

var TokensList = Column.template(function($) { return {
	left:0, right:0,
	contents: [
		Label($, { left:0, right:0, top:0, height:30, style:THEME.labeledButtonStyle, string:"NFC Tokens" }),
        NFCTokenButton({ data:$, string:"[ ] (no token)", value: -1 }, {  })
	],
}});

/*
    local functions
*/

function findToken(token)
{
    for (var i = 0; i < TOKENS.length; i++)
        if (equalArrays(token, TOKENS[i].uid))
            return TOKENS[i];

    return null;
}

function equalArrays(a, b)
{
    if (!Array.isArray(a) || !Array.isArray(b))
        return false;

    if (a.length != b.length)
        return false;

    for (var i = 0; i < a.length; i++)
        if (a[i] != b[i])
            return false;

    return true;
}
