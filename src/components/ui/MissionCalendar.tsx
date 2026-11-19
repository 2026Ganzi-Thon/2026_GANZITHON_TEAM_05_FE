import { Fragment, useState } from 'react'
import { todayString } from '@/stores/collectionStore'
import { assets } from '@/features/outings/assets'
import { cn } from '@/utils/cn'
import type { DayStatus } from '@/features/outings/history'
import complete from '@/assets/reflection/complete.svg'
import partial from '@/assets/reflection/partial.svg'
import rest from '@/assets/reflection/rest.svg'
import unknown from '@/assets/reflection/unknown.svg'

const icons = { complete, partial, rest, unknown }
const labels = { complete: '모두 완료', partial: '일부 완료', rest: '안 함', unknown: '미정' }
export default function MissionCalendar({
  statuses,
  onMonthChange,
  month: controlledMonth,
}: {
  statuses: Record<string, DayStatus>
  onMonthChange?: (month: string) => void
  month?: string
}) {
  const [offset, setOffset] = useState(0)
  const [now] = useState(() => new Date())
  const date = controlledMonth
    ? new Date(`${controlledMonth}-01T12:00:00`)
    : new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const year = date.getFullYear(),
    month = date.getMonth()
  const first = date.getDay(),
    count = new Date(year, month + 1, 0).getDate()
  const weeks = Math.ceil((first + count) / 7)
  function change(delta: number) {
    setOffset(offset + delta)
    onMonthChange?.(todayString(new Date(year, month + delta, 1)).slice(0, 7))
  }
  return (
    <div className="lt-calendar">
      <div className="lt-month">
        <button aria-label="이전 달" type="button" onClick={() => change(-1)}>
          <img src={assets.monthPrevious} alt="" />
        </button>
        <span>
          {year}년 {month + 1}월
        </span>
        <button aria-label="다음 달" type="button" onClick={() => change(1)}>
          <img src={assets.monthNext} alt="" />
        </button>
      </div>
      <div className="lt-calendar-grid">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span className="lt-weekday" key={day}>
            {day}
          </span>
        ))}
        {Array.from({ length: weeks }, (_, week) => (
          <Fragment key={week}>
            {Array.from({ length: 7 }, (_, day) => {
              const value = week * 7 + day - first + 1
              const valid = value > 0 && value <= count
              const key = todayString(new Date(year, month, value))
              return (
                <span
                  key={day}
                  className={cn(
                    'lt-day',
                    !valid && 'is-empty',
                    key > todayString(now) && 'is-upcoming',
                  )}
                  aria-hidden={!valid}
                >
                  {valid ? value : ''}
                </span>
              )
            })}
            {Array.from({ length: 7 }, (_, day) => {
              const value = week * 7 + day - first + 1
              const key = todayString(new Date(year, month, value))
              const status = key > todayString(now) ? 'unknown' : (statuses[key] ?? 'unknown')
              return (
                <div className="lt-calendar-marker" key={day}>
                  {value > 0 && value <= count && (
                    <img src={icons[status]} alt={`${month + 1}월 ${value}일 ${labels[status]}`} />
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
