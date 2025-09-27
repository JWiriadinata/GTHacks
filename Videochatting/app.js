const localVideo = document.getElementById('local-video');
let localStream;
let remoteStream;
let peerConnection;

const callBtn = document.getElementById('call-btn');
const hangupBtn = document.getElementById('hangup-btn');

callBtn.addEventListener('click', call);
hangupBtn.addEventListener('click', hangup);
async function call() {
  try {
    const configuration = { 
      // Add custom iceServers 
       "iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
    };

    // create peer connection object
    peerConnection = new RTCPeerConnection(configuration);

    // add tracks to the connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // set up event listeners for the connection
    peerConnection.addEventListener('track', event => {
      remoteVideo.srcObject = event.streams[0];
      remoteStream = event.streams[0];
    });

    // create offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // send offer to the other client
    // this is where you would use a signaling server
    // to exchange SDP (Session Description Protocol) messages
    // between the two clients
  } catch (error) {
    console.error('Error creating peer connection:', error);
  }
}