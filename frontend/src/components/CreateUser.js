import React, { useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'it', name: 'Italian' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

function CreateUser({ setUserId }) {
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    // Fake user ID for testing
    const fakeId = Math.floor(Math.random() * 1000);
    setUserId(fakeId);
    console.log('User created with ID:', fakeId);
    alert(`User created! ID: ${fakeId}`);
  };

  return (
    <div>
      <h2>Create User</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br />
      <select>
        {LANGUAGES.map(l => <option key={l.code}>{l.name}</option>)}
      </select>
      <br />
      <button onClick={handleSubmit}>Create User</button>
    </div>
  );
}

export default CreateUser;
