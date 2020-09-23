//attach a click listener to a play button
document.querySelector('button')?.addEventListener('click', async () => {
	await Tone.start()
	console.log('audio is ready')
})

const player = new Tone.Player("audio/Moanin.mp3").toDestination();
// const player = new Tone.Player("https://github.com/frankbass/songPlayer/blob/master/audio/Moanin.mp3").toMaster();
// const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
// play as soon as the buffer is loaded
// player.autostart = true;

function setup() {
	createCanvas(200, 200);
	fill(0);
	rect(10,10, 100,100);
}

function draw() {

}

var play = 0;
var time = 0;
function mousePressed() {
	play ++;
	play = play % 2;
	if (play) {player.start();}
	else {player.stop()}
	console.log(player.state);
}
