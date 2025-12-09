const express = require('express')
const path = require('path');
const app = express()
const port = 3000
const cors = require('cors');

app.use(cors());//needed for Ollama Cross-Origin Requests

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-r1:32b",
      prompt,
      stream: false
    })
  });

  const data = await response.json();

  // Strip hidden reasoning if present
  const clean = data.response
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim();

  res.json({ reply: clean });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/main.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})