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
window.onload = function() {
    const token = localStorage.getItem('jwt_token');
    console.log('Token:', token);

    const travelrouteGetURL = 'https://triptale.sekoaischool.com/api/travelRoute';

    // 여행 경로 요청
    fetch(travelrouteGetURL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('서버 응답:', data);
        
        // 여행 경로가 있는 경우 처리
        if (data.travelRoute) {
            renderDynamicItinerary(data.travelRoute);
        } else {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = '旅行ルートの読み込みに失敗しました。';
        }
    })
    .catch(error => {
        console.error('에러 발생:', error);
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = 'データの読み込み中にエラーが発生しました。';
    });


};

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: { lat: 34.6937, lng: 135.5023 }, // 기본 위치
    });

    const token = localStorage.getItem('jwt_token');
    const geocoder = new google.maps.Geocoder();
    const keywordGetURL = 'https://triptale.sekoaischool.com/api/keywordGet';

    // API로부터 키워드 가져오기
    fetch(keywordGetURL, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const locations = data.keyword ? data.keyword.split(',').map(keyword => keyword.trim()) : [];

        if (locations.length > 0) {
            const bounds = new google.maps.LatLngBounds();

            // 각 키워드를 개별적으로 처리
            locations.forEach((keyword) => {
                geocoder.geocode({ address: keyword, region: "jp", language: "ja" }, (results, status) => {
                    if (status === "OK") {
                        const location = results[0].geometry.location;

                        // 마커 생성
                        const marker = new google.maps.Marker({
                            map: map,
                            position: location,
                            title: keyword,  // 마커의 제목을 해당 키워드로 설정
                        });

                        // 정보창 생성
                        const infoWindow = new google.maps.InfoWindow({
                            content: `<div style="color: black; font-weight: bold;">${keyword}</div>`,  // 각 키워드에 맞는 정보 표시
                        });

                        // 마커에 클릭 이벤트 추가하여 정보창 열기
                        marker.addListener('click', () => {
                            infoWindow.open(map, marker);
                        });

                        // 지도 경계 확장
                        bounds.extend(location);
                        map.fitBounds(bounds);  // 모든 마커가 보이도록 지도 경계 조정
                    } else {
                        console.error("場所が見つかりません。: " + status);
                    }
                });
            });
        } else {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = '有効なキーワードが見つかりません。';
            console.error("有効なキーワードが見つかりません。");
        }
    })
    .catch(error => {
        console.error('キーワードの取得中にエラーが発生:', error);
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

// 생성ai 이미지
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwt_token");
    const userId = getUserIdFromToken(token);
  
    if (userId) {
      const response = await fetch(`https://triptale.sekoaischool.com/api/makeImg/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const imagePlaceholder = document.querySelector(".imagePlaceholder");
        
        // 기존 텍스트를 이미지로 교체
        imagePlaceholder.innerHTML = `<img src="${data.image_url}" alt="Generated Image" class="generated-image">`;
      } else {
        console.error("イメージ生成失敗:", response.statusText);
      }
    } else {
      console.error("userIdの取得に失敗しました。");
    }
  });

document.getElementById('startBtn').addEventListener('click', function() {
    window.location.href = "../voiceInput/voiceInput.html"
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