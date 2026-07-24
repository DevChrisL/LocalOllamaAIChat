const express = require("express");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

//SQLite database
const db = new sqlite3.Database("./chat.db", (err) => {
  if (err) console.error(err);
  else console.log("Connected to SQLite database");
});

//create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER,
      role TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id)
    )
  `);
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

//create new conversation query
app.post("/api/conversation/new", (req, res) => {
  db.run("INSERT INTO conversations DEFAULT VALUES", function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ conversationId: this.lastID });
  });
});

//list conversations query
app.get("/api/conversations", (req, res) => {
  db.all("SELECT id, created_at FROM conversations ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ conversations: rows });
  });
});

//get history query
app.get("/api/conversation/:id", (req, res) => {
  const conversationId = req.params.id;
  db.all(
    "SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    [conversationId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messages: rows });
    }
  );
});

//chat endpoint
app.post("/api/chat", async (req, res) => {
  const { prompt, conversationId } = req.body;

  if (!conversationId) return res.status(400).json({ error: "Missing conversationId" });

  //save user message
  db.run(
    "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
    [conversationId, "user", prompt],
    async (err) => {
      if (err) return res.status(500).json({ error: err.message });

      //load previous messages
      db.all(
        "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
        [conversationId],
        async (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });

          const messages = rows.map((m) => ({ role: m.role, content: m.content }));
          //error check
          try {
            //call ollama
            const ollamaRes = await fetch("http://localhost:11434/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "deepseek-r1:32b",
                messages,
                stream: false,
              }),
            });

            const data = await ollamaRes.json();
            const reply = data.message?.content || "";

            //save AI reply
            db.run(
              "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
              [conversationId, "llm", reply],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ reply });
              }
            );
          } catch (fetchErr) {
            console.error(fetchErr);
            res.status(500).json({ error: "Failed to call Ollama API" });
          }
        }
      );
    }
  );
});

//fron-end launch
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/main.html"));
});

app.listen(port, () => {
  console.log(`Express backend listening on http://localhost:${port}`);
});

//delete messages query
app.delete("/api/conversation/:id", (req, res) => {
  const conversationId = req.params.id;

  db.serialize(() => {
    db.run("DELETE FROM messages WHERE conversation_id = ?", [conversationId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
    });

    db.run("DELETE FROM conversations WHERE id = ?", [conversationId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});