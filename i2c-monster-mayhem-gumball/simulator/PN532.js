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
var TOKENS = [  {uid: [99,84,25,153], label: "0 Tries", pages: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[83,116,114,2,123,34,105,100,34,58,48,44,34,116,114,105],[101,115,34,58,48,125,0,0,0,0,0,0,0,0,0,0]]},
				{uid: [100,84,25,153], label: "1 Tries", pages: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[83,116,114,2,123,34,105,100,34,58,48,44,34,116,114,105],[101,115,34,58,49,125,0,0,0,0,0,0,0,0,0,0]]},
                {uid: [115,227,24,153], label: "2 Tries", pages: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[83,116,114,2,123,34,105,100,34,58,48,44,34,116,114,105],[101,115,34,58,50,125,0,0,0,0,0,0,0,0,0,0]]},
                {uid: [227,104,22,208], label: "3 Tries", pages: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,[83,116,114,2,123,34,105,100,34,58,48,44,34,116,114,105],[101,115,34,58,51,125,0,0,0,0,0,0,0,0,0,0]]}]

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
		value: undefined,
		last: undefined,
		authorized: false
	};
	this.container = shell.delegate("addSimulatorPart", this.data);
}

exports.close = function() {
	shell.delegate("removeSimulatorPart", this.container);
}

exports.poll = function(params) {
    var data = this.data;
    
    if (data.last == data.value) return;
    data.last = data.value;
	//trace(JSON.stringify(this)+"\n")
	var result = {token: data.value};
	if (params && ("command" in params) && data.value) {
		if ("token" in params.commandParams)
			params.commandParams.token = data.value;
		result.commandData = this[params.command](params.commandParams);
	}
    return result;
}

exports.getCard = function() {
	return {token: this.data.value};
}

exports.mifare_ReadString = function(params) {
	var data = "";
	var page = snapToDataPage(params.page);

	var sector = Math.floor(page / 4);
	var result = this.mifare_CmdRead({page: page, key: params.key, token: params.token});
	if (result < 0) return result;
	if (('S' != String.fromCharCode(result[0])) || ('t' != String.fromCharCode(result[1])) || ('r' != String.fromCharCode(result[2])))
		return "";	 
	var pages = result[3];
	for (var i = 4; i < 16; i++) {
		if (!result[i]) return data;
		data += String.fromCharCode(result[i]);
	}
	
	for (pages--; pages > 0; pages--) {
		page = snapToDataPage(page + 1);
		var thisSector = Math.floor(page / 4);
		if (thisSector != sector) {
			sector = thisSector;
			result = this.mifare_CmdRead({page: page, key: params.key, token: params.token});
		}
		else
			result = this.mifare_CmdRead({page: page});
		if (result < 0) return result;

		for (var i = 0; i < 16; i++) {
			if (!result[i]) break;
			data += String.fromCharCode(result[i]);
		}
	}
	return data;
}

exports.mifare_WriteString = function(params) {
 
	var pages = "Str" + String.fromCharCode(Math.ceil((3 + 1 + params.data.length) / 16)) + params.data;	// 4 byte header - "Str" and page count
	var page = snapToDataPage(params.page);
	for (var index = 0, count = pages.length; count > 0; count -= 16, page = snapToDataPage(page + 1)) {
		//since the store for this is in memory rather than being written to physical hardware, the pages array has a shallow reference to the data variable
		//before, when it was outside the loop, the new iterations would write to the old pages because they all pointed to the same array within the pages array...
		//i am so done
		var data = new Array(16);
		var i = 0;
		for (var length = (count > 16) ? 16 : count; i < length; i++, index++) {
			data[i] = pages.charCodeAt(index);
		}
		for (; i < 16; i++)
			data[i] = 0;
		var result = this.mifare_CmdWrite({data: data, page: page, key: params.key, token: params.token});
		if (result < 0)
			return result;
	}

	return 0;
}

function snapToDataPage(page)
{
	return (3 == (page % 4)) ? page + 1 : page;	// skip over the authentication page at end of sector
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
	if (("key" in params) && ("token" in params)) {
		if (-1 == this.mifare_CmdAuthA(params))
			return -1;
	}
    if (false == this.data.authorized)
        return -1;

    if ((params.page < 0) || (params.page > 63))
        return -1;
    var page = (params.page < this.data.token.pages.length) ? this.data.token.pages[params.page] : undefined;
    if (undefined == page)
        this.data.token.pages[params.page] = page = [];
    
    for (var i = page.length; i < 16; i++)
        page[i] = 0;
	
    return page;
}

exports.mifare_CmdWrite = function(params) {
	if (("key" in params) && ("token" in params)) {
		if (-1 == this.mifare_CmdAuthA(params))
			return -1;
	}

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
            list.add(new NFCTokenButton({data: data, string: TOKENS[i].label, value: TOKENS[i].uid}));
        column.partContentsContainer.add(list);
        column.distribute("onChanged");
	}},
});
var NFCTokenButton = Line.template(function($) { return {
	height:30, left: 30, active:true,
	behavior: Object.create(CONTROL.ButtonBehavior.prototype, {
		onCreate: { value: function(container, $) {
			CONTROL.ButtonBehavior.prototype.onCreate.call(this, container, $.data);
			//trace(JSON.stringify(this)+"\n")
			this.value = $.value;
			//trace(JSON.stringify(this)+"\n")
		}},
		onChanged: { value: function(container) {
			container.first.variant = (this.data.value == this.value) ? THEME.RADIO_SELECTED : THEME.RADIO_UNSELECTED
		}},
		onTap: { value: function(container) {
		//	trace(JSON.stringify(this))
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
        NFCTokenButton({ data:$, string:"[ ] (no token)", value: undefined }, {  })
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
