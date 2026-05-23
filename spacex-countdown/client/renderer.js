const { ipcRenderer } = require("electron");

let ws;
let reconnectTimer;

/* ================= STATE ================= */

let state = {
  time: 20,
  status: "SYSTEMS NOMINAL",
  launched: false,
  aborted: false,
  elapsed: 0
};

/* ================= DOM ================= */

const hud = document.getElementById("hud");
const timer = document.getElementById("timer");
const statusEl = document.getElementById("status");
const center = document.getElementById("center");
const abortScreen = document.getElementById("abortScreen");

/* ================= UTIL ================= */

function pad(n) {
  return String(n).padStart(2, "0");
}

/* ================= WEBSOCKET ================= */

function connectWS() {
  ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("WebSocket connected");
    clearTimeout(reconnectTimer);
  };

  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);

      if (data.type === "update") {
        mergeState(data.state);
        updateUI();
      }

      if (data.type === "abort") {
        abortUI();
      }
    } catch (e) {
      console.error("Invalid WS message", e);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected — reconnecting...");
    reconnectTimer = setTimeout(connectWS, 2000);
  };
}

connectWS();

/* ================= STATE MERGE ================= */

function mergeState(newState) {
  state = { ...state, ...newState };
}

/* ================= UI ================= */

function updateUI() {
  if (state.aborted) return;

  statusEl.innerText = state.status;

  if (!state.launched) {
    timer.innerText = `T-00:${pad(state.time)}`;

    if (state.time <= 0) {
      state.launched = true;
      state.elapsed = 0;
      hud.classList.add("launch");
    }
  } else {
    center.innerText = `T+00:${pad(state.elapsed)}`;
  }
}

/* ================= ABORT ================= */

function abortUI() {
  state.aborted = true;

  abortScreen.style.display = "flex";
  hud.style.display = "none";
}

/* ================= ELECTRON IPC (NO PRELOAD) ================= */

function abortApp() {
  ipcRenderer.send("abort");
}

ipcRenderer.on("abort", () => {
  abortUI();
});
