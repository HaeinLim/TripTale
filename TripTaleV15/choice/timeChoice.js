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


// '다음' 버튼 클릭 시 실행되는 함수
document.getElementById('nextBtn').addEventListener('click', function() {

  const token = localStorage.getItem('jwt_token');
  console.log('Token:', token);
  
  const userId = getUserIdFromToken(token);
  console.log('userId:', userId)

  const timeInput = document.getElementById('timeInput').value;
  const time = timeInput + '일';

  const timeChoiceURL = 'https://triptale.sekoaischool.com/api/timechoice';

  const timeChoiceData = {
    userId : userId,
    time : time
  }


  fetch(timeChoiceURL, {
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(timeChoiceData)
  })
  .then(response => {
    console.log('HTTP response status:', response.status);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Server response data:', data);
    alert(timeInput + '日を選びました。');
    window.location.href = '../choice/placeChoice.html'
  }) 

});


// '이전 페이지' 버튼 클릭 시 실행되는 함수
document.getElementById('prevBtn').addEventListener('click', function() {
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