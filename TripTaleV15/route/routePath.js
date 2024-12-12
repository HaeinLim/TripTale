// JWT 토큰에서 userId 디코딩하여 추출하는 함수
function getUserIdFromToken(token) {
  if (!token) {
    console.error("Token is null or undefined");
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    const payload = atob(parts[1]); // jwt 토큰 페이로드에서 userId 추출
    const parsedPayload = JSON.parse(payload); // JSON형태로 변환
    return parsedPayload.sub; 
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

window.onload = function(){

  const token = localStorage.getItem('jwt_token');
  console.log('Token:', token);
  
  const userId = getUserIdFromToken(token);
  console.log('userId:', userId)

  const routePathURL = 'https://triptale.sekoaischool.com/api/routePath'
  
  
  fetch(routePathURL, {
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('서버 응답:', data);

    // 서버에서 받은 데이터를 HTML에 표시
    const resultDiv = document.getElementById('result');
    
    if (data.travelRoute) {
      renderDynamicItinerary(data.travelRoute);
    } 
    else {
      resultDiv.textContent = '旅行ルートの読み込みに失敗しました。';
    }
  })
  .catch(error => {
    console.error('에러 발생:', error);

    // 에러가 발생했을 때 메시지 표시
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'データの読み込み中にエラーが発生しました。';
  });
  
  
}

function renderDynamicItinerary(text) {
  const resultDiv = document.getElementById("result");

  // 기존 내용을 비워 새로운 데이터를 추가하기 전 초기화
  resultDiv.innerHTML = '';

  // text가 유효한지 확인
  if (!text || typeof text !== 'string') {
    resultDiv.textContent = '有効な旅行ルートではありません。';
    return; // 함수 종료
  }

  // 텍스트를 <br>로 줄 바꿈 처리
  const formattedText = text.replace(/\n/g, '<br>');

  // 결과 div에 formattedText 추가
  resultDiv.innerHTML = formattedText;
}

// tts
document.getElementById('ttsBtn').addEventListener('click', async () => {
  const token = localStorage.getItem('jwt_token');
  const userId = getUserIdFromToken(token);

  if (!userId) {
      alert('ユーザーIDの取得に失敗しました。');
      return;
  }

  try {
      const response = await fetch('https://triptale.sekoaischool.com/api/tts', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userId }),
      });

      if (!response.ok) {
          throw new Error('TTS要請失敗');
      }

      const data = await response.json();
      const audioContent = data.audio_content;

      // 오디오 재생
      const audio = new Audio('data:audio/mp3;base64,' + audioContent);
      audio.play();
  } catch (error) {
      console.error('誤謬:', error);
      alert('音声の読み取り中にエラーが発生しました。');
  }
});


// 키워드 추출

document.getElementById('nextBtn').addEventListener('click', function() {
  
  const token = localStorage.getItem('jwt_token');
  console.log('Token:', token);
  
  const userId = getUserIdFromToken(token);
  console.log('userId:', userId)
  
  const keywordGetURL = 'https://triptale.sekoaischool.com/api/keywords';

  fetch(keywordGetURL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // 응답 상태 확인
    }
    return response.json();
  })
  .then(data => {
    console.log('サーバー応答:', data);
    window.location.href = "../route/routeImg.html"; // 스펠링 오류 수정
  })
  .catch(error => {
    console.error('リクエスト中にエラーが発生:', error.message);
  });
});


// '이전 페이지' 버튼 클릭 시 실행되는 함수
document.getElementById('preBtn').addEventListener('click', function() {
  // 이전 페이지로 이동
  window.history.back();
});

// 로그아웃 버튼 누를 시 실행되는 함수
document.getElementById('logout').addEventListener('click', function(){
    
  if(confirm("Are you sure you want to sign out?") == true){
      localStorage.removeItem('jwt_token'); // jwt 토큰 삭제
      localStorage.clear(); // localstorage 초기화
      window.location.href ="../login/login.html"
  }
  else{
      return false;
  }    
});