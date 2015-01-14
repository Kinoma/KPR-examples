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

// https://github.com/sparkfun/ML8511_Breakout/blob/master/firmware/MP8511_Read_Example/MP8511_Read_Example.ino
// http://media.digikey.com/pdf/Application%20Notes/Rohm%20Application%20Notes/ML8511_UV.pdf

exports.pins = {
    uv: {type: "A2D", pin: 52},
    vref: {type: "A2D", pin: 54},
}

exports.configure = function(configuration) {
    this.uv.init();
    this.vref.init();
}

exports.close = function() {
    this.uv.close();
    this.vref.close();
}

exports.read = function() {
    var uv = this.uv.read();
    var vref = this.vref.read();

    var outputVoltage = 3.3 / vref * uv;
    var uvIntensity = mapfloat(outputVoltage, 0.99, 2.9, 0.0, 15.0);
    var uvi = Math.max(Math.round((outputVoltage * 12.49 - 14.3635), 0));

    return {intensity: uvIntensity, index: uvi};
}

function mapfloat(x, in_min, in_max, out_min, out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
