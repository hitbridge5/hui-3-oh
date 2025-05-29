'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import EditorCanvas from './components/EditorCanvas';
import PropertiesPanel from './components/PropertiesPanel';

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  return (
    <main className="flex h-screen w-screen">
      <Sidebar
        onTemplatesGenerated={setTemplates}
        onSelectTemplate={setSelectedTemplate}
        templates={templates}
      />
      <EditorCanvas html={selectedTemplate} />
      <PropertiesPanel />
    </main>
  );
}
