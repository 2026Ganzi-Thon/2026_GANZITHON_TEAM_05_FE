import type {
  Barrier,
  Budget,
  Distance,
  Duration,
  EnergyLevel,
  Mood,
  Option,
  OutingConditions,
} from '@/types/condition'

/** 기분 — 온보딩 01 · 외출 조건 01 */
export const MOOD_OPTIONS: Option<Mood>[] = [
  { value: 'LETHARGIC', label: '무기력해요' },
  { value: 'DEPRESSED', label: '우울하거나 답답해요' },
  { value: 'ANXIOUS', label: '불안하고 복잡해요' },
  { value: 'NEED_REFRESH', label: '기분 전환이 필요해요' },
  { value: 'UNSURE', label: '잘 모르겠어요' },
]

/** 외출 에너지 — 온보딩 02 · 외출 조건 02. summary는 기본값 안내 표에 쓰는 짧은 문구 */
export const ENERGY_OPTIONS: (Option<EnergyLevel> & { summary: string })[] = [
  { value: 0, label: '0단계: 집 밖으로 나가는 것도 부담스러워요', summary: '0단계: 집 안' },
  { value: 1, label: '1단계: 현관 밖까지는 나갈 수 있어요', summary: '1단계: 현관 밖까지' },
  { value: 2, label: '2단계: 집 근처 잠깐 다녀올 수 있어요', summary: '2단계: 집 근처' },
  { value: 3, label: '3단계: 가까운 장소에서 활동할 수 있어요', summary: '3단계: 가까운 장소' },
  { value: 4, label: '4단계: 조금 더 멀리 나가도 괜찮아요', summary: '4단계: 더 멀리' },
]

/** 외출 장벽 (여러 개 선택) — 온보딩 03 · 외출 조건 03 */
export const BARRIER_OPTIONS: Option<Barrier>[] = [
  { value: 'TIRED', label: '몸이 피곤하고 힘들어요' },
  { value: 'BOTHERSOME_PREP', label: '준비하는 과정이 귀찮아요' },
  { value: 'CROWD', label: '사람 많은 곳이 부담스러워요' },
  { value: 'AWKWARD_ALONE', label: '혼자 나가는 게 어색해요' },
  { value: 'COST', label: '비용이 부담스러워요' },
  { value: 'NO_REASON', label: '특별한 이유 없이 나가기 어려워요' },
]

/** 이동 가능 거리 — 04 */
export const DISTANCE_OPTIONS: (Option<Distance> & { summary: string })[] = [
  { value: 'WITHIN_5', label: '5분 이내', summary: '도보 5분 이내' },
  { value: 'WITHIN_10', label: '10분 이내', summary: '도보 10분 이내' },
  { value: 'WITHIN_20', label: '20분 이내', summary: '도보 20분 이내' },
  { value: 'ANY', label: '상관없음', summary: '상관없음' },
]

/** 사용 가능한 시간 — 04 */
export const DURATION_OPTIONS: (Option<Duration> & { summary: string })[] = [
  { value: 'MIN_10', label: '10분', summary: '10분 이내' },
  { value: 'MIN_30', label: '30분', summary: '30분 이내' },
  { value: 'HOUR_1', label: '1시간', summary: '1시간 이내' },
  { value: 'ANY', label: '상관없음', summary: '상관없음' },
]

/** 예산 — 04 */
export const BUDGET_OPTIONS: (Option<Budget> & { summary: string })[] = [
  { value: 'FREE', label: '0원', summary: '0원' },
  { value: 'UNDER_5000', label: '5,000원 이하', summary: '5,000원 이하' },
  { value: 'UNDER_10000', label: '10,000원 이하', summary: '10,000원 이하' },
  { value: 'ANY', label: '상관없음', summary: '상관없음' },
]

/** 아무것도 고르지 않았을 때 쓰는 기본값 (명세 3-3 "기본값 추천 안내") */
export const DEFAULT_CONDITIONS: OutingConditions = {
  mood: null,
  energy: 1,
  barriers: [],
  distance: 'WITHIN_10',
  duration: 'MIN_30',
  budget: 'UNDER_5000',
}

const NOT_SELECTED = '선택 안 함'

function findLabel<T>(options: (Option<T> & { summary?: string })[], value: T) {
  const option = options.find((o) => o.value === value)
  return option?.summary ?? option?.label ?? ''
}

/** 조건 6개를 "기본값 안내" 표의 행 목록으로 바꾼다 */
export function toConditionRows(c: OutingConditions) {
  return [
    { label: '현재 기분', value: c.mood ? findLabel(MOOD_OPTIONS, c.mood) : NOT_SELECTED },
    { label: '외출 에너지', value: findLabel(ENERGY_OPTIONS, c.energy) },
    {
      label: '외출 장벽',
      value: c.barriers.length
        ? c.barriers.map((b) => findLabel(BARRIER_OPTIONS, b)).join(', ')
        : NOT_SELECTED,
    },
    { label: '거리', value: findLabel(DISTANCE_OPTIONS, c.distance) },
    { label: '시간', value: findLabel(DURATION_OPTIONS, c.duration) },
    { label: '예산', value: findLabel(BUDGET_OPTIONS, c.budget) },
  ]
}
