import type { ReactNode } from 'react'

/** 목업 단계에서는 로그인 저장 없이 각 화면을 직접 열어 확인할 수 있다. */
export function AuthGate({ children }: { children: ReactNode }) {
  return children
}
