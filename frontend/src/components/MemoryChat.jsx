import { useState } from "react";

export default function MemoryChat() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    // Add user message to history
    setHistory((prev) => [...prev, { role: "user", content: question }]);

    try {
      const res = await fetch("http://localhost:8000/query/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: question,
          top_k: 5
        }),
      });

      const data = await res.json();
      const answer = data.answer || "No answer received.";

      // Add assistant response
      setHistory((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to backend." }
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Ask Your Memory</h2>

      <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
        {history.map((msg, idx) => (
          <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-500 text-sm">Thinking...</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-grow border px-3 py-2 rounded-lg text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}
