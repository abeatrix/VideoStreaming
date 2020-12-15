import React from 'react'
import firebase from 'firebase/app';
import 'firebase/firestore';
import {useState} from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import {db} from '../config'

export default function TextChatContainer(props) {
    const messagesRef = db.collection('messages');
    const query = messagesRef.orderBy('createdAt').limit(25);

    const [ messages ] = useCollectionData(query, {idField: 'id'});

    const [formValue, setFormValue] = useState('');

    const sendMessage = async(e) => {
        e.preventDefault();

        await messagesRef.add({
          text: formValue,
          sender: props.sender,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        setFormValue('');
      }

    return (
        <div>
<main>
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'>Submit</button>
      </form>
        </div>
    )
}

function ChatMessage(props) {
    const {text, photoURL, sender} = props.message;

    return (
      <div>
        <img src={photoURL} />
        <p>{sender}: {text}</p>
      </div>
    )
  }
