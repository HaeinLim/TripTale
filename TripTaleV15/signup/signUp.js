

document.getElementById('signUpform').addEventListener('submit', function(event) {
    event.preventDefault(); // 기본 제출 동작 방지

    // 입력된 값 가져오기
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 입력값 검증

    if (password !== confirmPassword) {
        alert('パスワードが一致しません。');
        return;
    }

    // const signupURL = 'http://localhost:5008/signup'

    const signupURL = 'https://triptale.sekoaischool.com/api/signup'

    const signupData = {
        userId: userId,
        password: password
    }
    
    console.log('Sending signup data:', signupData);

    fetch(signupURL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
        body: JSON.stringify(signupData)
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
        alert("会員登録が完了しました。");
        window.location.href = '../login/login.html';
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('会員登録中にエラーが発生しました。 もう一度お試しください。');
    });


});