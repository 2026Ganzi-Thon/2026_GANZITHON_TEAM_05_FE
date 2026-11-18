import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import LoginPage from '@/pages/onboarding/LoginPage'
import SignupPage from '@/pages/onboarding/SignupPage'
import SurveyDefaultsPage from '@/pages/onboarding/SurveyDefaultsPage'
import SurveyPage from '@/pages/onboarding/SurveyPage'

/** 00 온보딩 · 인증 (시작 화면 /onboarding 은 router.tsx에 있음) */
export const onboardingRoutes: RouteObject[] = [
  { path: PATHS.SIGNUP, element: <SignupPage /> },
  { path: PATHS.LOGIN, element: <LoginPage /> },
  { path: PATHS.SURVEY, element: <SurveyPage /> },
  { path: PATHS.SURVEY_DEFAULTS, element: <SurveyDefaultsPage /> },
]
