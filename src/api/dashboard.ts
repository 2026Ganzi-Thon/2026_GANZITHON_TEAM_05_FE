import type { CalendarResponse, ReflectionProgress, ResumableMission } from './contracts'
import type { DayStatus } from '@/features/outings/history'
import type { MissionStatistics } from '@/components/ui/MissionStats'
import type { SavedMission } from '@/features/outings/types'
export function calendarStatuses(value?: CalendarResponse): Record<string, DayStatus> {
  return Object.fromEntries(
    (value?.days ?? []).map((day) => [
      day.date,
      ({ completed: 'complete', partial: 'partial', rest: 'rest', undecided: 'unknown' } as const)[
        day.status
      ],
    ]),
  )
}
export function calendarDayCounts(value: CalendarResponse) {
  const counts = { completed: 0, partial: 0, notCompleted: 0 }
  for (const status of new Map(value.days.map((day) => [day.date, day.status])).values()) {
    if (status === 'completed') counts.completed++
    else if (status === 'partial') counts.partial++
    else if (status === 'rest') counts.notCompleted++
  }
  return counts
}
export function progressStatistics(value?: ReflectionProgress): MissionStatistics {
  const counts = [0, 0, 0, 0, 0]
  for (const item of value?.completedByEnergy ?? [])
    if (item.energyLevel >= 0 && item.energyLevel <= 4)
      counts[item.energyLevel] = item.count ?? item.completedCount ?? 0
  const summary = (item: ReflectionProgress['firstMission']) =>
    item ? { title: item.title, date: item.date ?? item.startedAt ?? '날짜 없음' } : null
  return {
    first: summary(value?.firstMission ?? null),
    latest: summary(value?.latestMission ?? null),
    counts,
  }
}
export function resumableView(value: ResumableMission): SavedMission {
  return {
    id: value.missionId,
    missionId: value.missionId,
    title: value.title,
    startedAt: value.startedAt,
    date: value.startedAt,
    checked: [],
    placeId: '',
    completedCount: value.completedCount,
    remainingCount: value.remainingCount,
  }
}
