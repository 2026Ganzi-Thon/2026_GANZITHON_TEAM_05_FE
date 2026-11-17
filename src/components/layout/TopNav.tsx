import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { BackIcon } from '@/components/icons'
import { cn } from '@/utils/cn'

interface TopNavProps {
  /** 뒤로가기 버튼을 눌렀을 때. 없으면 브라우저 뒤로가기 */
  onBack?: () => void
  /** 뒤로가기 버튼 숨기기 */
  hideBack?: boolean
  /** 오른쪽 영역 (예: 모두 건너뛰기) */
  right?: ReactNode
  className?: string
}

/**
 * 상단 내비게이션 (뒤로가기 + 오른쪽 버튼). 스크롤해도 위에 붙어 있다.
 *
 * @example
 * <TopNav right={<TopNavTextButton onClick={skipAll}>모두 건너뛰기</TopNavTextButton>} />
 */
export default function TopNav({ onBack, hideBack, right, className }: TopNavProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-[60px] shrink-0 items-center justify-between bg-white pr-[20px] pl-[15px]',
        className,
      )}
    >
      {hideBack ? (
        <span />
      ) : (
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack ?? (() => navigate(-1))}
          className="flex size-[30px] items-center justify-center text-black"
        >
          <BackIcon />
        </button>
      )}
      {right}
    </header>
  )
}

/** 상단 내비 오른쪽에 들어가는 회색 글자 버튼 */
export function TopNavTextButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[30px] rounded-chip px-[10px] text-body font-semibold text-ink/50"
    >
      {children}
    </button>
  )
}
