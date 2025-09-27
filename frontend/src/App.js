import React, { useState } from 'react';
import CreateUser from './components/CreateUser';
import AddAvailability from './components/AddAvailability';
import FindMatch from './components/FindMatch';
import ChatRoom from './components/ChatRoom';

function App() {
  const [userId, setUserId] = useState(null);
  const [matchRoom, setMatchRoom] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Language Exchange Test Frontend</h1>
      {!userId && <CreateUser setUserId={setUserId} />}
      {userId && !matchRoom && (
        <>
          <AddAvailability userId={userId} />
          <FindMatch setMatchRoom={setMatchRoom} />
        </>
      )}
      {matchRoom && <ChatRoom roomName={matchRoom} />}
    </div>
  );
}

export default App;
