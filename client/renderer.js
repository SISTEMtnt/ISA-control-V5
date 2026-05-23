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

/* ================= CONFIG ================= */

const WS_URL =
  location.hostname === "localhost"
    ? "ws://localhost:3000"
    : "wss://YOUR-RENDER-URL.onrender.com";

/* ================= CONNECT ================= */

function connectWS() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ WS connected");
    clearTimeout(reconnectTimer);
  };

  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);

      if (data.type === "update") {
        state = { ...state, ...data.state };
        updateUI();
      }

      if (data.type === "abort") {
        abortUI();
      }
    } catch (e) {
      console.error("WS error:", e);
    }
  };

  ws.onclose = () => {
    console.log("❌ WS lost, reconnecting...");
    reconnectTimer = setTimeout(connectWS, 2000);
  };
}

connectWS();

/* ================= UTIL ================= */

function pad(n) {
  return String(n).padStart(2, "0");
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

/* ================= ELECTRON ================= */

function abortApp() {
  ipcRenderer.send("abort");
}
