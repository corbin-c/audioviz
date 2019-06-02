function WebAudio()
{
	this.type = "";
	this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	this.stream = {};
	this.audioSourceNode = {};
	this.analyserNode = {};
}
wa = new WebAudio();
document.getElementById("source_audio").addEventListener("change",async function (e) {
	try
	{
		wa.audioSourceNode.disconnect();
		wa.analyserNode.disconnect()
	}
	catch
	{
		console.log("could not disconnect audio node");
	}
	if (e.target.value == "audio_in")
	{
		wa.type = e.target.value;
		wa.stream = await get_mic();
		wa.audioSourceNode = wa.audioCtx.createMediaStreamSource(wa.stream);
	}
	else if (e.target.value == "file")
	{
		wa.type = e.target.value;
		wa.stream = new Audio();
		wa.stream.src = '1.mp3';
		wa.stream.autoplay = true;
		wa.stream.preload = 'auto';
		wa.audioSourceNode = wa.audioCtx.createMediaElementSource(wa.stream);
	}
	else
	{
		wa.type = "osc";
		wa.audioSourceNode = wa.audioCtx.createOscillator();
		wa.audioSourceNode.type = 'sine';
		wa.audioSourceNode.frequency.setValueAtTime(4400, wa.audioCtx.currentTime);
		wa.audioSourceNode.start();
	}
	wa.analyserNode = wa.audioCtx.createAnalyser();
	wa.analyserNode.fftSize = 2048;
	svg.init_graph(wa.analyserNode.fftSize)
	const bufferLength = wa.analyserNode.fftSize;
	const dataArray = new Uint8Array(bufferLength);

	wa.audioSourceNode.connect(wa.analyserNode);
	//analyserNode.connect(audioCtx.destination);

	draw();
	async function draw() {
		wa.analyserNode.getByteTimeDomainData(dataArray);
		svg.fourier(dataArray)
		await incr_wait(0,(wa.analyserNode.fftSize/wa.audioCtx.sampleRate)*1000)
		draw();
	}
})

function get_mic()
{
	return new Promise(function(resolve,reject){
	navigator.mediaDevices.getUserMedia ({audio: true, video: false})
		.then(async function(stream) {resolve(stream)})
		})
}
window.onbeforeunload = wa.audioCtx.close;
//Create audio source
/*
var audioSourceNode = audioCtx.createOscillator();
audioSourceNode.type = 'sine';
audioSourceNode.frequency.setValueAtTime(4400, audioCtx.currentTime); // value in hertz
audioSourceNode.start();

const stream = new Audio();
stream.src = '3.flac';//insert file name here
stream.autoplay = true;
stream.preload = 'auto';
*/
