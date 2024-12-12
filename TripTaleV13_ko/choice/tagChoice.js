let selectedOptions = []; // 선택된 옵션 저장

// 하위 옵션 동적 생성
function generateSubOptions() {
  const gridContainer = document.getElementById('gridContainer');
  
  if (gridContainer) {
    const options = ['Food', 'Dessert', 'Shopping', 'History', 'Experience', 'Nature']; // 6가지 옵션 제공

    options.forEach(optionText => {
      const div = document.createElement('div');
      div.classList.add('option');
      div.setAttribute('tabindex', '0');
      div.setAttribute('data-option', optionText);
      div.innerHTML = `<h3>${optionText}</h3>`;
      
      div.addEventListener('click', function() {
        selectOption(div);
      });

      gridContainer.appendChild(div);
    });
  } else {
    console.error("gridContainer를 찾을 수 없습니다.");
  }
}

// 각 옵션 클릭 시 실행되는 함수
function selectOption(option) {
  const optionValue = option.getAttribute('data-option');

  // 이미 선택된 항목을 클릭한 경우 선택 해제
  if (selectedOptions.includes(optionValue)) {
    selectedOptions = selectedOptions.filter(opt => opt !== optionValue); // 선택 해제
    option.classList.remove('selected'); // 시각적 선택 해제
  } else if (selectedOptions.length < 3) {
    // 선택된 항목이 3개 미만일 경우에만 추가
    selectedOptions.push(optionValue);
    option.classList.add('selected'); // 시각적 선택 표시
  }

  // 선택된 갯수 업데이트
  document.getElementById('selected-count').textContent = selectedOptions.length;

  // 선택된 옵션이 있으면 '다음' 버튼 활성화, 없으면 비활성화
  document.getElementById('nextBtn').disabled = selectedOptions.length === 0;
}

// 초기화
generateSubOptions(); // 페이지 로드 시 옵션 생성



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




// '이전 페이지' 버튼 클릭 시 실행되는 함수
document.getElementById('prevBtn').addEventListener('click', function() {
  // 이전 페이지로 이동
  window.history.back();
});

// '다음' 버튼 클릭 시 실행되는 함수
document.getElementById('nextBtn').addEventListener('click', function() {

  const token = localStorage.getItem('jwt_token');
  console.log('Token:', token);
  
  const userId = getUserIdFromToken(token);
  console.log('userId:', userId)


  // 삼항연산자 ?를 이용하여 Ture시 해당값을 False 시 null을 반환
  const food = selectedOptions.includes('Food') ? '음식' : null;
  const dessert = selectedOptions.includes('Dessert') ? '디저트': null;
  const shopping = selectedOptions.includes('Shopping') ? '쇼핑': null;
  const history  = selectedOptions.includes('History') ? '역사': null;
  const experience = selectedOptions.includes('Experience') ? '체험': null;
  const nature = selectedOptions.includes('Nature') ? '자연': null;



  const tagChoiceURL = 'https://triptale.sekoaischool.com/api/tagchoice'

  const tagChoiceData = {
    userId: userId,
    food: food,
    dessert: dessert,
    shopping: shopping,
    history: history,
    experience: experience,
    nature: nature
  }
  
  console.log("Sending data:", tagChoiceData);

  fetch(tagChoiceURL, {
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tagChoiceData)
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
    alert('Selected Options: ' + selectedOptions.join(', '));
    window.location.href = '../route/routePath.html'
  }) 
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