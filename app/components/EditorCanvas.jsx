export default function EditorCanvas({ html }) {
    console.log('Rendered HTML:', html); // 👈 Add this line
  
    return (
      <div className="flex-1 bg-white p-4 text-black border-r border-gray-400 overflow-auto">
        <h2 className="font-bold text-lg mb-4">Editor Canvas</h2>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-gray-500">No template loaded yet.</p>
        )}
      </div>
    );
  }
  