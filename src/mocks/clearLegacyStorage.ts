/** 영구 저장 목업에서 사용했던 이 프로젝트의 키만 제거한다. */
export function clearLegacyMockStorage() {
  const keys = {
    localStorage: [
      'letit-auth',
      'letit-user-defaults',
      'letit-outings-mock',
      'letit-collection',
      'letit-onboarding-draft',
    ],
    sessionStorage: ['letit-onboarding-draft'],
  } as const
  for (const kind of ['localStorage', 'sessionStorage'] as const) {
    try {
      for (const key of keys[kind]) window[kind].removeItem(key)
    } catch {
      // 브라우저 저장소가 차단돼 있어도 메모리 목업은 사용할 수 있다.
    }
  }
}
