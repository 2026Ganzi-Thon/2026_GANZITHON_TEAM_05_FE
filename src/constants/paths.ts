/** 라우트 경로. 화면 이동은 문자열 대신 이 상수를 사용한다. */
export const PATHS = {
  ROOT: '/',

  // 00 온보딩 · 인증
  ONBOARDING: '/onboarding',
  SURVEY: '/onboarding/survey/:step', // 기본값 설문 1~4
  SURVEY_DEFAULTS: '/onboarding/defaults', // 기본값 설정 안내
  SIGNUP: '/signup',
  LOGIN: '/login',

  // 01 홈 · 미션 이어하기 · 외출 조건
  RESUME: '/home/resume',
  OUTING_MOOD: '/outing/conditions/mood',
  OUTING_ENERGY: '/outing/conditions/energy',
  OUTING_BARRIERS: '/outing/conditions/barriers',
  OUTING_LIMITS: '/outing/conditions/limits',
  OUTING_DEFAULTS: '/outing/conditions/defaults',

  // 02 맞춤 미션 · 수행 · 외출 후기
  MISSION_LOADING: '/missions/loading',
  MISSIONS: '/missions',
  PLACE_LOADING: '/missions/places/loading',
  MISSION_PLACES: '/missions/places',
  MISSION_DETAIL: '/missions/detail',
  MISSION_ACTIVE: '/missions/active',
  MISSION_SUMMARY: '/missions/summary',
  MISSION_PROBLEM: '/missions/problem',
  MISSION_ALTERNATIVES: '/missions/alternatives',
  REVIEW_MOOD: '/outing/review/mood',
  REVIEW_NOTE: '/outing/review/note',

  // 하단 탭
  HOME: '/home',
  COLLECTION: '/collection', // 04 도감
  REFLECTION: '/reflection', // 03 성찰하기
  ARCHIVE: '/reflection/archive',
  RECORD_DETAIL: '/reflection/archive/:recordId',
  CHANGES: '/reflection/changes',
  HELP: '/reflection/help',
} as const

/** 기본값 설문 n번째 장 경로 */
export const surveyPath = (step: number) => `/onboarding/survey/${step}`
export const recordPath = (id: string) => `/reflection/archive/${encodeURIComponent(id)}`
