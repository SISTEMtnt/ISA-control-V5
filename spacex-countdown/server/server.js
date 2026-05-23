const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

/* =========================
   PORT (RENDER FIX)
========================= */
const PORT = process.env.PORT || 3000;

/* =========================
   STATE
========================= */

let state = {
  time: 20,
  status: "SYSTEMS NOMINAL",
  launched: false,
  aborted: false,
  elapsed: 0
};

/* =========================
   HTTP + WS SERVER
========================= */

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* =========================
   STATIC PANEL (optional)
========================= */

app.use(express.static("panel"));

/* =========================
   SAFE BROADCAST
========================= */

function broadcast(data) {
  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/* =========================
   API
========================= */

app.post("/update", (req, res) => {
  if (!req.body) return res.status(400).json({ error: "No body" });

  state = {
    ...state,
    ...req.body
  };

  broadcast({
    type: "update",
    state
  });

  res.json({ ok: true, state });
});

app.post("/abort", (req, res) => {
  state.aborted = true;

  broadcast({
    type: "abort",
    state
  });

  res.json({ ok: true });
});

app.get("/state", (req, res) => {
  res.json(state);
});

/* =========================
   WEBSOCKET
========================= */

wss.on("connection", (ws) => {
  // send current state immediately
  ws.send(
    JSON.stringify({
      type: "update",
      state
    })
  );

  ws.on("error", () => {
    // prevents crash on bad clients
  });
});

/* =========================
   START
========================= */

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
