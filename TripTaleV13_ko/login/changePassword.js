document.getElementById('change-password-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 기본 폼 동작 방지

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('email');
    console.log(userId)

    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
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
                throw new Error(errorData.message || '비밀번호 변경 중 오류 발생');
            });
        }
        return response.json();})
    .then(data => {
            console.log('Server response data:', data);
            alert('비밀번호가 성공적으로 변경되었습니다.');
            window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('비밀번호 변경 중 오류:', error);
    });
});
