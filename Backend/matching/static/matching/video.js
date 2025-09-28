const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const peerConnection = new RTCPeerConnection();

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    })
    .catch(error => console.error('Error accessing media devices:', error));

peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};