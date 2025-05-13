'use client';

import { useState } from 'react';

export default function MobileButtonManager() {
  const [buttons, setButtons] = useState([
    { label: 'Call Us', link: 'tel:+1234567890' },
    { label: 'Get Quote', link: '/quote' },
  ]);

  const updateButton = (index, field, value) => {
    const updated = [...buttons];
    updated[index][field] = value;
    setButtons(updated);
  };

  const addButton = () => {
    setButtons([...buttons, { label: '', link: '' }]);
  };

  const removeButton = (index) => {
    const updated = buttons.filter((_, i) => i !== index);
    setButtons(updated);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mobile Button Manager</h1>

      {buttons.map((btn, i) => (
        <div key={i} className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
          <div className="mb-2">
            <label className="block font-semibold mb-1">Label</label>
            <input
              type="text"
              value={btn.label}
              onChange={(e) => updateButton(i, 'label', e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1">Link</label>
            <input
              type="text"
              value={btn.link}
              onChange={(e) => updateButton(i, 'link', e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => removeButton(i)}
            className="text-red-600 hover:underline mt-2"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={addButton}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Button
      </button>
    </div>
  );
}
