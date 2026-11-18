import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface InfoTableProps {
  rows: { label: string; value: ReactNode }[]
  className?: string
}

/**
 * 회색 카드 안의 "이름 : 값" 표 (기본값 안내, 거리 · 소요 시간 · 금액 요약 등).
 *
 * @example
 * <InfoTable rows={[{ label: '거리', value: '도보 10분 이내' }]} />
 */
export default function InfoTable({ rows, className }: InfoTableProps) {
  return (
    <div className={cn('w-full rounded-card bg-surface p-[20px]', className)}>
      <dl className="grid grid-cols-[auto_1fr] gap-[25px] p-[5px] text-body font-medium">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className="contents">
            <dt className="text-ink/50">{row.label}</dt>
            <dd className="text-right text-ink/75">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
