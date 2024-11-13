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
        
});