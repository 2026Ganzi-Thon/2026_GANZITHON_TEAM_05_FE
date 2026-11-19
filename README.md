# Letit(레딧) FE

외출이 부담스러운 사람에게 지금 상태에 맞는 작은 외출 미션을 추천하는 모바일 웹입니다.
2026 간지톤 Team 05 프론트엔드 저장소입니다.

## 기술 스택

| 구분            | 사용                                                  |
| --------------- | ----------------------------------------------------- |
| 기본            | React 19, TypeScript, Vite                            |
| 라우팅          | React Router                                          |
| 서버 상태       | TanStack Query                                        |
| 클라이언트 상태 | Zustand                                               |
| 스타일          | Tailwind CSS v4 (디자인 토큰: `src/styles/index.css`) |
| 애니메이션      | Motion                                                |
| 폰트            | Pretendard Variable                                   |
| 린트 · 포맷     | oxlint, Prettier                                      |
| 배포            | Vercel                                                |

## 시작하기

Node.js 24 사용을 권장합니다(`.nvmrc`: 24.11.0). 현재 의존성은 Node.js 22.22.0 이상이 필요합니다.

Windows에서는 `미리보기.cmd`로 `/home`을 열 수 있습니다. 바탕화면 작업본에는 시스템 Node를 변경하지 않는 로컬 Node 24가 함께 준비되어 있습니다.

```bash
npm install
cp .env.example .env   # 필요한 값 채우기
npm run dev
```

| 명령              | 설명                                 |
| ----------------- | ------------------------------------ |
| `npm run dev`     | 개발 서버                            |
| `npm test`        | 26개 API 계약 및 오류·저장 순서 검증 |
| `npm run build`   | 타입 검사 + 빌드                     |
| `npm run lint`    | oxlint 검사                          |
| `npm run format`  | Prettier 정리                        |
| `npm run preview` | 빌드 결과 미리보기                   |

## 폴더 구조

```
src/
├─ app/            App, 라우터(routes/), Provider, 앱 프레임, 접근 제어(guards)
├─ api/            API 계약·클라이언트·요청·화면 변환·서버 쿼리
├─ assets/         이미지 · 아이콘 (피그마 에셋)
├─ components/
│  ├─ layout/      화면 공통 레이아웃 (상단 내비, 하단 버튼 영역, 하단 탭 등)
│  └─ ui/          공통 UI (버튼, 선택지, 입력창, 팝업 등)
├─ constants/      상수 (라우트 경로, 선택지 목록 등)
├─ hooks/          커스텀 훅
├─ pages/          화면 (섹션별 폴더)
│  ├─ onboarding/  00 온보딩
│  ├─ home/        01 홈
│  ├─ reflection/  03 성찰하기
│  └─ collection/  04 도감
├─ stores/         Zustand 스토어
├─ styles/         전역 CSS · 디자인 토큰
├─ types/          공용 타입
└─ utils/          유틸 함수
```

- import는 `@/` 별칭을 사용합니다. 예: `import { PATHS } from '@/constants/paths'`
- 화면 이동 경로는 `src/constants/paths.ts`의 `PATHS`를 사용합니다.

## 01 · 02 화면 개발

`/home`에서 홈 → 외출 조건 → 맞춤 미션 → 수행 → 후기 흐름을 확인할 수 있습니다. 온보딩·도감·성찰 화면은 각 담당자의 라우트를 유지합니다.

- `/home/resume`: 저장된 미션 이어하기
- `/outing/conditions/mood`: 외출 조건 4단계 입력 시작
- `/missions`: 조건에 맞는 추천
- `/missions/active`: 현재 수행 중인 미션
- `/outing/review/note`: 한 줄 후기

화면은 `src/features/outings`, 원본 피그마 에셋은 `src/assets/outings`, 상태는 `src/stores/outingStore.ts`에 있습니다. 버튼·선택지·입력창·진행 막대·정보 표·팝업과 화면 틀은 공통 UI를 재사용합니다. 스타일은 공통 `@theme` 색상·폰트 토큰과 `lt-` 범위 CSS를 사용합니다.

`VITE_API_BASE_URL`을 설정하면 실제 API 모드, 비워두면 메모리 목업 모드로 실행합니다. API 모드에서 실패한 요청을 목업 성공으로 대체하지 않습니다. 두 모드 모두 브라우저 저장소에 사용자 입력과 토큰을 쓰지 않습니다.

온보딩 기본값은 공통 `useUserDefaultsStore`를 참조합니다. 기본값 안내에서 건너뛴 거리·시간·예산·에너지를 이 값으로 채웁니다. API 모드에서는 서버 응답으로 기본값을 복원합니다.

웹 화면에는 가상 시간·와이파이·배터리 표시를 넣지 않습니다. 상태 표시줄이 있던 상단 여백은 디자인대로 유지하며, 하단에는 safe-area 여백을 적용했습니다.

### API 연결

`.env.local`에 `VITE_API_BASE_URL=http://127.0.0.1:8000`을 설정하고 개발 서버를 재시작합니다. `/api/v1` 접두사는 한 번만 붙입니다. 배포 시에는 HTTPS 백엔드 URL을 사용하고 백엔드 CORS에 프런트 origin을 등록합니다.

- 회원가입·로그인 후 받은 Bearer 토큰은 메모리에만 유지합니다. 토큰 갱신 API가 없어 새로고침하면 다시 로그인합니다. 서버에 저장한 기본값·미션·기록·꽃은 로그인 후 다시 조회합니다.
- 미션 추천부터 생성, UUID 단계 PATCH, 중간 저장, 재개, 완료, 교체, 중단, 후기까지 26개 API의 연결 코드를 포함합니다. 빠른 체크 요청은 순서대로 보내며 저장·완료는 체크 요청을 기다립니다. 변경 요청은 자동 재전송하지 않습니다.
- 성찰 월별 조회, 아카이브 페이지 추가·상세·숨김 삭제, 서버 도감 조회와 꽃 확인을 연결합니다. `claim`은 꽃을 새로 지급하지 않고 서버가 지급한 꽃의 확인 상태만 갱신합니다.
- 로딩·빈 목록·위치 거부·검색 실패·API 오류·재시도 화면은 기존 Figma 공통 컴포넌트를 사용합니다. 오류가 나면 입력 중인 후기와 설문을 유지합니다.
- 백엔드 main의 인증·기본값 4개를 검증했습니다. 이후 새 백엔드 PR #1을 별도 서버로 실행해 미션·장소 API까지 총 16개를 실제 호출로 검증했고, 응답 형식 차이를 프런트에 반영했습니다. 후기·휴식·성찰·아카이브·도감 10개는 아직 백엔드 구현이 없어 명세 응답으로만 검증했습니다. 미구현 API는 오류·재시도를 표시합니다. [연동 상태와 백엔드 확인 항목](docs/api-integration.md)을 참고해 주세요.

### 카카오맵 연결

1. 카카오 Developers에서 Maps 사용 설정과 JavaScript 키의 SDK 도메인을 등록합니다. 실제 개발 주소(`http://127.0.0.1:5178`, `http://localhost:5178`)와 배포 도메인을 추가합니다.
2. `.env.local`에 `VITE_KAKAO_MAP_APP_KEY`를 설정하고 개발 서버를 재시작합니다. AI 키·REST API 키·DB 비밀번호는 프런트에 넣지 않습니다.
3. 장소 미션을 선택하고 **동의하기**를 누른 뒤에만 브라우저 위치를 요청합니다. 거절하면 다른 미션을 선택할 수 있습니다. 장소 없는 미션은 GPS와 주변 검색을 호출하지 않습니다.

`OutingMap`은 장소 선택·미션 상세·수행·내역에서 재사용합니다. 백엔드 `/places/nearby`의 좌표와 카카오 장소 ID로 번호 마커를 표시하며 마커·카드 선택을 동기화합니다. 이동 시간은 `약 N분 (추정)`으로 표시합니다. 위치·장소 검색은 백엔드, 지도 표시는 카카오 JavaScript SDK가 담당합니다. SDK 실패 시 장소 정보와 재시도 버튼을 유지합니다.

공식 문서: [Kakao Maps 시작하기](https://apis.map.kakao.com/web/guide/)

## 디자인 토큰

피그마 값을 `src/styles/index.css`의 `@theme`에 정의했습니다. 단계 색은 불투명도 수식어로 씁니다.

| 토큰    | 값                  | 예시 클래스                                                       |
| ------- | ------------------- | ----------------------------------------------------------------- |
| mint    | `#9fdfbf`           | `bg-mint`                                                         |
| ink     | `#303a50`           | `text-ink`, `text-ink/50`, `bg-ink/5`                             |
| surface | `#f9fafb`           | `bg-surface`                                                      |
| dim     | `rgb(0 0 0 / 0.25)` | `bg-dim`                                                          |
| 글자    | 24 / 20 / 16 / 12   | `text-title`, `text-heading`, `text-body`, `text-caption`         |
| 모서리  | 10 / 15 / 20 / 25   | `rounded-chip`, `rounded-button`, `rounded-card`, `rounded-popup` |
| 앱 폭   | 402px               | `max-w-app`                                                       |

## 공통 컴포넌트

개발 서버에서 `/dev/components`로 들어가면 전체 미리보기를 볼 수 있습니다. (배포 빌드에는 포함되지 않음)

| 컴포넌트                         | 위치                 | 용도                                              |
| -------------------------------- | -------------------- | ------------------------------------------------- |
| `Screen`                         | `layout/Screen`      | 화면 기본 틀: 상단 내비 / 본문 / 하단 고정 버튼   |
| `TopNav`, `TopNavTextButton`     | `layout/TopNav`      | 뒤로가기 + 오른쪽 버튼 (모두 건너뛰기 등)         |
| `PageTitle`                      | `layout/PageTitle`   | 진행 막대 + 제목 + 설명                           |
| `TabLayout`, `BottomNav`         | `layout/`            | 하단 탭 (도감 / 홈 / 성찰하기)                    |
| `Button`                         | `ui/Button`          | `primary` · `secondary` · `text`                  |
| `OptionList`, `MultiOptionList`  | `ui/OptionList`      | 동그라미 선택지 (하나 / 여러 개)                  |
| `ChoiceChipGroup`                | `ui/ChoiceChipGroup` | 2열 선택 버튼 (거리 · 시간 · 예산)                |
| `TextField`                      | `ui/TextField`       | 제목 + 입력창 (지우기 버튼)                       |
| `ProgressBar`                    | `ui/ProgressBar`     | 질문 진행 막대                                    |
| `InfoTable`                      | `ui/InfoTable`       | 회색 카드 "이름 : 값" 표                          |
| `Modal`, `ConfirmDialog`         | `ui/`                | 팝업 바탕, [아니오 / 예] 확인 팝업                |
| `FlowerIcon`, `FlowerSilhouette` | `ui/`                | 도감 꽃 아이콘, 흐릿한 꽃 실루엣                  |
| 아이콘                           | `components/icons`   | 뒤로가기, 지우기, 하단 탭 아이콘 (`currentColor`) |

```tsx
<Screen
  header={<TopNav right={<TopNavTextButton onClick={skipAll}>모두 건너뛰기</TopNavTextButton>} />}
  bottom={
    <>
      <Button onClick={next}>다음</Button>
      <Button variant="secondary" onClick={skip}>
        건너뛰기
      </Button>
    </>
  }
>
  <PageTitle className="pt-[15px]" progress={{ current: 1 }} title="지금 기분은 어떤가요?" />
  <OptionList options={MOOD_OPTIONS} value={mood} onChange={setMood} />
</Screen>
```

선택지 목록과 기본값은 `src/constants/options.ts`, 조건 타입은 `src/types/condition.ts`에 있습니다.

## 00 온보딩

| 화면              | 주소                          | 파일                                       |
| ----------------- | ----------------------------- | ------------------------------------------ |
| 시작              | `/onboarding`                 | `pages/onboarding/OnboardingStartPage.tsx` |
| 회원가입          | `/signup`                     | `pages/onboarding/SignupPage.tsx`          |
| 로그인            | `/login`                      | `pages/onboarding/LoginPage.tsx`           |
| 기본값 설문 01~04 | `/onboarding/survey/1` ~ `/4` | `pages/onboarding/SurveyPage.tsx`          |
| 기본값 설정 안내  | `/onboarding/defaults`        | `pages/onboarding/SurveyDefaultsPage.tsx`  |

라우트는 `src/app/routes/onboardingRoutes.tsx`에 있습니다.

### 목업 실행 방식

`VITE_API_BASE_URL`이 비어 있을 때 인증·설문·미션·후기·성찰·도감은 메모리 목업으로 동작합니다. `localStorage`와 `sessionStorage`에 저장하지 않습니다.

- 화면 이동 중에는 선택·체크·저장·삭제·보상 동작을 확인할 수 있습니다.
- 새로고침하거나 페이지를 다시 열면 `src/mocks/data.ts`의 예시 데이터로 돌아갑니다.
- 홈·성찰·도감은 같은 목업 데이터에서 계산됩니다. 이어할 미션 2개, 완료·일부 완료 기록과 보유 꽃 3개가 초기 예시에 들어 있습니다.
- `/home`, `/collection`, `/reflection` 등은 로그인 없이 직접 열어 확인할 수 있습니다.
- 회원가입은 입력 → 기본값 설문 → 홈, 로그인은 비어 있지 않은 아이디·비밀번호 입력 → 홈으로 이동하는 목업입니다. 계정 목록이나 비밀번호를 저장하지 않습니다.
- 이전 영구 저장 목업의 프로젝트 키만 앱 시작 시 정리합니다. 다른 서비스의 브라우저 데이터는 건드리지 않습니다.

| 내용                             | 메모리 스토어             |
| -------------------------------- | ------------------------- |
| 화면 이동용 로그인 상태          | `useAuthStore`            |
| 이번 실행에서 선택한 설문 기본값 | `useUserDefaultsStore`    |
| 설문 작성 중 선택                | `useOnboardingDraftStore` |
| 조건·수행·이어하기·후기·기록     | `useOutingStore`          |
| 완료 일수·보유 꽃·보상 팝업      | `useCollectionStore`      |

### 도감과 성찰 목업

- 홈의 꽃과 도감은 같은 `owned` 목록을 쓰고, 홈에는 최근 3개를 표시합니다.
- 달력과 통계는 예시 기록에 이번 실행 중 변경한 내용을 합쳐 계산합니다.
- 기록 삭제는 아카이브에서 숨기는 동작입니다. 같은 실행 중 달력·통계·보유 꽃은 유지합니다.
- 시작 후 7일 안의 중단 미션을 이어할 수 있고, 개별 그만하기가 가능합니다.
- 보상은 완료 일수 3일마다 순서대로 지급하는 로직을 유지합니다. `/dev/components`의 목업 테스트 버튼으로 완료 일수 추가·지급·초기화를 확인할 수 있습니다.
- 새로고침하면 사용자 입력을 누적하지 않고 원래 목업 데이터로 돌아갑니다. 서버 저장과 앱 재실행 사이의 실제 누적 보상은 백엔드 연동 시 구현합니다.

### 화면과 스타일

- 스크롤바 표시는 `src/styles/index.css`에서 공통으로 숨깁니다. 터치·휠·키보드 스크롤 동작은 유지하며, 긴 팝업은 내부에서 스크롤할 수 있습니다.
- 가상 시간·와이파이·배터리는 표시하지 않고 상단 디자인 여백을 유지합니다.
- 아카이브 아이콘은 Figma `72:9935`의 원본 도형과 영역별 색상을 보존한 SVG입니다.
- `/reflection/archive`: 날짜별 목록과 삭제 확인
- `/reflection/archive/:recordId`: 단계·예상 시간·금액·장소·읽기 전용 후기
- `/reflection/changes`: 처음·최근 미션, 최댓값 96px 막대그래프, 거리 변화
- `/reflection/help`: 전화 앱과 상담 기관 링크

### 통합 브랜치

온보딩 PR #2, 도감 PR #3, 홈·미션 PR #4와 Figma·기획 검수 결과를 PR #5로 main에 병합했습니다. API 연결 작업은 별도 `feat/api-integration` 브랜치에서 진행합니다.
