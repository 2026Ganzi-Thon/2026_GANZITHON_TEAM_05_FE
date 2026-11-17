import { lazy } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import AppFrame from '@/app/AppFrame'
import { onboardingRoutes } from '@/app/routes/onboardingRoutes'
import TabLayout from '@/components/layout/TabLayout'
import { PATHS } from '@/constants/paths'
import CollectionPage from '@/pages/collection/CollectionPage'
import HomePage from '@/pages/home/HomePage'
import OnboardingStartPage from '@/pages/onboarding/OnboardingStartPage'
import ReflectionPage from '@/pages/reflection/ReflectionPage'

/** 개발 모드에서만 쓰는 화면 (배포 빌드에는 포함되지 않음) */
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/components',
        Component: lazy(() => import('@/pages/dev/ComponentsPage')),
      },
    ]
  : []

export const router = createBrowserRouter([
  {
    element: <AppFrame />,
    children: [
      { path: PATHS.ROOT, element: <Navigate to={PATHS.ONBOARDING} replace /> },

      // 00 온보딩 · 인증
      { path: PATHS.ONBOARDING, element: <OnboardingStartPage /> },

      // 하단 탭이 있는 화면
      {
        element: <TabLayout />,
        children: [
          { path: PATHS.HOME, element: <HomePage /> }, // 01 홈
          { path: PATHS.COLLECTION, element: <CollectionPage /> }, // 04 도감
          { path: PATHS.REFLECTION, element: <ReflectionPage /> }, // 03 성찰하기 · 기록 요약
        ],
      },

      // 01 미션 이어하기 · 외출 조건

      // 02 맞춤 미션 · 수행 · 외출 후기

      // 03 성찰하기 (아카이브, 나의 변화, 도움 받기 등)

      // 00 회원가입 · 로그인 · 기본값 설문 (app/routes/onboardingRoutes.tsx)
      ...onboardingRoutes,

      ...devRoutes,

      { path: '*', element: <Navigate to={PATHS.ROOT} replace /> },
    ],
  },
])
