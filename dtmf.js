// gera tons DTMF do telefone
var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

function Tone(context, freq1, freq2) {
    this.context = context;
    this.status = 0;
    this.freq1 = freq1;
    this.freq2 = freq2;
}

Tone.prototype.setup = function () {
    this.osc1 = context.createOscillator();
    this.osc2 = context.createOscillator();
    this.osc1.frequency.value = this.freq1;
    this.osc2.frequency.value = this.freq2;

    this.gainNode = this.context.createGain();
    this.gainNode.gain.value = 0.25;

    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency = 8000;

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);

    this.gainNode.connect(this.filter);
    this.filter.connect(context.destination);
}

Tone.prototype.start = function () {
    this.setup();
    this.osc1.start(0);
    this.osc2.start(0);
    this.status = 1;
}

Tone.prototype.stop = function () {
    this.osc1.stop(0);
    this.osc2.stop(0);
    this.status = 0;
}

var dtmfFrequencies = {
    "1": { f1: 697, f2: 1209 },
    "2": { f1: 697, f2: 1336 },
    "3": { f1: 697, f2: 1477 },
    "4": { f1: 770, f2: 1209 },
    "5": { f1: 770, f2: 1336 },
    "6": { f1: 770, f2: 1477 },
    "7": { f1: 852, f2: 1209 },
    "8": { f1: 852, f2: 1336 },
    "9": { f1: 852, f2: 1477 },
    "*": { f1: 941, f2: 1209 },
    "0": { f1: 941, f2: 1336 },
    "tone": { f1: 390, f2: 0 },
    "no-tone": { f1: 0, f2: 0 }
}

var context = new AudioContext();

// Create a new Tone instace. (We've initialised it with 
// frequencies of 350 and 440 but it doesn't really matter
// what we choose because we will be changing them in the 
// function below)
var dtmf = new Tone(context, 350, 440);
var ringbackTone = new Tone(context, 400, 450);

$(".js-dtmf-interface button").on("mousedown touchstart", function (e) {
    e.preventDefault();

    var keyPressed = $(this).attr('data-dtmf'); // this gets the number/character that was pressed
    var frequencyPair = dtmfFrequencies[keyPressed]; // this looks up which frequency pair we need

    // this sets the freq1 and freq2 properties
    dtmf.freq1 = frequencyPair.f1;
    dtmf.freq2 = frequencyPair.f2;

    if (dtmf.status == 0) {
        dtmf.start();
    }
});

// we detect the mouseup event on the window tag as opposed to the li
// tag because otherwise if we release the mouse when not over a button,
// the tone will remain playing
$(window).on("mouseup touchend", function () {
    if (typeof dtmf !== "undefined" && dtmf.status) {
        dtmf.stop();
    }
});

Tone.prototype.createRingerLFO = function () {
    // Create an empty 3 second mono buffer at the
    // sample rate of the AudioContext
    var channels = 1;
    var sampleRate = this.context.sampleRate;
    var frameCount = sampleRate * 3;
    var myArrayBuffer = this.context.createBuffer(channels, frameCount, sampleRate);

    // getChannelData allows us to access and edit the buffer data and change.
    var bufferData = myArrayBuffer.getChannelData(0);
    for (var i = 0; i < frameCount; i++) {
        // if the sample lies between 0 and 0.4 seconds, or 0.6 and 1 second, we want it to be on.
        if ((i / sampleRate > 0 && i / sampleRate < 0.4) || (i / sampleRate > 0.6 && i / sampleRate < 1.0)) {
            bufferData[i] = 0.25;
        }
    }

    this.ringerLFOBuffer = myArrayBuffer;
}

Tone.prototype.startRinging = function () {
    this.start();
    // set our gain node to 0, because the LFO is callibrated to this level
    this.gainNode.gain.value = 0;
    this.status = 1;

    this.createRingerLFO();

    this.ringerLFOSource = this.context.createBufferSource();
    this.ringerLFOSource.buffer = this.ringerLFOBuffer;
    this.ringerLFOSource.loop = true;
    // connect the ringerLFOSource to the gain Node audio param
    this.ringerLFOSource.connect(this.gainNode.gain);
    this.ringerLFOSource.start(0);
}

Tone.prototype.stopRinging = function () {
    this.stop();
    this.ringerLFOSource.stop(0);
}

// alterna o sinal de chamada
function toggleRingtone() {

    if (ringbackTone.status === 0) {
        // The tone is currently off, so we need to turn it on.
        ringbackTone.startRinging();
    } else {
        // The tone is currently on, so we need to turn it off.
        ringbackTone.stopRinging();
    }
}