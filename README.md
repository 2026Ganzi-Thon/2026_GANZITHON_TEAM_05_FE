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

| 명령              | 설명               |
| ----------------- | ------------------ |
| `npm run dev`     | 개발 서버          |
| `npm run build`   | 타입 검사 + 빌드   |
| `npm run lint`    | oxlint 검사        |
| `npm run format`  | Prettier 정리      |
| `npm run preview` | 빌드 결과 미리보기 |

## 폴더 구조

```
src/
├─ app/            App, 라우터(routes/), Provider, 앱 프레임, 접근 제어(guards)
├─ apis/           API 요청 함수
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

- `/home/resume`: 목업으로 저장된 미션 이어하기
- `/outing/conditions/mood`: 외출 조건 4단계 입력 시작
- `/missions`: 조건에 맞는 목업 추천
- `/missions/active`: 현재 수행 중인 미션
- `/outing/review/note`: 한 줄 후기

화면은 `src/features/outings`, 원본 피그마 에셋은 `src/assets/outings`, 상태는 `src/stores/outingStore.ts`에 있습니다. 버튼·선택지·입력창·진행 막대·정보 표·팝업과 화면 틀은 공통 UI를 재사용합니다. 스타일은 공통 `@theme` 색상·폰트 토큰과 `lt-` 범위 CSS를 사용합니다.

백엔드 연결 전 추천 미션·장소 목록·거리·도보 시간과 사용자 기록은 메모리 목업입니다. 화면 이동 중에는 상태가 이어지지만, 새로고침하면 공통 예시 데이터로 돌아갑니다. 브라우저 저장소에는 쓰지 않습니다.

온보딩 기본값은 공통 `useUserDefaultsStore`를 참조합니다. 기본값 안내에서 건너뛴 거리·시간·예산·에너지를 이 값으로 채웁니다. API 연결 시 `mockData.ts`와 스토어의 저장 동작을 교체할 수 있습니다.

웹 화면에는 가상 시간·와이파이·배터리 표시를 넣지 않습니다. 상태 표시줄이 있던 상단 여백은 디자인대로 유지하며, 하단에는 safe-area 여백을 적용했습니다.

### 네이버 지도 연결

`OutingMap`은 장소 선택·미션 상세·수행·내역 화면에서 재사용합니다. 키가 없으면 '지도 미리보기'로 표시하고, 장소 카드 선택은 계속 사용할 수 있습니다. 실제 위치 권한 요청은 아직 연결하지 않았으며, 기존 위치 동의 팝업은 UI만 유지합니다.

1. 네이버 클라우드 Maps Application에서 **Dynamic Map**을 활성화합니다. 주소를 좌표로 변환할 때는 **Geocoding**도 활성화합니다.
2. Web 서비스 URL에 개발 주소(`http://127.0.0.1:5174`, `http://localhost:5174`)와 배포 도메인을 등록합니다. 개발 서버 포트가 다르면 해당 주소를 등록합니다.
3. `.env.local`에 `VITE_NAVER_MAP_CLIENT_ID=발급받은_Client_ID`를 입력하고 개발 서버를 재시작합니다. Client Secret은 프런트엔드에 넣지 않습니다.

키가 설정되면 SDK를 한 번만 로딩하고, 기존 장소 주소를 Geocoding으로 변환해 번호 마커를 표시합니다. 마커 선택과 카드 선택은 같은 상태를 사용하며, 카드 선택 시 해당 장소로 지도를 이동합니다. `Place.coordinates`에 `{ lat, lng }`가 제공되면 Geocoding 없이 해당 좌표를 사용합니다. SDK·인증·주소 변환 실패 시 미리보기와 재시도 버튼을 표시합니다. 화면 이동 시 지도 인스턴스·마커·이벤트·크기 관찰자를 정리합니다.

실제 주변 장소 검색과 거리·도보 시간 산출은 별도 장소/경로 API 연동이 필요합니다. 현재 지도는 전달된 장소 목록을 표시합니다.

공식 문서: [SDK 시작하기](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html), [HTML 마커](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Marker.html)

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

## 배포 · 앱 설치

main 브랜치는 Vercel로 자동 배포됩니다. PR을 올리면 PR마다 미리보기 주소가 따로 생깁니다.

- 배포 주소: https://letit.vercel.app
- `vercel.json`은 새로고침과 주소 직접 입력(`/reflection/help` 등)을 `index.html`로 보내고, 서비스 워커·manifest·빌드 파일의 캐시 규칙을 정합니다.

### Vercel 환경변수

Vercel 프로젝트 **Settings → Environment Variables**에서 설정합니다. `VITE_` 값은 빌드할 때 코드에 들어가므로, 값을 바꾼 뒤에는 **다시 배포**해야 반영됩니다.

| 변수                       | 언제 넣나                          | 비워 두면            |
| -------------------------- | ---------------------------------- | -------------------- |
| `VITE_API_BASE_URL`        | 백엔드 HTTPS 주소가 정해졌을 때    | 메모리 목업 모드     |
| `VITE_NAVER_MAP_CLIENT_ID` | 지금 main의 지도(네이버)를 띄울 때 | 지도 미리보기 이미지 |

- 지도 키 콘솔에는 배포 주소(`https://letit.vercel.app`)를 허용 도메인으로 등록합니다.
- 백엔드 CORS 허용 목록에도 배포 주소를 추가해야 API 모드가 동작합니다.
- 지도용 공개 키만 넣습니다. REST API 키·AI 키·DB 비밀번호 같은 서버용 비밀 값은 넣지 않습니다.

### 앱으로 설치 (PWA)

홈 화면에 추가하면 주소창 없이 앱처럼 실행됩니다.

- 안드로이드 크롬: 메뉴(⋮) → **앱 설치** 또는 **홈 화면에 추가**
- 아이폰 사파리: 공유 버튼 → **홈 화면에 추가**

| 파일                          | 역할                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `public/manifest.webmanifest` | 앱 이름 · 아이콘 · 실행 방식(standalone)                                       |
| `public/icons/`               | 피그마 "레딧 로고" 원본(58:2290)에서 만든 192 · 512 · 마스커블 · 아이폰 아이콘 |
| `public/sw.js`                | 서비스 워커. 오프라인 안내 화면만 캐시하고 JS · CSS · API는 캐시하지 않음      |
| `public/offline.html`         | 인터넷이 끊겼을 때 보여 주는 안내 화면                                         |

서비스 워커는 배포 빌드에서만 등록됩니다(`src/main.tsx`). 개발 서버(`npm run dev`)에서는 등록하지 않습니다. `npm run build && npm run preview`로 확인할 수 있습니다.

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

현재 인증·설문·미션·후기·성찰·도감 데이터는 모두 메모리 목업입니다. `localStorage`와 `sessionStorage`에 저장하지 않습니다.

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

`integration/onboarding-home-collection`에 온보딩 PR #2, 도감 PR #3, 홈·미션 PR #4를 병합했습니다. 이후 Figma·기획 명세 검수, 성찰하기 구현, 원본 에셋과 스크롤 통일 및 메모리 목업 전환을 반영합니다. 실제 인증·AI·주변 장소 API와 기기 위치 권한 요청은 연결하지 않았습니다.
