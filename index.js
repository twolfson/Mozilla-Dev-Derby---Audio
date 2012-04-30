(function () {
function noop() {}

// TODO: Feature detection for Audio
// TODO: Modify based on mouse location
/**
 * Constructor function for SoundMaker
 * @param {Number} [sampleRate] Sample rate that the SoundMaker will use
 */
function SoundMaker(sampleRate) {
  // If there is a sampleRate, save it
  if (sampleRate) {
    this._sampleRate = sampleRate;
  } else {
  // Otherwise, retrieve the prototype's
    sampleRate = this._sampleRate;
  }

  var audioOutput = new Audio(),
      currentWritePosition = 0,
  // Set up buffer space which is half the sampleRate
      prebufferSize = sampleRate / 2,
      tail = null,
      that = this;

  // Complete set up of the audio element
  audioOutput.mozSetup(1, sampleRate);

  // Save sample rate and audioOutput for later
  this._sampleRate = sampleRate;
  this._audio = audioOutput;

  // Every 100 ms, run a function that will
  setInterval(function() {
    var written;

    // If there is data still in the buffer, attempt to output it
    if (tail) {
      written = audioOutput.mozWriteAudio(tail);
      currentWritePosition += written;

      // If there is still data in the buffer, save the subsection and return
      if (written < tail.length) {
        tail = tail.subarray(written);
        return;
      }

      // Otherwise, reset the buffer
      tail = null;
    }

    // Note to self: We may have just written some tail data. Maybe enough to fill the buffer, maybe not.

    // Get the position of the current output and determine how far we are in the prebuffer
    var currentPosition = audioOutput.mozCurrentSampleOffset(),
        available = currentPosition + prebufferSize - currentWritePosition;

    // If there is room available in the prebuffer
    if (available > 0) {
      // Create some new soundData to place in the tail
      var soundData = that.requestSound(available);

      // Add the new sound data set to the output
      written = audioOutput.mozWriteAudio(soundData);

      // If the entire soundDate is not output, save it as our tail
      if (written < soundData.length) {
        tail = soundData.subarray(written);
      }

      // Record the new offset for our buffer logic
      currentWritePosition += written;
    }
  }, 100);
}
SoundMaker.prototype = {
  '_frequency': 0,
  '_sampleRate': 44100,
  '_currentSoundSample': 0,
  'start': function (frequency) {
    this._frequency = frequency;
  },
  'stop': function () {
    this._currentSoundSample = 0;
    this._frequency = 0;
  },
  'destroy': function () {
    this.stop();
    this._audio = null;
  },
  'requestSound': function (timeOpen) {
    // Create a sound that will run for the remaining amount of time we have left
    var retBuffer = new Float32Array(parseFloat(timeOpen)),
        frequency = this._frequency,
        sampleRate = this._sampleRate,
        currentSoundSample = this._currentSoundSample;

    // If nothing is being output, skip it
    if (!frequency) { return new Float32Array; }

    // Determine the length of the sound wave
    var radians = 2 * Math.PI * frequency,
        k = radians / sampleRate,

    // Loop through the sound wave and save the pitches
        i = 0,
        len = timeOpen;
    for (; i < len; i++) {
      // TODO: What does currentSoundSample do?
      retBuffer[i] = Math.sin(k * currentSoundSample++);
    }

    // Save the new currentSoundSample
    this._currentSoundSample = currentSoundSample;

    // Return the buffer
    return retBuffer;
  }
};

function Pulser() {
}
Pulser.prototype = {
  'pulse': function (freq, length) {
    var sound = new SoundMaker();

    sound.start(freq);

    setTimeout(function () {
      // TODO: Make SoundMaker.stop cleaner so we don't have to keep on creating new ones
      sound.destroy();
    }, length);
  }
};

// Create the sound file
var pulse1 = new Pulser();

pulse1.pulse(300, 1000);
setTimeout(function () {
  pulse1.pulse(320, 1000);
}, 2000);


return;

// Attribution to https://raw.github.com/jeromeetienne/microevent.js/master/microevent.js
// function MicroEvent() {}
// MicroEvent.prototype={on:function(a,b){this._events=this._events||{};this._events[a]=this._events[a]||[];this._events[a].push(b)},off:function(a,b){this._events=this._events||{};!1!==a in this._events&&this._events[a].splice(this._events[a].indexOf(b),1)},emit:function(a){this._events=this._events||{};if(!1!==a in this._events)for(var b=0;b<this._events[a].length;b++)this._events[a][b].apply(this,[].slice.call(arguments,1))}}; MicroEvent.mixin=function(a){for(var b=["on","off","emit"],c=0;c<b.length;c++)a.prototype[b[c]]=MicroEvent.prototype[b[c]]};

// var body = document.body;
// function MouseWatcher() {
  // var that = this;
  // this.x = 0;
  // this.y = 0;

  // this.mousemove = function (e) {
    // // Record the mouse location
    // var x = that.x = e.clientX,
        // y = that.y = e.clientY;

    // // Emit an event
    // that.emit('move', x, y);
  // };

  // this.mousedown = function (e) {
    // // Record the mouse location
    // var x = that.x = e.clientX,
        // y = that.y = e.clientY;

    // // Bind the mouse movements
    // that.bindMove();

    // // Emit an event
    // that.emit('down', x, y);
  // };

  // this.mouseup = function () {
    // // Unbind the mouse movements
    // that.unbindMove();

    // // Emit an event
    // that.emit('up', true);
  // };
// }
// MouseWatcher.prototype = {
  // 'bindMove': function () {
    // body.addEventListener('mousemove', this.mousemove, false);
    // body.addEventListener('mouseup', this.mouseup, false);
  // },
  // 'unbindMove': function () {
    // body.removeEventListener('mousemove', this.mousemove, false);
    // body.removeEventListener('mouseup', this.mouseup, false);
  // },
  // 'start': function () {
    // body.addEventListener('mousedown', this.mousedown, false);
    // return this;
  // },
  // 'stop': function () {
    // body.removeEventListener('mousedown', this.mousedown, false);
    // this.unbindMove();
    // return this;
  // }
// };
// // Mixin events to MouseWatcher
// MicroEvent.mixin(MouseWatcher);

// // Create a new MouseWatcher
// var mouse = new MouseWatcher();
// mouse.start();


// // Set up sound actions
// var callAgain = false;
// function soundOut() {
  // writeSound(22050, function () {
    // if (callAgain) {
      // soundOut();
    // }
  // });
// }

// // When the person initially clicks, send out a sound
// mouse.on('down', function (x, y) {
  // callAgain = true;
  // soundOut();
// });

// // When the person click is released, stop sending sounds
// mouse.on('up', function (x, y) {
  // callAgain = false;
// });
}());