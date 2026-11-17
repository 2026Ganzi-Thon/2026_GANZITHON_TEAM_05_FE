import { Outlet } from 'react-router'

/**
 * 모든 화면을 감싸는 앱 프레임.
 * 모바일에서는 화면 전체, PC에서는 가운데 402px 폭으로 보여준다.
 */
export default function AppFrame() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-app flex-col bg-white shadow-[0_0_24px_rgb(0_0_0/0.06)]">
      <Outlet />
    </div>
  )
}
