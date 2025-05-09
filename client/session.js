import { state } from "./state.js";

export function connectWebSocket(apiUrl) {
  //websocket連線
  // if (window.ws) {
  //   console.warn("WebSocket 已經存在，避免重複連線");
  //   return;
  // }
  let heartbeatInterval = null;
  window.ws = new WebSocket(apiUrl);

  window.ws.onopen = function () {
    console.log('連線成功');
    let sessionID = sessionStorage.getItem('sessionId');
    //沒有id創一個
    if (!sessionID) {
      console.log("沒有id 創建一個")
      window.ws.send(JSON.stringify({ type: 'createNewSessionID' }));

      // 在這裡發送 bgText_12 訊息
      // window.ws.send('bgText_345');
      // console.log('bgText_345')
      //  musicWs.send('playBG');
      // setTimeout(() => {
      //   window.ws.send("open");
      // }, 300);
    }
    heartbeatInterval = setInterval(() => {
      if (window.ws.readyState === WebSocket.OPEN) {
        window.ws.send('ping');
      }
    }, 30000); // 30秒
  };


  function showSessionMessage(message) {
    const sessionMessageElement = document.getElementById('sessionMessage');
    sessionMessageElement.textContent = message;  // 顯示訊息
    sessionMessageElement.style.display = 'block';  // 顯示提示文字
  }

  function hideSessionMessage() {
    const sessionMessageElement = document.getElementById('sessionMessage');
    sessionMessageElement.style.display = 'none';  // 隱藏提示文字
  }

  window.ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    //獲得id
    if (data.type === 'sessionUpdate') {
      console.log(data)
      console.log('獲取新id:', data.sessionId)
      sessionStorage.setItem('sessionId', data.sessionId);
      updateOpenStatus(true); //此時按鈕才可以換
      // window.ws.send("open");
      hideSessionMessage();
    }
    //閒置太久，id過期
    if (data.type === 'sessionExpired') {
      console.log(data)
      console.log('id已失效')
      updateOpenStatus(false);
      sessionStorage.removeItem('sessionId');
      window.ws.send(JSON.stringify({ type: 'ALL', messages: 'close' }));
      // musicWs.send('close');
      showSessionMessage('閒置太久，已將您的使用權移除');
      if (window.ws) {
        window.ws.close();
        window.ws = null
      }
    }
    //避免其他使用者使用
    if (data.type === 'sessionUsed') {
      console.log(data);
      console.log('id已失效，有新的使用者出現');
      updateOpenStatus(false);
      window.ws.send("close");
      // musicWs.send('close');
      sessionStorage.removeItem('sessionId');
      showSessionMessage('使用權已失效，有新的用戶使用');
      if (window.ws) {
        window.ws.close();
        window.ws = null
      }
    }
  }


  window.ws.onclose = function (event) {
    console.log("連線關閉");
    console.log("關閉代碼:", event.code);
    console.log("關閉原因:", event.reason);
    console.log("是否乾淨關閉:", event.wasClean); // true 表示正常關閉
    updateOpenStatus(false);
    sessionStorage.removeItem('sessionId');
    document.body.classList.remove("hide-overlay");
    window.ws = null;
    // musicWs.send('close');
    clearInterval(heartbeatInterval);
    window.socket.send(JSON.stringify({
      id: state.requestid++,
      type: 'call_service',
      domain: 'light',
      service: 'turn_on',
      service_data: { rgb_color: [0, 0, 0] },
      target: { entity_id: lights } //所有裝置
    }));
  };
  window.ws.onerror = function (error) {
    console.error("錯誤" + error);
  }
}

export function updateOpenStatus(status) {
  // const lights = [
  //   "light.spotlights_green",
  //   "light.spotlights_6c1c",
  //   "light.spotlights_9eac"
  // ];


  //更新狀態
  window.isOpne = status;
  //切換開關按鈕圖片
  const statusImg = window.open.querySelector('img');
  statusImg.setAttribute('src', `img/dj台(1)_${status ? '開關-開' : '開關-關'}.png`)
  const btn = document.getElementById('on')
  if (status) {
    btn.style.width = "41%"
    btn.style.left = "30%"
    btn.style.top = "10%"
    btn.style.height = "70%"
    // window.socket.send(JSON.stringify({
    //   id: state.requestid++,
    //   type: 'call_service',
    //   domain: 'light',
    //   service: 'turn_on',
    //   service_data: { rgb_color: [0, 0, 0] },
    //   target: { entity_id: lights } //所有裝置
    // }));
  }
  else {
    btn.style.width = "41%"
    btn.style.left = "30%"
    btn.style.top = "10%"
    btn.style.height = "70%"

    // if (window.socket.readyState === WebSocket.OPEN) {
    //   window.socket.send(JSON.stringify({
    //     id: state.requestid++,
    //     type: 'call_service',
    //     domain: 'light',
    //     service: 'turn_on',
    //     service_data: { rgb_color: [0, 0, 0] },
    //     target: { entity_id: lights } //所有裝置
    //   }))
    // };
  }
  const elements = document.querySelectorAll('button');
  const disc = document.getElementById('discImg')
  //只選取可交互的元素
  elements.forEach(element => {
    if (element !== open) { // 排除 open 按鈕，其他元素根據狀態禁用或啟用
      element.disabled = !status; // 如果狀態為關閉，禁用所有元素，否則恢復啟用
    }
  });
}

