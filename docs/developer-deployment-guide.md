# Letit 개발 환경 · 배포 · 앱 설치 가이드

2026-11-20 기준. 다른 개발자가 `main`을 클론한 뒤 로컬 실행, API 연결, 웹 배포, 휴대폰 앱 설치까지 진행하기 위한 문서입니다. 실제 키와 비밀번호는 포함하지 않습니다.

## 1. 먼저 알아둘 현재 상태

| 항목                  | 현재 상태                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------- |
| 프런트 저장소         | [2026_GANZITHON_TEAM_05_FE](https://github.com/2026Ganzi-Thon/2026_GANZITHON_TEAM_05_FE) |
| 백엔드 저장소         | [2026_GANZITHON_TEAM_05_BE](https://github.com/2026Ganzi-Thon/2026_GANZITHON_TEAM_05_BE) |
| 프런트 배포           | [https://letit.vercel.app](https://letit.vercel.app), Vercel                             |
| 백엔드 배포 주소      | `https://letit-backend.onrender.com` (Render)                                            |
| 프런트 main           | API 연결, 카카오맵, 위치 동의 재사용, PWA 설치 기능 포함                                 |
| 백엔드 main           | PR #1·#2 병합 완료. 인증·미션·장소·성찰·도감 라우터 포함                                 |
| 현재 공유 웹의 데이터 | 운영·미리보기 모두 위 백엔드에 연결된 API 모드. 미리보기 주소는 백엔드 CORS 추가 필요    |
| AI 검증               | 기존 로컬 통합 검증은 서버 예비 추천 사용. 실제 Upstage 호출은 별도 확인 필요            |

프런트만 클론하면 개인 `.env.local`, 지도 키, 실행 중인 API 서버, 로컬 DB는 따라오지 않습니다. 기존 작업자의 `8001` 서버와 `로컬 통합 미리보기.cmd`는 개인 작업 환경이며 새 클론의 기본 실행 조건이 아닙니다.

이 문서의 백엔드 실행·배포 명령은 담당자가 자신의 환경에서 진행하기 위한 절차입니다. 이 문서를 작성하면서 백엔드를 원격 수정하거나 서버·DB를 새로 배포하지 않았습니다. 확인한 범위와 서버 보완 항목은 [API 연동 상태](api-integration.md)를 함께 봐 주세요.

## 2. 필요한 도구와 계정

| 대상                    | 준비할 것                                                   |
| ----------------------- | ----------------------------------------------------------- |
| 모든 프런트 개발자      | Git, Node.js 24, npm, 편집기                                |
| 백엔드 로컬 실행 담당자 | Python 3.12 또는 3.13                                       |
| 지도 연동 담당자        | 팀 Kakao Developers 앱의 JavaScript 키와 도메인 설정 권한   |
| 서버 담당자             | Kakao REST API 키, Upstage API 키, JWT 비밀키, DB 연결 정보 |
| 배포 담당자             | 팀 Vercel 프로젝트 접근 권한, 백엔드 호스팅 및 DB 관리 권한 |

프런트 `.nvmrc`는 `24.11.0`, `package.json`의 최소 Node 버전은 `22.22.0`입니다. 팀 기준인 Node 24로 맞추고 `node -v`, `npm -v`로 확인합니다. macOS/Linux의 nvm은 저장소에서 `nvm install`, `nvm use`로 `.nvmrc`를 적용합니다. nvm-windows는 `nvm install 24.11.0`, `nvm use 24.11.0`처럼 버전을 명시합니다. 도구가 없는 Windows 환경에서는 Node 24를 설치해도 됩니다.

## 3. main 클론 후 프런트 실행

```bash
git clone https://github.com/2026Ganzi-Thon/2026_GANZITHON_TEAM_05_FE.git
cd 2026_GANZITHON_TEAM_05_FE
git switch main
npm ci
git switch -c feat/your-task
```

`npm ci`는 커밋된 `package-lock.json` 기준으로 의존성을 설치합니다. 새 기능 작업은 `main`에서 만든 개인 브랜치에서 진행합니다.

처음 클론한 저장소에서 환경파일을 만듭니다. 이미 `.env.local`이 있다면 복사하지 말고 기존 파일을 수정합니다.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS / Linux:

```bash
cp .env.example .env.local
```

개발 주소를 통일하려면 다음 명령을 사용합니다.

```bash
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

브라우저에서 `http://127.0.0.1:5178`을 엽니다. 포트가 사용 중이면 기존 서버를 확인하거나 포트를 바꾸고, 백엔드 CORS와 카카오 SDK 허용 도메인도 같은 포트로 맞춥니다. `npm run dev`만 실행하면 기본 포트는 5173이며, 사용 중이면 다른 포트로 바뀔 수 있습니다.

### A. 화면만 확인할 때: 목업 모드

`.env.local`의 두 값을 비웁니다.

```dotenv
VITE_API_BASE_URL=
VITE_KAKAO_MAP_APP_KEY=
```

- 백엔드나 키 없이 `/home`, `/collection`, `/reflection`을 직접 열 수 있습니다.
- 로그인·미션·기록·꽃은 예시 데이터입니다. 화면 이동 중에는 바뀌지만 새로고침하면 초기 예시로 돌아갑니다.
- 실제 장소 검색과 AI 추천 성공 여부를 이 모드로 판단하지 않습니다.

### B. 실제 API로 개발할 때

로컬 백엔드를 8000 포트에서 실행한다면 다음과 같이 설정합니다.

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_KAKAO_MAP_APP_KEY=REPLACE_WITH_JAVASCRIPT_KEY
```

`REPLACE_WITH_JAVASCRIPT_KEY`는 예시이므로 실제 팀 JavaScript 키로 교체합니다. 서버 담당자가 공유 API를 제공하면 `VITE_API_BASE_URL`에 그 HTTPS 주소를 넣습니다. origin만 넣거나 `/api/v1`까지 넣을 수 있고, 프런트가 접두사를 한 번만 붙입니다. `/docs` 주소를 넣지는 않습니다.

환경파일을 바꾼 뒤에는 개발 서버를 종료하고 다시 실행합니다. 로그인 화면에서 계정을 만들고 설문을 완료해 홈으로 들어갑니다. 다른 개발자의 로컬 DB 계정은 내 로컬 DB에 없으므로 새 계정이 필요할 수 있습니다.

## 4. 환경변수와 키를 넣는 위치

| 변수                     | 로컬 위치        | 배포 위치                    | 용도                               |
| ------------------------ | ---------------- | ---------------------------- | ---------------------------------- |
| `VITE_API_BASE_URL`      | FE `.env.local`  | Vercel 환경변수              | FastAPI 주소, 비어 있으면 목업     |
| `VITE_KAKAO_MAP_APP_KEY` | FE `.env.local`  | Vercel 환경변수              | 지도 표시용 JavaScript 키          |
| `DATABASE_URL`           | BE `.env`        | 백엔드 서비스 환경변수       | SQLite 또는 PostgreSQL 연결        |
| `JWT_SECRET_KEY`         | BE `.env`        | 백엔드 서비스 환경변수       | 로그인 토큰 서명 비밀값            |
| `JWT_EXPIRE_MINUTES`     | BE `.env`, 선택  | 백엔드 서비스 환경변수, 선택 | 토큰 유효 시간, 코드 기본값 1440분 |
| `CORS_ORIGINS`           | BE `.env`        | 백엔드 서비스 환경변수       | 허용할 프런트 origin 목록          |
| `KAKAO_REST_API_KEY`     | BE `.env`에 추가 | 백엔드 서비스 환경변수       | 실제 주변 장소 검색                |
| `UPSTAGE_API_KEY`        | BE `.env`에 추가 | 백엔드 서비스 환경변수       | 실제 AI 미션 추천                  |

프런트에서 사용하는 키는 **JavaScript 키**이고, 백엔드 장소 검색은 **REST API 키**를 씁니다. 서로 바꿔 넣지 않습니다. 어드민 키는 현재 지도 연동에 필요하지 않습니다.

`.env.local`과 BE `.env`는 Git에서 제외합니다. `.env.example`에는 변수명과 예시만 공유합니다. 팀 키는 앱 관리자에게 별도로 받고 문서·PR 본문·스크린샷에 실제 값을 넣지 않습니다.

`VITE_` 값은 빌드된 브라우저 코드에 들어갑니다. JavaScript 지도 키도 실행 중 확인할 수 있으므로 허용 도메인으로 사용 범위를 제한합니다. REST 키, AI 키, JWT 비밀값, DB 비밀번호는 `VITE_` 변수에 넣지 않습니다. Vercel 환경변수로 설정해도 `VITE_` 값이 브라우저 비밀값으로 바뀌지는 않습니다. [Vite 환경변수 문서](https://vite.dev/guide/env-and-mode)

## 5. 백엔드를 내 PC에서 실행할 때

공유 API 주소를 사용할 수 있다면 이 단계 대신 그 주소를 FE에 설정하면 됩니다. 직접 띄울 때는 FE와 별도 폴더에 백엔드 `main`을 받습니다.

```bash
git clone https://github.com/2026Ganzi-Thon/2026_GANZITHON_TEAM_05_BE.git
cd 2026_GANZITHON_TEAM_05_BE
git switch main
```

Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

macOS / Linux:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
cp .env.example .env
```

BE `.env` 예시입니다. 키 자리의 예시 문자열은 실제 값으로 교체합니다. AI 없이 화면을 확인하려면 `UPSTAGE_API_KEY`를 비워 둘 수 있지만, 이때 추천은 서버 예비 데이터로 동작합니다.

```dotenv
DATABASE_URL=sqlite:///./letit_local.db
JWT_SECRET_KEY=REPLACE_WITH_LONG_RANDOM_SECRET
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://127.0.0.1:5178,http://localhost:5178
KAKAO_REST_API_KEY=REPLACE_WITH_REST_API_KEY
UPSTAGE_API_KEY=
```

`JWT_SECRET_KEY`는 예시를 그대로 쓰지 않고 충분히 긴 무작위 값으로 생성합니다. 서버가 여러 개라면 같은 환경의 서버들은 동일한 서명 키를 사용해야 합니다. 키를 바꾸면 기존 토큰은 무효가 됩니다.

새 로컬 SQLite DB에 테이블을 만든 뒤 API 서버를 실행합니다.

Windows PowerShell:

```powershell
.\.venv\Scripts\python.exe -m app.init_db
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

macOS / Linux:

```bash
.venv/bin/python -m app.init_db
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

확인 주소:

- `http://127.0.0.1:8000/health`: 프로세스 정상, `{"status":"ok"}`
- `http://127.0.0.1:8000/health/db`: DB 연결 정상, `{"database":"connected"}`
- `http://127.0.0.1:8000/docs`: Swagger에서 회원가입·로그인·기본값 및 미션·성찰·도감 라우터 확인
- `http://127.0.0.1:8000/openapi.json`: 실제 서버 계약 확인

`/health`만 성공해도 DB나 전체 API가 정상이라는 뜻은 아닙니다. BE README의 초기 구현 설명보다 현재 OpenAPI와 실제 응답을 기준으로 확인합니다. 기존 임의 작업본 대신 두 PR이 병합된 최신 `main`인지도 확인합니다.

## 6. 카카오맵과 CORS 맞추기

### 지도 앱 관리자 설정

1. 팀 Kakao Developers 앱을 엽니다. 개발자마다 앱을 새로 만들 필요는 없습니다.
2. **카카오맵 → 사용 설정**을 활성화합니다.
3. **일반 → 플랫폼 키 → 사용할 JavaScript 키 → JavaScript SDK 도메인**에 프런트 주소를 등록합니다. 콘솔 화면 이름이 바뀌면 아래 공식 문서를 참고합니다.
4. 프런트에는 같은 앱의 JavaScript 키, 백엔드에는 장소 검색용 REST API 키를 설정합니다.

등록할 JavaScript SDK 도메인 예시:

```text
http://127.0.0.1:5178
http://localhost:5178
https://letit.vercel.app
```

커스텀 도메인이나 PR 미리보기 주소로 테스트할 때는 그 주소도 추가합니다. `localhost`와 `127.0.0.1`, 서로 다른 포트는 별도 주소입니다. **제품 링크 관리의 웹 도메인만 등록하면 지도 SDK 허용 도메인 설정을 대신하지 못합니다.** [카카오 앱 키 설정 문서](https://developers.kakao.com/docs/ko/getting-started/app-key-migration)

### 백엔드 CORS

백엔드 `CORS_ORIGINS`에도 브라우저에서 실제로 여는 주소를 넣고 서버를 재시작합니다.

```dotenv
CORS_ORIGINS=http://127.0.0.1:5178,http://localhost:5178,https://letit.vercel.app
```

origin은 `스킴://호스트:포트`입니다. `/home`, `/api/v1` 같은 경로나 끝의 `/`를 붙이지 않습니다. 현재 서버는 쉼표로 분리한 정확한 origin 목록을 사용하며, `https://*.vercel.app` 문자열을 넣는 방식은 지원하지 않습니다. PR 미리보기는 테스트할 정확한 주소를 추가하거나 팀의 고정된 스테이징 도메인을 사용합니다.

SDK 도메인은 **지도 표시**, CORS는 **프런트→백엔드 요청**에 대한 설정이므로 각각 맞춰야 합니다. 브라우저 지도 타일이 보인다고 백엔드 장소 검색까지 성공한 것은 아닙니다.

### 위치와 검색 범위

- API 모드는 장소 미션을 선택했을 때 기존 브라우저 권한을 확인합니다. 이미 허용했다면 앱 동의 팝업을 생략합니다. 처음이면 안내 후 위치를 요청합니다.
- 에너지 1단계 50m, 2단계 100m, 3단계 500m가 검색 반경입니다. 4단계는 선택한 거리 조건을 사용합니다. 편의점이 근처에 있어도 50m 밖이면 1단계 결과는 비어 있을 수 있습니다.
- 위치는 브라우저가 보고한 좌표입니다. PC에서는 오차가 클 수 있으며, 오차가 반경보다 크면 안내가 나옵니다. 재검색 버튼은 위치를 새로 요청합니다.
- 실제 휴대폰 위치 검증은 HTTPS 주소에서 합니다. PC의 `localhost`는 그 PC, 휴대폰의 `localhost`는 그 휴대폰을 가리킵니다. 휴대폰에서 PC의 `127.0.0.1:8000`에 접근할 수 없습니다.
- 일반적인 사설 IP의 HTTP 개발 주소는 위치 API의 보안 컨텍스트 조건을 만족하지 않을 수 있으므로, 실기기는 HTTPS 미리보기와 접근 가능한 API를 사용합니다. [브라우저 위치 API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)

## 7. 서버와 웹 배포 순서

**백엔드 HTTPS 주소 확보 → DB·키·CORS 검증 → Vercel 환경변수 설정 → 프런트 재배포 → 실제 로그인·지도·기록 검증** 순서로 진행합니다.

### 7-1. 백엔드 서버 배포

프런트 Vercel 프로젝트는 `dist`를 제공하는 웹 배포입니다. FastAPI 프로세스는 별도의 백엔드 서비스로 띄웁니다. 아래는 Render를 사용할 경우의 설정 예시이며, 현재 팀이 Render에 배포했다는 뜻은 아닙니다.

| 설정              | 값                                                           |
| ----------------- | ------------------------------------------------------------ |
| 저장소            | 백엔드 저장소                                                |
| 배포 브랜치       | `main`                                                       |
| 서비스 종류       | Python Web Service                                           |
| 작업 디렉터리     | 백엔드 저장소 루트                                           |
| 빌드 명령         | `pip install -r requirements.txt`                            |
| 실행 명령         | `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health`                                                    |
| 환경변수          | 이 문서 4절의 BE 변수 전체                                   |

`$PORT`는 호스팅 서비스가 제공하는 포트이며 위 실행 명령은 서비스의 Linux 실행 환경에 입력합니다. 실제 Python 버전은 팀이 검증한 3.12/3.13 패치 버전으로 고정합니다. 운영 실행에 개발용 `--reload`는 붙이지 않습니다. 다른 호스팅을 쓰면 동일한 앱 경로 `app.main:app`과 서비스가 요구하는 포트 설정을 적용합니다. [Render FastAPI 배포 문서](https://render.com/docs/deploy-fastapi)

운영 DB는 백엔드 담당자가 관리하는 영구 PostgreSQL을 사용합니다. 로컬 SQLite 파일을 기본값 그대로 두면 호스팅의 재배포·인스턴스 변경 시 데이터 유지가 보장되지 않습니다. 여러 서버가 같은 로컬 SQLite 파일을 공유하는 배포 구성도 사용하지 않습니다.

Supabase를 쓴다면 프로젝트의 **Connect**에서 실제 연결 문자열을 받아 SQLAlchemy용 `postgresql+psycopg://` 형식과 TLS 설정을 맞춥니다. 장기 실행 FastAPI 서버의 연결 방식은 네트워크의 IPv4/IPv6 지원과 풀링 방식에 맞춰 결정합니다. 새 DB 스키마는 백엔드 담당자가 저장소의 `sql/001_schema.sql`을 검토해 적용하고 `/health/db`를 확인합니다. 기존 DB 초기화나 재생성 명령을 배포 때마다 실행하지 않습니다. [Supabase PostgreSQL 연결 문서](https://supabase.com/docs/guides/database/connecting-to-postgres)

발급된 실제 백엔드 HTTPS 주소에서 `/health`, `/health/db`, `/docs`를 확인한 뒤 합성 테스트 계정으로 로그인과 각 기능을 확인합니다. `UPSTAGE_API_KEY`가 있어도 응답이 `fallbackUsed: true`라면 실제 AI 성공으로 보지 않고 서버 로그·모델 접근 권한·응답 검증 실패를 확인합니다.

### 7-2. Vercel 프런트 연결

기존 팀 프로젝트를 사용한다면 새 Vercel 프로젝트를 만들지 않고 프로젝트 접근 권한을 받습니다. 별도 배포가 필요하다면 FE 저장소를 연결하고 다음 값으로 설정합니다.

| 설정              | 값                 |
| ----------------- | ------------------ |
| Framework Preset  | Vite               |
| Production Branch | `main`             |
| Root Directory    | 프런트 저장소 루트 |
| Node.js           | 24.x               |
| Install Command   | `npm ci`           |
| Build Command     | `npm run build`    |
| Output Directory  | `dist`             |

현재 팀 프로젝트는 main 자동 배포와 PR 미리보기를 사용합니다. 다른 팀 계정에 연결된 Git 저장소·환경변수 설정이 clone만으로 복제되는 것은 아닙니다. [Vercel의 Vite 배포 문서](https://vercel.com/docs/frameworks/frontend/vite)

프로젝트 **Settings → Environment Variables**에서 다음을 설정합니다. `https://api.example.com`은 실제 주소가 아닌 예시이며 백엔드 담당자가 공유한 HTTPS 주소로 교체합니다.

```dotenv
VITE_API_BASE_URL=https://api.example.com
VITE_KAKAO_MAP_APP_KEY=REPLACE_WITH_JAVASCRIPT_KEY
```

운영 값은 Production에, 미리보기 테스트 값은 Preview에 각각 적용합니다. Preview도 기본적으로 main과 같은 운영 DB를 사용한다고 가정하지 말고 테스트 환경을 정합니다. 백엔드 CORS와 카카오 SDK 허용 도메인에는 각각 사용할 프런트 주소를 추가합니다.

**변수를 저장한 뒤 새 빌드로 재배포합니다.** 이미 생성된 `dist`는 나중에 환경변수만 바꿔도 갱신되지 않습니다. 배포 웹에서는 로컬 `.env.local`을 읽지 않습니다. HTTPS 프런트에서 HTTP 백엔드를 호출하면 혼합 콘텐츠로 막힐 수 있으므로 API도 HTTPS를 사용합니다. [Vercel 환경변수 문서](https://vercel.com/docs/environment-variables)

저장소의 `vercel.json`은 화면 주소 직접 접근을 `index.html`로 연결하고 서비스 워커·manifest·정적 파일 헤더를 설정합니다. 다른 정적 호스팅으로 옮겨도 `/reflection/help` 같은 SPA 경로의 새로고침 처리와 실제 정적 파일 제공이 유지되어야 합니다.

## 8. 배포한 웹을 휴대폰 앱처럼 설치하기

현재 구현은 **PWA**입니다. 배포 웹을 휴대폰 홈 화면에 추가하면 아이콘과 앱 이름으로 실행하고, standalone 실행을 지원합니다. 프런트 웹 업데이트를 배포하면 설치한 PWA도 이후 웹을 다시 열거나 새로고침할 때 해당 배포를 사용합니다. 이미 열려 있는 화면이 즉시 교체되는 방식은 아닙니다.

### 사용자 설치 순서

1. 휴대폰에서 `https://letit.vercel.app` 또는 팀이 확정한 HTTPS 배포 주소를 엽니다.
2. Android Chrome은 메뉴의 **앱 설치** 또는 **홈 화면에 추가**를 선택합니다.
3. iPhone은 Safari의 공유 메뉴에서 **홈 화면에 추가**를 선택합니다.
4. 홈 화면의 Letit 아이콘으로 실행하고 로그인·위치 허용·미션 흐름을 확인합니다.

메뉴 이름과 설치 표시 조건은 OS·브라우저에 따라 다릅니다. 카카오톡 같은 앱 안의 브라우저에서는 외부 Chrome/Safari로 열어 진행합니다. [PWA 설치 안내](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing)

### 개발자가 확인할 파일

| 파일                          | 역할                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| `public/manifest.webmanifest` | 앱 이름, 아이콘, `start_url: /`, `scope: /`, `display: standalone` |
| `public/icons/`               | 192/512px, maskable, Apple 터치 아이콘                             |
| `index.html`                  | manifest·Apple 아이콘 연결, 모바일 메타 정보                       |
| `src/main.tsx`                | 배포 빌드일 때 `/sw.js` 등록                                       |
| `public/sw.js`                | 오프라인 안내 화면 캐시 및 네트워크 실패 시 안내                   |
| `public/offline.html`         | 인터넷 연결이 없을 때 표시할 화면                                  |
| `vercel.json`                 | SPA 경로와 서비스 워커·정적 파일 헤더                              |

현재 서비스 워커는 JS·CSS·API 데이터를 오프라인 저장하지 않습니다. PWA 설치가 오프라인 미션 수행·후기 저장 기능을 추가하지는 않습니다. 토큰은 메모리에만 있으므로 PWA를 완전히 종료한 뒤 다시 열면 재로그인이 필요할 수 있습니다. 서버에 저장된 기록은 같은 계정으로 로그인해 다시 조회합니다.

### 로컬에서 PWA 빌드 확인

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

`http://127.0.0.1:4173`을 열어 개발자 도구의 Application에서 manifest와 서비스 워커를 확인합니다. `npm run dev`에서는 서비스 워커를 새로 등록하지 않습니다. 지도·API도 검증하려면 `4173` origin을 각각 SDK 허용 도메인과 백엔드 CORS에 추가합니다. 이 PC용 주소를 휴대폰에 입력하는 것은 실기기 검증 방법이 아닙니다.

### Play Store / App Store 등록이 필요하다면

현재 저장소에는 Android/iOS 네이티브 프로젝트, APK/AAB/IPA 빌드, 서명, 스토어 심사 설정이 없습니다. 홈 화면 설치와 스토어 등록은 별도 작업입니다. 스토어 배포가 목표라면 웹 UI 재사용 방식과 네이티브 앱 구성을 정한 뒤 앱 ID·서명·위치 권한·지도·CORS·로그인·실기기 테스트·스토어 제출 자료를 별도로 준비합니다. 현재 가이드는 이미 구현된 PWA 설치까지 다룹니다.

## 9. 다른 개발자가 유지해야 할 동작과 작업 위치

| 변경 대상            | 먼저 볼 파일                                                               |
| -------------------- | -------------------------------------------------------------------------- |
| API 요청·응답        | `src/api/endpoints.ts`, `contracts.ts`, `validation.ts`, `presentation.ts` |
| API URL·인증 토큰    | `src/api/config.ts`, `session.ts`, `client.ts`                             |
| 미션 API 흐름        | `src/features/outings/ApiOutingFlow.tsx`, `src/stores/apiMissionStore.ts`  |
| 목업 흐름            | `src/features/outings/OutingFlow.tsx`, `src/mocks/data.ts`                 |
| 지도·위치 권한       | `src/features/outings/OutingMap.tsx`, `src/lib/kakaoMaps.ts`               |
| 공통 화면·버튼·팝업  | `src/components/layout`, `src/components/ui`                               |
| 디자인 토큰·스크롤바 | `src/styles/index.css`, `src/features/outings/letit.css`                   |
| 페이지 경로          | `src/constants/paths.ts`, `src/app/router.tsx`                             |

- API 실패를 목업 성공으로 바꾸지 않습니다. 서버 계약이 바뀌면 타입·변환·테스트를 함께 맞춥니다.
- 토큰·위치·후기를 임의로 `localStorage`에 저장하지 않습니다. 새로고침 후 재로그인은 현재 인증 구조입니다.
- 장소 없는 미션은 기기 위치와 주변 검색을 호출하지 않습니다. 이미 허용한 브라우저에는 동의 팝업을 반복하지 않습니다.
- 단계 체크 요청은 순서대로 저장하고, 저장·완료는 마지막 체크가 끝나기를 기다립니다. 꽃 지급과 기록 집계는 서버 결과를 사용합니다.
- 공통 UI를 먼저 재사용합니다. 가짜 시간·와이파이·배터리는 표시하지 않고 상단 디자인 여백을 유지합니다. 스크롤 동작은 유지하되 스크롤바는 공통으로 숨깁니다.

PR 전에는 다음을 실행하고 바꾼 화면의 긴 텍스트·빈 결과·오류·좁은 화면을 확인합니다.

```bash
npm test
npm run lint
npm run build
npm run format:check
```

## 10. 배포 후 실제로 확인할 항목

| 확인                                  | 기대 결과                                                           |
| ------------------------------------- | ------------------------------------------------------------------- |
| `/health` + `/health/db`              | 서버와 DB 모두 정상                                                 |
| Swagger 라우터                        | 인증·기본값·미션·장소·후기·휴식·성찰·아카이브·도감 제공             |
| 회원가입 → 설문 → 홈 → 재로그인       | 서버 기본값 복원, 잘못된 비밀번호는 오류                            |
| 추천                                  | 실제 AI 여부를 `fallbackUsed`로 구분                                |
| 장소 미션                             | 최초 권한 안내, 허용 상태에서는 안내 생략, 실제 주변 결과·지도 표시 |
| 장소 15개·320/402px                   | 카드 두 열, 가로 넘침 없음, 핀/카드 선택 일치                       |
| 일부 체크 → 저장 → 이어하기           | 같은 미션과 체크 상태 복원                                          |
| 완료 → 후기 → 성찰                    | 서버 저장 및 날짜별 집계 확인                                       |
| 도감                                  | 서버가 지급한 꽃 조회, 확인 요청으로 중복 지급하지 않음             |
| 아카이브 숨김                         | 목록에서 숨겨지고 기존 통계·획득 꽃 유지                            |
| `/reflection/help` 직접 접근·새로고침 | 호스팅 404 없이 앱 화면 표시                                        |
| PWA                                   | 아이콘·이름·앱 실행 확인, 네트워크 단절 시 안내                     |

합성 계정과 별도 테스트 DB에서 확인합니다. 꽃의 3일 정책을 보려고 운영 데이터나 서버 날짜를 바꾸지 않습니다.

서버 담당자가 배포 전 따로 확인할 사항은 장소 스냅샷 저장, 에너지 0단계 실내 추천, 날짜별 기록·꽃 갱신, 실제 Upstage/Supabase 연결입니다. 기존 개인 로컬 통합 서버의 보완 코드가 공유 main에도 모두 들어 있다고 가정하면 안 됩니다. [상세 상태](api-integration.md)

## 11. 문제 해결

| 증상                                           | 확인할 곳                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 다른 개발자는 동작하는데 내 PC는 로그인 재시도 | FE API 주소, 내 PC의 서버 실행 여부, 해당 DB에 계정이 있는지, CORS, Network 응답 코드 확인 |
| 배포했는데 예시 데이터만 나옴                  | Vercel Production의 `VITE_API_BASE_URL`과 그 값을 반영한 새 빌드인지 확인                  |
| 환경변수를 바꿔도 그대로임                     | 개발 서버 재시작 또는 배포 재빌드. 설치된 PWA는 재실행/새로고침                            |
| `Failed to fetch` 또는 CORS 오류               | 실제 프런트 origin과 `CORS_ORIGINS`, HTTPS API 접근, 서버 상태 확인                        |
| API 404                                        | URL에 `/api/v1`이 중복됐는지, 잘못된 서버/브랜치인지, `/docs`의 경로 확인                  |
| API 422                                        | 요청 필드·enum·UUID를 실제 OpenAPI와 비교. 키를 바꾸는 것으로 해결하지 않음                |
| 지도 SDK 401 / `domain mismatched`             | JavaScript 키 종류, 해당 키의 SDK 도메인, 포트, 카카오맵 사용 설정 확인                    |
| 지도는 보이는데 장소가 없음                    | 검색 반경·기기 위치와 `/places/nearby` 결과 확인. 1단계는 50m                              |
| 장소 검색 API 503                              | 백엔드 REST 키·Kakao Local 응답·서버 외부 통신 확인                                        |
| 장소를 만들었는데 상세 주소가 없음             | 서버가 ID 외 장소 스냅샷도 저장하는지 확인. 프런트는 현재 실행의 조회 결과까지만 보완      |
| 매번 같은 AI 미션이 나옴                       | 응답의 `fallbackUsed`, Upstage 키·접근 가능한 모델·서버 로그 확인                          |
| 위치가 거부됨                                  | 브라우저 사이트 설정과 OS 위치 권한 확인. HTTPS 실기기에서도 테스트                        |
| 새로고침 후 로그아웃됨                         | 현재 메모리 토큰 구조의 동작. 같은 계정으로 재로그인                                       |
| PWA 설치 메뉴가 없음                           | HTTPS, 외부 Chrome/Safari, manifest·아이콘 응답, 이미 설치됐는지 확인                      |
| 오프라인에서 미션이 안 열림                    | 현재 서비스 워커는 오프라인 안내만 제공. 실제 작업은 네트워크 필요                         |

## 12. 인수인계할 때 공유할 값

실제 비밀값은 안전한 팀 채널로 전달하고 Git 문서에는 아래의 위치·담당자·상태만 갱신합니다.

| 항목                                | 현재 전달 상태                            |
| ----------------------------------- | ----------------------------------------- |
| 프런트 운영 주소                    | `https://letit.vercel.app`                |
| 백엔드 HTTPS 주소·Swagger           | `https://letit-backend.onrender.com/docs` |
| Vercel 프로젝트·권한                | 프로젝트 관리자에게 요청                  |
| Kakao Developers 팀 앱·키 관리 권한 | 앱 관리자에게 요청                        |
| JavaScript 키·REST 키 전달 경로     | 앱 관리자가 별도 공유                     |
| Upstage 키·모델 접근 상태           | 백엔드 담당자가 확인                      |
| 운영/스테이징 DB·백업 담당자        | 백엔드 담당자가 확정                      |
| CORS·SDK 허용 도메인 목록           | 실제 개발·운영·미리보기 주소로 각각 갱신  |

서버 주소, 배포 방식 또는 저장 정책이 바뀌면 이 문서와 [API 연동 상태](api-integration.md), [README](../README.md)를 같이 갱신합니다.
