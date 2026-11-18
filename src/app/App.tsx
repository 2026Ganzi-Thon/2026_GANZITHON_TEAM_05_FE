import { RouterProvider } from 'react-router'
import Providers from '@/app/providers'
import { router } from '@/app/router'
import FlowerRewardPopup from '@/components/collection/FlowerRewardPopup'

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      {/* 04 도감: 앱 시작 시 꽃 지급 + 홈에서 획득 팝업 */}
      <FlowerRewardPopup />
    </Providers>
  )
}
