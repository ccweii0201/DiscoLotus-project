import AudioManager from "./audio.js";

export function setupButton(){
    //六個功能按鈕切換 ->控制燈光
    const buttonConfigs = [
        { id: 'greenlight', defaultSrc: 'img/dj台(1)-20.png', activeSrc: 'img/dj台(1)_綠燈.png' },
        { id: 'pinklight', defaultSrc: 'img/dj台(1)-21.png', activeSrc: 'img/dj台(1)_粉燈.png' },
        { id: 'yellowlight', defaultSrc: 'img/dj台(1)-22.png', activeSrc: 'img/dj台(1)_黃燈.png' },
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
    
        // 處理滑鼠點擊(電腦)
        button.addEventListener('click', handleToggle);
    
        // 處理觸摸事件(手機)
        button.addEventListener('touchstart', function (e) {
          e.preventDefault(); // 防止觸發點擊事件
          touchStarted = true;
          if(!this.disabled){
            AudioManager.playSound("buttonClick");
          }
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
          
          } else {
            buttonConfigs.forEach(config => {
              const otherButton = document.getElementById(config.id);
              const otherImg = otherButton.querySelector('img');
              if (config.id === buttonId) {
                img.setAttribute('src', activeSrc);
               
              } else {
                otherImg.setAttribute('src', config.defaultSrc);
               img.style.width="78%"
              }
            });
          }
        }
      }
}

export function setupSlider1(){
  //slider滑動 ->瀑布速度
  const container = document.getElementById('slider1'); // 滑動區域
  const track = document.getElementById('slider_BG'); 
  const fish=document.getElementById('waterfall_fish');
 let  isDragging = false;
 let startX = 0; // 手指觸碰時的座標
 let initialLeft = 0; // 圖片最初的left值
  let gifSrc = "img/fish.gif";  // GIF 圖片
  let staticSrc = "img/dj台-滑桿2.png";  // GIF 第一幀的靜態圖片
  let isPlaying = true;

    //抓取範圍
    const trackRect = track.getBoundingClientRect(); // 軌道的範圍
    const minLeft = trackRect.left-20; // 軌道的最左邊
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
      let newLeft  = initialLeft  + deltaX;

      if (newLeft < minLeft) newLeft = minLeft;
      if (newLeft > maxLeft) newLeft = maxLeft;

      fish.style.left = `${newLeft}px`;

      switch (true) {
        case (newLeft > 115 && newLeft <= 131):
          window.ws.send('1');
          break;
        case (newLeft > 131 && newLeft <= 147):
          window.ws.send('2');
          break;
        case (newLeft > 147 && newLeft <= 163):
          window.ws.send('3');
          break;
        case (newLeft > 163 && newLeft <= 179):
          window.ws.send('4');
          break;
        case (newLeft > 179 && newLeft <= 195):
          window.ws.send('5');
          break;
        case (newLeft > 195 && newLeft <= 211):
          window.ws.send('6');
          break;
        case (newLeft > 211 && newLeft <= 227):
          window.ws.send('7');
          break;
        case (newLeft > 227 && newLeft <= 247):
          window.ws.send('8');
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

export function setupSlider2(){
    //slider滑動 ->蓮花開合
    const container = document.getElementById('slider2'); // 滑動區域
    const track = document.getElementById('slider_BG'); 
    const fish=document.getElementById('angle_fish');
   let  isDragging = false;
   let startX = 0; // 手指觸碰時的座標
   let initialLeft = 0; // 圖片最初的left值
    let gifSrc = "img/fish.gif";  // GIF 圖片
    let staticSrc = "img/dj台-滑桿2.png";  // GIF 第一幀的靜態圖片
    let isPlaying = true;
  
      //抓取範圍
      const trackRect = track.getBoundingClientRect(); // 軌道的範圍
      const minLeft = trackRect.left-20; // 軌道的最左邊
      const maxLeft = trackRect.right - fish.offsetWidth; // 軌道的最右邊
    
  
      container.addEventListener('touchstart', (e) => {
        // const sessionId = sessionStorage.getItem('sessionId')
        // if (!sessionId) return;
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
        let newLeft  = initialLeft  + deltaX;
  
        if (newLeft < minLeft) newLeft = minLeft;
        if (newLeft > maxLeft) newLeft = maxLeft;
  
        fish.style.left = `${newLeft}px`;
  
       
        
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

  rotateDisc.addEventListener('touchmove', (e) => {
    if (!isTouching) return;

    const rect = rotateDisc.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    const currentTouchAngle = Math.atan2(touchY - centerY, touchX - centerX) * (180 / Math.PI);
    let deltaAngle = currentTouchAngle - lastTouchAngle;

    // 確保角度變化方向正確
    if (deltaAngle > 180) {
      deltaAngle -= 360;
    } else if (deltaAngle < -180) {
      deltaAngle += 360;
    }

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    
    const rotation = (lastAngle + deltaAngle * (timeDiff / 50)) % 360;
    rotateDisc.style.transform = `rotate(${rotation}deg)`;

    lastAngle = rotation;
    lastTouchAngle = currentTouchAngle;
    lastTime = currentTime;
  });

  rotateDisc.addEventListener('touchend', () => {
    isTouching = false;
    AudioManager.pauseSound("discSpin");
  });
}

export function setupText(){
  let safety =document.getElementById('safety');
  let happy =document.getElementById('happy');
  let touchStarted = false;

  safety.addEventListener('touchstart', function (e) {

    touchStarted = true;
    if(!this.disabled){
      AudioManager.playSound("buttonClick");
    }
    console.log("傳遞平安")
    window.ws.send('平安');
  });
  safety.addEventListener('touchend', function (e) {
   
    if (touchStarted) {
      touchStarted = false;
    }
  });
  
  happy.addEventListener('touchstart', function (e) {
  
    touchStarted = true;
    if(!this.disabled){
      AudioManager.playSound("buttonClick");
    }
    console.log("傳遞喜樂")
    window.ws.send('喜樂');
  });
  happy.addEventListener('touchend', function (e) {
   
    if (touchStarted) {
      touchStarted = false;
    }
  });
}


  



