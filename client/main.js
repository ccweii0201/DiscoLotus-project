import { updateOpenStatus, connectWebSocket } from "./session.js";
import { setupButton, setupSlider1, setupDisc, setupText } from "./control.js";
import AudioManager from "./audio.js";


let apiUrl;
apiUrl = 'wss://' + window.location.hostname+'/';


document.addEventListener('DOMContentLoaded', function () {
  window.isOpne = false //關閉狀態
  window.open = document.getElementById('on'); //開關鍵宣告
  window.ws;
  window.socket = new WebSocket('wss://jgbvvy4fejhkfodvo163d86ppqvfptpj.ui.nabu.casa/api/websocket');
  window.musicWs= new WebSocket('wss://1da2-2001-b400-e3d2-bd5d-48a2-ffcb-b8a6-6024.ngrok-free.app/')
  // window.socket = new WebSocket('ws://127.0.0.1:8123/api/websocket'); //測試環境


  //一開始都為關閉狀態(初始化)
  updateOpenStatus(false);
  sessionStorage.removeItem('sessionId') //一開始沒有id

  //開啟/關閉dj台
  open.addEventListener('touchstart', function (e) {
    e.preventDefault();



    if (!isOpne) { //關閉狀態
      console.log('開啟dj台');
      document.body.classList.add("hide-overlay");
      connectWebSocket(apiUrl);
      AudioManager.playSound("djOn");
    }
    else { //開啟狀態
      updateOpenStatus(false);
      console.log('關閉dj台');
      document.body.classList.remove("hide-overlay"); // 顯示遮罩
      if (ws) {
        window.ws.send("close");
        ws.close();
        ws = null
      }
      AudioManager.playSound("djOn");

    }
  })
  //HA websocket ->setLight
  function connectHA() {
    const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmZGZhYTM4MWIwMTg0NjEyYTcwMjY1ZjljYWU5YTY4YiIsImlhdCI6MTc0MjIzNTA3MiwiZXhwIjoyMDU3NTk1MDcyfQ.VrgCHHG1GEHyUfSEzjOCwuuFtI0SA-qFLHdGSY9gt1c";
    socket.onopen = function () {
      console.log('與 HA 連接成功');
      socket.send(JSON.stringify({ type: 'auth', access_token: `${API_KEY}` }));

    };

    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      console.log('收到訊息:', data);
    };

    socket.onerror = function (error) {
      console.error('WebSocket 錯誤:', error);
    };

  }

  function connectLocal(){
    musicWs.onopen=function () {
      console.log('與 本地電腦 連接成功');
    };
  }

  connectLocal()
  connectHA()
  setupButton()
  setupSlider1()
  setupDisc()
  setupText()

})






