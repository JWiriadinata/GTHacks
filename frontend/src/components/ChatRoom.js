import React, { useState } from 'react';

function ChatRoom({ roomName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const sendMessage = () => {
    if (text.trim() === '') return;
    setMessages([...messages, text]);
    setText('');
  };

  return (
    <div>
      <h2>Chat Room: {roomName}</h2>
      <div
        style={{
          border: '1px solid black',
          padding: '10px',
          height: '150px',
          overflowY: 'scroll',
          marginBottom: '10px'
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;
