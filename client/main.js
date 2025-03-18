import { updateOpenStatus, connectWebSocket } from "./session.js";
import { setupButton, setupSlider1, setupSlider2, setupDisc, setupText, setlight } from "./control.js";
import AudioManager from "./audio.js";

let apiUrl;
apiUrl = 'wss://' + window.location.hostname + '/'


document.addEventListener('DOMContentLoaded', function () {
  window.isOpne = false //關閉狀態
  window.open = document.getElementById('on');
  window.ws;
  const socket = new WebSocket('wss://jgbvvy4fejhkfodvo163d86ppqvfptpj.ui.nabu.casa/api/websocket');
  let wss;

  //一開始都為關閉狀態(初始化)
  updateOpenStatus(false);
  sessionStorage.removeItem('sessionId')
  //esp32 websocket test
  function connectESP32() {
    wss = new WebSocket("ws://172.20.10.4:81")
    wss.onopen = () => {
      document.getElementById("status").innerText = "連接狀態:已連接";
      console.log('esp32連接成功')
      wss.send('open');
    }
    wss.onmessage = (event) => {
      console.log("ESP32 回應: ", event.data);
      document.getElementById("messages").innerText += "ESP32: " + event.data + "\n";
    }
    wss.onclose = () => {
      document.getElementById("status").innerText = "連線狀態: 已斷線";
      console.log("WebSocket 連線關閉");
    }
    wss.onerror = (error) => {
      console.error("錯誤", error);
    }
  }
  //開啟/關閉dj台
  open.addEventListener('touchstart', function (e) {
    e.preventDefault();

    if (!isOpne) { //關閉狀態
      console.log('開啟dj台')
      connectWebSocket(apiUrl);
      connectESP32();
      AudioManager.playSound("djOn");
    }
    else { //開啟狀態
      updateOpenStatus(false);
      console.log('關閉dj台')
      if (ws) {
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
      console.log('已與 Home Assistant 建立 WebSocket 連接');
      socket.send(JSON.stringify({ type: 'auth', access_token: `${API_KEY}` }));
      // 定義顏色（紅色）
      const rgbColor = [0,255, 0]; // 這是紅色

      // 發送控制燈光顏色的消息
      socket.send(JSON.stringify({
        id: 1,
        type: 'call_service',
        domain: 'light',
        service: 'turn_on',
        service_data: {
          rgb_color: rgbColor // 設定燈光顏色
        },
        target: {
          entity_id: "light.spotlights_green"
        }
      }));
    };

    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      console.log('收到訊息:', data);
    };

    socket.onerror = function (error) {
      console.error('WebSocket 錯誤:', error);
    };

  }

  // function controlLight() {
  //   const rgbColor = [255, 0, 0]; // 這是紅色，數值範圍 0-255，分別代表紅、綠、藍顏色

  //   socket.send(JSON.stringify({
  //     type: 'call_service',
  //     domain: 'light',
  //     service: 'turn_on',
  //     service_data: {
  //       entity_id: 'light.spotlights_green',
  //       rgb_color: rgbColor // 設定燈光顏色
  //     }
  //   }));
  // }
  // document.getElementById('playBtn').addEventListener('click',function(){
  //   controlLight();
  // })

  connectHA()
  setupButton()
  setupSlider1()
  setupSlider2()
  setupDisc()
  setupText()

})






