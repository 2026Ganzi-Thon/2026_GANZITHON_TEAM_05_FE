import type { ReactNode } from 'react'
import ProgressBar from '@/components/ui/ProgressBar'
import { cn } from '@/utils/cn'

interface PageTitleProps {
  /** 큰 제목. 줄바꿈은 \n */
  title: ReactNode
  /** 제목 아래 회색 문구 */
  description?: ReactNode
  eyebrow?: ReactNode
  /** 진행 막대 { current, total } */
  progress?: { current: number; total?: number }
  className?: string
}

/**
 * 화면 상단 제목 영역 (진행 막대 + 제목 + 설명).
 * 상단 내비가 없으면 위 여백 50, 있으면 15 (className으로 조정).
 */
export default function PageTitle({
  title,
  description,
  eyebrow,
  progress,
  className,
}: PageTitleProps) {
  return (
    <div className={cn('flex flex-col gap-[40px] px-[25px] pt-[50px] pb-[25px]', className)}>
      {progress && <ProgressBar current={progress.current} total={progress.total} />}
      <div className="flex flex-col gap-[20px] font-semibold">
        {eyebrow && <p className="text-body text-ink/75">{eyebrow}</p>}
        <h1 className="text-title whitespace-pre-line text-ink">{title}</h1>
        {description && <p className="text-body text-ink/50">{description}</p>}
      </div>
    </div>
  )
}
