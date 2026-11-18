import { Card, InfoRows } from '@/features/outings/components'
import { shortDate, successCounts } from '@/features/outings/history'
import type { OutingRecord } from '@/features/outings/types'
import { cn } from '@/utils/cn'

export default function MissionStats({ records }: { records: OutingRecord[] }) {
  const sorted = [...records].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const first = sorted[0],
    last = sorted.at(-1)
  const counts = successCounts(records),
    max = Math.max(...counts)
  return (
    <>
      <Card title="처음과 최근의 미션">
        {first && last ? (
          <InfoRows
            spacious
            rows={[
              [shortDate(first.startedAt ?? first.createdAt), first.title],
              [shortDate(last.startedAt ?? last.createdAt), last.title],
            ]}
          />
        ) : (
          <p className="lt-empty lt-trim">아직 남긴 미션 기록이 없어요</p>
        )}
      </Card>
      <Card title="단계별 성공 기록">
        <div className="lt-chart" aria-label="단계별 미션 성공 횟수">
          <div className="lt-chart-counts">
            {counts.map((count, i) => (
              <span className="lt-trim" key={i}>
                {count}회
              </span>
            ))}
          </div>
          <div className="lt-chart-bars">
            {counts.map((count, i) => (
              <span
                key={i}
                style={{ height: count && max ? (count / max) * 96 : 5 }}
                className={cn(max > 0 && count === max && 'is-active')}
              />
            ))}
          </div>
          <div className="lt-chart-labels">
            {counts.map((count, i) => (
              <span key={i} className={cn('lt-trim', max > 0 && count === max && 'is-active')}>
                {i}단계
              </span>
            ))}
          </div>
        </div>
      </Card>
    </>
  )
}
