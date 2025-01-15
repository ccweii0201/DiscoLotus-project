document.addEventListener('DOMContentLoaded', function () {
  // 如果沒有 sessionId，發送請求創建新的 sessionId
  //儲存到sessionStorage
  const sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    createNewSession();
  } else {
    validateSession(sessionId);
  }
  // 如果沒有 sessionId，發送請求創建新的 sessionId
  function createNewSession() {
    fetch('http://localhost:3000/start-session', {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        //儲存id
        sessionStorage.setItem('sessionId', data.sessionId);
        enableButtons();
        //每十秒檢查一次(暫定10s)
        setInterval(validateSession, 10000, data.sessionId);
      })
      .catch(err => console.log('Error starting session:', err));
  }
  // 驗證id
  function validateSession(sessionId) {
    fetch('http://localhost:3000/validate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })
      .then(response => {
        if (response.ok) {
          console.log('Session is valid');
          enableButtons();
        } else {
          console.log('Session is invalid');
          disableButtons();
        }
      })
      .catch(err => console.log(err));
  }

  function enableButtons() {
    const button = document.getElementById('test');
    button.disabled = false;
    button.addEventListener('click', function () {
      fetch('http://localhost:3000/test', { method: 'POST' })
        .then(response => response.text())
        .then(data => {
          console.log(data);
        })
        .catch(err => {
          console.log('error', err);
        });
    });
  }
  function disableButtons() {
    const button = document.getElementById('test');
    if (button) {
      button.disabled = true;
    }
  }
  function toggleButtonImg(buttonId, defaultSrc, activeSrc, buttonConfigs) {
    const button = document.getElementById(buttonId);

    button.addEventListener('click', function () {
      //[震動時間,停止時間]
      window.navigator.vibrate([200, 100, 200]);

      const img = button.querySelector('img');
      const currentSrc = img.getAttribute('src');
      if (currentSrc === activeSrc) {
        // 如果當前圖片是激活狀態，切回原始圖片
        img.setAttribute('src', defaultSrc);
      } else {
        // 切換到激活圖片並重置其他按鈕
        buttonConfigs.forEach(config => {
          const otherButton = document.getElementById(config.id);
          const otherImg = otherButton.querySelector('img');
          if (config.id === buttonId) {
            // 當前按鈕切換到激活圖片
            img.setAttribute('src', activeSrc);
          } else {
            // 其他按鈕重置為原始圖片
            otherImg.setAttribute('src', config.defaultSrc);
          }
        });
      }
    });
  }

  // 按鈕的配置陣列
  const buttonConfigs = [
    { id: 'greenlight', defaultSrc: 'img/dj台-13.png', activeSrc: 'img/dj台-按鈕-04.png' },
    { id: 'pinklight', defaultSrc: 'img/dj台-14.png', activeSrc: 'img/dj台-按鈕-05.png' },
    { id: 'yellowlight', defaultSrc: 'img/dj台-15.png', activeSrc: 'img/dj台-按鈕-06.png' }
  ];

  // 初始化每個按鈕
  buttonConfigs.forEach(config => {
    toggleButtonImg(config.id, config.defaultSrc, config.activeSrc, buttonConfigs);
  });


});

