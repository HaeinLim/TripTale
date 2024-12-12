let selectedMainOption = ''; // 선택된 옵션 저장

// 옵션 선택 시 호출되는 함수
function selectOption(option) {
  // 모든 옵션에서 'selected' 클래스 제거
  const options = document.querySelectorAll('#option-container-1 .option');
  options.forEach(opt => opt.classList.remove('selected'));

  // 선택된 옵션에 'selected' 클래스 추가
  option.classList.add('selected');
  
  // 선택된 옵션 저장(문자)
  selectedMainOption = option.getAttribute('data-option');
  
  // '다음' 버튼 활성화
  document.getElementById('nextBtn').disabled = false;
}

// 각 옵션 클릭 시 selectOption 함수 호출
document.querySelectorAll('.option').forEach(option => {
  option.addEventListener('click', function() {
    selectOption(option);
  });
});


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




// '다음' 버튼 클릭 시 tagChoice.html로 이동, 선택된 옵션을 DB에 전달
document.getElementById('nextBtn').addEventListener('click', function() {
  
  const token = localStorage.getItem('jwt_token');
  console.log('Token:', token);
  
  const userId = getUserIdFromToken(token);
  console.log('userId:', userId)
  
  const location = selectedMainOption;

  const locationURL = 'https://triptale.sekoaischool.com/api/placechoice'

  const locationData = {
    userId: userId,
    location: location
  }

  fetch(locationURL, {
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(locationData)
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
    alert(`${location}を選択されました。`);
    window.location.href = '../choice/tagChoice.html';
  })
  .catch(error => {
    console.error('Fetch error:', error);
    alert('選択中にエラーが発生しました。 もう一度お試しください。');
  });

  
});




// 로그아웃 버튼 누를 시
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


