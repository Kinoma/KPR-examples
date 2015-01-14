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

// https://stuff.mit.edu/afs/sipb/contrib/linux/drivers/iio/light/vcnl4000.c
// http://dlnmh9ip6v2uc.cloudfront.net/datasheets/BreakoutBoards/VCNL4000_Example.pde

exports.pins = {
    data: {type: "I2C", address: 0x13}
}

var VCNL4000_COMMAND = 0x80;
var VCNL4000_PROD_REV = 0x81;
var VCNL4000_AL_RESULT_HI = 0x85;
var VCNL4000_PS_RESULT_HI = 0x87;

var AMBIENT_PARAMETER = 0x84;
var IR_CURRENT = 0x83;
var PROXIMITY_FREQ = 0x89;
var PROXIMITY_MOD = 0x8A;

var VCNL4000_AL_RDY = 0x40;
var VCNL4000_PS_RDY = 0x20;
var VCNL4000_AL_OD = 0x10;
var VCNL4000_PS_OD = 0x08;

exports.configure = function(configuration) {
    this.data.init();

    var id = this.data.readByteDataSMB(VCNL4000_PROD_REV);
    if (0x11 != id) {
        trace("bad device id. expected 0x11. got " + id + "\n");
        throw new Error(-1);
    }

    this.data.writeByteDataSMB(AMBIENT_PARAMETER, 0x0F);  // Single conversion mode, 128 averages
    this.data.writeByteDataSMB(IR_CURRENT, 20);  // Set IR current to 200mA
    this.data.writeByteDataSMB(PROXIMITY_FREQ, 3);  // 781.25 kHz
    this.data.writeByteDataSMB(PROXIMITY_MOD, 0x81);  // 129, recommended by Vishay
}

exports.close = function() {
    this.data.close();
}

exports.read = function() {
    return { ambient: readValue.call(this, VCNL4000_AL_OD, VCNL4000_AL_RDY, VCNL4000_AL_RESULT_HI),
             proximity: readValue.call(this, VCNL4000_PS_OD, VCNL4000_PS_RDY, VCNL4000_PS_RESULT_HI)}
}

function readValue(command, ready, register) {
    var value = this.data.readByteDataSMB(VCNL4000_COMMAND);
    this.data.writeByteDataSMB(VCNL4000_COMMAND, value | command);

    var count = 20;
    while (count--) {
        try {
            if (ready & this.data.readByteDataSMB(VCNL4000_COMMAND))
                break;
            sensorUtils.mdelay(20);
        }
        catch (e) {
        }
    }
    if (count < 0) {
        trace("can't get ready\n");
        return {};
    }

    var bytes = this.data.readBlockDataSMB(register, 2, "Array");
    return (bytes[0] << 8) | bytes[1];
}
