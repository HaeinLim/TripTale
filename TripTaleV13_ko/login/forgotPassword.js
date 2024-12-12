// document.getElementById('forgot-password-form').addEventListener('submit', function(event) {
//     event.preventDefault(); // 기본 폼 동작 방지

//     const username = document.getElementById('username').value;
//     if (username.trim() === '') {
//         alert('아이디를 입력해주세요.');
//         return;
//     }

//     // 비밀번호 찾기 요청을 서버로 전송
//     fetch('/forgot-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert('비밀번호를 이메일로 전송했습니다.');
//         } else {
//             alert('사용자를 찾을 수 없습니다.');
//         }
//     })
//     .catch(error => {
//         console.error('비밀번호 찾기 요청 중 오류:', error);
//     });
// });

// 이메일 인증 페이지로 이동하는 이벤트
document.getElementById('forgot-password-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 링크 기본 동작 방지

    const userId = document.getElementById('userId').value;
    window.location.href =`changePassword.html?email=${encodeURIComponent(userId)}`;

});
