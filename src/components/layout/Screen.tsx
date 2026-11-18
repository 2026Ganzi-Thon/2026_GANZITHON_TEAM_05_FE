import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ScreenProps {
  /** 상단 고정 영역 (TopNav) */
  header?: ReactNode
  /** 하단 고정 버튼 영역 내용 (Button 1~2개) */
  bottom?: ReactNode
  children: ReactNode
  className?: string
  /** 하단 버튼 영역 className (여백 조정 등) */
  bottomClassName?: string
  frameClassName?: string
}

/**
 * 한 화면의 기본 틀: [상단 내비] / 본문 / [하단 고정 버튼].
 *
 * @example
 * <Screen
 *   header={<TopNav />}
 *   bottom={<Button onClick={next}>다음</Button>}
 * >
 *   <PageTitle title="지금 기분은 어떤가요?" />
 *   <OptionList ... />
 * </Screen>
 */
export default function Screen({
  header,
  bottom,
  children,
  className,
  bottomClassName,
  frameClassName,
}: ScreenProps) {
  return (
    <div className={cn('flex flex-1 flex-col pt-[env(safe-area-inset-top)]', frameClassName)}>
      {header}
      <main tabIndex={0} className={cn('flex flex-1 flex-col', className)}>
        {children}
      </main>
      {bottom && (
        <div
          className={cn(
            'sticky bottom-0 z-10 flex flex-col gap-[10px] bg-white px-[20px] pt-[20px] pb-[max(40px,env(safe-area-inset-bottom))]',
            bottomClassName,
          )}
        >
          {bottom}
        </div>
      )}
    </div>
  )
}
