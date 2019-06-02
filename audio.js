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
		document.getElementById("l_osc_type").classList.add("hidden")
		document.getElementById("l_osc_freq").classList.add("hidden")
		document.getElementById("osc_type").classList.add("hidden")
		document.getElementById("osc_freq").classList.add("hidden")
		document.getElementById("l_file_input").classList.add("hidden")
		document.getElementById("file_input").classList.add("hidden")
		wa.type = e.target.value;
		wa.stream = await get_mic();
		wa.audioSourceNode = wa.audioCtx.createMediaStreamSource(wa.stream);
		
	}
	else if (e.target.value == "file")
	{
		document.getElementById("l_osc_type").classList.add("hidden")
		document.getElementById("l_osc_freq").classList.add("hidden")
		document.getElementById("osc_type").classList.add("hidden")
		document.getElementById("osc_freq").classList.add("hidden")
		document.getElementById("l_file_input").classList.remove("hidden")
		document.getElementById("file_input").classList.remove("hidden")
		wa.type = e.target.value;
		wa.stream = new Audio();
		wa.stream.src = await get_input();
		wa.stream.autoplay = true;
		wa.stream.preload = 'auto';
		wa.audioSourceNode = wa.audioCtx.createMediaElementSource(wa.stream);
	}
	else
	{
		wa.type = "osc";
		wa.audioSourceNode = wa.audioCtx.createOscillator();
		wa.audioSourceNode.type = document.getElementById("osc_type").value;
		wa.audioSourceNode.frequency.setValueAtTime(document.getElementById("osc_freq").value, wa.audioCtx.currentTime);
		wa.audioSourceNode.start();
		document.getElementById("l_osc_type").classList.remove("hidden")
		document.getElementById("l_osc_freq").classList.remove("hidden")
		document.getElementById("osc_type").classList.remove("hidden")
		document.getElementById("osc_freq").classList.remove("hidden")
		document.getElementById("l_file_input").classList.add("hidden")
		document.getElementById("file_input").classList.add("hidden")
	}
	wa.analyserNode = wa.audioCtx.createAnalyser();
	wa.analyserNode.fftSize = 1024;
	svg.init_graph(wa.analyserNode.fftSize)
	const bufferLength = wa.analyserNode.fftSize;
	const dataArray = new Uint8Array(bufferLength);

	wa.audioSourceNode.connect(wa.analyserNode);
	if (document.getElementById("out_monitor").checked && wa.type != "audio_in")
	{
		wa.analyserNode.connect(wa.audioCtx.destination);
	}
	else
	{
		document.getElementById("out_monitor").checked = false;
	}

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
document.getElementById("osc_freq").addEventListener("change",function (e)
{
	wa.audioSourceNode.frequency.setValueAtTime(e.target.value, wa.audioCtx.currentTime);
})
document.getElementById("osc_type").addEventListener("change",function (e)
{
	wa.audioSourceNode.type = e.target.value;
})
function get_input()
{
	return new Promise(function(resolve,reject){
		document.getElementById("file_input").addEventListener("change",async function (e)
		{
			src = await read(e.target.files[0]);
			resolve(src)
		})
	})
}
document.getElementById("out_monitor").addEventListener("change",async function (e)
{
	if (e.target.checked && wa.type != "audio_in")
	{
		wa.analyserNode.connect(wa.audioCtx.destination);
	}
	else
	{
		wa.analyserNode.disconnect();
	}
})
function read(what)
{
	return new Promise(function(resolve,reject){
		var reader = new FileReader();
		reader.addEventListener('load', function() {
			resolve(this.result)
		});
		reader.readAsDataURL(what);
	})
}
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
