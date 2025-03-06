import { updateOpenStatus, connectWebSocket } from "./session.js";
import { setupButton, setupSlider, setupDisc,setupText} from "./control.js";
import AudioManager from "./audio.js";

let apiUrl;
apiUrl = 'wss://' + window.location.hostname + '/'


document.addEventListener('DOMContentLoaded', function () {
  window.isOpne = false //關閉狀態
  window.open = document.getElementById('on');
  window.ws;
  let wss;

  //一開始都為關閉狀態(初始化)
    updateOpenStatus(false);
    sessionStorage.removeItem('sessionId')
  //esp32 websocket test
  function connectESP32(){
    wss=new WebSocket("ws://172.20.10.4:81")
    wss.onopen=()=>{
      document.getElementById("status").innerText="連接狀態:已連接";
      console.log('esp32連接成功')
      wss.send('open');
    }
    wss.onmessage=(event)=>{
      console.log("ESP32 回應: ", event.data);
      document.getElementById("messages").innerText += "ESP32: " + event.data + "\n";
    }
    wss.onclose=()=>{
      document.getElementById("status").innerText = "連線狀態: 已斷線";
      console.log("WebSocket 連線關閉");
    }
    wss.onerror=(error)=>{
      console.error("錯誤" , error);
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

    setupButton()
    setupSlider()
    setupDisc()
    setupText()
  })

 




