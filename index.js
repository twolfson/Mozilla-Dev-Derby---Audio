(function () {
// TODO: Feature detection
var audioOutput = new Audio();
audioOutput.mozSetup(2, 44100);

var samples = new Float32Array(22050);  
for (var i = 0; i < samples.length ; i++) {  
 samples[i] = Math.sin( i / 20 );  
} 
audioOutput.mozWriteAudio(samples); 
}());