import React, { Component } from "react";
import "../App.css";
import "firebase/database";
import {
  createOffer,
  initiateConnection,
  startCall,
  sendAnswer,
  addCandidate,
  initiateLocalStream,
  listenToConnectionEvents,
} from "../Helpers/RTC";
import firebase from "firebase/app";
import {fbConfig} from '../config'
import VideoChat from "./VideoChat";
import { doOffer, doAnswer, doLogin, doCandidate } from "../Helpers/FB";
import "webrtc-adapter";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class VideoChatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      database: null,
      connectedUser: null,
      localStream: null,
      localConnection: null,
    };
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
  }

  componentDidMount = async () => {
    //initialize firebase
    if(!firebase.apps.length){
      firebase.initializeApp(fbConfig);
    }

    //getting local video stream
    const localStream = await initiateLocalStream();
    this.localVideoRef.srcObject = localStream;

    // create the local connection
    const localConnection = await initiateConnection();
    this.setState({
      database: firebase.database(),
      localStream,
      localConnection,
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    //prevent re-renders if not necessary
    // do not re-render if the state of database has changed
    if (this.state.database !== nextState.database) {
      return false;
    }
    if (this.state.localStream !== nextState.localStream) {
      return false;
    }
    if (this.state.localConnection !== nextState.localConnection) {
      return false;
    }
    // otherwise update UI
    return true;
  }

  startCall = async (username, userToCall) => {
    const { localConnection, database, localStream } = this.state
    listenToConnectionEvents(localConnection, username, userToCall, database, this.remoteVideoRef, doCandidate)
    // create an offer
    createOffer(localConnection, localStream, userToCall, doOffer, database, username)
  }

  onLogin = async (username) => {
    //login phase
    return await doLogin(username, this.state.database, this.handleUpdate);
  };

  setLocalVideoRef = (ref) => {
    this.localVideoRef = ref;
  };

  setRemoteVideoRef = (ref) => {
    this.remoteVideoRef = ref;
  };

  handleUpdate = (notif, username) => {
    // read the received notif and apply it
    const { database, localConnection, localStream } = this.state;

    if (notif) {
      switch (notif.type) {
        case "offer":
          this.setState({
            connectedUser: notif.from,
          });
          // listen to connection events
          listenToConnectionEvents(
            localConnection,
            username,
            notif.from,
            database,
            this.remoteVideoRef,
            doCandidate
          );

          sendAnswer(
            localConnection,
            localStream,
            notif,
            doAnswer,
            database,
            username
          );
          break;
        case "answer":
          this.setState({
            connectedUser: notif.from,
          });
          startCall(localConnection, notif);
          break;
        case "candidate":
          addCandidate(localConnection, notif);
          break;
        default:
          break;
      }
    }
  };

  render() {
    return (
      <>
      <ToastContainer/>
      <VideoChat
        startCall={this.startCall}
        onLogin={this.onLogin}
        setLocalVideoRef={this.setLocalVideoRef}
        setRemoteVideoRef={this.setRemoteVideoRef}
        connectedUser={this.state.connectedUser}
      />
      </>
    );
  }
}
