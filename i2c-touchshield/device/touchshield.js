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

exports.pins = {
    data: {type: "I2C", address: 0x5A, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9']}
}

var MHD_RISING = 0x2B;
var NHD_AMOUNT_RISING = 0x2C;
var NCL_RRISING = 0x2D;
var FDL_RISING = 0x2E;

var MHD_FALLING = 0x2F;
var NHD_AMOUNT_FALLING = 0x30;
var NCL_RFALLING = 0x31;
var FDL_FALLING = 0x32;

var ELE0_Touch_Threshold = 0x41;
var ELE11_Touch_Threshold = 0x57;

var Filter_Configuration = 0x5D;
var Electrode_Configuration = 0x5E;

var TOU_THRESH = 0x0F;
var REL_THRESH = 0x0A;

var MAP = [9, 6, 3, 8, 5, 2, 7, 4, 1];
var KEYS;

exports.configure = function(configuration) {
    this.data.init();

    this.data.writeByteDataSMB(0x80, 0x63);     // soft reset
    sensorUtils.mdelay(100);

    var keys = configuration.pins.data.keys;
    if (9 != keys.length) throw new Exception("keys.length must be 9");
    KEYS = new Array(9);
    for (var i = 0; i < 9; i++)
        KEYS[i] = keys[MAP[i] - 1];

    // Section A
    // This group controls filtering when data is > baseline.
    this.data.writeByteDataSMB(MHD_RISING, 0x01);
    this.data.writeByteDataSMB(NHD_AMOUNT_RISING, 0x01);
    this.data.writeByteDataSMB(NCL_RRISING, 0);
    this.data.writeByteDataSMB(FDL_RISING, 0);

    // Section B
    // This group controls filtering when data is < baseline.
    this.data.writeByteDataSMB(MHD_FALLING, 0x01);
    this.data.writeByteDataSMB(NHD_AMOUNT_FALLING, 0x01);
    this.data.writeByteDataSMB(NCL_RFALLING, 0xFF);
    this.data.writeByteDataSMB(FDL_FALLING, 0x02);

    // Section C
    // This group sets touch and release thresholds for each electrode
    for (var i = ELE0_Touch_Threshold; i <= ELE11_Touch_Threshold; i+= 2) {
        this.data.writeByteDataSMB(i, TOU_THRESH);
        this.data.writeByteDataSMB(i + 1, REL_THRESH);
    }

    // Section D
    // Set the Filter Configuration
    // Set ESI2
    this.data.writeByteDataSMB(Filter_Configuration, 0x04);

    // Section E
    // Electrode Configuration
    // Must be written last
    // Enable 6 Electrodes and set to run mode
    this.data.writeByteDataSMB(Electrode_Configuration, 0x0C); // Enables all 12 Electrodes
    
    this.last = undefined;
}

exports.close = function() {
    this.data.close();
}

exports.read = function() {
    var value = (this.data.readByteDataSMB(1) << 8) | this.data.readByteDataSMB(0);
    if (value === this.last)
        return;

    var mask = value ^ this.last;
    this.last = value;
    var result = {up: [], down: []};

    for (var i = 0, bit = 1; i < 9; i++, bit <<= 1) {
        if (mask & bit) {
            if (value & bit)
                result.down.push(KEYS[i]);
            else
                result.up.push(KEYS[i]);
        }
    }

    return result;
}
