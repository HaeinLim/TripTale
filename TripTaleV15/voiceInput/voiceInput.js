const voiceBtn = document.getElementById('voiceBtn');
const transcriptArea = document.getElementById('transcript');
const nextBtn = document.getElementById('nextBtn'); // Next 버튼 추가

const startImage = '../images/voiceImg.png'; // 녹음 시작 이미지 경로
const stopImage = '../images/stop.png'; // 녹음 중지 이미지 경로

let isRecording = false; // 녹음 상태 변수
let mediaRecorder; // MediaRecorder 변수
let audioChunks = []; // 오디오 데이터 저장 배열
let stream; // 스트림 저장 변수

// JWT에서 userId를 추출하는 함수
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

// 일본어 음성을 인식하기 위한 SpeechRecognition 설정
const recognition = new webkitSpeechRecognition();
recognition.lang = 'ja-JP'; // 일본어로 설정
recognition.interimResults = false; // 중간 결과 표시 안 함
recognition.maxAlternatives = 1; // 최대 대안 수

// 녹음 시작 함수
async function startRecording() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                sampleRate: 48000 // 샘플 레이트 설정
            } 
        });

        // MIME 타입을 'audio/webm'으로 설정
        const options = { mimeType: 'audio/webm; codecs=opus' };
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data); // 오디오 데이터 저장
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = []; // 초기화

            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm'); // 파일로 추가

            const token = localStorage.getItem('jwt_token');
            const userId = getUserIdFromToken(token);
            if (!userId) {
                console.error('사용자 ID를 찾을 수 없습니다.');
                return;
            }

            formData.append('userId', userId); // userId 추가

            try {
                const response = await fetch('https://triptale.sekoaischool.com/api/upload', {
                    method: 'PUT',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.speechText) {
                        transcriptArea.textContent = data.speechText; // 텍스트 표시
                        nextBtn.disabled = false; // 녹음 후 Next 버튼 활성화
                    } else {
                        console.error('인식된 텍스트가 없습니다.');
                    }
                } else {
                    console.error('파일 업로드 실패:', response.statusText);
                }
            } catch (error) {
                console.error('파일 업로드 중 오류 발생:', error);
            }

            // 스트림을 중지하여 마이크 자원을 해제
            stopStream();
            voiceBtn.disabled = false;
            voiceBtn.querySelector('img').src = startImage; // 버튼 이미지를 시작 이미지로 변경
            isRecording = false; // 녹음 상태 업데이트
        };

        mediaRecorder.start(); // 녹음 시작
        voiceBtn.querySelector('img').src = stopImage; // 버튼 이미지를 중지 이미지로 변경

        // 음성 인식 시작
        recognition.start();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            transcriptArea.textContent = transcript; // 텍스트 표시
            nextBtn.disabled = false; // Next 버튼 활성화
        };

        recognition.onerror = (event) => {
            console.error('음성 인식 에러:', event.error);
        };

    } catch (error) {
        console.error('마이크 접근 실패:', error);
        isRecording = false; // 마이크 접근 실패 시 녹음 상태를 false로 설정
    }
}

// 스트림을 중지하는 함수
function stopStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

// 녹음 버튼 클릭 이벤트 처리
voiceBtn.addEventListener('click', async () => {
    if (!isRecording) {
        isRecording = true; // 녹음 상태 업데이트
        await startRecording();
    } else {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop(); // 녹음 중지
            recognition.stop(); // 음성 인식 중지
        } else {
            // 재녹음을 위해 이전 녹음 데이터 초기화
            transcriptArea.textContent = ''; // 이전 텍스트 지우기
            audioChunks = []; // 이전 오디오 데이터 지우기
            stopStream(); // 이전 스트림 중지
            voiceBtn.querySelector('img').src = startImage; // 버튼 이미지를 시작 이미지로 변경
            isRecording = false; // 녹음 상태 업데이트
            
            // 새로 녹음 시작
            await startRecording();
            voiceBtn.querySelector('img').src = stopImage; // 재녹음 시 버튼 이미지를 중지 이미지로 변경
        }
    }
});

// "Next" 버튼 클릭 이벤트 처리
nextBtn.addEventListener('click', function() {
    if (transcriptArea.textContent.trim() === '') {
        alert("음성 녹음을 해주세요."); // 녹음이 진행되지 않은 경우 알림
    } else {
        window.location.href = "../choice/timeChoice.html"; // 녹음이 진행된 경우 페이지 이동
    }
});

// 로그아웃 버튼 클릭 이벤트 처리
document.getElementById('logout').addEventListener('click', function(){
    localStorage.removeItem('jwt_token'); // JWT 항목 삭제
    localStorage.clear(); // 모든 항목 삭제 (원하는 경우)
    window.location.href ="../login/login.html";
});
