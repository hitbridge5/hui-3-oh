import EditorComponent from './components/Editor';

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-semibold mb-6">HUI 3.5 GPT Code Editor</h1>
      <EditorComponent />
    </main>
  );
}
