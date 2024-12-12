document.getElementById('change-password-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 기본 폼 동작 방지

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('email');
    console.log(userId)

    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
        alert('すべてのフィールドを入力してください。');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('パスワードが一致しません。');
        return;
    }

    const changeData = {
        userId: userId,
        password: newPassword
    }

    // const changePwURL = `http://localhost:5008/changePw/${userId}`;

    const changePwURL = `https://triptale.sekoaischool.com/api/changePw/${userId}`

    // 비밀번호 변경 요청을 서버로 전송
    fetch(changePwURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeData)
    })
    .then(response => {
        if (!response.ok) {
            // 응답이 성공적이지 않으면 에러 발생
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'パスワード変更中にエラーが発生');
            });
        }
        return response.json();})
    .then(data => {
            console.log('Server response data:', data);
            alert('パスワードが正常に変更されました。');
            window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('パスワード変更中のエラー:', error);
    });
});
