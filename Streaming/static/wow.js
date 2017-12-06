 
navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
  
   audio_context = new AudioContext;
   sampleRate = audio_context.sampleRate;
   var audioInput = audio_context.createMediaStreamSource(stream);
   console.log("Created media stream.");
   console.log(sampleRate)

   var bufferSize = 4096;
   // record only 1 channel
   var recorder = audio_context.createScriptProcessor(bufferSize, 1, 1);
   // specify the processing function
   recorder.onaudioprocess = recorderProcess;
   // connect stream to our recorder
   audioInput.connect(recorder);
   // connect our recorder to the previous destination
   recorder.connect(audio_context.destination);
  /* use the stream */
})
.catch(function(err) {
  console.log(err)
  /* handle the error */
});



var ws = new WebSocket('ws://127.0.0.1:8080/websocket');

ws.onopen = function(evt) {
  console.log('Connected to websocket.');

  // First message: send the sample rate
  ws.send(16000);

}

function recorderProcess(e) {
    var left = e.inputBuffer.getChannelData(0);
    ws.send(convertFloat32ToInt16(left));
    console.log('Sending audio to websocket.');
}

function convertFloat32ToInt16(buffer) {
  l = buffer.length;
  buf = new Int16Array(l);
  while (l--) {
    buf[l] = Math.min(1, buffer[l])*0x7FFF;
  }
  return buf.buffer;
}

