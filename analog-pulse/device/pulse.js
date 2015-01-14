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
    sensor: {type: "A2D"}
}

var rate, sampleCounter, lastBeatTime, P, T, thresh, amp, Beats, IBI, Pulse;

exports.configure = function(configuration) {
    this.sensor.init();

    rate = new Array(10);       // array to hold last ten IBI values

    reset();
}

exports.close = function() {
    this.sensor.close();
}

exports.beat = function() {
    var Signal = this.sensor.read() * 1024;         // read the Pulse Sensor

    sampleCounter = Date.now();                     // keep track of the time in mS with this variable
    var N = sampleCounter - lastBeatTime;           // monitor the time since the last beat to avoid noise

    //  find the peak and trough of the pulse wave
    if ((Signal < thresh) && (N > (IBI / 5) * 3)) { // avoid dichrotic noise by waiting 3/5 of last IBI
        if (Signal < T)                             // T is the trough
            T = Signal;                             // keep track of lowest point in pulse wave
    }

    if ((Signal > thresh) && (Signal > P))          // thresh condition helps avoid noise
        P = Signal;                                 // P is the peak, keep track of highest point in pulse wave

    // NOW IT'S TIME TO LOOK FOR THE HEART BEAT
    // signal surges up in value every time there is a pulse
    if (N > 250) {                                  // avoid high frequency noise
        if ((Signal > thresh) && !Pulse && (N > (IBI / 5) * 3)) {
            Beats++;                                // count another beat
            Pulse = true;                           // set the Pulse flag when we think there is a pulse
            IBI = N;                                // time between beats in mS
            lastBeatTime = sampleCounter;           // keep track of time for next pulse

            if (1 == Beats)
                return;                             // IBI value is unreliable so discard it

            // total the stored IBI values
            var runningTotal = IBI;                  // initialize the runningTotal variable

            if (Beats >= 12) {
                for (var i = 0; i < 9; i++) {        // shift data in the rate array
                    rate[i] = rate[i + 1];           // and drop the oldest IBI value
                    runningTotal += rate[i];         // add up the stored IBI values
                }
                rate[9] = IBI;                       // add the latest IBI to the rate array
                runningTotal /= 10;                  // average the stored IBI values
            }
            else {
                for (var i = 0; i < Beats - 3; i++)
                    runningTotal += rate[i];         // add up the stored IBI values
                rate[Beats - 2] = IBI;               // add the latest IBI to the rate array
                runningTotal /= (Beats - 1);         // average the stored IBI values
            }

            var BPM = 60000 / runningTotal;         // how many beats can fit into a minute? that's BPM!
            return {BPM: BPM, IBI: IBI};
        }
    }

    if ((Signal < thresh) && Pulse) {               // when the values are going down, the beat is over
        Pulse = false;                              // reset the Pulse flag so we can do it again
        amp = P - T;                                // get amplitude of the pulse wave
        thresh = amp / 2 + T;                       // set thresh at 50% of the amplitude
        P = thresh;                                 // reset these for next time
        T = thresh;
    }

    if (N > 2500) {                                 // if 2.5 seconds go by without a beat
        reset();
        thresh = 512;                               // set thresh default
        P = 512;                                    // set P default
        T = 512;                                    // set T default
        lastBeatTime = sampleCounter;               // bring the lastBeatTime up to date
        Beats = 0;                                  // reset to avoid noise, when we get the heartbeat back
        Pulse = false;
        return {BPM: 0};                            // lost signal
    }
}


function reset()
{
    sampleCounter = Date.now();  // used to determine pulse timing
    lastBeatTime = sampleCounter;           // used to find IBI
    P = 512;                    // used to find peak in pulse wave, seeded
    T = 512;                    // used to find trough in pulse wave, seeded
    thresh = 525;               // used to find instant moment of heart beat, seeded
    amp = 100;                  // used to hold amplitude of pulse waveform, seeded
    Beats = 0;                  // beat counter
    IBI = 600;                  // holds the time between beats, must be seeded!
    Pulse = false;
}
