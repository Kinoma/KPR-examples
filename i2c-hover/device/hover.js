//@module
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

// This BLL requires Kinoma Software version 6.1.337.1 or later.
// Use the Settings app on Kinoma Create to update.

exports.pins = {
    ts: {type: "Digital", direction: "input"},
    reset: {type: "Digital", direction: "output"},
    data: {type: "I2C", address: 0x42},
}

// default mapping of values to directions
var tb = 1, tl = 2, tt = 4, tr = 8, tc = 16, sr = 2, sl = 3, su = 4, sd = 5;

exports.configure = function(configuration) {
    this.tsPin = configuration.pins.ts.pin;
    // assume front-panel connections means board is upside down, so invert direction mapping
    if(this.tsPin ==59 | this.tsPin ==60) {
		tb = 4, tl = 8, tt = 1, tr = 2, tc = 16, sr = 3, sl = 2, su = 5, sd = 4;
	}
		
    this.ts.init();
    this.reset.init();
    this.data.init();

    this.reset.write(0);
    this.reset.direction = "input";

    sensorUtils.delay(1);

    this.data.readBlockDataSMB(0, 1, "Array");        // read to verify device present
}

exports.close = function() {
    this.ts.close();
    this.reset.close();
    this.data.close();
}

exports.read = function() {
    var result;

    if (this.ts.read())
        return;

    try {
        this.ts.direction = "output";
        this.ts.write(0);

        var busData = this.data.readBlockDataSMB(0, 18, "Array");

        var gestureEvent = busData[9];
        if (gestureEvent > 1) {
            switch (gestureEvent) {
                case  sr: result = "swipe to right"; break;
                case  sl: result = "swipe to left"; break;
                case  su: result = "swipe up"; break;
                case  sd: result = "swipe down"; break;
                default: result = "mystery swipe 0x" + gestureEvent.toString(16); break;
            }
            trace(result + "\n");
        }

        var touchEvent = ((busData[13] & 0xE0) >>> 5) | ((busData[14] & 0x03) << 3);
        if (touchEvent > 0) {
            switch (touchEvent) {
                case tb: result = "touch bottom"; break;
                case tl: result = "touch left"; break;
                case tt: result = "touch top"; break;
                case tr: result = "touch right"; break;
                case tc: result = "touch center"; break;
                default: result = "mystery touch 0x" + busData[13].toString(16) + ", 0x" + busData[14].toString(16); break;
            }
            trace(result + "\n");
        }
    }
    catch (e) {
        result = "error";
    }
    finally {
        this.ts.write(1);
        this.ts.direction = "input";
    }

    return result;
}
