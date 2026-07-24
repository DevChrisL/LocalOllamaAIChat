import React, { useEffect, useRef, useState } from "react";

function App() {
  //initialize variables, array used to store messages, conversations, etc
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversationList, setConversationList] = useState([]);
  const bottomRef = useRef(null);

  //load conversations
  useEffect(() => {
    fetch("http://localhost:3000/api/conversations")//endpoint for deepseek
      .then(res => res.json())
      .then(data => setConversationList(data.conversations));
  }, []);

  //load messages when conversation changes
  useEffect(() => {
    if (!conversationId) return;

    fetch(`http://localhost:3000/api/conversation/${conversationId}`)//endpoint for deepseek
      .then(res => res.json())
      .then(history => setMessages(history.messages || []));
  }, [conversationId]);

  //scroll down on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //send user prompt
  const sendPrompt = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    //error check for message
    try {
      const res = await fetch("http://localhost:3000/api/chat", {//endpoint for deepseek
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content, conversationId }),
      });

      const data = await res.json();
      const aiMessage = { role: "llm", content: data.reply || "" };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending prompt:", err);
    }
  };

  //create new conversation
  const createConversation = async () => {
    const res = await fetch("http://localhost:3000/api/conversation/new", { method: "POST" });//endpoint for deepseek
    const data = await res.json();
    const newId = data.conversationId;
    setConversationId(newId);
    setMessages([]);
    setConversationList(prev => [{ id: newId, created_at: new Date().toISOString() }, ...prev]);
  };

  //delete conversation
  const deleteConversation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    await fetch(`http://localhost:3000/api/conversation/${id}`, { method: "DELETE" });//endpoint for deepseek
    setConversationList(prev => prev.filter(c => c.id !== parseInt(id)));
    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }
  };
  //styling for buttons and text boxes
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Ollama Local AI Workspace</h1>

      <div style={{ marginBottom: "10px" }}>
        <select
          value={conversationId || ""}
          onChange={e => setConversationId(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px" }}
        >
          <option value="" disabled>Select a conversation</option>
          {conversationList.map(c => (
            <option key={c.id} value={c.id}>
              {`#${c.id} (${new Date(c.created_at).toLocaleString()})`}
            </option>
          ))}
        </select>

        <button onClick={createConversation} style={{ ...styles.button, marginLeft: "10px", padding: "6px 12px" }}>
          New Conversation
        </button>

        {conversationId && (
          <button
            onClick={() => deleteConversation(conversationId)}
            style={{ ...styles.button, marginLeft: "10px", padding: "6px 12px", background: "#ef4444" }}
          >
            Delete
          </button>
        )}
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{ ...styles.message, ...(msg.role === "user" ? styles.userMessage : styles.aiMessage) }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          rows="2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.textarea}
        />
        <button onClick={sendPrompt} style={styles.button}>Send</button>
      </div>
    </div>
  );
}
//set styles
const styles = {
  page: { maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif" },
  title: { textAlign: "center" },
  chatBox: { border: "1px solid #ccc", borderRadius: "8px", padding: "10px", height: "400px", overflowY: "auto", marginBottom: "10px", background: "#f9f9f9" },
  message: { padding: "10px", borderRadius: "6px", marginBottom: "8px", maxWidth: "70%", whiteSpace: "pre-wrap" },
  userMessage: { background: "#dbeafe", marginLeft: "auto", textAlign: "right" },
  aiMessage: { background: "#e5e7eb", marginRight: "auto" },
  inputRow: { display: "flex", gap: "10px" },
  textarea: { flex: 1, resize: "none", padding: "10px", borderRadius: "6px" },
  button: { padding: "10px 16px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
};

export default App;