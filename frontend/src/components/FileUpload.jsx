import { useRef, useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      setResponse(null);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setResponse(null);
      setError(null);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Upload PDF, DOCX, or TXT.");
      return false;
    }
    if (file.size > maxSize) {
      setError("File is too large. Max 5 MB allowed.");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
    }

    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-gray-500 transition-all"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        />
        <p className="text-gray-600 text-sm">Drag & drop a file here or click to select</p>
        {file && (
          <p className="mt-2 text-gray-800 font-medium text-sm">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-red-500 text-sm">{error}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-4 bg-black text-white px-5 py-2 rounded hover:bg-gray-900 transition-all disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {response && (
        <div className="mt-6 border-t pt-4 text-sm text-gray-700">
          <p><strong>Filename:</strong> {response.filename}</p>
          <p><strong>Type:</strong> {response.type}</p>
          <p><strong>Upload Time:</strong> {new Date(response.upload_time).toLocaleString()}</p>
          <p className="mt-2"><strong>Content Preview:</strong></p>
          <pre className="mt-1 p-2 bg-gray-50 rounded max-h-60 overflow-y-auto whitespace-pre-wrap">
            {response.content}
          </pre>
        </div>
      )}
    </div>
  );
}
