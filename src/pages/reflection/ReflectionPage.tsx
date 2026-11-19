import { useState } from 'react'
import { Link } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import MissionCalendar from '@/components/ui/MissionCalendar'
import { useOutingStore } from '@/stores/outingStore'
import { todayString } from '@/stores/collectionStore'
import { dailyStatuses } from '@/features/outings/history'
import { PATHS } from '@/constants/paths'
import archiveIcon from '@/assets/reflection/archive.svg'
import changesIcon from '@/assets/reflection/changes.svg'
import helpIcon from '@/assets/reflection/help.svg'
import '@/features/outings/letit.css'
import { isApiEnabled } from '@/api/config'
import { useReflectionQueries } from '@/api/queries'
import { calendarDayCounts, calendarStatuses } from '@/api/dashboard'
import ApiFeedback from '@/components/ui/ApiFeedback'
import type { DayStatus } from '@/features/outings/history'

export default function ReflectionPage() {
  return isApiEnabled ? <ApiReflectionPage /> : <MockReflectionPage />
}
function ApiReflectionPage() {
  const [month, setMonth] = useState(todayString().slice(0, 7))
  const { summary, calendar } = useReflectionQueries(month)
  const error = summary.error ?? calendar.error
  const loading = summary.isPending || calendar.isPending
  return (
    <ReflectionView
      month={month}
      setMonth={setMonth}
      statuses={calendarStatuses(calendar.data)}
      counts={calendar.data ? calendarDayCounts(calendar.data) : undefined}
      feedback={
        loading || error ? (
          <ApiFeedback
            loading={loading && !error}
            error={error}
            onRetry={() => {
              void summary.refetch()
              void calendar.refetch()
            }}
          />
        ) : null
      }
    />
  )
}
function MockReflectionPage() {
  const state = useOutingStore((store) => store.state)
  const statuses = dailyStatuses(state)
  const [month, setMonth] = useState(todayString().slice(0, 7))
  const days = Object.entries(statuses)
    .filter(([date]) => date.startsWith(month))
    .map(([, status]) => status)
  return (
    <ReflectionView
      month={month}
      setMonth={setMonth}
      statuses={statuses}
      counts={{
        completed: days.filter((day) => day === 'complete').length,
        partial: days.filter((day) => day === 'partial').length,
        notCompleted: days.filter((day) => day === 'rest').length,
      }}
    />
  )
}
function ReflectionView({
  month,
  setMonth,
  statuses,
  counts,
  feedback,
}: {
  month: string
  setMonth: (month: string) => void
  statuses: Record<string, DayStatus>
  counts?: { completed: number; partial: number; notCompleted: number }
  feedback?: React.ReactNode
}) {
  const menus = [
    [PATHS.ARCHIVE, archiveIcon, '아카이브', '최근 기록, 한 줄 후기, 기록 삭제'],
    [PATHS.CHANGES, changesIcon, '나의 변화', '처음과 최근, 거리 변화, 단계별 성공'],
    [PATHS.HELP, helpIcon, '도움 받기', '전문 상담 및 도움 안내'],
  ]
  return (
    <main className="lt-app lt-reflection" data-figma-node="72:9827">
      <PageTitle
        title="성찰하기"
        description="내가 남긴 기록을 확인해보세요"
        className="pt-[100px]"
      />
      <div className="lt-body lt-reflection-calendar">
        <MissionCalendar month={month} statuses={statuses} onMonthChange={setMonth} />
        <dl className="lt-metrics">
          {[
            ['모두 완료', 'completed'],
            ['일부 완료', 'partial'],
            ['미완료', 'notCompleted'],
          ].map(([label, status]) => (
            <div key={status}>
              <dt className="lt-trim">{label}</dt>
              <dd className="lt-trim">{counts ? counts[status as keyof typeof counts] : '—'}일</dd>
            </div>
          ))}
        </dl>
      </div>
      {feedback}
      <div className="lt-divider" />
      <nav aria-label="성찰 메뉴" className="lt-reflection-menu">
        {menus.map(([path, icon, title, description]) => (
          <Link key={path} to={path}>
            <i className="lt-menu-icon" aria-hidden>
              <img src={icon} alt="" />
            </i>
            <span>
              <strong className="lt-trim">{title}</strong>
              <span className="lt-trim">{description}</span>
            </span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
