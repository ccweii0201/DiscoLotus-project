let apiUrl;
apiUrl='ws://'+window.location.hostname+':3000/'

document.addEventListener('DOMContentLoaded', function () {
  let isOpne = false //關閉狀態
  const open = document.getElementById('on');
  let ws;

  //更新狀態
  function updateOpenStatus(status) {
    isOpne = status;
    //切換開關按鈕圖片
    const statusImg = open.querySelector('img');
    statusImg.setAttribute('src', `img/dj台-${status ? '開啟' : '關閉'}.png`)

    const elements = document.querySelectorAll('button');
    const disc=document.getElementById('discImg')
    // 只選取可交互的元素
    elements.forEach(element => {
      if (element !== open) { // 排除 open 按鈕，其他元素根據狀態禁用或啟用
        element.disabled = !status; // 如果狀態為關閉，禁用所有元素，否則恢復啟用
      }
    });
  }

  //一開始都為關閉狀態(初始化)
  updateOpenStatus(false);
  sessionStorage.removeItem('sessionId')
  
  //websocket連線
  function connectWebSocket(){
    if (ws) {
      console.warn("WebSocket 已經存在，避免重複連線");
      return;
    }

    ws=new WebSocket(apiUrl);

    ws.onopen=function(){
      console.log('連線成功');
      let sessionID=sessionStorage.getItem('sessionId')
      //沒有id創一個
      if(!sessionID){
        console.log("沒有id 創建一個")
        ws.send(JSON.stringify({type:'createNewSessionID'}));
      }
    };

    ws.onmessage=function(event){
      const data=JSON.parse(event.data);

      if(data.type==='sessionUpdate'){
        console.log(data)
        console.log('獲取新id:',data.sessionId)
        sessionStorage.setItem('sessionId', data.sessionId);
        updateOpenStatus(true);
      }

      if(data.type==='sessionExpired'){
        console.log(data)
        console.log('id已失效')
        updateOpenStatus(false);
        sessionStorage.removeItem('sessionId')
        if(ws){
          ws.close();
          ws=null
        }
      }
    }


    ws.onclose=function(){
      console.log("連線關閉");
      sessionStorage.removeItem('sessionId')
      ws=null;
    };
    ws.onerror=function(error){
      console.error("錯誤"+error);
    }
  }

  //開啟/關閉dj台
  open.addEventListener('touchstart',function (e) {
    e.preventDefault();

    if (!isOpne) { //關閉狀態
      console.log('開啟dj台')
      connectWebSocket()
    }
    else{ //開啟狀態
      updateOpenStatus(false);
      console.log('關閉dj台')
      if(ws){
        ws.close();
        ws=null
      }
    }
  })


  //六個功能按鈕切換 ->控制燈光
  function toggleButtonImg(buttonId, defaultSrc, activeSrc, buttonConfigs) {
    const button = document.getElementById(buttonId);
    let touchStarted = false;

    // 處理滑鼠點擊(電腦)
    button.addEventListener('click', handleToggle);

    // 處理觸摸事件(手機)
    button.addEventListener('touchstart', function (e) {
      e.preventDefault(); // 防止觸發點擊事件
      touchStarted = true;
    });
    button.addEventListener('touchend', function (e) {
      e.preventDefault(); // 防止觸發點擊事件
      if (touchStarted) {
        handleToggle(e);
        touchStarted = false;
      }
    });

    function handleToggle(e) {

      if (button.disabled) {
        return;
      }
      const img = button.querySelector('img');
      const currentSrc = img.getAttribute('src');

      if (currentSrc === activeSrc) {
        img.setAttribute('src', defaultSrc);
        img.style.filter = 'drop-shadow(0 3px 0 #b7b7b6)';
      } else {
        buttonConfigs.forEach(config => {
          const otherButton = document.getElementById(config.id);
          const otherImg = otherButton.querySelector('img');
          if (config.id === buttonId) {
            img.setAttribute('src', activeSrc);
            img.style.filter = 'drop-shadow(0 0px 0 #b7b7b6)';
          } else {
            otherImg.setAttribute('src', config.defaultSrc);
            otherImg.style.filter = 'drop-shadow(0 3px 0 #b7b7b6)';
          }
        });
      }
    }
  }
  const buttonConfigs = [
    { id: 'greenlight', defaultSrc: 'img/dj台-13.png', activeSrc: 'img/dj台-按鈕-04.png' },
    { id: 'pinklight', defaultSrc: 'img/dj台-14.png', activeSrc: 'img/dj台-按鈕-05.png' },
    { id: 'yellowlight', defaultSrc: 'img/dj台-15.png', activeSrc: 'img/dj台-按鈕-06.png' },
    { id: 'function1', defaultSrc: 'img/dj台-按鈕-16.png', activeSrc: 'img/dj台-按鈕-07.png' },
    { id: 'function2', defaultSrc: 'img/dj台-按鈕-16.png', activeSrc: 'img/dj台-按鈕-08.png' },
    { id: 'function3', defaultSrc: 'img/dj台-按鈕-16.png', activeSrc: 'img/dj台-按鈕-09.png' }
  ];
  buttonConfigs.forEach(config => {
    toggleButtonImg(config.id, config.defaultSrc, config.activeSrc, buttonConfigs);
  });

  //slider滑動 ->蓮花開合 
  const sliders = document.querySelectorAll('.slider img');
  sliders.forEach((slider) => {
    let isDragging = false; //是否在拖移
    let startY = 0; //手指觸碰時的座標
    let initialTop = 0; //圖片最初的top值

    //抓取範圍
    const container = slider.parentElement;
    const containerHeight = container.offsetHeight;
    const imageHeight = slider.offsetHeight;


    const minTop = -10;
    const maxTop = containerHeight - imageHeight + 15; //+20手動調整

    slider.addEventListener('touchstart', (e) => {
      const sessionId=sessionStorage.getItem('sessionId')
      if(!sessionId) return;
      isDragging = true;
      startY = e.touches[0].clientY;
      initialTop = parseInt(window.getComputedStyle(slider).top) || 0;
      console.log("containerHeight:" + containerHeight)
      console.log("imageHeight" + imageHeight)
    });
    slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;

      e.preventDefault();

      const deltaY = (e.touches[0].clientY - startY)/1.8;
      let newTop = initialTop + deltaY;

      if (newTop < minTop) newTop = minTop;
      if (newTop > maxTop) newTop = maxTop;

      slider.style.top = `${newTop}px`;
    });
    slider.addEventListener('touchend', () => {
      isDragging = false;
    })
  })

  //disc轉動 ->蓮花旋轉
  let isTouching = false; //是否觸碰照片
  let lastAngle = 0 //初始角度
  let startX = 0 
  let startY = 0 //紀錄觸碰時的座標
  let lastTime = 0; 

  const rotateDisc = document.getElementById('discImg');
  rotateDisc.addEventListener('touchstart', (e) => {
    const sessionId=sessionStorage.getItem('sessionId')
    if(!sessionId) return;
    isTouching = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lastTime = Date.now();
  });
  rotateDisc.addEventListener('touchmove', (e) => {
    if (!isTouching) return;

    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    //一開始的座標與目前的座標所移動的距離
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    //計算角度
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const currentTime = Date.now();
    //計算當前時間和上次移動的時間差
    //如果時間間隔較短，旋轉速度會快；如果時間間隔較長，旋轉速度會變慢。
    const timeDiff = currentTime - lastTime; 

    const rotation = (lastAngle + angle * (timeDiff / 100)) % 360; 
    rotateDisc.style.transform = `rotate(${rotation}deg)`;

    lastAngle = rotation;

    startX = currentX;
    startY = currentY;

      lastTime = currentTime;
  });
  rotateDisc.addEventListener('touchend', (e) => {
    isTouching = false;
  });
});

