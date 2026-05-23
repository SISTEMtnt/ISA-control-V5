const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

/* =========================
   STATE (MISSION DATA)
========================= */

let state = {
  time: 20,
  status: "SYSTEMS NOMINAL",
  launched: false,
  aborted: false,
  elapsed: 0
};

/* =========================
   STATIC PANEL (optional)
========================= */

app.use(express.static("panel"));

/* =========================
   BROADCAST HELPERS
========================= */

function broadcast(payload) {
  const msg = JSON.stringify(payload);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

/* =========================
   API ROUTES
========================= */

/**
 * Update mission state
 */
app.post("/update", (req, res) => {
  state = { ...state, ...req.body };

  broadcast({
    type: "update",
    state
  });

  res.json({ ok: true, state });
});

/**
 * Abort mission
 */
app.post("/abort", (req, res) => {
  state.aborted = true;

  broadcast({
    type: "abort",
    state
  });

  res.json({ ok: true });
});

/**
 * Debug state
 */
app.get("/state", (req, res) => {
  res.json(state);
});

/* =========================
   WEBSOCKET
========================= */

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({
    type: "update",
    state
  }));
});

/* =========================
   START SERVER
========================= */

server.listen(PORT, () => {
  console.log(`🚀 Mission Control running on port ${PORT}`);
});
