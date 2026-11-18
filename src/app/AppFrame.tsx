import { Outlet, ScrollRestoration } from 'react-router'
import { AuthGate } from '@/app/guards'

/**
 * 모든 화면을 감싸는 앱 프레임.
 * - 모바일에서는 화면 전체, PC에서는 가운데 402px 폭으로 보여준다.
 * - 사용자 상태에 맞지 않는 주소면 알맞은 화면으로 보낸다 (AuthGate).
 * - 화면을 이동하면 스크롤을 맨 위로 올린다 (뒤로가기는 이전 위치 복원).
 */
export default function AppFrame() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-app flex-col bg-white shadow-[0_0_24px_rgb(0_0_0/0.06)]">
      <AuthGate>
        <Outlet />
      </AuthGate>
      <ScrollRestoration />
    </div>
  )
}
