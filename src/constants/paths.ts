/** 라우트 경로. 화면 이동은 문자열 대신 이 상수를 사용한다. */
export const PATHS = {
  ROOT: '/',

  // 00 온보딩 · 인증
  ONBOARDING: '/onboarding',
  SIGNUP: '/signup',
  LOGIN: '/login',

  // 하단 탭
  HOME: '/home',
  COLLECTION: '/collection', // 04 도감
  REFLECTION: '/reflection', // 03 성찰하기
} as const
