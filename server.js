const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

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
   STATIC CONTROL PANEL
========================= */

app.use(express.static("panel"));

/* =========================
   WEBSOCKET BROADCAST
========================= */

function broadcast(payload) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
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
 * Get current state (debug)
 */
app.get("/state", (req, res) => {
  res.json(state);
});

/* =========================
   WEBSOCKET CONNECTION
========================= */

wss.on("connection", (ws) => {
  // send current state immediately on connect
  ws.send(JSON.stringify({
    type: "update",
    state
  }));
});

/* =========================
   START SERVER
========================= */

server.listen(3000, () => {
  console.log("🚀 Mission Control running at http://localhost:3000");
});