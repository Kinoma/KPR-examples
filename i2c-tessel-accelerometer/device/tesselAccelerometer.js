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

// based on tessel/accel-mma84/index.js - https://github.com/tessel/accel-mma84/

var OUT_X_MSB = 0x01;
var XYZ_DATA_CFG = 0x0E;
var WHO_AM_I = 0x0D;
var CTRL_REG1 = 0x2A;

var outputRates = [800, 400, 200, 100, 50, 12.5, 6.25, 1.56];

exports.pins = {
    accelerometer: {type: "I2C", address: 0x1D, outputRate: 12.5, scaleRange: 2}
}

exports.configure = function(configuration) {
    this.accelerometer.init();

    // confirm this is the expected device
    var id = this.accelerometer.readByteDataSMB(WHO_AM_I);
    if (0x2A != id) {
        trace("Expected ID 0x2A, got " + id + "\n");
        throw new Error(-1);
    }

    // initialize scale
    this.scaleRange = configuration.pins.accelerometer.scaleRange;
    changeRegister.call(this, XYZ_DATA_CFG, Math.max(this.scaleRange, 8) >> 2);

    // initialize output rate
    this.outputRate = getClosestOutputRate(configuration.pins.accelerometer.outputRate);
    var bin = outputRates.indexOf(this.outputRate);
    if (bin < 0) {
        trace("bad outputRate\n");
        throw new Error(-1);
    }
    var mode = this.accelerometer.readByteDataSMB(CTRL_REG1);
    this.accelerometer.writeByteDataSMB(CTRL_REG1, (mode & 199) | (bin << 3));
}

exports.close = function() {
    this.accelerometer.close();
}

exports.read = function() {
    var data = this.accelerometer.readBlockDataSMB(OUT_X_MSB, 6, "Array");
    return {
        x: convertAxis.call(this, data[0], data[1]),
        y: convertAxis.call(this, data[2], data[3]),
        z: convertAxis.call(this, data[4], data[5])
    }
}

function changeRegister(register, value)
{
    var mode = this.accelerometer.readByteDataSMB(CTRL_REG1);
    this.accelerometer.writeByteDataSMB(CTRL_REG1, mode & ~1);

    this.accelerometer.writeByteDataSMB(register, value);

    this.accelerometer.writeByteDataSMB(CTRL_REG1, mode | 1);
}

function getClosestOutputRate(requestedRate)
{
    // If a negative number is requested, stop output (0 hz)
    // If 0 hz is requested, return just that so that output will be stopped
    if (requestedRate <= 0)
        return 0;

    // Iterate through available rates
    for (var i = 0; i < outputRates.length; i++) {
        // The first available rate less than or equal to requested is a match
        if (outputRates[i] <= requestedRate)
            return outputRates[i];
    }

    return outputRates[outputRates.length - 1];
}

function convertAxis(msb, lsb)
{
    var count = ((msb << 8) | lsb) >> 4;

    // If the number is negative, we have to make it so manually (no 12-bit data type)
    if (msb > 0x7F)
      count = -(1 + 0xFFF - count); // Transform into negative 2's complement

    return count / ((1 << 12) / (2 * this.scaleRange));
}
