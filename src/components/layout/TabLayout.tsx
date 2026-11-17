import { Outlet } from 'react-router'
import BottomNav from '@/components/layout/BottomNav'

/** 하단 탭이 있는 화면(홈 · 도감 · 성찰하기 기록 요약)을 감싸는 레이아웃 */
export default function TabLayout() {
  return (
    <div className="flex flex-1 flex-col pb-[120px]">
      <Outlet />
      <BottomNav />
    </div>
  )
}
