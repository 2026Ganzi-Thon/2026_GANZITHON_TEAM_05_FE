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

백엔드 연결 전 추천 미션·장소 목록·거리·도보 시간은 목업입니다. 수행 상태와 후기는 Zustand persist의 `letit-outings-mock` 키에 저장되므로 새로고침해도 유지됩니다. 초기화가 필요하면 브라우저 개발자 도구의 Application → Local Storage에서 이 키를 삭제하고 새로고침하세요.

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

### 화면 접근 규칙

`AppFrame`의 `AuthGate`(`src/app/guards.tsx`)가 주소와 사용자 상태를 비교해 맞지 않으면 알맞은 화면으로 보냅니다. 라우트마다 감쌀 필요가 없고, 새 화면을 추가하면 자동으로 "설문 후" 영역이 됩니다.

| 사용자 상태         | 열리는 화면                                      |
| ------------------- | ------------------------------------------------ |
| 로그인 전           | 시작 · 회원가입 · 로그인                         |
| 로그인 후 · 설문 전 | 기본값 설문 · 안내                               |
| 설문 후             | 그 밖의 모든 화면 (홈, 외출, 미션, 성찰, 도감 …) |

`/dev/`로 시작하는 주소는 상태와 상관없이 열립니다.

### 개발할 때 화면 여는 법

`/home` 등을 열려면 회원가입과 설문을 한 번 거쳐야 합니다. `/onboarding` → "Letit 시작하기" → 아무 아이디 · 비밀번호로 가입 → 설문에서 "다음" 4번 → "시작하기". 같은 주소(예: `localhost:5173`)에서는 한 번만 하면 유지됩니다.

### 데이터 (API 연결 전 목업)

| 내용                                 | 스토어                    | 저장 위치 · 키                          |
| ------------------------------------ | ------------------------- | --------------------------------------- |
| 로그인 상태 · 계정                   | `useAuthStore`            | localStorage `letit-auth`               |
| 온보딩 기본값 (외출 조건에서 재사용) | `useUserDefaultsStore`    | localStorage `letit-user-defaults`      |
| 설문 중 고른 값                      | `useOnboardingDraftStore` | sessionStorage `letit-onboarding-draft` |

처음 상태로 되돌리려면 개발자 도구 Application에서 위 키를 지우고 새로고침하세요. API를 연결할 때는 각 스토어 안의 동작만 요청으로 바꾸면 됩니다.

## 04 도감 · 꽃 획득

- `/collection`: 실제 보유 꽃과 미보유 꽃 목록을 표시합니다. 보유한 꽃이 없으면 안내 문구를, 18종을 모두 얻으면 보유 목록만 표시합니다.
- 홈의 "나의 도감"은 같은 `useCollectionStore.owned`에서 가장 최근에 얻은 3개를 가져옵니다. 꽃 그림도 공통 `FlowerIcon`을 사용합니다.
- 미션을 모두 완료하고 수행 내역을 저장하면 `markDayCompleted(todayString())`로 해당 날짜를 기록합니다. 일부 완료·쉰 날은 제외하고 같은 날은 한 번만 셉니다.
- 완료한 날이 누적 3일 쌓일 때마다 꽃 1개를 얻습니다. 연속 달성 조건은 없으며, 획득 순서는 `FLOWERS`의 1~18번입니다.
- 꽃은 다음 앱 실행 시 지급합니다. 홈에서 획득 팝업을 하나씩 보여주며, "도감에서 보기"는 도감으로 이동하고 "확인했어요"는 팝업을 닫습니다.
- 통합 전 저장한 전체 완료 기록도 앱 시작 시 날짜별로 반영합니다. 기존 꽃과 기록은 유지하고 중복 날짜는 추가하지 않습니다.
- 저장소는 `src/stores/collectionStore.ts`, localStorage 키는 `letit-collection`입니다. 개발 모드 `/dev/components`의 도감 테스트 버튼으로 완료 일수 추가·지급·초기화를 확인할 수 있습니다.

## 통합 브랜치와 기본값 정책

`integration/onboarding-home-collection`에는 온보딩 PR #2, 도감 PR #3, 홈·미션 PR #4를 병합했습니다. `main` 반영은 별도로 진행합니다.

온보딩에서 정한 기본값(`letit-user-defaults`)과 외출 때 선택한 조건(`letit-outings-mock`)은 별개입니다. 외출 조건 변경은 온보딩 기본값을 수정하지 않습니다. 새 사용자의 외출 조건은 비어 있으며, 입력을 생략하면 온보딩의 에너지·거리·시간·예산을 사용합니다. 이후 외출에서는 직전에 사용한 에너지·거리·시간·예산을 미리 보여주되, 기분·외출 장벽은 새로 선택합니다. 건너뛴 항목은 온보딩 기본값으로 채웁니다.

외출 저장소 버전 2로 이전할 때 이전 빌드의 고정 예시 조건만 비웁니다. 사용자가 변경한 조건과 저장된 미션·체크 단계·후기는 유지합니다. 따라서 기존 개발 환경에서도 예시 조건이 온보딩 기본값을 덮어쓰지 않습니다.
