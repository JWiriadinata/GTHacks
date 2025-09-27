import React from 'react';

function FindMatch({ setMatchRoom }) {
  const handleFind = () => {
    // Fake match for testing
    const fakeRoom = 'room_1_2';
    setMatchRoom(fakeRoom);
    console.log('Matched with room:', fakeRoom);
    alert('Matched with a test user!');
  };

  return (
    <div>
      <h2>Find Match</h2>
      <button onClick={handleFind}>Find Match</button>
    </div>
  );
}

export default FindMatch;
