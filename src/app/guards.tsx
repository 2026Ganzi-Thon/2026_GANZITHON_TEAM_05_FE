import { useEffect, type ReactNode } from 'react'
import { Navigate, matchPath, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { PATHS, surveyPath } from '@/constants/paths'
import { isApiEnabled } from '@/api/config'
import { defaultsApi } from '@/api/endpoints'
import { fromApiDefaults } from '@/api/presentation'
import { useAuthStore } from '@/stores/authStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import ApiFeedback from '@/components/ui/ApiFeedback'
import { Page, Heading } from '@/features/outings/components'
import '@/features/outings/letit.css'

const guestPaths: string[] = [PATHS.ROOT, PATHS.ONBOARDING, PATHS.SIGNUP, PATHS.LOGIN]
export function AuthGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { userId, onboardingCompleted, completeOnboarding, logout } = useAuthStore()
  const defaults = useQuery({
    queryKey: ['api', userId, 'defaults'],
    queryFn: ({ signal }) => defaultsApi.get(signal),
    enabled: isApiEnabled && !!userId && onboardingCompleted === null,
  })
  useEffect(() => {
    if (!defaults.data || !userId || onboardingCompleted !== null) return
    useUserDefaultsStore.getState().setDefaults(fromApiDefaults(defaults.data))
    completeOnboarding(defaults.data.onboardingCompleted)
  }, [defaults.data, userId, onboardingCompleted, completeOnboarding])
  if (!isApiEnabled || pathname.startsWith('/dev/')) return children
  const guest = guestPaths.includes(pathname)
  if (!userId) return guest ? children : <Navigate to={PATHS.LOGIN} replace />
  if (onboardingCompleted === null)
    return (
      <div className="lt-app">
        <Page nodeId="72:8925" onBack={logout}>
          <Heading title="기본 정보를 확인하고 있어요" />
          <ApiFeedback
            loading={!defaults.error}
            error={defaults.error}
            onRetry={() => void defaults.refetch()}
          />
        </Page>
      </div>
    )
  const survey = !!matchPath(PATHS.SURVEY, pathname) || pathname === PATHS.SURVEY_DEFAULTS
  if (!onboardingCompleted) return survey ? children : <Navigate to={surveyPath(1)} replace />
  return guest || survey ? <Navigate to={PATHS.HOME} replace /> : children
}
