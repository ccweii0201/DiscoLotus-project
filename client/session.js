
export function connectWebSocket(apiUrl) {
    //websocket連線
  if (window.ws) {
    console.warn("WebSocket 已經存在，避免重複連線");
    return;
  }
  
  window.ws = new WebSocket(apiUrl);
  
  window.ws.onopen = function () {
    console.log('連線成功');
    let sessionID = sessionStorage.getItem('sessionId')
    //沒有id創一個
    if (!sessionID) {
      console.log("沒有id 創建一個")
      window.ws.send(JSON.stringify({ type: 'createNewSessionID' }));

      setTimeout(() => {
        window.ws.send("open");
    }, 1000); 
    }
  };
  
  window.ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
  
    if (data.type === 'sessionUpdate') {
      console.log(data)

      console.log('獲取新id:', data.sessionId)
      sessionStorage.setItem('sessionId', data.sessionId);
      updateOpenStatus(true);
    }
  
    if (data.type === 'sessionExpired') {
      console.log(data)
      console.log('id已失效')
      updateOpenStatus(false);
      sessionStorage.removeItem('sessionId');
     
      if (window.ws) {
        window.ws.close();
        window.ws = null
      }
    }
  }
  
  
  window.ws.onclose = function () {
    console.log("連線關閉");
    sessionStorage.removeItem('sessionId')
    window.ws = null;
  };
  window.ws.onerror = function (error) {
    console.error("錯誤" + error);
  }
  }
  
  export function updateOpenStatus(status) {
  //更新狀態
  window.isOpne = status;
  //切換開關按鈕圖片
  const statusImg = window.open.querySelector('img');
  statusImg.setAttribute('src', `img/dj台(1)_${status ? '開關-開' : '開關-關'}.png`)
  const btn = document.getElementById('on')
  if(status){
    btn.style.left="10%"
    btn.style.width="63%"
  }
  else{
     btn.style.width="61%"
      btn.style.left="14%"
  }

 
  const elements = document.querySelectorAll('button');
  const disc = document.getElementById('discImg')
  // 只選取可交互的元素
  // elements.forEach(element => {
  //   if (element !== open) { // 排除 open 按鈕，其他元素根據狀態禁用或啟用
  //     element.disabled = !status; // 如果狀態為關閉，禁用所有元素，否則恢復啟用
  //   }
  // });
  }
  
  