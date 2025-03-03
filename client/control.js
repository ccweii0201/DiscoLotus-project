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

export function setupSlider(){
      //slider滑動 ->蓮花開合 ， 瀑布速度
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
      const sessionId = sessionStorage.getItem('sessionId')
      if (!sessionId) return;
      isDragging = true;
      startY = e.touches[0].clientY;
      initialTop = parseInt(window.getComputedStyle(slider).top) || 0;
      AudioManager.playSound("sliderMove");
    });
    slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;

      e.preventDefault();

   
      const deltaY = (e.touches[0].clientY - startY) / 1.8;
      let newTop = initialTop + deltaY;

      if (newTop < minTop) newTop = minTop;
      if (newTop > maxTop) newTop = maxTop;

      slider.style.top = `${newTop}px`;
      switch (true) {
        case (newTop > -10 && newTop <= 10):
          window.ws.send('1');
          break;
        case (newTop > 10 && newTop <= 30):
          window.ws.send('2');
          break;
        case (newTop > 30 && newTop <= 50):
          window.ws.send('3');
          break;
        case (newTop > 50 && newTop <= 70):
          window.ws.send('4');
          break;
        case (newTop > 70 && newTop <= 90):
          window.ws.send('5');
          break;
        case (newTop > 90 && newTop <= 110):
          window.ws.send('6');
          break;
        case (newTop > 110 && newTop <= 130):
          window.ws.send('7');
          break;
        case (newTop > 130 && newTop <= 150):
          window.ws.send('8');
          break;
        default:
          break;
      }
    });
    slider.addEventListener('touchend', () => {
      isDragging = false;
      AudioManager.pauseSound("sliderMove");
    })
  })

}

export function setupDisc(){

  //disc轉動 ->蓮花旋轉
  let isTouching = false; //是否觸碰照片
  let lastAngle = 0 //初始角度
  let startX = 0
  let startY = 0 //紀錄觸碰時的座標
  let lastTime = 0;

  const rotateDisc = document.getElementById('discImg');
  rotateDisc.addEventListener('touchstart', (e) => {
    const sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) return;
    isTouching = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    lastTime = Date.now();
    AudioManager.playSound("discSpin");
   
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


  



