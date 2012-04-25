(function () {
function noop() {}

// TODO: Feature detection
var audioOutput = new Audio(),
    channels = 1,
    sampleRate = 44100;
audioOutput.mozSetup(channels, sampleRate);

// Set up sample sound
// TODO: Modify based on mouse location
var buffer = new Float32Array();
function writeSound(pulseLength) {
  // Set up array for sound out
  var offset = buffer.length,
      i = 0,
      len = pulseLength,
  // Regenerate the new buffer
      newBuffer = new Float32Array(offset + len);

  // Save the old items on the new buffer
  newBuffer.set(buffer);

  // Add the new items to the new buffer
  for (; i < len; i++) {
   newBuffer[offset + i] = Math.sin(i / pulseLength);
  }

  // Overwrite the old buffer
  buffer = newBuffer;
}

// On a setInterval, output the buffer
setInterval(function () {
  // If the buffer is empty, do nothing
  // console.log(buffer);
  if (buffer.length === 0) { return; }

  // Otherwise, output the buffer
  var hzWritten = audioOutput.mozWriteAudio(buffer);
console.log(hzWritten, buffer.length);
  // Remove the chunk of buffer that was just written
  // buffer = buffer.subarray(hzWritten);
}, 100);


writeSound(44100);
writeSound(20000);
writeSound(5000);

// Attribution to https://raw.github.com/jeromeetienne/microevent.js/master/microevent.js
function MicroEvent() {}
MicroEvent.prototype={on:function(a,b){this._events=this._events||{};this._events[a]=this._events[a]||[];this._events[a].push(b)},off:function(a,b){this._events=this._events||{};!1!==a in this._events&&this._events[a].splice(this._events[a].indexOf(b),1)},emit:function(a){this._events=this._events||{};if(!1!==a in this._events)for(var b=0;b<this._events[a].length;b++)this._events[a][b].apply(this,[].slice.call(arguments,1))}}; MicroEvent.mixin=function(a){for(var b=["on","off","emit"],c=0;c<b.length;c++)a.prototype[b[c]]=MicroEvent.prototype[b[c]]};

var body = document.body;
function MouseWatcher() {
  var that = this;
  this.x = 0;
  this.y = 0;

  this.mousemove = function (e) {
    // Record the mouse location
    var x = that.x = e.clientX,
        y = that.y = e.clientY;

    // Emit an event
    that.emit('move', x, y);
  };

  this.mousedown = function (e) {
    // Record the mouse location
    var x = that.x = e.clientX,
        y = that.y = e.clientY;

    // Bind the mouse movements
    that.bindMove();

    // Emit an event
    that.emit('down', x, y);
  };

  this.mouseup = function () {
    // Unbind the mouse movements
    that.unbindMove();

    // Emit an event
    that.emit('up', true);
  };
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
// Mixin events to MouseWatcher
MicroEvent.mixin(MouseWatcher);

// Create a new MouseWatcher
var mouse = new MouseWatcher();
mouse.start();


// Set up sound actions
var callAgain = false;
function soundOut() {
  writeSound(22050, function () {
    if (callAgain) {
      soundOut();
    }
  });
}

// When the person initially clicks, send out a sound
mouse.on('down', function (x, y) {
  callAgain = true;
  soundOut();
});

// When the person click is released, stop sending sounds
mouse.on('up', function (x, y) {
  callAgain = false;
});
}());