import os
import jwt
import openai
import io
import logging
import traceback
import base64
from pydub import AudioSegment
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer  # 보안 유틸리티
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from databases import Database
import bcrypt
from fastapi.responses import JSONResponse
from google.cloud import speech_v1 as speech  # 안정적인 v1 버전 사용
from google.cloud import texttospeech
from google.api_core.exceptions import GoogleAPICallError, RetryError
import logging  # 로깅 모듈 추가

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 멀티링구얼 키워드 추출 모델 초기화 (한국어, 일본어 등을 지원하는 모델 사용)


DATABASE_db1_URL = "mysql://admin:Seigakushakorea0308(!@127.0.0.1/testDBt33"

database_DB1 = Database(DATABASE_db1_URL)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "bimillbeonhoishere"
ALGORITHM = "HS256"

# 환경 변수에서 인증 키 경로 가져오기

# openai api키 가져오기

class CreateData(BaseModel):
    userId: str
    password: str

class UpdataData(BaseModel):
    password: str

class timeChoice(BaseModel):
    userId: str
    time: str    

class placeChoice(BaseModel):
    userId: str
    location: str    

# Optional을 사용하는 이유는 선택지에 null값이 들어갈 수 있기 때문에

class tagChoice(BaseModel):
    userId: str
    food: Optional[str]
    dessert: Optional[str]
    shopping: Optional[str]
    history: Optional[str]
    experience: Optional[str]
    nature: Optional[str] 

class craftTextData(BaseModel):
    userId: str
    craftText: str

class routePathData(BaseModel):
    userId: str
    travelRoute: str

class ttsRequest(BaseModel):
    userId: str


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# JWT TOKEN 생성 함수

def createAccessToken(data: dict, expiresDelta: timedelta=timedelta(hours=1)) -> str: 
    toEncode = data.copy() # 토큰에 포함될 데이터를 복사
    expire = datetime.utcnow() + expiresDelta # 토큰 만료 시간 설정
    toEncode.update({"exp":expire}) # 만료시간 추가
    encodeJwt = jwt.encode(toEncode, SECRET_KEY, algorithm=ALGORITHM)
    return encodeJwt
    
# JWT TOKEN 디코딩 함수

def decode_jwt(token:str):
    try:
        # 토큰이 세 부분으로 나뉘어 있는지 확인 (옵션)
        if len(token.split('.')) != 3:
            raise ValueError("JWT 형식이 잘못되었습니다.")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userId: str = payload.get("sub")
        
        if not userId:
            raise ValueError("userId가 페이로드에 없습니다.")
        
        return userId
    except ExpiredSignatureError:
        print("토큰이 만료되었습니다.")
        return None
    except InvalidTokenError:
        print("유효하지 않은 토큰입니다.")
        return None
    except ValueError as ve:
        print(f"토큰 형식 오류: {ve}")
        return None

app = FastAPI()

# 데이터베이스 연결 및 해제 관리
async def manageDatabaseConnection(connect: bool):
    if connect:
        print("서버 시작 중...")  # 서버 시작 시
        await database_DB1.connect()  # DB 연결
    else:
        print("서버 종료 중...")  # 서버 종료 시
        await database_DB1.disconnect()  # DB 연결 해제

# FastAPI 시작 시 데이터베이스 연결
@app.on_event("startup")
async def startup():
    await manageDatabaseConnection(connect=True)

# FastAPI 종료 시 데이터베이스 연결 해제
@app.on_event("shutdown")
async def shutdown():
    await manageDatabaseConnection(connect=False)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

@app.post("/signup") # 회원가입 기능
async def create_data(data: CreateData):
    try:

        hashed_password = hash_password(data.password) # 비밀번호 해쉬화

        query = """
        INSERT INTO userTable (userId, password)
        VALUES (:userId, :password)
        """
        
        values = {
            "userId": data.userId,
            "password": hashed_password
        }

        await database_DB1.execute(query, values=values)

        return { # OK 200
                "success" : "true",
                "message" : "The Requset was successful"
            }
    except Exception as e : # error 500
        raise HTTPException(status_code=500, 
              detail={str(e)
                }
              )
        
@app.post("/login")
async def login(data: CreateData):
    try:
        # 데이터베이스에서 사용자 정보 가져오기
        query = "SELECT * FROM userTable WHERE userId = :userId"
        user_data = await database_DB1.fetch_one(query, values={"userId": data.userId})

        print(f"Received userId: {data.userId}")

        if not user_data:
            raise HTTPException(
                status_code=404,
                detail={
                    str(e)
                }
              )

        # 데이터베이스에서 가져온 해시된 비밀번호
        hashed_password = user_data["password"]
        
        # 필요 시, 해시된 비밀번호를 bytes로 변환 (만약 str로 저장된 경우)
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')


        print(f"Stored hashed password: {hashed_password}")

        # 입력된 비밀번호와 데이터베이스의 해시된 비밀번호를 비교
        if not bcrypt.checkpw(data.password.encode('utf-8'), hashed_password):
            raise HTTPException(
                status_code=400,
                detail={str(e)}   
                
            )

        access_token = createAccessToken(data={"sub": data.userId})
        return {"access_token":access_token, "tonken_type" : "bearer"}  # 토큰 반환

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )
        
@app.put("/changePw/{userId}")
async def pwsearch(userId: str, data : UpdataData):
    try: 
        
        query = "SELECT * FROM userTable WHERE userId = :userId"
        user_data = await database_DB1.fetch_one(query, values={"userId": userId})

        if not user_data:
            raise HTTPException(
                status_code=404,
                detail={
                    "message" : "User not found"
                    }
            )
        
        new_hashed_password = hash_password(data.password)
        update_query ="""
        UPDATE userTable
        SET password = :password
        WHERE userId = :userId
        """
        values = {
            "userId" : userId,
            "password": new_hashed_password
        }


        await database_DB1.execute(update_query, values=values) 
        
    except Exception as e:

        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )

# 음성 인식, STT API
@app.put("/upload")
async def upload_file(file: UploadFile = File(...), userId: str = Form(...)):
    content = await file.read()

    # 파일 형식 확인
    if file.content_type != "audio/webm":
        return JSONResponse(content={"error": "지원되지 않는 파일 형식입니다."}, status_code=400)

    try:
        # AudioSegment를 사용하여 webm 파일을 wav로 변환
        audio = AudioSegment.from_file(io.BytesIO(content), format='webm')
        audio = audio.set_sample_width(2)  # 16비트로 설정
        wav_io = io.BytesIO()
        audio.export(wav_io, format='wav')
        wav_io.seek(0)

        # Google STT API 설정
        client = speech.SpeechClient()
        audio = speech.RecognitionAudio(content=wav_io.read())
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=48000,
            language_code="ko-KR",
        )

        # 음성 인식 요청
        response = client.recognize(config=config, audio=audio)

        # 텍스트 결과 생성
        speechText = " ".join([result.alternatives[0].transcript for result in response.results])

        if not speechText:  # 텍스트가 비어있을 경우 예외 처리
            return JSONResponse(content={"error": "인식된 텍스트가 없습니다."}, status_code=400)

        # 데이터베이스에서 speechText 업데이트
        query = """UPDATE userTable SET speechText = :speechText WHERE userId = :userId"""
        await database_DB1.execute(query, {"userId": userId, "speechText": speechText})
        return JSONResponse(content={"speechText": speechText})

    except GoogleAPICallError as e:
        logging.error(f"Google API 호출 오류 발생: {str(e)}")
        return JSONResponse(content={"error": "Google API 호출 중 오류가 발생했습니다."}, status_code=500)
    except RetryError as e:
        logging.error(f"Google API 재시도 오류 발생: {str(e)}")
        return JSONResponse(content={"error": "Google API 재시도 중 오류가 발생했습니다."}, status_code=500)
    except Exception as e:
        logging.error(f"STT API 오류 발생: {str(e)}")
        return JSONResponse(content={"error": f"STT API 처리 중 오류가 발생했습니다: {str(e)}"}, status_code=500)

@app.put("/timechoice")
async def timechoice(data: timeChoice, token= Depends(oauth2_scheme)):

    try:
        userId= decode_jwt(token)

        print("userId", userId)

        timequery="""
        UPDATE userTable
        SET time = :time
        WHERE userId = :userId    
        """ 
        values={
            "userId" : userId,
            "time": data.time
        }

        await database_DB1.execute(timequery, values=values)
        
        

    except Exception as e:

        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )        

@app.put("/placechoice")
async def placechoice(data: placeChoice, token = Depends(oauth2_scheme)):
    
    if not data.location:
        raise HTTPException(status_code=422, detail="Location field is required")
    
    print("Received data:", data.dict())
    
    
    try:
        userId = decode_jwt(token)
        
        print("userId:", userId)

        placequery="""
        UPDATE userTable
        SET location = :location
        WHERE userId = :userId
        """

        values={
            "userId" : userId,
            "location": data.location
        }

        await database_DB1.execute(placequery, values=values)
        
        

    except Exception as e:

        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )
    
@app.put("/tagchoice")
async def tagchoice(data: tagChoice, token = Depends(oauth2_scheme)):
   
    print("Received data:", data.dict())

    try:
        userId = decode_jwt(token)

        print("userId:", userId)

        tagquery="""
        UPDATE userTable
        SET food = :food,
            dessert = :dessert,
            shopping = :shopping,
            history = :history,
            experience = :experience,
            nature = :nature
        WHERE userId = :userId
        """

        tagvalues={
            "userId" : userId,
            "dessert": data.dessert,
            "food": data.food,
            "shopping": data.shopping,
            "history": data.history,
            "experience": data.experience,
            "nature": data.nature
        }

        await database_DB1.execute(tagquery, values=tagvalues)

        query = "SELECT * FROM userTable WHERE userId = :userId"

        user_data = await database_DB1.fetch_one(query, values={"userId": userId})
        
        if not user_data:
            raise HTTPException(
                status_code=404,
                detail={
                    "message" : "User not found"
                    }
            )
        
        # 리스트를 초기화 하여 만들어 조건에 맞는 데이터를 넣어 문장을 구성
        TagRecommend = []

        if user_data['speechText']:
            TagRecommend.append(f"{user_data['speechText']}에서")

        if user_data['time']:
            TagRecommend.append(f"{user_data['time']}동안 여행다닐 수 있는")

        if user_data['location']:
            TagRecommend.append(f"{user_data['location']}인 장소를 추천해줘.")

        addition_TagRecommend=[]

        if user_data['food']:
            addition_TagRecommend.append(f"{user_data['food']}")

        if user_data['dessert']:
            addition_TagRecommend.append(f"{user_data['dessert']}")
        
        if user_data['shopping']:
            addition_TagRecommend.append(f"{user_data['shopping']}")

        if user_data['history']:
            addition_TagRecommend.append(f"{user_data['history']}")

        if user_data['experience']:
            addition_TagRecommend.append(f"{user_data['experience']}")

        if user_data['nature']:
            addition_TagRecommend.append(f"{user_data['nature']}")

        if addition_TagRecommend:
            addtion_text = ", ".join(addition_TagRecommend) 
            TagRecommend.append(f"해보고 싶은 것은 {addtion_text}이야. 이걸로 여행경로를 만들어줘.")   

        if TagRecommend:
            craft_text = " ".join(TagRecommend)    

        craftquery="""
        UPDATE userTable
        SET craftText = :craftText
        WHERE userId = :userId
        """

        craftvalues={
            "userId" : userId,
            "craftText": craft_text
        }

        await database_DB1.execute(craftquery, values=craftvalues)

        return {"message": "craftText updated successfully", "craftText": craft_text}




    except Exception as e:

        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )

@app.put("/routePath")
async def routepath(token=Depends(oauth2_scheme)):
    try:
        userId = decode_jwt(token)
        print("userId:", userId)

        query = "SELECT * FROM userTable WHERE userId = :userId"
        user_data = await database_DB1.fetch_one(query, values={"userId": userId})

        if not user_data:
            raise HTTPException(
                status_code=404,
                detail={"message": "User not found"}
            )

        
        print({openai.api_key})

        async def ask_chatgpt(question):
            try:
                response = await openai.ChatCompletion.acreate(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": question}
                    ],
                    max_tokens=2000,
                    temperature=0.3
                )
                return response['choices'][0]['message']['content'].strip()
            except openai.error.RateLimitError as e:
                raise HTTPException(status_code=429, detail="OpenAI API 사용량 한도를 초과했습니다. 사용량을 확인하시거나 나중에 다시 시도해 주세요.")
            except openai.error.OpenAIError as e:
                print(f"ChatGPT API error: {str(e)}")
                raise HTTPException(status_code=500, detail="ChatGPT API 오류")
        
        
        question = user_data['craftText']
        
        print("craftText", question)
        
        if not question:
            raise HTTPException(status_code=400, detail="craftText is required")

        travelRoute = await ask_chatgpt(question)
        print("Generated travelRoute:", travelRoute)  # 생성된 travelRoute 출력

        pathquery = """
        UPDATE userTable
        SET travelRoute = :travelRoute
        WHERE userId = :userId
        """
        
        values = {
            "userId": userId,
            "travelRoute": travelRoute
        }

        await database_DB1.execute(pathquery, values=values)
        
        return {"travelRoute": travelRoute}

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )
        
@app.post("/tts")
async def get_tts(data: ttsRequest):
    user_id = data.userId

    # userId를 통해 travelRoute 가져오기
    query = "SELECT travelRoute FROM userTable WHERE userId = :userId"
    values = {"userId": user_id}
    
    travel_route = await database_DB1.fetch_one(query, values=values)
    
    if travel_route is None:
        raise HTTPException(status_code=404, detail="여행 경로를 찾을 수 없습니다.")
    
    # TTS API 호출
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=travel_route['travelRoute'])
    voice = texttospeech.VoiceSelectionParams(
        language_code="ko-KR",
        name="ko-KR-Wavenet-A"  # 스탠다드 음성 사용
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    try:
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
    except (GoogleAPICallError, RetryError) as e:
        logger.error(f"TTS API 호출 오류: {e}")
        raise HTTPException(status_code=500, detail="TTS API 요청 실패")

    # 오디오 콘텐츠를 Base64로 인코딩하여 반환
    audio_content = base64.b64encode(response.audio_content).decode("utf-8")
    
    return JSONResponse(content={"audio_content": audio_content})

    
@app.get("/travelRoute")
async def travelrouteGet(token=Depends(oauth2_scheme)):
    try:
        userId = decode_jwt(token)
        print("userId:", userId)

        query = "SELECT * FROM userTable WHERE userId = :userId"
        user_data = await database_DB1.fetch_one(query, values={"userId": userId})

        if not user_data:
            raise HTTPException(
                status_code=404,
                detail={"message": "User not found"}
            )
        
        if not user_data["travelRoute"]:
            raise HTTPException(
                status_code=404,
                detail={"message": "Travel route not found"}
            )
        
        # 여행 경로 데이터를 클라이언트에 반환
        return {"travelRoute": user_data["travelRoute"]}

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )
        
@app.put("/keywords")
async def extract_place_keywords(token=Depends(oauth2_scheme)):
    try:
        userId = decode_jwt(token)
        logging.info(f"userId: {userId}")

        # 사용자 데이터 조회
        query = "SELECT * FROM userTable WHERE userId = :userId"
        user_data = await database_DB1.fetch_one(query, values={"userId": userId})

        if not user_data:
            logging.error("User not found")
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user_data["travelRoute"]:
            logging.error("Travel route not found")
            raise HTTPException(status_code=404, detail="Travel route not found")
        
        text = user_data["travelRoute"]

        if not text or not isinstance(text, str):
            logging.error("Invalid text input")
            raise HTTPException(status_code=400, detail="Invalid text input")

        # 챗GPT API 호출하여 답변 받기
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"다음 텍스트에서 장소와 관련된 키워드를 추출해 주세요: {text}. 키워드를  쉼표로 구분된 리스트 형식으로 반환해 주세요."}
            ],
            max_tokens=500,
            temperature=0.3
        )
        chatgpt_answer = response['choices'][0]['message']['content'].strip()

        # 응답을 쉼표로 분리하여 키워드 추출
        keywords = [keyword.strip() for keyword in chatgpt_answer.split(',')]

        if not keywords:
            logging.error("No keywords found in ChatGPT response")
            raise HTTPException(status_code=400, detail="챗GPT 응답에서 키워드를 찾을 수 없습니다.")

        keywords_str = ", ".join(keywords)
        logging.info(f"Extracted keywords: {keywords_str}")

        # 키워드를 DB에 업데이트
        query = """UPDATE userTable 
        SET keyword = :keyword 
        WHERE userId = :userId"""
        
        values = {"userId": userId, "keyword": keywords_str}
        await database_DB1.execute(query, values=values)

        return {"keyword": keywords_str}

    except Exception as e:
        logging.error(f"장소 키워드 추출 중 오류 발생: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="서버 내부 오류 발생")
        
@app.get("/keywordGet")
async def keywordGet(token=Depends(oauth2_scheme)):
    try:
        userId = decode_jwt(token)
        print("userId:", userId)

        query = "SELECT * FROM userTable WHERE userId = :userId"
        user_data = await database_DB1.fetch_one(query, values={"userId": userId})

        if not user_data:
            raise HTTPException(
                status_code=404,
                detail={"message": "User not found"}
            )
        
        if not user_data["keyword"]:
            raise HTTPException(
                status_code=404,
                detail={"message": "Travel route not found"}
            )
        
        # 여행 경로 데이터를 클라이언트에 반환
        return {"keyword": user_data["keyword"]}

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # 서버 콘솔에 에러 메시지를 출력
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)  # 실제 예외 메시지를 클라이언트에 전달
            }
        )        

@app.get("/makeImg/{user_id}")
async def generate_image(user_id: str):
    try:
        # 데이터베이스에서 키워드 가져오기
        query = "SELECT keyword FROM userTable WHERE userId = :userId"
        values = {"userId": user_id}
        keyword_data = await database_DB1.fetch_one(query, values=values)
        if keyword_data is None:
            raise HTTPException(status_code=404, detail="Keyword not found")
        # 키워드 추출 및 분리
        keywords = keyword_data['keyword'].split(',')
        # 키워드를 기반으로 프롬프트 생성
        combined_prompt = "A beautiful scene in Japan featuring: " + ", ".join(keyword.strip() for keyword in keywords)
        # OpenAI API를 통해 이미지 생성
        response = openai.Image.create(
            prompt=combined_prompt,
            n=1,
            size="512x512"
        )
        image_url = response['data'][0]['url']
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))