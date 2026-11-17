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
