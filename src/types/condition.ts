/** 기분 (하나 선택) */
export type Mood = 'LETHARGIC' | 'DEPRESSED' | 'ANXIOUS' | 'NEED_REFRESH' | 'UNSURE'

/** 외출 에너지 단계 0~4 */
export type EnergyLevel = 0 | 1 | 2 | 3 | 4

/** 외출 장벽 (여러 개 선택) */
export type Barrier = 'TIRED' | 'BOTHERSOME_PREP' | 'CROWD' | 'AWKWARD_ALONE' | 'COST' | 'NO_REASON'

/** 이동 가능 거리 */
export type Distance = 'WITHIN_5' | 'WITHIN_10' | 'WITHIN_20' | 'ANY'

/** 사용 가능한 시간 */
export type Duration = 'MIN_10' | 'MIN_30' | 'HOUR_1' | 'ANY'

/** 예산 */
export type Budget = 'FREE' | 'UNDER_10000' | 'UNDER_50000' | 'ANY'

/** 외출 조건 6개. 온보딩 기본값 설문과 외출 조건 입력이 같은 형태를 쓴다. */
export interface OutingConditions {
  mood: Mood | null // null = 선택 안 함
  energy: EnergyLevel
  barriers: Barrier[] // [] = 선택 안 함
  distance: Distance
  duration: Duration
  budget: Budget
}

/** 선택지 공통 형태 */
export interface Option<T> {
  value: T
  label: string
}
