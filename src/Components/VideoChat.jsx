import React from 'react'
import '../App.css'
import 'firebase/database'
import classnames from 'classnames'
import TextChatContainer from './TextChatContainer'

export default class VideoChat extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        isLoggedIn: false,
        userToCall: '',
        username: ''
      }
    }

    onLoginClicked = async () => {
        //console.log(this.state.username)
        await this.props.onLogin(this.state.username)
        this.setState({
            isLoggedIn: true
        })
    }

    onStartCallClicked = () => {
        // console.log(this.state.userToCall)
        this.props.startCall(this.state.username, this.state.userToCall)
    }

    // Connected Video Sources
    renderVideos = () => {
        return <div className={classnames("videos", { active: this.state.isLoggedIn })}>
            <div>
                <label>{this.state.username}</label>
                <video ref={this.props.setLocalVideoRef} autoPlay playsInline></video>
            </div>
            <div>
                <label>{this.props.connectedUser}</label>
                <video ref={this.props.setRemoteVideoRef} autoPlay playsInline></video>
            </div>

        </div>
    }

    renderForms = () => {
      return this.state.isLoggedIn
        ?
        <div key='a' className='form'>
          <label>Who would you like to call?</label>
          <input
            value={this.state.userToCall}
            className='my-3 p-4'
            placeholder="Enter a Topic" type="text"
            onChange={e => this.setState({ userToCall: e.target.value })}
          />
          <div key='b' className='right'>
            <button onClick={this.onStartCallClicked} id="call-btn" className="btn btn-outline-dark">Find Them!</button>
          </div>
        </div>
        :
        <div key='b' className='form'>
          <label>What would you like to be called?</label>
          <input value={this.state.username}
            className='my-3 p-4'
            placeholder="A codename!"
            type="text"
            onChange={e => this.setState({ username: e.target.value })}
          />
          <div key='b' className='right my-3'>
            <button onClick={this.onLoginClicked} id="login-btn" className="btn btn-outline-dark">Get in!</button>
          </div>
        </div>
    }

    render () {
      return <section id="container">
        {this.props.connectedUser ? null : this.renderForms()}
        {this.renderVideos()}
        {this.props.connectedUser ? <TextChatContainer className="my-3" sender={this.state.username}/> : null}
      </section>
    }
  }
