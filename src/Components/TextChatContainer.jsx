import React from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import { useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../config";

export default function TextChatContainer(props) {
  const messagesRef = db.collection("messages");

  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {

    e.preventDefault();

    await messagesRef.add({
      text: formValue,
      sender: props.sender,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setFormValue("");

  };

  return (
    <div style={{width: "500px", height: "300px"}}>
      <form onSubmit={sendMessage} className="w-100 mt-5">
        <textarea
          className="w-100"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          rows="3"></textarea>
        <div className="right my-3">
          <button className="btn btn-outline-dark" type="submit">Submit</button>
        </div>
        <main className="w-100 mt-5">
        <div className="chat-area">
          {messages &&
            messages.reverse().map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        </div>
      </main>
      </form>
    </div>
  );
}

function ChatMessage(props) {
  const { text, sender } = props.message;

  return (
    <div>
      <p>
      <strong>{sender}:</strong> {text}
      </p>
    </div>
  );
}
