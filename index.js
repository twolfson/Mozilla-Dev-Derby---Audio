(function () {
// TODO: Feature detection
var audioOutput = new Audio();
audioOutput.mozSetup(2, 44100);

// Set up sample sound
// TODO: Modify based on mouse location
var samples = new Float32Array(22050);
for (var i = 0; i < samples.length ; i++) {
 samples[i] = Math.sin( i / 20 );
}
function writeSound() {
  audioOutput.mozWriteAudio(samples);
}

// When the person initially clicks
// TODO: Objectify mouse watcher

var body = document.body;
function MouseWatcher() {
  var that = this;
  this.x = 0;
  this.y = 0;

  this.mousemove = function (e) {
    // Record the mouse location
    that.x = e.clientX;
    that.y = e.clientY;
  };

  this.mousedown = function (e) {
    // Record the mouse location
    that.x = e.clientX;
    that.y = e.clientY;

    // Bind the mouse movements
    that.bindMove();
  };

  this.mouseup = function () { that.unbindMove(); };
}
MouseWatcher.prototype = {
  'bindMove': function () {
    body.addEventListener('mousemove', this.mousemove, false);
    body.addEventListener('mouseup', this.mouseup, false);
  },
  'unbindMove': function () {
    body.removeEventListener('mousemove', this.mousemove, false);
    body.removeEventListener('mouseup', this.mouseup, false);
  },
  'start': function () {
    body.addEventListener('mousedown', this.mousedown, false);
    return this;
  },
  'stop': function () {
    body.removeEventListener('mousedown', this.mousedown, false);
    this.unbindMove();
    return this;
  }
};

// Create a new MouseWatcher
var mouse = new MouseWatcher();
mouse.start();
}());