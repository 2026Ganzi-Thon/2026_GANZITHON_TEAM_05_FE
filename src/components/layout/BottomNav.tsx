import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router'
import { CollectionIcon, HomeIcon, MyIcon, ReflectionIcon } from '@/components/icons'
import { PATHS } from '@/constants/paths'
import { cn } from '@/utils/cn'

const TABS: { to: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { to: PATHS.COLLECTION, label: '도감', Icon: CollectionIcon },
  { to: PATHS.HOME, label: '홈', Icon: HomeIcon },
  { to: PATHS.REFLECTION, label: '성찰하기', Icon: ReflectionIcon },
  { to: PATHS.MY, label: '마이', Icon: MyIcon },
]

/** 하단 탭 (도감 / 홈 / 성찰하기 / 마이). 화면 아래 가운데에 떠 있는 알약 모양. */
export default function BottomNav() {
  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-40 flex h-[60px] w-[320px] -translate-x-1/2 items-center justify-center rounded-full bg-white/25 shadow-[0_5px_50px_rgb(0_0_0/0.1)] backdrop-blur-[12.5px]"
    >
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={label}
          className={({ isActive }) =>
            cn(
              'flex h-[50px] w-[80px] items-center justify-center rounded-full transition-colors',
              isActive ? 'bg-ink/5 text-ink' : 'text-ink/25',
            )
          }
        >
          <Icon />
        </NavLink>
      ))}
    </nav>
  )
}
