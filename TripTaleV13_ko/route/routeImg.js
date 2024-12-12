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
            resultDiv.textContent = '여행 경로를 불러오는 데 실패했습니다.';
        }
    })
    .catch(error => {
        console.error('에러 발생:', error);
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = '데이터를 불러오는 중 에러가 발생했습니다.';
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

            const promises = locations.map((keyword) => {
                return new Promise((resolve, reject) => {
                    geocoder.geocode({ address: keyword }, (results, status) => {
                        if (status === "OK") {
                            const location = results[0].geometry.location;

                            const marker = new google.maps.Marker({
                                map: map,
                                position: location,
                                title: keyword,
                            });

                            const infoWindow = new google.maps.InfoWindow({
                                content: `<div style="color: black; font-weight: bold;">${keyword}</div>`,
                            });

                            marker.addListener('click', () => {
                                infoWindow.open(map, marker);
                            });

                            bounds.extend(location);
                            resolve(location);
                        } else {
                            console.error("위치를 찾을 수 없습니다: " + status);
                            reject(status);
                        }
                    });
                });
            });

            Promise.all(promises)
            .then((locations) => {
                map.fitBounds(bounds);
            })
            .catch(error => {
                console.error("모든 위치를 찾는 데 실패했습니다: ", error);
            });
        } else {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = '유효한 키워드를 찾을 수 없습니다.';
            console.error("유효한 키워드를 찾을 수 없습니다.");
        }
    })
    .catch(error => {
        console.error('키워드 가져오기 중 에러 발생:', error);
    });
}
function renderDynamicItinerary(text) {
  const resultDiv = document.getElementById("result");

  // 기존 내용을 비워 새로운 데이터를 추가하기 전 초기화
  resultDiv.innerHTML = '';

  // text가 유효한지 확인
  if (!text || typeof text !== 'string') {
    resultDiv.textContent = '유효한 여행 경로가 아닙니다.';
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
        console.error("이미지 생성 실패:", response.statusText);
      }
    } else {
      console.error("userId를 가져오는 데 실패했습니다.");
    }
  });

document.getElementById('startBtn').addEventListener('click', function() {
    window.location.href = "../voiceinput/voiceInput.html"
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