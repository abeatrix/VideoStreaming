import React, { Component } from 'react'
import '../App.css'
import 'firebase/database'
import { createOffer, initiateConnection, startCall, sendAnswer, addCandidate, initiateLocalStream, listenToConnectionEvents } from './RTCModule'
import firebase from 'firebase/app'
import fbConfig from '../config'
import VideoChat from './VideoChat'
import { doOffer, doAnswer, doLogin, doCandidate } from './FBModule'
import 'webrtc-adapter'

export default class VideoChatContainer extends Component {
    constructor(props){
        super(props)
        this.state = {
            database: null,
            connectedUser: null,
            localStream: null,
            localConnection: null
        }
        this.localVideoRef = React.createRef()
        this.remoteVideoRef = React.createRef()
    }

    componentDidMount = async () => {
        //initialize firebase
        firebase.initializeApp(fbConfig)

        //getting local video stream
        const localStream = await initiateLocalStream()
        this.localVideoRef.srcObject = localStream

        // create the local connection
        const localConnection = await initiateConnection()
        this.setState({
            database: firebase.database(),
            localStream,
            localConnection
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        //prevent re-renders if not necessary
        // do not re-render if the state of database has changed
        if (this.state.database !== nextState.database) {
            return false
        }
        if (this.state.localStream !== nextState.localStream) {
            return false
        }
        if (this.state.localConnection !== nextState.localConnection) {
            return false
        }
        // otherwise update UI
        return true
    }



    startCall = async (username, userToCall) => {
        const {localConnection, database, localStream} = this.state;
        // listen to the events first
        listenToConnectionEvents(localConnection, username, userToCall, database, this.remoteVideoRef, doCandidate)
        // create a new offer
        createOffer(localConnection, localStream, userToCall, doOffer, database, username)

    }

    onLogin = async (username) => {
        //login phase
        return await doLogin(username, this.state.database, this.handleUpdate)

    }

    setLocalVideoRef = ref => {
        this.localVideoRef = ref
    }

    setRemoteVideoRef = ref => {
        this.remoteVideoRef = ref
    }

    handleUpdate = (notif, username) => {
        // read the received notif and apply it
        const { database, localConnection, localStream} = this.state

        if(notif){
            switch(notif.type){
                case 'offer':
                    this.setState({
                        connectedUser: notif.from
                    })
                    // listen to the connection events
                    listenToConnectionEvents(localConnection, username, notif.form , database, this.remoteVideoRef, doCandidate)

                    //send an answer
                    sendAnswer(localConnection, localStream, notif, doAnswer, database, username) //doAnswer fb function to send answer to the first user

                    break;

                case 'answer':
                    this.setState({
                        connectedUser: notif.from
                    })
                    // start the call
                    startCall(localConnection)
                    break;

                case 'candidate':
                    //add candidate to connections
                    addCandidate(localConnection, notif)

                    break;

                default:

                    break;

            }
        }
    }



    render() {
        return (
           <VideoChat
           startCall={this.startCall}
           onLogin={this.onLogin}
           setLocalVideoRef={this.setLocalVideoRef}
           setRemoteVideoRef={this.setRemoteVideoRef}
           connectedUser={this.state.connectedUser}
           />
        )
    }
}
