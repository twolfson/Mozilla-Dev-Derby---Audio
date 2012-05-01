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
  this._prebufferSize = prebufferSize;
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
  'pulse': function (freq, length, callback) {
    // Fallback callback
    callback = callback || noop;

    var sound = new SoundMaker();

    sound.start(freq);

    setTimeout(function () {
      // TODO: Make SoundMaker.stop cleaner so we don't have to keep on creating new ones
      sound.destroy();
      setTimeout(callback, 500);
    }, length);
  }
};

// TODO: Scrap this?
var body = document.body;

// Set up constants for canvas and pulser
var OCTAVES = 16,
    PITCHES = 32;

// Canvas time
var canvasElt = document.getElementById('canvas'),
    canvas = canvasElt.getContext('2d'),
    height = window.innerHeight,
    width = window.innerWidth,
    slate = {
      'drawBg': function () {
        // Paint a slate gray background
        canvas.fillStyle = '#999999';
        canvas.fillRect(0, 0, width, height);

        // Add some white dots for demarcation
        canvas.fillStyle = 'rgba(255, 255, 255, 0.2)';
        var i = 0,
            len = PITCHES,
            x,
            j,
            len2 = OCTAVES,
            y;
        for (; i < len; i++) {
          x = (i + .5) * width/len;
          for (j = 0; j < len2; j++) {
            y = (j + .5) * height/len2;
            canvas.moveTo(x, y);
            canvas.beginPath();
            canvas.arc(x, y, 3, 0, 360);
            canvas.fill();
          }
        }
      },
      'drawWelcomeText': function () {
        canvas.fillStyle = '#000000';
        canvas.font = '20px Helvetica, Arial, sans-serif';
        canvas.fillText('Audio Playground', 20, 30);
        canvas.font = '14px Helvetica, Arial, sans-serif';
        canvas.fillText('Turn on your speakers and click on the grey background to begin!', 20, 50);
        canvas.fillText('Multi-touch is supported. To play with this in a non-touch environment, use shift + click to add touches and ctrl + click to remove them.', 20, 70);
      }
    };

// Make the canvas full size
canvasElt.height = canvas.height = height;
canvasElt.width = canvas.width = width;

// Draw the background and welcome text
slate.drawBg();
slate.drawWelcomeText();

// Set up touch map
var touchMap = {},
    MIDDLE_C = 261.626,
    MAX_C = MIDDLE_C * Math.pow(2, 2),
    DIFF_C = MAX_C - MIDDLE_C;

function soundOut(id) {
  var pulser = new Pulser,
      touch = touchMap[id],
      percentX = touch.x / width,
      percentY = 1 - touch.y / height,
      squareRatio = DIFF_C * (percentX / 3) + (percentY * 2/3);
  // TODO: Work on the equation?
  pulser.pulse(MIDDLE_C + squareRatio, 100, function () {
    if (touchMap[id]) {
      soundOut(id);
    }
  });
}

function updateTouches(e) {
  var touches = e.touches,
      touch,
      id,
      i = 0,
      len = touches.length,
      seenBefore;

  // Iterate and save the touches
  for (; i < len; i++) {
    touch = touches[i];
    id = touch.identifier;

    seenBefore = !!touchMap[id];

    touchMap[id] = {'x': touch.pageX, 'y': touch.pageY};

    // If the item did not previously exist, start sound out
    if (!seenBefore) {
      soundOut(id);
    }
  }

}

document.addEventListener('touchstart', updateTouches);
document.addEventListener('touchmove', updateTouches);
document.addEventListener('touchend', function (e) {
  // Remove the changed touches
  var touches = e.changedTouches,
      i = 0,
      len = touches.length;
  for (; i < len; i++) {
    delete touchMap[touches[i].identifier];
  }
});
}());