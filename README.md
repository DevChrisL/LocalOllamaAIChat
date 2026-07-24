# Local AI Workspace

A local AI workspace web application using **Ollama DeepSeek-R1 (32B)** as the language model or any other.  
The project features a **React frontend** and **Angular frontend**, **Express.js backend**, and is structured for easy integration of **SQLite conversation history** in the future.

---

## Features

- Chat with a **local LLM (DeepSeek-R1:32B)** via Ollama.  
- React frontend with live chat interface.  
- Express backend handling API requests.  
- Ready for **SQLite-based conversation history**.  
- Local-only setup — fully private, no cloud required.  

---

## Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/DevChrisL/LocalOllamaAIChat.git
cd localollamaaichat
```

### 2. Install backend dependencies
Under the root folder
```bash
npm install
```

Then Express.js backend
```bash
cd backend
npm install
```

Make sure you have Ollama installed:
https://ollama.com/

Node 18+ includes fetch, so no need to install node-fetch.

### 3. Install frontend dependencies
Make sure you have Node.js installed:
https://nodejs.org/en/download

Then install Angular dependencies under the angular-llm-chat folder
```bash
cd angular-llm-chat
npm install 
```

Then install React dependencies under the react-llm-chat folder
```bash
cd react-llm-chat
npm install 
```

---

## Running the App
### 1. Start with Concurrently
Make sure Ollama is installed and the DeepSeek-R1 model is available:

```bash
npm run dev
```

Backend will run on http://localhost:3000

Frontend will run on http://localhost:3001

---

## License

MIT License. Free for personal and commercial use.