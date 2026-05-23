const { ipcRenderer } = require("electron");

let ws = new WebSocket("ws://localhost:3000");

let state = {
  time: 20,
  status: "SYSTEMS NOMINAL",
  launched: false,
  aborted: false
};

const hud = document.getElementById("hud");
const timer = document.getElementById("timer");
const status = document.getElementById("status");
const center = document.getElementById("center");
const abortScreen = document.getElementById("abortScreen");

function pad(n){
  return String(n).padStart(2,'0');
}

/* ================= SERVER SYNC ================= */

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if(data.type === "update"){
    state = data.state;
    updateUI();
  }

  if(data.type === "abort"){
    abortUI();
  }
};

/* ================= UI ================= */

function updateUI(){

  if(state.aborted) return;

  status.innerText = state.status;

  if(!state.launched){

    timer.innerText = `T-00:${pad(state.time)}`;

    if(state.time === 0){
      state.launched = true;
      hud.classList.add("launch");
    }
  }

  else{
    state.elapsed = (state.elapsed || 0) + 1;
    center.innerText = `T+00:${pad(state.elapsed)}`;
  }
}

/* ================= ABORT ================= */

function abortUI(){
  abortScreen.style.display = "flex";
  hud.style.display = "none";
}

/* send abort to electron */
function abortApp(){
  ipcRenderer.send("abort");
}