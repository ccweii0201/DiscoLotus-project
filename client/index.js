let apiUrl;
apiUrl='http://'+window.location.hostname+':3000/'

document.addEventListener('DOMContentLoaded', function () {
  let isOpne = false //關閉狀態
  const open = document.getElementById('on');
  let validationInterval;
  //更新狀態
  function updateOpenStatus(status) {
    isOpne = status;
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

  function handleSessionError(error, message) {
    console.error(`${message}:`, error);
    updateOpenStatus(false); //發生錯誤會直接關閉並移除id
    sessionStorage.removeItem('sessionId');
    if (validationInterval) {
      clearInterval(validationInterval); //停止請求
    }
  }
  // 如果沒有 sessionId，發送請求創建新的 sessionId
  async function createNewSession() {
    try {
      const response = await fetch(`${apiUrl}start-session`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      sessionStorage.setItem('sessionId', data.sessionId);

      // 儲存 interval ID
      validationInterval = setInterval(() => {
        validateSession(data.sessionId);
        console.log('驗證請求已發送'); // 用來確認驗證是否在進行
      }, 10000);

      return true;
    } catch (error) {
      handleSessionError(error, 'Error starting session');
      return false;
    }
  }
  // 驗證id
  async function validateSession(sessionId) {
    try {
      const response = await fetch(`${apiUrl}validate-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Session is valid');
      return true;
    } catch (error) {
      handleSessionError(error, 'Session validation failed');
      return false;
    }
  }
  //開啟/關閉dj台
  open.addEventListener('touchstart', async function (e) {
    e.preventDefault();
    const sessionId = sessionStorage.getItem('sessionId');
    if (!isOpne) { //狀態非開啟
      updateOpenStatus(false);
      if (!sessionId) {
        const success = await createNewSession();      //沒有id 產生id
        if (success) {
          updateOpenStatus(true);
        }
      }
    }
    else { //狀態非關閉
      if (validationInterval) {
        clearInterval(validationInterval); //停止驗證
        console.log('已停止驗證請求');
      }
      sessionStorage.removeItem('sessionId');
      updateOpenStatus(false);
    }
  })

  window.addEventListener('beforeunload', function () {
    if (validationInterval) {
      clearInterval(validationInterval);
    }
  });
  //按鈕切換
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

  //slider滑動
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

      const deltaY = e.touches[0].clientY - startY;
      let newTop = initialTop + deltaY;

      if (newTop < minTop) newTop = minTop;
      if (newTop > maxTop) newTop = maxTop;

      slider.style.top = `${newTop}px`;
    });
    slider.addEventListener('touchend', () => {
      isDragging = false;
    })
  })

  //disc轉動
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

