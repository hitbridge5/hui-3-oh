import React, { useState } from 'react';
import Sidebar from '../app/components/Sidebar.jsx';
import Editor from '../app/components/Editor.jsx';

const mockUser = {
  name: 'Alex Rivera',
  avatarUrl: 'https://api.dicebear.com/6.x/thumbs/svg?seed=Alex'
};

function App() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e293b',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>HUI 3.5 Editor</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem' }}>{mockUser.name}</span>
          <img
            src={mockUser.avatarUrl}
            alt="Avatar"
            width="32"
            height="32"
            style={{ borderRadius: '50%' }}
          />
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar: fixed width */}
        <div style={{ width: '300px', backgroundColor: '#202123', padding: '1rem', overflowY: 'auto' }}>
          <Sidebar
            templates={templates}
            onTemplatesGenerated={setTemplates}
            onSelectTemplate={setSelectedTemplate}
          />
        </div>

        {/* Editor: full remaining space */}
        <div style={{ flex: 1, backgroundColor: '#343541', padding: '2rem', overflowY: 'auto' }}>
          <Editor />
        </div>
      </div>
    </div>
  );
}

export default App;
