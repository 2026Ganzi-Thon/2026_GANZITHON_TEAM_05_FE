import { createBrowserRouter, Navigate } from 'react-router'
import AppFrame from '@/app/AppFrame'
import { PATHS } from '@/constants/paths'
import CollectionPage from '@/pages/collection/CollectionPage'
import HomePage from '@/pages/home/HomePage'
import OnboardingStartPage from '@/pages/onboarding/OnboardingStartPage'
import ReflectionPage from '@/pages/reflection/ReflectionPage'

export const router = createBrowserRouter([
  {
    element: <AppFrame />,
    children: [
      { path: PATHS.ROOT, element: <Navigate to={PATHS.ONBOARDING} replace /> },

      // 00 온보딩 · 인증
      { path: PATHS.ONBOARDING, element: <OnboardingStartPage /> },

      // 01 홈 · 미션 이어하기 · 외출 조건
      { path: PATHS.HOME, element: <HomePage /> },

      // 02 맞춤 미션 · 수행 · 외출 후기

      // 03 성찰하기
      { path: PATHS.REFLECTION, element: <ReflectionPage /> },

      // 04 도감
      { path: PATHS.COLLECTION, element: <CollectionPage /> },

      { path: '*', element: <Navigate to={PATHS.ROOT} replace /> },
    ],
  },
])
