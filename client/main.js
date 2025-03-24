import { updateOpenStatus, connectWebSocket } from "./session.js";
import { setupButton, setupSlider1, setupSlider2, setupDisc, setupText, setlight } from "./control.js";
import AudioManager from "./audio.js";

let apiUrl;
apiUrl = 'wss://' + window.location.hostname


document.addEventListener('DOMContentLoaded', function () {
  window.isOpne = false //關閉狀態
  window.open = document.getElementById('on');
  window.ws;
  window.socket = new WebSocket('wss://jgbvvy4fejhkfodvo163d86ppqvfptpj.ui.nabu.casa/api/websocket');
  // window.socket = new WebSocket('ws://127.0.0.1:8123/api/websocket'); //測試環境用
  let wss;


  //一開始都為關閉狀態(初始化)
  updateOpenStatus(false);
  sessionStorage.removeItem('sessionId')
  //esp32 websocket test
  // function connectESP32() {
  //   wss = new WebSocket("ws://172.20.10.2:81")
  //   wss.onopen = () => {
  //     console.log('esp32連接成功')
  //     wss.send('open');
  //   }
  //   wss.onmessage = (event) => {
  //     console.log("ESP32 回應: ", event.data);
  //     document.getElementById("messages").innerText += "ESP32: " + event.data + "\n";
  //   }
  //   wss.onclose = () => {
  //     document.getElementById("status").innerText = "連線狀態: 已斷線";
  //     console.log("WebSocket 連線關閉");
  //   }
  //   wss.onerror = (error) => {
  //     console.error("錯誤", error);
  //   }
  // }
  //開啟/關閉dj台
  open.addEventListener('touchstart', function (e) {
    e.preventDefault();

    if (!isOpne) { //關閉狀態
      console.log('開啟dj台')
      connectWebSocket(apiUrl);
      // connectESP32();
      AudioManager.playSound("djOn");
    }
    else { //開啟狀態
      updateOpenStatus(false);
      console.log('關閉dj台')
      if (ws) {
        window.ws.send("close");
        ws.close();
        ws = null
      }
      AudioManager.playSound("djOn");
    }
  })
  //HA websocket test
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


  connectHA()
  setupButton()
  setupSlider1()
  setupSlider2()
  setupDisc()
  setupText()

})






