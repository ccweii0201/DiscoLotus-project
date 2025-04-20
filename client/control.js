import AudioManager from "./audio.js";
import { state } from "./state.js";

//button樣式
export function setupButton() {

  let currentLightIndex = 0;

  //燈光顏色(與按鈕id同名)
  const lightColors = {
    greenlight: [0, 255, 0],
    pinklight: [255, 0, 136],
    yellowlight: [255, 162, 0]
  };
  //隨機顏色
  function getRandomColor() {
    return [
      Math.floor(Math.random() * 256), // R
      Math.floor(Math.random() * 256), // G
      Math.floor(Math.random() * 256)  // B
    ];
  }
  // //燈泡裝置
  const lights = [
    "light.spotlights_green",
    "light.spotlights_6c1c",
    "light.spotlights_9eac"
  ];
  //發送訊息(websocket)
  function sendLightCommand(rgbColor) {
    console.log("Sending color command:", rgbColor, "to lights:", lights);
    window.socket.send(JSON.stringify({
      id: state.requestid++,
      type: 'call_service',
      domain: 'light',
      service: 'turn_on',
      service_data: { rgb_color: rgbColor },
      target: { entity_id: lights } //所有裝置
    }));
  }
  // 燈光模式 >隨機一色、隨機三色、單一燈炮
  function startLightEffect(effectType) {
    if (effectType === "same") {
      sendLightCommand(getRandomColor());
    }
    else if (effectType === "different") {
      lights.forEach(light => {
        window.socket.send(JSON.stringify({
          id: state.requestid++,
          type: 'call_service',
          domain: 'light',
          service: 'turn_on',
          service_data: { rgb_color: getRandomColor() },
          target: { entity_id: light }
        }));
      });
    }
    else if (effectType === "onlyone") {
      const lightToTurnOn = lights[currentLightIndex];
      const otherLights = lights.filter((_, i) => i !== currentLightIndex);

      // 開啟燈泡
      window.socket.send(JSON.stringify({
        id: requestId++,
        type: 'call_service',
        domain: 'light',
        service: 'turn_on',
        service_data: { rgb_color: getRandomColor() },
        target: { entity_id: lightToTurnOn }
      }));

      // 關閉燈泡
      otherLights.forEach(light => {
        window.socket.send(JSON.stringify({
          id: requestId++,
          type: 'call_service',
          domain: 'light',
          service: 'turn_off',
          target: { entity_id: light }
        }));
      });

      currentLightIndex = (currentLightIndex + 1) % lights.length;
    }
  }

  function handleButtonClick(buttonId) {
    if (lightColors[buttonId]) {
      console.log(buttonId);
      window.ws.send(JSON.stringify({ type: 'ESP32', messages: buttonId }));
      sendLightCommand(lightColors[buttonId]);
    } else if (buttonId === 'function1') {
      window.ws.send(JSON.stringify({ type: 'ESP32', messages: 'random' }));
      startLightEffect("same");
    } else if (buttonId === 'function2') {
      startLightEffect("different");
    } else if (buttonId === 'function3') {
      startLightEffect("onlyone");
    }
  }
  //六個功能按鈕切換
  const buttonConfigs = [
    { id: 'greenlight', defaultSrc: 'img/dj台(1)-20.png', activeSrc: 'img/dj台(1)_綠燈.png' }, //0,255,0
    { id: 'pinklight', defaultSrc: 'img/dj台(1)-21.png', activeSrc: 'img/dj台(1)_粉燈.png' },//255,0,136
    { id: 'yellowlight', defaultSrc: 'img/dj台(1)-22.png', activeSrc: 'img/dj台(1)_黃燈.png' },//255,162,0
    { id: 'function1', defaultSrc: 'img/dj台(1)-23.png', activeSrc: 'img/dj台(1)_白燈.png' },
    { id: 'function2', defaultSrc: 'img/dj台(1)-24.png', activeSrc: 'img/dj台(1)_白燈.png' },
    { id: 'function3', defaultSrc: 'img/dj台(1)-25.png', activeSrc: 'img/dj台(1)_白燈.png' }
  ];
  buttonConfigs.forEach(config => {
    toggleButtonImg(config.id, config.defaultSrc, config.activeSrc, buttonConfigs);
  });
  function toggleButtonImg(buttonId, defaultSrc, activeSrc, buttonConfigs) {
    const button = document.getElementById(buttonId);
    let touchStarted = false;
    // 處理觸摸事件(手機)
    button.addEventListener('touchstart', function (e) {
      e.preventDefault(); // 防止觸發點擊事件
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) return;
      touchStarted = true;

      AudioManager.playSound("buttonClick");
      handleButtonClick(buttonId)


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
      // if (button.classList.contains('disable')) return; 

      const img = button.querySelector('img');
      const currentSrc = img.getAttribute('src');
      const btnp = button.querySelector('p');
      if (currentSrc === activeSrc) {
        img.setAttribute('src', defaultSrc);

      } else {
        buttonConfigs.forEach(config => {
          const otherButton = document.getElementById(config.id);
          const otherImg = otherButton.querySelector('img');
          const otherP = otherButton.querySelector('p');
          if (config.id === buttonId) {
            img.setAttribute('src', activeSrc);
            if (buttonId === 'greenlight' || buttonId === 'pinklight' || buttonId === 'yellowlight') {
              // btnp.style.left = ''
              btnp.style.top = '-4%'
            }
            else {
              // btnp.style.left = ''
              btnp.style.top = '44%'
            }
          } else {
            otherImg.setAttribute('src', config.defaultSrc);
            if (config.id === 'greenlight' || config.id === 'pinklight' || config.id === 'yellowlight') {
              // btnp.style.left = ''
              otherP.style.top = '-8%'
            }
            else {
              // btnp.style.left = ''
              otherP.style.top = '42%'
            }
            // img.style.width = "78%"

          }
        });
      }
    }
  }
}

export function setupSlider1() {
  //slider滑動 ->瀑布速度
  const container = document.getElementById('slider1'); // 滑動區域
  const track = document.getElementById('slider_BG');
  const fish = document.getElementById('waterfall_fish');
  let isDragging = false;
  let startX = 0; // 手指觸碰時的座標
  let initialLeft = 0; // 圖片最初的left值
  let gifSrc = "img/fish.gif";  // GIF 圖片
  let staticSrc = "img/dj台-滑桿2.png";  // GIF 第一幀的靜態圖片
  let isPlaying = true;

  //抓取範圍
  const trackRect = track.getBoundingClientRect(); // 軌道的範圍
  const minLeft = trackRect.left - 20; // 軌道的最左邊
  const maxLeft = trackRect.right - fish.offsetWidth; // 軌道的最右邊


  container.addEventListener('touchstart', (e) => {
    const sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    initialLeft = fish.offsetLeft;
    fish.src = gifSrc;
    isPlaying = true;
    AudioManager.playSound("sliderMove");
  });
  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;



    e.preventDefault();


    const deltaX = (e.touches[0].clientX - startX) / 1.8;
    let newLeft = initialLeft + deltaX;

    if (newLeft < minLeft) newLeft = minLeft;
    if (newLeft > maxLeft) newLeft = maxLeft;

    fish.style.left = `${newLeft}px`;
    console.log(newLeft);
    switch (true) {
      case (newLeft > 100 && newLeft <= 118):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 1 }));
        break;
      case (newLeft > 118 && newLeft <= 136):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 2 }));
        break;
      case (newLeft > 136 && newLeft <= 154):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 3 }));
        break;
      case (newLeft > 154 && newLeft <= 172):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 4 }));
        break;
      case (newLeft > 172 && newLeft <= 190):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 5 }));
        break;
      case (newLeft > 190 && newLeft <= 208):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 6 }));
        break;
      case (newLeft > 208 && newLeft <= 226):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 7 }));
        break;
      case (newLeft > 226 && newLeft <= 247):
        window.ws.send(JSON.stringify({ type: 'Unity', messages: 8 }));
        break;
      default:
        break;
    }
  });
  container.addEventListener('touchend', () => {
    fish.src = staticSrc;
    isPlaying = false;
    isDragging = false;
    AudioManager.pauseSound("sliderMove");
  })
}

export function setupDisc() {
  let isTouching = false;
  let lastAngle = 0;
  let lastTouchAngle = 0; // 記錄上一幀的觸控角度
  let lastTime = 0;

  const rotateDisc = document.getElementById('discImg');


  rotateDisc.addEventListener('touchstart', (e) => {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) return;

    isTouching = true;
    lastTime = Date.now();

    // 取得觸碰的初始角度
    const rect = rotateDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    lastTouchAngle = Math.atan2(touchY - centerY, touchX - centerX) * (180 / Math.PI);

    AudioManager.playSound("discSpin");
  });
  let lastDirection = null;
  rotateDisc.addEventListener('touchmove', (e) => {
    if (!isTouching) return;

    const rect = rotateDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    const currentTouchAngle = Math.atan2(touchY - centerY, touchX - centerX) * (180 / Math.PI);
    let deltaAngle = currentTouchAngle - lastTouchAngle;

    if (deltaAngle > 180) {
      deltaAngle -= 360;
    } else if (deltaAngle < -180) {
      deltaAngle += 360;
    }
    //傳遞給esp32的
    if (deltaAngle > 0) {
      if (lastDirection !== 'left') {
        window.ws.send(JSON.stringify({ type: 'ESP32', messages: 'left' }));
        lastDirection = 'left';
      }
    } else if (deltaAngle < 0) {
      if (lastDirection !== 'right') {
        window.ws.send(JSON.stringify({ type: 'ESP32', messages: 'right' }));
        lastDirection = 'right';
      }
    }
    //停止轉動(esp32)
    // const btn = document.getElementById('playBtn');
    // btn.addEventListener('touchstart', function () {
    //   window.ws.send('close');
    //   lastDirection = close;
    // })

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;

    const rotation = (lastAngle + deltaAngle * (timeDiff / 50)) % 360;
    rotateDisc.style.transform = `rotate(${rotation}deg)`;
    console.log("rotation:", rotation)
    lastAngle = rotation;
    lastTouchAngle = currentTouchAngle;
    lastTime = currentTime;
  });

  rotateDisc.addEventListener('touchend', () => {
    isTouching = false;
    AudioManager.pauseSound("discSpin");
  });
}

export function setupText() {
  let safety = document.getElementById('safety');
  let happy = document.getElementById('happy');
  let touchStarted = false;

  safety.addEventListener('touchstart', function (e) {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) return;

    touchStarted = true;
    AudioManager.playSound("buttonClick");

    console.log("傳遞平安");
    window.ws.send(JSON.stringify({ type: 'Unity', messages: '平安' }));
  });
  safety.addEventListener('touchend', function (e) {

    if (touchStarted) {
      touchStarted = false;
    }
  });

  happy.addEventListener('touchstart', function (e) {

    touchStarted = true;
    if (!this.disabled) {
      AudioManager.playSound("buttonClick");
    }
    console.log("傳遞喜樂")
    window.ws.send(JSON.stringify({ type: 'Unity', messages: '喜樂' }));
  });
  happy.addEventListener('touchend', function (e) {

    if (touchStarted) {
      touchStarted = false;
    }
  });
}

export function setPlay() {
  // let isPlaying = true;
  // const btn = document.getElementById('playBtn');
  // btn.addEventListener('touchstart', function () {
  //   if (isPlaying) {
  //     window.musicWs.send('close');
  //     isPlaying=false;
  //   }
  //   else {
  //     window.musicWs.send('playBG');
  //     isPlaying = true;
  //   }

  // })
}







