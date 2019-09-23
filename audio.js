function WebAudio() {
  this.type = "";
  this.audioCtx = new (window.AudioContext ||
                      window.webkitAudioContext)();
  this.stream = {};
  this.audioSourceNode = {};
  this.analyserNode = {};
}
wa = new WebAudio();
document.getElementById("buff_size").value = 512;
document.getElementById("source_audio")
  .addEventListener("change",async function (e) {
    try {
      wa.audioSourceNode.disconnect();
      wa.analyserNode.disconnect()
    }
    catch {
      console.log("could not disconnect audio node");
    }
    if (e.target.value == "audio_in") {
      document.getElementById("l_osc_type").classList.add("hidden")
      document.getElementById("l_osc_freq").classList.add("hidden")
      document.getElementById("osc_type").classList.add("hidden")
      document.getElementById("osc_freq").classList.add("hidden")
      document.getElementById("l_file_input").classList.add("hidden")
      document.getElementById("file_input").classList.add("hidden")
      wa.type = e.target.value;
      wa.stream = await get_mic();
      wa.audioSourceNode = wa.audioCtx
        .createMediaStreamSource(wa.stream);
      
    } else if (e.target.value == "file") {
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
      wa.audioSourceNode = wa.audioCtx
        .createMediaElementSource(wa.stream);
    } else {
      wa.type = "osc";
      wa.audioSourceNode = wa.audioCtx.createOscillator();
      wa.audioSourceNode.type = document.getElementById("osc_type")
        .value;
      wa.audioSourceNode.frequency.setValueAtTime(
        document.getElementById("osc_freq").value,
        wa.audioCtx.currentTime);
      wa.audioSourceNode.start();
      document.getElementById("l_osc_type").classList.remove("hidden")
      document.getElementById("l_osc_freq").classList.remove("hidden")
      document.getElementById("osc_type").classList.remove("hidden")
      document.getElementById("osc_freq").classList.remove("hidden")
      document.getElementById("l_file_input").classList.add("hidden")
      document.getElementById("file_input").classList.add("hidden")
    }
    wa.analyserNode = wa.audioCtx.createAnalyser();
    wa.analyserNode.fftSize = document.getElementById("buff_size").value;
    svg.init_graph(wa.analyserNode.fftSize)
    wa.bufferLength = wa.analyserNode.fftSize;
    wa.dataArray = new Uint8Array(wa.bufferLength);

    wa.audioSourceNode.connect(wa.analyserNode);
    if (document.getElementById("out_monitor").checked
      && wa.type != "audio_in") {
      wa.analyserNode.connect(wa.audioCtx.destination);
    } else {
      document.getElementById("out_monitor").checked = false;
    }
    if (!svg.drawing("status")) {
      draw();
      async function draw() {
        wa.analyserNode.getByteTimeDomainData(wa.dataArray);
        svg.fourier(wa.dataArray)
        await incr_wait(0,
          (wa.analyserNode.fftSize/wa.audioCtx.sampleRate)*1000)
        draw();
      }
    }
})
function get_mic() {
  return new Promise(function(resolve,reject){
  navigator.mediaDevices.getUserMedia ({audio: true, video: false})
    .then(async function(stream) {resolve(stream)})
    })
}
document.getElementById("osc_freq").addEventListener("change",
  function (e) {
  wa.audioSourceNode.frequency
    .setValueAtTime(e.target.value, wa.audioCtx.currentTime);
})
document.getElementById("osc_type").addEventListener("change",
  function (e) {
  wa.audioSourceNode.type = e.target.value;
})
document.getElementById("pt_size").addEventListener("change",
  function (e) {
  svg.init_graph(wa.analyserNode.fftSize)
})
document.getElementById("buff_size").addEventListener("change",
  function (e) {
  bufsize = (wa.analyserNode.fftSize || 512);
  if (e.target.value != bufsize) {
    bufsize = pow_two(bufsize);
    bufsize = (wa.analyserNode.fftSize > e.target.value) ?
      Math.pow(2,bufsize-1):Math.pow(2,bufsize+1);
    try {
      svg.init_graph(bufsize)
      e.target.value = bufsize;
      wa.analyserNode.fftSize = bufsize;
      wa.bufferLength = wa.analyserNode.fftSize;
      wa.dataArray = new Uint8Array(wa.bufferLength);
    }
    catch {
      console.log("buffersize failure");
    }
  }
})
function get_input() {
  return new Promise(function(resolve,reject){
    document.getElementById("file_input").addEventListener("change",
      async function (e) {
      src = await read(e.target.files[0]);
      resolve(src)
    })
  })
}
document.getElementById("out_monitor").addEventListener("change",
  async function (e) {
  if (e.target.checked && wa.type != "audio_in") {
    wa.analyserNode.connect(wa.audioCtx.destination);
  } else {
    wa.analyserNode.disconnect();
  }
})
function read(what) {
  return new Promise(function(resolve,reject){
    let reader = new FileReader();
    reader.addEventListener('load', function() {
      resolve(this.result)
    });
    reader.readAsDataURL(what);
  })
}
function pow_two(number) {
  let i = 1;
  while (Math.pow(2,i)<number) {
    i++;
  }
  return i;
}
