import AudioManager from "./audio.js";

export function setupButton(){
    //六個功能按鈕切換 ->控制燈光
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

export function tutorial(){

//教學介面
const tutorial = document.getElementById('Tutorial');
const content=document.getElementById('Tutorial_p');
const t_btn=document.getElementById('help');
let spet=0;
function updateMask(targetID) {

  let target = document.getElementById(targetID);
  
  if (!targetID) {
      console.log('not found!')
      return;
  }
  
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let radius=0;
  let maskCSS="";
  
  //圓形
  if(targetID==="on"){
      radius = Math.max(rect.width, rect.height) / 2 + 45;
      maskCSS = `radial-gradient(circle ${radius}px at ${centerX}px ${centerY}px, 
      transparent 40%, rgba(0, 0, 0, 1) 41%)`;
      content.textContent='蓮花啟動開關'
      content.style.top='8%'
      content.style.right='3%'
  }
  else if(targetID==="discImg"){
      radius = Math.max(rect.width, rect.height) / 2 + 280;
      maskCSS = `radial-gradient(circle ${radius}px at ${centerX}px ${centerY}px, 
      transparent 40%, rgba(0, 0, 0, 1) 41%)`;
      content.textContent='轉動調整蓮花速度'
      content.style.top='63%'
      content.style.right='0%'
      content.style.left='3%'
  }
  //方形
  else if(targetID==="slider1"){
      let maskSize = `${rect.width + 30}px ${rect.height + 40}px`;
      let maskPosition = `${rect.left - 15}px ${rect.top - 20}px`;
  
      tutorial.style.maskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      // tutorial.style.webkitMaskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      tutorial.style.maskSize = `100% 100%, ${maskSize}`;
      // tutorial.style.webkitMaskSize = `100% 100%, ${maskSize}`;
      tutorial.style.maskPosition = `0 0, ${maskPosition}`;
      // tutorial.style.webkitMaskPosition = `0 0, ${maskPosition}`;
      tutorial.style.maskRepeat = "no-repeat";
      // tutorial.style.webkitMaskRepeat = "no-repeat";
      tutorial.style.maskComposite = "exclude";
      // tutorial.style.webkitMaskComposite = "destination-out";
      content.textContent='滑動調整蓮花開合角度'
      content.style.top='90%'
      content.style.right='0%'
      content.style.left='20%'
      return;
  }
  else if(targetID==="slider2"){
      let maskSize = `${rect.width + 30}px ${rect.height + 40}px`;
      let maskPosition = `${rect.left - 15}px ${rect.top - 20}px`;
  
      tutorial.style.maskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      // tutorial.style.webkitMaskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      tutorial.style.maskSize = `100% 100%, ${maskSize}`;
      // tutorial.style.webkitMaskSize = `100% 100%, ${maskSize}`;
      tutorial.style.maskPosition = `0 0, ${maskPosition}`;
      // tutorial.style.webkitMaskPosition = `0 0, ${maskPosition}`;
      tutorial.style.maskRepeat = "no-repeat";
      // tutorial.style.webkitMaskRepeat = "no-repeat";
      tutorial.style.maskComposite = "exclude";
      // tutorial.style.webkitMaskComposite = "destination-out";
      content.textContent='滑動調整瀑布流水速度'
      content.style.top='53%'
      content.style.right='0%'
      content.style.left='6%'
      return;
  }
  else if(targetID==="lightButton"&&spet===3){
      let maskSize = `${rect.width -10}px ${rect.height - 100}px`;
      let maskPosition = `${rect.left +5}px ${rect.top +10}px`;
  
      tutorial.style.maskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      // tutorial.style.webkitMaskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      tutorial.style.maskSize = `100% 100%, ${maskSize}`;
      // tutorial.style.webkitMaskSize = `100% 100%, ${maskSize}`;
      tutorial.style.maskPosition = `0 0, ${maskPosition}`;
      // tutorial.style.webkitMaskPosition = `0 0, ${maskPosition}`;
      tutorial.style.maskRepeat = "no-repeat";
      // tutorial.style.webkitMaskRepeat = "no-repeat";
      tutorial.style.maskComposite = "exclude";
      // tutorial.style.webkitMaskComposite = "destination-out";
      content.textContent='燈光顏色'
      content.style.top='61%'
      content.style.left='73%'
      return;
  }
  else if(targetID==="lightButton"&&spet===4){
      let maskSize = `${rect.width -10}px ${rect.height - 100}px`;
      let maskPosition = `${rect.left +5}px ${rect.top +93}px`;
  
      tutorial.style.maskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      // tutorial.style.webkitMaskImage = "linear-gradient(black, black), linear-gradient(black, black)";
      tutorial.style.maskSize = `100% 100%, ${maskSize}`;
      // tutorial.style.webkitMaskSize = `100% 100%, ${maskSize}`;
      tutorial.style.maskPosition = `0 0, ${maskPosition}`;
      // tutorial.style.webkitMaskPosition = `0 0, ${maskPosition}`;
      tutorial.style.maskRepeat = "no-repeat";
      // tutorial.style.webkitMaskRepeat = "no-repeat";
      tutorial.style.maskComposite = "exclude";
      // tutorial.style.webkitMaskComposite = "destination-out";
      content.textContent='隨機閃爍方式'
      content.style.top='73%'
      content.style.left='65%'
      return;
  }
  
  tutorial.style.maskImage = maskCSS;
    }

updateMask('on');
  
    // 自動找物件位置
  tutorial.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(spet===0){
      spet++;
      updateMask('discImg');
    }
    else if(spet===1){
      spet++;
      updateMask('slider1');
    }
    else if(spet===2){
      spet++;
      updateMask('slider2');
    }
    else if(spet===3){
      updateMask('lightButton');
      spet++;
    }
    else if(spet===4){
      updateMask('lightButton');
      spet++;
    }
    else{
      tutorial.style.display='none'
      spet=0;
    }
  })
  t_btn.addEventListener('touchstart',(e)=>{
    tutorial.style.display='block';
    updateMask('on');
  })

}


  



