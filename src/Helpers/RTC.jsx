import { toast } from 'react-toastify';

export const createOffer = async (
  connection,
  localStream,
  userToCall,
  doOffer,
  database,
  username
) => {
  try {
    connection.addStream(localStream);

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    doOffer(userToCall, offer, database, username);
  } catch (e) {
    toast.error(e);
  }
};

export const initiateLocalStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (e) {
    toast.error(e);
  }
};
export const initiateConnection = async () => {
  try {
    // using Google public stun server
    var config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:74.125.142.127:19302" }, // = stun.l.google.com - Firefox does not support DNS names
        { urls: "stun:stun2.1.google.com:19305" },
      ],
    };

    const conn = new RTCPeerConnection(config);

    return conn;
  } catch (e) {
    toast.error(e);
  }
};

export const listenToConnectionEvents = (
  conn,
  username,
  remoteUsername,
  database,
  remoteVideoRef,
  doCandidate
) => {
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      doCandidate(remoteUsername, event.candidate, database, username);
    }
  };

  // display remote user when add stream to the peer connection
  conn.ontrack = function (e) {
    console.log(conn);
    if (remoteVideoRef.srcObject !== e.streams[0]) {
      remoteVideoRef.srcObject = e.streams[0];
    }
  };
};

export const sendAnswer = async (
  conn,
  localStream,
  notif,
  doAnswer,
  database,
  username
) => {
  try {
    // console.log(conn)
    conn.addStream(localStream);

    const offer = JSON.parse(notif.offer);
    conn.setRemoteDescription(offer);

    // create an answer to an offer
    const answer = await conn.createAnswer();
    conn.setLocalDescription(answer);

    doAnswer(notif.from, answer, database, username);
  } catch (e) {
    toast.error(e);
  }
};

export const startCall = (conn, notif) => {
  const answer = JSON.parse(notif.answer);
  conn.setRemoteDescription(answer);
};

export const addCandidate = (conn, notif) => {
  // apply the new received candidate to the connection
  const candidate = JSON.parse(notif.candidate);
  conn.addIceCandidate(new RTCIceCandidate(candidate));
};
