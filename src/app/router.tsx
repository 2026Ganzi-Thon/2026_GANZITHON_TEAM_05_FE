import { lazy } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import AppFrame from '@/app/AppFrame'
import { onboardingRoutes } from '@/app/routes/onboardingRoutes'
import TabLayout from '@/components/layout/TabLayout'
import { PATHS } from '@/constants/paths'
import CollectionPage from '@/pages/collection/CollectionPage'
import OnboardingStartPage from '@/pages/onboarding/OnboardingStartPage'
import ReflectionPage from '@/pages/reflection/ReflectionPage'
import {
  ArchivePage,
  ChangesPage,
  HelpPage,
  RecordDetailPage,
} from '@/pages/reflection/ReflectionPages'
import { OUTING_SCREEN_PATHS } from '@/features/outings/navigation'
import type { Screen } from '@/features/outings/types'

const outingRoutes: RouteObject[] = Object.entries(OUTING_SCREEN_PATHS)
  .filter(([screen]) => screen !== 'home')
  .map(([screen, path]) => ({
    path,
    lazy: async () => {
      const { default: OutingFlow } = await import('@/features/outings/OutingFlow')
      return { Component: () => <OutingFlow screen={screen as Screen} /> }
    },
  }))

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
    hydrateFallbackElement: (
      <div
        role="status"
        aria-label="화면 불러오는 중"
        className="mx-auto min-h-dvh w-full max-w-app bg-white"
      />
    ),
    children: [
      { path: PATHS.ROOT, element: <Navigate to={PATHS.ONBOARDING} replace /> },

      // 00 온보딩 · 인증
      { path: PATHS.ONBOARDING, element: <OnboardingStartPage /> },

      // 홈은 전용 스크롤 영역 안에 공통 하단 내비게이션을 사용한다.
      {
        path: PATHS.HOME,
        lazy: async () => ({ Component: (await import('@/pages/home/HomePage')).default }),
      },

      // 하단 탭이 있는 화면
      {
        element: <TabLayout />,
        children: [
          { path: PATHS.COLLECTION, element: <CollectionPage /> }, // 04 도감
          { path: PATHS.REFLECTION, element: <ReflectionPage /> }, // 03 성찰하기 · 기록 요약
        ],
      },

      // 01 미션 이어하기 · 외출 조건
      // 02 맞춤 미션 · 수행 · 외출 후기
      ...outingRoutes,

      // 03 성찰하기 (아카이브, 나의 변화, 도움 받기 등)
      { path: PATHS.ARCHIVE, element: <ArchivePage /> },
      { path: PATHS.CHANGES, element: <ChangesPage /> },
      { path: PATHS.HELP, element: <HelpPage /> },
      { path: PATHS.RECORD_DETAIL, element: <RecordDetailPage /> },

      // 00 회원가입 · 로그인 · 기본값 설문 (app/routes/onboardingRoutes.tsx)
      ...onboardingRoutes,

      ...devRoutes,

      { path: '*', element: <Navigate to={PATHS.ROOT} replace /> },
    ],
  },
])
