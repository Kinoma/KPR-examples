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

// Defines new default speaker w/ settings
exports.pins = {
    speaker: {type: "Audio", sampleRate: 8000, channels: 1, frequencies: [], amplitude: 16384, realTime: true, direction: "output"}
}

// Configure function
exports.configure = function(config) {
    this.samplesPerRender = 185; // This is the value best supported by the hardware
    this.sampleRate = config.pins.speaker.sampleRate;// can range 4~8k
    this.amplitude = config.pins.speaker.amplitude;// can be reset using the setAmplitude function
    this.chunk = new Chunk(this.samplesPerRender * 2);// data storage to send to the speaker
    this.samples = new Int16Array(this.chunk, 0, this.samplesPerRender);
    this.k = 2 * Math.PI / this.sampleRate;// constant that simplifies sound wave function later
    this.speaker.init();// calls the initialize speaker function through HPS
    this.setFrequencies(config.pins.speaker.frequencies);// initialize Frequencies to zero
}

// Close speaker
exports.close = function() {
    this.speaker.close();
}

// Start speaker
exports.start = function() {
    this.time = 0; 
    this.speaker.start();
}

// Stop speaker
exports.stop = function() {
    this.speaker.stop();
}

// Sets frequencies using renderAudio
exports.setFrequencies = function(frequencies) {
    this.frequencies = frequencies;
    for (var i = 0, k = this.k; i < frequencies.length; i++)
        frequencies[i] *= k;
    this.renderAudio = voices[frequencies.length];
}

// Sets a sequence of frequencies to be called in set order, in set sample length. NOT USED in this sample program.
exports.setSequence = function(sequence) {
    this.sequences = sequence.sequence;
    this.sequenceIndex = 0;
    for (var i = 0, sequences = this.sequences, length = sequences.length; i < length; i++)
        sequences[i].seed = 0;
    this.repeat = ("repeat" in sequence) ? sequence.repeat : 1;
    this.seed = 1;
    this.time = 0;
    this.renderAudio = synthesizeSequence;
}

// Sets amplitude
exports.setAmplitude = function(amplitude) {
    this.amplitude = amplitude; 
}

// Sets renderAudio to play nothing (synthesize 0 function)
exports.silence = function() {
    this.frequencies.length = 0; 
    this.renderAudio = synthesize0; 
}

// Call renderAudio, then write data to speaker
exports.synthesize = function()
{
    this.renderAudio(0, this.samplesPerRender, this.frequencies);
    this.speaker.write(this.chunk);
}

// Synthesize silence
function synthesize0(i, count) {
    var samples = this.samples;
    for (; i < count; i++)
        samples[i] = 0;
    this.time = 0;
}

// A useful reference for sound wave functions: http://js.do/blog/sound-waves-with-javascript 

// Synthesize one pure tone
function synthesize1(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;
    var step = frequencies[0];   
    for (var time = this.time; i < count; time += step)
        samples[i++] = Math.sin(time) * amplitude;		
    this.time += step * count;
}

// Synthesize 2 pure tones at once
function synthesize2(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;
    var step1 = frequencies[0], step2 = frequencies[1]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2; i < count; time1 += step1, time2 += step2)
        samples[i++] = (Math.sin(time1) + Math.sin(time2)) * amplitude;
    this.time += step1 * count;
}

// Synthesize 3 pure tones at once
function synthesize3(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;
    var step1 = frequencies[0], step2 = frequencies[1], step3 = frequencies[2]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2, time3 = (this.time / step1) * step3 ; i < count; time1 += step1, time2 += step2, time3 += step3)
        samples[i++] = (Math.sin(time1) + Math.sin(time2) + Math.sin(time3)) * amplitude;
    this.time += step1 * count;
}

// Synthesize 4 pure tones at once
function synthesize4(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;
    var step1 = frequencies[0], step2 = frequencies[1], step3 = frequencies[2], step4 = frequencies[3]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2, time3 = (this.time / step1) * step3, time4 = (this.time / step1)* step4 ; i < count; time1 += step1, time2 += step2, time3 += step3, time4+=step4)
        samples[i++] = (Math.sin(time1) + Math.sin(time2) + Math.sin(time3)+ Math.sin(time4)) * amplitude;
    this.time += step1 * count;
}

// Synthesize 5 pure tones at once
function synthesize5(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;
    var step1 = frequencies[0], step2 = frequencies[1], step3 = frequencies[2], step4 = frequencies[3], step5 = frequencies[4]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2, time3 = (this.time / step1) * step3, time4 = (this.time / step1)* step4, time5 = (this.time / step1)* step5  ; i < count; time1 += step1, time2 += step2, time3 += step3, time4+=step4, time5+=step5)
        samples[i++] = (Math.sin(time1) + Math.sin(time2) + Math.sin(time3)+ Math.sin(time4) + Math.sin(time5)) * amplitude;
    this.time += step1 * count;
}

// Synthesizes a sequence of notes. NOT USED in this sample program.
function synthesizeSequence(i, count) {
    for (var sequences = this.sequences; i < count; i++) {
        var sequence = sequences[this.sequenceIndex];
        var frequencies = sequence.frequencies;
        if (!sequence.seed) {
            for (var j = 0, k = this.k, l = frequencies.length; j < l; j++)
                frequencies[j] *= k;
            sequence.seed = 1;
            sequence.saveSamples = sequence.samples;
        }
        else if (sequence.seed != this.seed) {
            sequence.seed++;
            sequence.samples = sequence.saveSamples; 
        }
        var c = sequence.samples;
        if (c > count) {
            voices[frequencies.length].call(this, i, count, frequencies);
            sequence.samples -= count;
            break;
        }
        else {
            voices[frequencies.length].call(this, i, c, frequencies);
            if (++this.sequenceIndex >= sequences.length) {
                if (--this.repeat) {
                    this.sequenceIndex = 0;
                    this.seed++;
                }
                else {
                    this.renderAudio = synthesize0;
                    break;
                }
            }
            i += c;
        }
    }
}

// Calls function based on size of frequency array being passed. Kinoma Create can do up to 5 tones at 4k sampling rate.
var voices = [synthesize0, synthesize1, synthesize2, synthesize3, synthesize4, synthesize5];
// Violin synthesizer
exports.setFrequenciesViolin = function(frequencies) {
    this.frequencies = frequencies;
    for (var i = 0, k = this.k; i < frequencies.length; i++)
        frequencies[i] *= k;
    this.renderAudio = voicesViolin[frequencies.length];
}

function synthesize1Violin(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;
    var step = frequencies[0]; 
    for (var time = this.time; i < count; time += step) 
		// Violin tone function. Uses descending harmonics, and oscillation for vibrato effect.  
		 samples[i++] = ( Math.sin(time) + .5 * Math.sin(time*2) + 1/3*Math.sin(time*3) ) * amplitude * (1-Math.exp(-((time/step))*0.00075/* 3/4000 */)) * (1-0.5*Math.sin(0.00942477796/* 2*Math.PI*6/4000 */*(time/step))) ;		
    this.time += step * count;     
}

/* The violin synth mode function is already comprised of multiple tones, so the Kinoma Create
 cannot support more than one key at a time. */
var voicesViolin = [synthesize0, synthesize1Violin];
// Bell synthesizer
exports.setFrequenciesBell = function(frequencies) {
    this.frequencies = frequencies;
    for (var i = 0, k = this.k; i < frequencies.length; i++)
        frequencies[i] *= k;
    this.renderAudio = voicesBell[frequencies.length];
}

function synthesize1Bell(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;	
    var step = frequencies[0]; 
    for (var time = this.time; i < count; time += step)   
		// Bell tone function.
		 samples[i++] = Math.cos(time + 8*Math.sin(time*1.4) * Math.exp(-((time/step))*.001/* 4/4000 */) )* Math.exp(-(time/step)*0.00075/* 3/4000 */)* amplitude; 		
    this.time += step * count;    
}	

var voicesBell = [synthesize0, synthesize1Bell];
// Laser synthesizer	
exports.setFrequenciesLaser = function(frequencies) {
    this.frequencies = frequencies;
    for (var i = 0, k = this.k; i < frequencies.length; i++)
        frequencies[i] *= k;
    this.renderAudio = voicesLaser[frequencies.length];
}

function synthesize1Laser(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;	
    var step = frequencies[0]; 
    for (var time = this.time; i < count; time += step)   
		// Laser tone function.
		 samples[i++] = Math.cos(time + 1500*Math.cos((time/step)*0.00392699081/*5*Math.PI/4000*/) ) * Math.exp(-(time/step)*.001/* 4/4000 */) * amplitude ;		
    this.time += step * count;    
}
	
var voicesLaser = [synthesize0, synthesize1Laser];		 