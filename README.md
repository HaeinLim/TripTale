# TripTale
회원이 일본 지역명을 일본어로 음성 입력한 뒤 태그 선택을 마치면 Chat GPT API를 통해 일본 여행 계획을 세울 수 있는 웹 사이트 프로젝트입니다. (한국어 버전은 한국어로 음성 입력)

## 목차
  - [개요](#개요)
  - [프로그램 설명](#프로그램-설명)
  - [프로그램 화면](#프로그램-화면)
## 개요
  - 프로젝트명 : TripTale
  - 프로젝트 진행기간 : 2024.08.19-2024.10.07
  - 사용 기술 : Python, FastAPI, HTML, CSS, JavaScript, AWS, MySQL
  - 팀 구성원 : 임해인 외 4명

## 프로그램 설명
<div align="center">
  <table>
    <tr>
      <td>
        <img src="https://github.com/user-attachments/assets/0e76cfa3-b5b8-4e50-84ec-a6e5034b50d5" width="600" height="400">
      </td>
    </tr>
    <tr>
      <td align="center">로그인 전 메인 페이지</td>
    </tr>
  </table>
</div>
여행 계획 세우는 것이 어려운 2~40대 한국인을 타겟팅하여 음성으로 지역명을 입력하고 태그들을 선택하면 Chat GPT가 세워주는 일본 여행 계획을 받아볼 수 있습니다.

  - 회원가입하고 일본 지역명 음성 입력하기 🗣️ <br>
    TripTale은 회원가입 후 이용할 수 있기 때문에 간단한 회원가입 후 로그인하여 가고 싶은 일본 지역명을 음성으로 입력할 수 있습니다.
    
  - 다양한 태그 선택하기 ✔️ <br>
    지역명을 입력한 다음 여행 일수를 정하고, 명소와 로컬 태그를 선택할 수 있으며 Food, Dessert, Shopping, History, Experience, Nature 6가지의 태그 중
    원하는 태그를 3개까지 선택 가능합니다. 해당 데이터들을 종합하여 Chat GPT가 그에 맞는 여행 계획을 세워줍니다.

  - Chat GPT가 추천하는 일본 여행 계획 📋 <br>
    Chat GPT가 여행 계획을 생성하면 웹 페이지에서 확인할 수 있습니다. 여기서 Read 버튼을 클릭해 경로를 읽어주기도 합니다. 이후 페이지에서 경로 글을 다시
    한 번 보여주며 Google 지도에 추출된 키워드 장소들을 마커로 표시합니다. 또한 이 키워드를 종합하여 생성 AI 이미지를 제공합니다.

## 프로그램 화면

- 회원가입

<div align="center">
  <table align="center">
      <tr>
        <th>회원가입</th>
      </tr>
      <tr>
        <td>
          <img src="https://github.com/user-attachments/assets/6d8cd415-f504-4443-b60d-22866c0f3507" width="500" height="300">
        </td>
      </tr>
      <tr>
        <td>
          - 모든 항목을 입력한 후 회원가입 진행<br>
          - 비밀번호 확인이 일치하지 않으면 회원가입 불가
        </td>
      </tr>
  </table>
</div>

- 비밀번호 변경

<div align="center">
  <table align="center">
    <tr>
      <th>아이디 확인</th><th>비밀번호 변경</th>
    </tr>
    <tr>
      <td>
        <img src="https://github.com/user-attachments/assets/86611bf7-47ca-488a-9af1-f8ca9a84fb78" width="500" height="300">
      </td>
      <td>
        <img src="https://github.com/user-attachments/assets/0f6b30f2-d38c-400b-8a58-12c9f64aef41" width="500" height="300">
      </td>
    </tr>
    <tr>
      <td>
        - 회원가입 한 아이디 입력
      </td>
      <td>
        - 비밀번호 변경 시 비밀번호 확인과 다를 경우 변경 불가
      </td>
    </tr>
  </table>
</div>

  - 일본 지역명 음성 입력

<div align="center">
  <table align="center">
    <tr>
      <th>음성 입력 전</th><th>음성 입력 후</th>
    </tr>
    <tr>
      <td>
        <img src="https://github.com/user-attachments/assets/6539cb42-2b1d-4cc3-bf84-82d0268d0a98" width="400" height="200">
      </td>
      <td>
        <img src="https://github.com/user-attachments/assets/6a91068b-d972-4164-8a1f-524ad31e7654" width="400" height="200">
      </td>
    </tr>
    <tr>
      <td>
        - 마이크 버튼을 클릭해 음성 입력
      </td>
      <td>
        - 음성 입력 후 마이크 버튼 재클릭 하면 페이지에 텍스트로 표시
      </td>
    </tr>
  </table>
</div>

  - 태그 선택

<div align="center">
  <table algin="center">
    <tr>
      <th>기간</th><th>장소</th><th>관심사</th>
    </tr>
    <tr>
      <td>
        <img src="https://github.com/user-attachments/assets/c0a2012d-a682-49d4-b50b-77229b3b1e33" width="400" height="200">
      </td>
      <td>
        <img src="https://github.com/user-attachments/assets/ee71a8e7-4e36-4876-9d58-758b0bcd145e" width="400" height="200">
      </td>
      <td>
        <img src="https://github.com/user-attachments/assets/86c0e23a-7459-40ea-9236-b8f4d9bf1ed7" width="400" height="200">
      </td>
    </tr>
    <tr>
      <td>
        - 여행 기간 선택
      </td>
      <td>
        - 명소나 로컬 선택
      </td>
      <td>
        - 6개의 관심사 중 최대 3개까지 선택
      </td>
    </tr>
  </table>
</div>

  - 경로 추천

<div align="center">
  <table algin="center">
    <tr>
      <th>여행 경로</th><th>지도</th><th>생성AI 이미지</th>
    </tr>
    <tr>
      <td>
        <img src="https://github.com/user-attachments/assets/3659fc92-3ea9-4e51-ae2d-04ea867deffa" width="400" height="200">
      </td>
      <td>
        <img src="https://github.com/user-attachments/assets/640ad2e9-3e67-4407-8f22-b9b313243eed" width="400" height="200">
      </td>
      <td>
        <img src="https://github.com/user-attachments/assets/c23da6d5-dda9-4944-bed9-a99fd883dd4d" width="400" height="200">
      </td>
    </tr>
    <tr>
      <td>
        - 지역명과 태그 데이터를 종합해 Chat GPT가 여행 경로 추천
      </td>
      <td>
        - 추천된 경로에서 장소에 대한 키워드를 추출해 Google 지도에 마커로 표시
      </td>
      <td>
        - 키워드를 종합해 일본의 전경을 생성AI 이미지로 제공
      </td>
    </tr>
  </table>
</div>
