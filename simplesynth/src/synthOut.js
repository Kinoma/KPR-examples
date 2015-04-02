//@module

exports.pins = {
    speaker: {type: "Audio", sampleRate: 8000, channels: 1, frequencies: [], amplitude: 16384, realTime: true, direction: "output"}
}

exports.configure = function(config) {
    this.samplesPerRender = 185;
    this.sampleRate = config.pins.speaker.sampleRate;
    this.amplitude = config.pins.speaker.amplitude;
    this.chunk = new Chunk(this.samplesPerRender * 2);
    this.samples = new Int16Array(this.chunk, 0, this.samplesPerRender);
    this.k = 2 * Math.PI / this.sampleRate;
    this.speaker.init();

    this.setFrequencies(config.pins.speaker.frequencies);
}

exports.close = function() {
    this.speaker.close();
}

exports.start = function() {
    this.time = 0; 
    this.speaker.start();
}

exports.stop = function() {
    this.speaker.stop();
}

exports.setFrequencies = function(frequencies) {
    this.frequencies = frequencies;

    for (var i = 0, k = this.k; i < frequencies.length; i++)
        frequencies[i] *= k;

    this.renderAudio = voices[frequencies.length];
}

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

exports.setAmplitude = function(amplitude) {
    this.amplitude = amplitude; 
}

exports.silence = function() {
    this.frequencies.length = 0; 
    this.renderAudio = synthesize0; 
}

exports.synthesize = function()
{
    this.renderAudio(0, this.samplesPerRender, this.frequencies);
    this.speaker.write(this.chunk);
}

function synthesize0(i, count) {
    var samples = this.samples;

    for (; i < count; i++)
        samples[i] = 0;

    this.time = 0;
}

function synthesize1(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;

    var step = frequencies[0]; 
    for (var time = this.time; i < count; time += step)
        samples[i++] = Math.sin(time) * amplitude;

    this.time += step * count;
}

function synthesize2(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;

    var step1 = frequencies[0], step2 = frequencies[1]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2; i < count; time1 += step1, time2 += step2)
        samples[i++] = (Math.sin(time1) + Math.sin(time2)) * amplitude;

    this.time += step1 * count;
}

function synthesize3(i, count, frequencies) {
    var amplitude = this.amplitude, samples = this.samples;

    var step1 = frequencies[0], step2 = frequencies[1], step3 = frequencies[2]; 
    for (var time1 = this.time, time2 = (this.time / step1) * step2, time3 = (this.time / step1) * step3 ; i < count; time1 += step1, time2 += step2, time3 += step3)
        samples[i++] = (Math.sin(time1) + Math.sin(time2) + Math.sin(time3)) * amplitude;

    this.time += step1 * count;
}

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

var voices = [synthesize0, synthesize1, synthesize2, synthesize3];
