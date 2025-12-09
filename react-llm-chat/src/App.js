import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  const sendPrompt = async () => {
    if (!input) return;

    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setReply(data.reply);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Ollama local hosted AI chat</h1>

      <textarea
        rows="4"
        style={{ width: "300px" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your prompt here..."
      />

      <br />
      <button onClick={sendPrompt} style={{ marginTop: "10px" }}>
        Enter
      </button>

      <h2>Reply:</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{reply}</pre>
    </div>
  );
}

export default App;
