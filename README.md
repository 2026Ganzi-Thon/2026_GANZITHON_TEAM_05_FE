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
├─ app/            App, 라우터, Provider, 앱 프레임
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

백엔드 연결 전 데이터는 전부 목업입니다. 추천 미션, 장소, 지도는 외부 API 키 없이 표시되며 실제 위치 권한을 요청하지 않습니다. 수행 상태와 후기는 Zustand persist의 `letit-outings-mock` 키에 저장되므로 새로고침해도 유지됩니다. 초기화가 필요하면 브라우저 개발자 도구의 Application → Local Storage에서 이 키를 삭제하고 새로고침하세요.

온보딩 기본값은 공통 `useUserDefaultsStore`를 참조합니다. 기본값 안내에서 건너뛴 거리·시간·예산·에너지를 이 값으로 채웁니다. API 연결 시 `mockData.ts`와 스토어의 저장 동작을 교체할 수 있습니다.

가상 상태 표시줄은 피그마 비교용입니다. 앱이 자체 상태 표시줄을 제공하면 `OutingFlow`의 `showMockStatusBar={false}`로 숨길 수 있습니다. 하단에는 safe-area 여백을 적용했습니다.

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
