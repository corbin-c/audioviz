var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
navigator.mediaDevices.getUserMedia ({audio: true, video: false})
    .then(async function(stream) {
//Create audio source
/*var oscillator = audioCtx.createOscillator();

const audioEle = new Audio();
audioEle.src = '3.flac';//insert file name here
audioEle.autoplay = true;
audioEle.preload = 'auto';
const audioSourceNode = audioCtx.createMediaElementSource(audioEle);
*/
const audioSourceNode = audioCtx.createMediaStreamSource(stream);

//oscillator.type = 'sine';
//oscillator.frequency.setValueAtTime(4400, audioCtx.currentTime); // value in hertz
//oscillator.start();

//Create analyser node
const analyserNode = audioCtx.createAnalyser();
analyserNode.fftSize = 4096;
svg.init_graph(analyserNode.fftSize)
//const bufferLength = analyserNode.frequencyBinCount;
const bufferLength = analyserNode.fftSize;
const dataArray = new Uint8Array(bufferLength);

//Set up audio node network
//oscillator.connect(analyserNode);
audioSourceNode.connect(analyserNode);
//analyserNode.connect(audioCtx.destination);

draw();

var i =0;
async function draw() {
	//requestAnimationFrame(draw);
	analyserNode.getByteTimeDomainData(dataArray);
	svg.fourier(dataArray)
	//svg.osc(dataArray)

	await incr_wait(0,(analyserNode.fftSize/audioCtx.sampleRate)*1000)
	//i++;
	//if (i < 20)
	//{
		draw();
	//}
}
})
