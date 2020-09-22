//attach a click listener to a play button
document.querySelector('button')?.addEventListener('click', async () => {
	await Tone.start()
	console.log('audio is ready')
})

const player = new Tone.Player("/audio/03 Moanin'.mp3").toMaster();
// const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
// play as soon as the buffer is loaded
player.autostart = true;

function setup() {
	createCanvas(200, 200);
	fill(0);
	rect(10,10, 100,100);
}

function draw() {

}
