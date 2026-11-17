import { cn } from '@/utils/cn'

interface ProgressBarProps {
  /** 현재 단계 (1부터) */
  current: number
  /** 전체 단계 수 */
  total?: number
  className?: string
}

/** 질문 진행 막대 (설문 · 외출 조건 4장) */
export default function ProgressBar({ current, total = 4, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`${total}단계 중 ${current}단계`}
      className={cn('flex h-[5px] w-full gap-[10px]', className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-full flex-1 rounded-full transition-colors',
            i < current ? 'bg-ink/50' : 'bg-ink/10',
          )}
        />
      ))}
    </div>
  )
}
