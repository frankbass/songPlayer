console.clear();
var shifter;
var playButton;
var stopButton;
var pitchSlider;
var pitchResetButton;
var tempoSlider;
var tempoResetButton;
var player;
var gainNode;
var gainSlider;
var pitchCorrection = 0;
var dropzone;
var currentTime;
var name = "counting.wav";
var startSlider;
var endSlider;
var loopStart;
var loopEnd;
var loopButton;
var positionSlider;
var endOfSong = 100;
var songData;
var looping = false;
var wave;

function preload() {
  const url = 'https://cors-anywhere.herokuapp.com/https://github.com/frankbass/sampleAudio/blob/main/count%20to%2030.wav?raw=true';
  gainNode = new Tone.Gain(.8).toDestination();
  shifter = new Tone.PitchShift(2).connect(gainNode);
  // player = new Tone.Player(url, loaded).connect(shifter).sync().start(0);
  player = new Tone.Player("audio/count to 30.wav", loaded).connect(shifter).sync().start(0);
}
//reset
function loaded() {
  endOfSong = player.buffer.duration;
  positionSlider.elt.max = endOfSong;
  startSlider.elt.max = endOfSong;
  endSlider.elt.max = endOfSong;
  songData = player.buffer.toMono().toArray();
  loopStart = 0;
  loopEnd = endOfSong;
  startSlider.elt.value = 0;
  endSlider.elt.value = endOfSong;
  gainSlider.elt.value = .8;
  volumeUpdate();
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = loopStart;
  Tone.Transport.loopEnd = loopEnd;
  wave.generator();
  stop();
  tempoReset();
  pitchReset();
}

class WaveForm {
  constructor(_xPos, _yPos, _xSize, _ySize) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.xSize = _xSize;
    this.ySize = _ySize;
    this.waveImg = createGraphics(this.xSize, this.ySize);
    this.waveImg.background(255);
  }
  generator() {
    this.xScale = floor(player.buffer.length / this.xSize);
    this.waveImg.fill(255);
    this.waveImg.stroke(0);
    this.waveImg.strokeWeight(1);
    this.waveImg.background(255);
    for (var i = 0; i < this.xSize; i++) {
      var data = abs(songData[i * this.xScale]);
      var lineHeight = data * this.ySize;
      this.waveImg.line(i, this.ySize / 2, i, this.ySize / 2 - lineHeight);
      this.waveImg.line(i, this.ySize / 2, i, this.ySize / 2 + lineHeight);
    }
  }
  display() {
    image(this.waveImg, this.xPos, this.yPos);
  }
}

function setup() {
  var cnv = createCanvas(400, 650);
  cnv.drop(loadSong);
  wave = new WaveForm(50, 40, 300, 100);
  background(200);
  currentTime = 0;
  playButton = createButton("play");
  playButton.position(10, 10);
  playButton.mousePressed(playToggle);
  stopButton = createButton("stop");
  stopButton.position(62, 10);
  stopButton.mousePressed(stop);
  pitchSlider = createSlider(-6, 6, 0, .1);
  pitchSlider.style("width", "200px");
  pitchSlider.position(width / 2 - 100, height / 2 + 150);
  pitchSlider.input(pitchUpdate);
  pitchResetButton = createButton("reset pitch");
  pitchResetButton.position(310, pitchSlider.y);
  pitchResetButton.mousePressed(pitchReset);
  tempoSlider = createSlider(.5, 1.25, 1, .05);
  tempoSlider.style("width", "200px");
  tempoSlider.position(width / 2 - 100, height / 2 + 180);
  tempoSlider.input(pitchCorrectCalculate);
  tempoResetButton = createButton("reset tempo");
  tempoResetButton.position(310, tempoSlider.y);
  tempoResetButton.mousePressed(tempoReset);
  loopButton = createButton(" loop ");
  loopButton.position(105, 10);
  loopButton.mousePressed(looper);
  positionSlider = createSlider(0, endOfSong, 0, .01);
  positionSlider.position(width / 2 - 100, height / 2 + 30);
  positionSlider.style("width", "200px");
  positionSlider.input(positionUpdate);
  gainSlider = createSlider(0, 1.2, .8, .01);
  gainSlider.position(width / 2 - 100, height / 2 + 60);
  gainSlider.style("width", "200px");
  gainSlider.input(volumeUpdate);
  startSlider = createSlider(0, 60, 0, .01);
  startSlider.position(width / 2 - 100, height / 2 + 90);
  startSlider.style("width", "200px");
  startSlider.input(startUpdate);
  endSlider = createSlider(0, 60, 60, .01); // don't want it to go backwards... do we?
  endSlider.position(width / 2 - 100, height / 2 + 120);
  endSlider.style("width", "200px");
  endSlider.input(endUpdate);
}

function draw() {
  background(200);
  timeKeeper();
  wave.display();
  texts();
  if (!looping && currentTime >= loopEnd - .1) {
    stop();
  }
}

function texts() {
  strokeWeight(.5);
  fill(0);
  textSize(20);
  text("title: " + name, 10, 200);
  textSize(12);
  text("tempo rate: " + tempoSlider.value(), 5, tempoSlider.y + 12);
  text("pitch shift: " + pitchSlider.value(), 5, pitchSlider.y + 12);
  text("position: " + nf(floor(currentTime / 60), 2, 0) + ":" + nf(currentTime % 60, 2, 1), 5, positionSlider.y + 12);
  text("loop start: " + nf(floor(startSlider.value() / 60), 2, 0) + ":" + nf(startSlider.value() % 60, 2, 1), 5, startSlider.y + 12);
  text("end: " + nf(floor(endSlider.value() / 60), 2, 0) + ":" + nf(endSlider.value() % 60, 2, 1), 5, endSlider.y + 12);
  text("volume: " + gainSlider.value(), 5, gainSlider.y + 12);
}

function pitchUpdate() {
  shifter.pitch = pitchSlider.value() + pitchCorrection;
}

function positionUpdate() {
  currentTime = positionSlider.value();
  if (Tone.Transport.state == "started") {
    Tone.Transport.stop();
    Tone.Transport.start(undefined, currentTime);
  }
}

function pitchCorrectCalculate() {
  pitchCorrection = -12 * log(tempoSlider.value()) / log(2);
  player.playbackRate = tempoSlider.value();
  shifter.pitch = pitchSlider.value() + pitchCorrection;
  Tone.Transport.bpm.value = 120 * tempoSlider.value();
}

function stop() {
  Tone.Transport.stop();
  playButton.html("play");
  currentTime = 0;
  if (looping) currentTime = loopStart;
  positionSlider.elt.value = currentTime;
}

function playToggle() {
  if (Tone.Transport.state == "paused") {
    Tone.Transport.start(undefined, currentTime);
    playButton.html("pause");
  } else if (Tone.Transport.state == "stopped") {
    Tone.Transport.start(undefined, currentTime);
    playButton.html("pause");
  } else if (Tone.Transport.state == "started") {
    Tone.Transport.pause();
    playButton.html("play");
  }
}

function keyPressed() {
  if (keyCode == 32) {
    playToggle();
  }
}

function tempoReset() {
  tempoSlider.value(1);
  pitchCorrection = -12 * log(tempoSlider.value()) / log(2);
  player.playbackRate = 1
  shifter.pitch = pitchSlider.value() + pitchCorrection;
  Tone.Transport.bpm.value = 120;
}

function pitchReset() {
  pitchSlider.value(0);
  shifter.pitch = 0;
}

function timeKeeper() {
  var diffTime = loopEnd - loopStart;
  var currPos = loopStart + (diffTime * Tone.Transport.progress);
  if (Tone.Transport.state == "started") {
    positionSlider.elt.value = currPos;
    currentTime = currPos;
  }
}

function looper() {
  looping = !looping;
  if (looping) loopButton.html("don't loop");
  else loopButton.html(" loop ");
}

function startUpdate() {
  loopStart = startSlider.value();
  if (loopStart >= loopEnd) {
    loopStart = loopEnd - .1;
    startSlider.elt.value = loopStart;
  }
  Tone.Transport.loopStart = loopStart;
  if (looping) currentTime = loopStart;
}

function endUpdate() {
  loopEnd = endSlider.value();
  if (loopEnd <= loopStart) {
    loopEnd = loopStart + .1;
    endSlider.elt.value = loopEnd;
  }
  Tone.Transport.loopEnd = loopEnd;
}

function volumeUpdate() {
  gainNode.gain.rampTo(gainSlider.value(), .1);
}

function loadSong(file) {
  player.load(file.data, loaded);
  name = file.name;
  /*
  // If it's an image file
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    const img = createImg(file.data).hide();
    // Draw the image onto the canvas
    image(img, 0, 0, width, height);
  } else {
    console.log('Not an image file!');
  }
  */
}

/*
dragOver(), mouseDragged() and mouseReleased() for drag and drop visual feedback
*/
