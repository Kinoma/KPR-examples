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

/*
    Tested against Adafruit PN532 breakout shield with Mifare Classic tokens.
    
    Based on libnfc and AdaFruit I2C sample
    
    Useful URLs
		http://www.nxp.com/documents/user_manual/141520.pdf
		https://github.com/adafruit/Adafruit-PN532/blob/master/Adafruit_PN532.cpp
		http://mifareclassicdetectiononandroid.blogspot.it
		http://www.nxp.com/documents/application_note/055020.pdf
*/


exports.pins = {
    data: {type: "I2C", address: 0x24}
}

var TRACE_COMMANDS = false;
var TRACE_ERRORS = false;
var DEBUG_COMMUNICATION = false;

var type;
var last_uid;
var sam_mode;

exports.configure = function(configuration) {
    initializeGlobalConstants();

    this.data.init();

    trace_comm = DEBUG_COMMUNICATION ? trace : nop;
    trace_cmd = TRACE_COMMANDS ? trace : nop;
    trace_err = TRACE_ERRORS ? trace : nop;

    trace_cmd("PN532 configure BEGIN\n");

    type = undefined;
    sam_mode = PSM_NORMAL;
    last_uid = undefined;

    if (!doCheckCommunication.call(this)) {
        trace_err("communication check failed\n");
        return;
    }

    doCheckFirmwareVersion.call(this);
    trace_cmd("Firmware type: " + type + "\n");

    doSetParameters.call(this, PARAM_AUTO_ATR_RES | PARAM_AUTO_RATS);

    doResetSettings.call(this);

    doSAMConfiguration.call(this, PSM_NORMAL);
    
    trace_cmd("PN532 configure END\n");
}

exports.close = function() {
    this.data.close();
}

exports.getCard = function() {
    var target = doInListPassiveTarget.call(this, PM_ISO14443A_106, 1);
    if (target)
        return {token: target.slice(6, 6 + target[5])};
    return {token: undefined};
}

exports.poll = function(params) {
    trace_cmd("PN532 Read BEGIN\n");
    var changed = false, uid, result;

    var target = doInListPassiveTarget.call(this, PM_ISO14443A_106, 1);
    if (target)
        uid = target.slice(6, 6 + target[5]);

    // if active device changed, return uid (or empty uid) to caller
    if (!last_uid && uid) {
        changed = true;
        result = {token: uid};
        last_uid = uid;
    }
    else if (last_uid && !uid) {
        changed = true;
        result = {token: undefined};
        last_uid = undefined;
    }
    else if (!last_uid && !uid)
        ;
    else {
        changed = last_uid.length != uid.length;
        for (var i = 0, length = uid.length; (i < length) && !changed; i++)
            changed = last_uid[i] != uid[i];

        if (changed) {
            result = {token: uid};
            last_uid = uid;
        }
    }

	if (params && ("command" in params) && changed && last_uid) {
		if ("token" in params.commandParams)
			params.commandParams.token = last_uid;
		result.commandData = this[params.command](params.commandParams);
	}

    trace_cmd("PN532 Read END, UID: " + last_uid + "\n");

    return result;
}

exports.mifare_CmdAuthA = function(params) {
    var result = doInDataExchange.call(this, 1, [MIFARE_CMD_AUTH_A, params.page].concat(params.key).concat(params.token), 1);
    trace_cmd("doInDataExchange MIFARE_CMD_AUTH_A: " + JSON.stringify(result) + "\n");

    return result ? result[0] : -1;
}

exports.mifare_CmdRead = function(params) {
	if (("key" in params) && ("token" in params)) {
		if (-1 == this.mifare_CmdAuthA(params))
			return -1;
	}

    var result = doInDataExchange.call(this, 1, [MIFARE_CMD_READ, params.page], 17);
    trace_cmd("doInDataExchange MIFARE_CMD_READ: " + JSON.stringify(result) + "\n");
    if (!result) return -1;
    if (0 != result[0]) return -1;

    return result.slice(1);
}

exports.mifare_CmdWrite = function(params) {
	if (("key" in params) && ("token" in params)) {
		if (-1 == this.mifare_CmdAuthA(params))
			return -1;
	}

    var result = doInDataExchange.call(this, 1, [MIFARE_CMD_WRITE, params.page].concat(params.data), 1);
    trace_cmd("doInDataExchange MIFARE_CMD_WRITE: " + JSON.stringify(result) + "\n");

    return result ? result[0] : -1;
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
	var data = new Array(16);

	for (var index = 0, count = pages.length; count > 0; count -= 16, page = snapToDataPage(page + 1)) {
		var i = 0;

		for (var length = (count > 16) ? 16 : count; i < length; i++, index++)
			data[i] = pages.charCodeAt(index);
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

function transceive(request, responseSize)
{
    trace_comm("transceive command " + request[0] + ", responseSize " + responseSize + "\n");

    if (send.call(this, request)) {
        var result = receive.call(this, responseSize, request[0]);

        //@@ retry support goes here @@

        trace_comm("transceive returns: " + JSON.stringify(result) + "\n");

        return result;
    }
}

function send(request)
{
    var frame = [0x00, 0x00, 0xff];        // the start of every good packet

    buildFrame.call(this, frame, request);

    trace_comm("writeBlock - start\n");
    this.data.writeBlock(frame);
    trace_comm("writeBlock - done\n");

    var readyFrame = waitReadyFrame.call(this, pn53x_ack_frame.length);
    if (!readyFrame) {
        trace_err("no readyFrame on transceive\n");
        return;
    }

    var ready = checkAckFrame.call(this, readyFrame);
    trace_comm("checkAckFrame says " + ready + "\n");
    return readyFrame;
}

function receive(responseSize, lastCommand)
{
	trace_comm("receive START, responseSize = " + responseSize + "\n");
//  var frame = waitReadyFrame.call(this, PN53x_EXTENDED_FRAME__DATA_MAX_LEN);        // if non-blocking i2c read
    var frame = waitReadyFrame.call(this, 5 + 2 + responseSize + 2);

    if (!frame || (0 == frame.length)) {
        trace_err("receive got no data\n");
        return;
    }

    if ((frame[0] != 0) || (frame[1] != 0) || (frame[2] != 0xff)) {
        trace_err("receive got bad preamble\n");
        return;
    }
    
    var TFI_idx, length;
    if ((1 == frame[3]) && (0x0ff == frame[4])) {
        trace_err("receive got application level errorCode " + frame[5] + "\n");
        return;
    }
    else if ((0xff == frame[3]) || (0xff == frame[4])) {
        //@@ extended frame
        trace_err("receive - unimplemented extended frame\n");
        
//@@        TFI_idx = ;
    }
    else {
        // normal frame
        length = frame[3];
        var checkSum = (frame[3] + frame[4]) & 0xff;
        if (0 != checkSum) {
            trace_err("receive - bad length checksum\n");
            return;
        }
        TFI_idx = 5;
    }
    
    var TFI = frame[TFI_idx];
    if (0xd5 != TFI) {
        trace_err("receive TFI mismatch\n");
        return;
    }
    
    if (frame[TFI_idx + 1] != (lastCommand + 1)) {
        trace_err("Command code verification failed\n");
        return;
    }

    var DCS = frame[TFI_idx + length];
    var btDCS = DCS;
    
    for (var i = 0; i < length; i++)
        btDCS += frame[TFI_idx + i];
    btDCS &= 0xff;

    if (0 != btDCS) {
        trace_err("Data checksum mismatch\n");
        return;
    }

    if (0 != frame[TFI_idx + length + 1]) {
        trace_err("Frame postamble mismatch\n");
        return;
    }

    trace_comm("receive STOP - slice remains\n");

    return frame.slice(TFI_idx + 2, TFI_idx + length);
}

function buildFrame(frame, request)
{
    var szData = request.length;

    if (szData < PN53x_NORMAL_FRAME__DATA_MAX_LEN) {
        frame[3] = szData + 1;
        frame[4] = 256 - (szData + 1);
        frame[5] = 0xD4;
        for (var i = 0; i < szData; i++)
            frame[i + 6] = request[i];
        
        var btDCS = 256 - 0xD4;
        for (var szPos = 0; szPos < szData; szPos++)
            btDCS -= request[szPos];
        frame[szData + 6] = btDCS & 0xFF;
        frame[szData + 7] = 0;
        frame.length = szData + PN53x_NORMAL_FRAME__OVERHEAD;
        
        trace_comm("built frame " + JSON.stringify(frame) + "\n");
    }
    else {
        trace("@@ ADD SUPPORT FOR GIANT FRAME IN BUILDFRAME\n");
        // frame.length = ;
    }
}

function waitReadyFrame(responseSize)
{
    var stop = Date.now() + 100;       /// @@ timeout = 100 ms - perhaps allow client to configure based on responsiveness needed
    trace_comm("waitReady start, responseSize " + responseSize + "\n");

    do {
        trace_comm("waitReady readBlock start\n");
        var result = this.data.readBlock(responseSize + 1, 1);     // result is Array
        trace_comm("waitReady readBlock stop\n");
        if (result && result.length) {
            if (1 & result[0]) {
                result.shift();      // remove first value
                trace_comm("waitReady stop " + JSON.stringify(result) + "\n");
                return result;
            }
        }
    } while (Date.now() < stop)

    trace_comm("waitReady stop - timed out\n");
    return;
}

function checkAckFrame(frame)
{
    if (pn53x_ack_frame.length != frame.length) {
        trace_err("checkAckFrame - bad frame length: " + frame.length + "\n");
        return false;
    }

    for (var i = 0, length = frame.length; i < length; i++) {
        if (frame[i] != pn53x_ack_frame[i]) {
            trace_err("checkAckFrame - error frame\n");
            return false;
        }
    }

    return true;
}

function doCheckCommunication()
{
    trace_cmd("doCheckCommunication\n");

    var response = transceive.call(this, elementsToNumbers([Diagnose, 0x00, 'K', 'i', 'n', 'o', 'm', 'a']), 7);
    var expected = elementsToNumbers([0x00, 'K', 'i', 'n', 'o', 'm', 'a']);

    if (expected.length != response.length) {
        trace_err("doCheckCommunication bad response.length " + response.length + "\n");
        return false;
    }

    for (var i = 0, length = response.length; i < length; i++) {
        if (response[i] != expected[i]) {
            trace_err("doCheckCommunication FAILED\n");
            return false;
        }
    }


    return true;
}

function doCheckFirmwareVersion()
{
    trace_cmd("doCheckFirmware\n");
    var fwVersion = transceive.call(this, [GetFirmwareVersion], 4);
    
    if (2 == fwVersion.length)
        type = "PN531";
    else if (4 == fwVersion.length) {
        if (0x32 == fwVersion[0])
            type = "PN532";
        else if (0x33 == fwVersion[0]) {
            if (1 == fwVersion[1])
                type = "RCS360";
            else
                type = "PN533";
        }
    }
    
    return type;
}

function doSetParameters(value)
{
    trace_cmd("doSetParameters value " + value + "\n");
    transceive.call(this, [SetParameters, value], 0);
}

function doResetSettings()
{
    trace_cmd("doReset Settings\n");
    doModifyRegister.call(this, PN53X_REG_CIU_BitFraming, SYMBOL_TX_LAST_BITS, 0);
    doSetPropertyBool.call(this, NP_HANDLE_CRC, true);
    doSetPropertyBool.call(this, NP_HANDLE_PARITY, true);
    doSetPropertyBool.call(this, NP_ACTIVATE_CRYPTO1, true);
}

function doReadRegister(address)
{
    trace_cmd("ReadRegister " + address.toString(16) + "\n");

    var result = transceive.call(this, [ReadRegister, address >> 8, address & 0xff], 2);
    var value = ("PN533" == type) ? result[1] : result[0];
    
    trace_cmd("    ReadRegister " + address.toString(16) + ", returned " + value.toString(16) + "\n");

    return value;
}

function doWriteRegister(address, value)
{
    trace_cmd("doWriteRegister address " + address.toString(16) + ", value " + value.toString(16) + "\n");
    transceive.call(this, [WriteRegister, address >> 8, address & 0xff, value], 0);
}

function doModifyRegister(address, mask, value)
{
    trace_cmd("doModifyRegister address " + address.toString(16) + ", mask " + mask.toString(16) + " value " + value.toString(16) + "\n");
    if (0xff == mask)
        doWriteRegister.call(this, address, value);
    else {
        var current = doReadRegister.call(this, address);
        var next = (value & mask) | (current & ~mask);
        if (next != current)
            doWriteRegister.call(this, address, next);
    }
}

function doSetPropertyBool(property, enable)
{
    trace_cmd("doSetPropertyBool property " + property + ", enable " + enable + "\n");
    switch (property) {
        case NP_HANDLE_CRC:
            doModifyRegister.call(this, PN53X_REG_CIU_TxMode, SYMBOL_TX_CRC_ENABLE, enable ? 0x80 : 0x00);
            doModifyRegister.call(this, PN53X_REG_CIU_RxMode, SYMBOL_RX_CRC_ENABLE, enable ? 0x80 : 0x00);
            break;
        case NP_HANDLE_PARITY:
            doModifyRegister.call(this, PN53X_REG_CIU_ManualRCV, SYMBOL_PARITY_DISABLE, enable ? 0x00 : SYMBOL_PARITY_DISABLE);
            break;
        case NP_ACTIVATE_CRYPTO1:
            doModifyRegister.call(this, PN53X_REG_CIU_Status2, SYMBOL_MF_CRYPTO1_ON, enable ? SYMBOL_MF_CRYPTO1_ON : 0x00);
            break;
        default:
            trace("UNHANDLED doSetPropertyBool " + property + "\n");
            break;
    }
}

function doSAMConfiguration(mode)
{
    trace_cmd("doSAMConfiguration mode " + mode + "\n");

    if ("PN532" != type) {
        trace_err("  doSAMConfiguration - not supported by chip " + type + "\n");
        return;
    }

    var request;
    if ((PSM_NORMAL == mode) || (PSM_WIRED_CARD == mode))
        transceive.call(this, [SAMConfiguration, mode], 0);		// SAM is not used in PSM_NORMAL mode
    else if ((PSM_VIRTUAL_CARD == mode) || (PSM_DUAL_CARD == mode))
        transceive.call(this, [SAMConfiguration, mode, 0], 0);
    else {
        trace_err("  doSAMConfiguration - bad mode " + mode + "\n");
        return;
    }

    sam_mode = mode;
}

function doInListPassiveTarget(modulation, maxTargets)
{
    trace_cmd("doInListPassiveTarget modulation " + modulation + ", maxTargets " + maxTargets + "\n");
    //@@ libnfc validates modulation here against type

    return transceive.call(this, [InListPassiveTarget, maxTargets, modulation], 10);        //@@ not so confident in this 10
}

function doInDataExchange(target, data, responseSize)
{
    trace_cmd("doInDataExchange target " + target + ", data " + JSON.stringify(data) + "\n");

    return transceive.call(this, [InDataExchange, target].concat(data), responseSize);
}




function elementsToNumbers(arr)
{
    for (var i = 0, length = arr.length; i < length; i++) {
        switch (typeof arr[i]) {
            case "string":
                arr[i] = (1 == arr[i].length) ? arr[i].charCodeAt(0) : Number(arr[i]);
                break;
            default:
                break;
        }
    }
    
    return arr;
}

function nop()
{
}

function initializeGlobalConstants()
{
    PN53x_EXTENDED_FRAME__DATA_MAX_LEN = 264;
    PN53x_EXTENDED_FRAME__OVERHEAD = 11;
    PN53x_NORMAL_FRAME__OVERHEAD = 8;
    PN53x_NORMAL_FRAME__DATA_MAX_LEN = 254;

    PN532_BUFFER_LEN = PN53x_EXTENDED_FRAME__DATA_MAX_LEN + PN53x_EXTENDED_FRAME__OVERHEAD;

    pn53x_ack_frame = [0x00, 0x00, 0xff, 0x00, 0xff, 0x00];

    Diagnose = 0x00;
    GetFirmwareVersion = 0x02;
    ReadRegister = 0x06;
    WriteRegister = 0x08;
    SetParameters = 0x12;
    SAMConfiguration = 0x14;

    InDataExchange = 0x40;
    InListPassiveTarget = 0x4A;

    SYMBOL_START_SEND = 0x80;
    SYMBOL_RX_ALIGN = 0x70;
    SYMBOL_TX_LAST_BITS = 0x07;

    SYMBOL_TX_CRC_ENABLE = 0x80;
    SYMBOL_TX_SPEED = 0x70;
    SYMBOL_TX_FRAMING = 0x03;

    SYMBOL_RX_CRC_ENABLE = 0x80;
    SYMBOL_RX_SPEED = 0x70;

    SYMBOL_PARITY_DISABLE = 0x10;

    SYMBOL_MF_CRYPTO1_ON = 0x08;

    PSM_NORMAL = 0x01;
    PSM_VIRTUAL_CARD = 0x02;
    PSM_WIRED_CARD = 0x03;
    PSM_DUAL_CARD = 0x04;

    PARAM_NONE = 0x00;
    PARAM_NAD_USED = 0x01;
    PARAM_DID_USED = 0x02;
    PARAM_AUTO_ATR_RES = 0x04;
    PARAM_AUTO_RATS = 0x10;
    PARAM_14443_4_PICC = 0x20;
    PARAM_NFC_SECURE = 0x20;
    PARAM_NO_AMBLE = 0x40;

// Register addresses
    PN53X_REG_Control_switch_rng = 0x6106;
    PN53X_REG_CIU_Mode = 0x6301;
    PN53X_REG_CIU_TxMode = 0x6302;
    PN53X_REG_CIU_RxMode = 0x6303;
    PN53X_REG_CIU_TxControl = 0x6304;
    PN53X_REG_CIU_TxAuto = 0x6305;
    PN53X_REG_CIU_TxSel = 0x6306;
    PN53X_REG_CIU_RxSel = 0x6307;
    PN53X_REG_CIU_RxThreshold = 0x6308;
    PN53X_REG_CIU_Demod = 0x6309;
    PN53X_REG_CIU_FelNFC1 = 0x630A;
    PN53X_REG_CIU_FelNFC2 = 0x630B;
    PN53X_REG_CIU_MifNFC = 0x630C;
    PN53X_REG_CIU_ManualRCV = 0x630D;
    PN53X_REG_CIU_TypeB = 0x630E;
//     PN53X_REG_- = 0x630F;
//     PN53X_REG_- = 0x6310;
    PN53X_REG_CIU_CRCResultMSB = 0x6311;
    PN53X_REG_CIU_CRCResultLSB = 0x6312;
    PN53X_REG_CIU_GsNOFF = 0x6313;
    PN53X_REG_CIU_ModWidth = 0x6314;
    PN53X_REG_CIU_TxBitPhase = 0x6315;
    PN53X_REG_CIU_RFCfg = 0x6316;
    PN53X_REG_CIU_GsNOn = 0x6317;
    PN53X_REG_CIU_CWGsP = 0x6318;
    PN53X_REG_CIU_ModGsP = 0x6319;
    PN53X_REG_CIU_TMode = 0x631A;
    PN53X_REG_CIU_TPrescaler = 0x631B;
    PN53X_REG_CIU_TReloadVal_hi = 0x631C;
    PN53X_REG_CIU_TReloadVal_lo = 0x631D;
    PN53X_REG_CIU_TCounterVal_hi = 0x631E;
    PN53X_REG_CIU_TCounterVal_lo = 0x631F;
//     PN53X_REG_- = 0x6320
    PN53X_REG_CIU_TestSel1 = 0x6321;
    PN53X_REG_CIU_TestSel2 = 0x6322;
    PN53X_REG_CIU_TestPinEn = 0x6323;
    PN53X_REG_CIU_TestPinValue = 0x6324;
    PN53X_REG_CIU_TestBus = 0x6325;
    PN53X_REG_CIU_AutoTest = 0x6326;
    PN53X_REG_CIU_Version = 0x6327;
    PN53X_REG_CIU_AnalogTest = 0x6328;
    PN53X_REG_CIU_TestDAC1 = 0x6329;
    PN53X_REG_CIU_TestDAC2 = 0x632A;
    PN53X_REG_CIU_TestADC = 0x632B;
//     PN53X_REG_- = 0x632C;
//     PN53X_REG_- = 0x632D;
//     PN53X_REG_- = 0x632E;
    PN53X_REG_CIU_RFlevelDet = 0x632F;
    PN53X_REG_CIU_SIC_CLK_en = 0x6330;
    PN53X_REG_CIU_Command = 0x6331;
    PN53X_REG_CIU_CommIEn = 0x6332;
    PN53X_REG_CIU_DivIEn = 0x6333;
    PN53X_REG_CIU_CommIrq = 0x6334;
    PN53X_REG_CIU_DivIrq = 0x6335;
    PN53X_REG_CIU_Error = 0x6336;
    PN53X_REG_CIU_Status1 = 0x6337;
    PN53X_REG_CIU_Status2 = 0x6338;
    PN53X_REG_CIU_FIFOData = 0x6339;
    PN53X_REG_CIU_FIFOLevel = 0x633A;
    PN53X_REG_CIU_WaterLevel = 0x633B;
    PN53X_REG_CIU_Control = 0x633C;
    PN53X_REG_CIU_BitFraming = 0x633D;
    PN53X_REG_CIU_Coll = 0x633E;

    PN53X_CACHE_REGISTER_MIN_ADDRESS = PN53X_REG_CIU_Mode;
    PN53X_CACHE_REGISTER_MAX_ADDRESS = PN53X_REG_CIU_Coll;
    PN53X_CACHE_REGISTER_SIZE = (PN53X_CACHE_REGISTER_MAX_ADDRESS - PN53X_CACHE_REGISTER_MIN_ADDRESS) + 1;

    NP_TIMEOUT_COMMAND = 1;
    NP_TIMEOUT_ATR = 2;
    NP_TIMEOUT_COM = 3;
    NP_HANDLE_CRC = 4;
    NP_HANDLE_PARITY = 5;
    NP_ACTIVATE_FIELD = 6;
    NP_ACTIVATE_CRYPTO1 = 7;
    NP_INFINITE_SELECT = 8;
    NP_ACCEPT_INVALID_FRAMES = 9;
    NP_ACCEPT_MULTIPLE_FRAMES = 10;
    NP_AUTO_ISO14443_4 = 11;
    NP_EASY_FRAMING = 12;
    NP_FORCE_ISO14443_A = 13;
    NP_FORCE_ISO14443_B = 14;
    NP_FORCE_SPEED_106 = 15;

    PM_UNDEFINED = -1;
    PM_ISO14443A_106 = 0x00;
    PM_FELICA_212 = 0x01;
    PM_FELICA_424 = 0x02;
    PM_ISO14443B_106 = 0x03;
    PM_JEWEL_106 = 0x04;
    PM_ISO14443B_212 = 0x06;
    PM_ISO14443B_424 = 0x07;
    PM_ISO14443B_847 = 0x08;

    MIFARE_CMD_AUTH_A = 0x60;
    MIFARE_CMD_AUTH_B = 0x61;
    MIFARE_CMD_READ = 0x30;
    MIFARE_CMD_WRITE = 0xA0;
    MIFARE_CMD_TRANSFER = 0xB0;
    MIFARE_CMD_DECREMENT = 0xC0;
    MIFARE_CMD_INCREMENT = 0xC1;
    MIFARE_CMD_STORE = 0xC2;;
}
