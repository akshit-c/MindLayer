import './App.css';
import FileUpload from './components/FileUpload';
import MemoryChat from './components/MemoryChat';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Welcome Header */}
      <div className="p-10 bg-white rounded-xl shadow-md max-w-md mx-auto mt-10 mb-10">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to MindLayer</h1>
        <p className="text-gray-500 mt-2">Your personal AI memory system.</p>
      </div>

      {/* File Upload */}
      <FileUpload />

      {/* Memory Chat Interface */}
      <MemoryChat />
    </div>
  );
}

export default App;


