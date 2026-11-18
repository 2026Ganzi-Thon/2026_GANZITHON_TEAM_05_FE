import type { ReactNode } from 'react'
import { matchPath, Navigate, useLocation } from 'react-router'
import { PATHS, surveyPath } from '@/constants/paths'
import { useAuthStore } from '@/stores/authStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'

/** 로그인 전에만 보는 화면 */
const GUEST_PATHS = [PATHS.ROOT, PATHS.ONBOARDING, PATHS.SIGNUP, PATHS.LOGIN]
/** 로그인 후, 기본값 설문을 마치기 전에만 보는 화면 */
const SURVEY_PATHS = [PATHS.SURVEY, PATHS.SURVEY_DEFAULTS]
/** 상태와 상관없이 열리는 화면 */
const PUBLIC_PREFIXES = ['/dev/']

type Area = 'guest' | 'survey' | 'member'

const matches = (paths: string[], pathname: string) =>
  paths.some((path) => matchPath({ path, end: true }, pathname))

/** 지금 사용자가 있어야 할 영역과 그 영역의 첫 화면 */
function useUserArea(): { area: Area; entry: string } {
  const userId = useAuthStore((s) => s.userId)
  const hasDefaults = useUserDefaultsStore((s) => s.defaults !== null)

  if (!userId) return { area: 'guest', entry: PATHS.ONBOARDING }
  if (!hasDefaults) return { area: 'survey', entry: surveyPath(1) }
  return { area: 'member', entry: PATHS.HOME }
}

/**
 * 주소와 사용자 상태가 맞지 않으면 알맞은 화면으로 보낸다.
 * - 로그인 전: 시작 · 회원가입 · 로그인만
 * - 로그인 후 설문 전: 기본값 설문 · 안내만
 * - 설문까지 마침: 그 밖의 모든 화면 (홈, 외출, 미션, 성찰, 도감 …)
 *
 * 라우트마다 감쌀 필요 없이 AppFrame에서 한 번만 쓴다.
 * 새 화면을 추가하면 자동으로 "설문까지 마친 사용자" 화면이 된다.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { area, entry } = useUserArea()

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return children

  const pageArea: Area = matches(GUEST_PATHS, pathname)
    ? 'guest'
    : matches(SURVEY_PATHS, pathname)
      ? 'survey'
      : 'member'

  if (pageArea !== area || pathname === PATHS.ROOT) return <Navigate to={entry} replace />
  return children
}
