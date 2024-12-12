// form 요소를 가져와 이벤트 리스너 추가
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 방지

    // 사용자 입력값을 가져오기
    const userId = document.querySelector('input[name="id"]').value;
    const password = document.querySelector('input[name="pw"]').value;

    const loginData = {
        userId: userId,
        password: password
    }

    // const loginURL = 'http://localhost:5008/login'

    const loginURL = 'https://triptale.sekoaischool.com/api/login'

    // 서버에 로그인 정보 전송 
    fetch(loginURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail.message || 'Login failed');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response data:', data);

        const token = data.access_token;
        if (token){
            localStorage.setItem('jwt_token', token);
        }
        alert("ログインされました。");
        window.location.href = "../voiceInput/voiceInput.html" 
    })
    .catch(error => {
        console.error('ログイン中にエラーが発生:', error);
        alert('ログイン中にエラーが発生しました。 パスワードまたはサーバーの状態を確認してください。');
    });
});


