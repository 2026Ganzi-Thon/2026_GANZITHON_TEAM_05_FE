import { missionById } from './mockData'
import type { MockState, OutingRecord, SavedMission } from './types'
import { todayString, useCollectionStore } from '@/stores/collectionStore'

export type DayStatus = 'complete' | 'partial' | 'rest' | 'unknown'
export const shortDate = (value: string) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? `${date.getMonth() + 1}월 ${date.getDate()}일` : value
}
export const longDate = (value: string) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? `${date.getFullYear()}년 ${shortDate(value)}` : value
}
export const recordMission = (record: OutingRecord) =>
  record.mission ?? missionById(record.missionId)
export function dailyStatuses(state: MockState): Record<string, DayStatus> {
  const days: Record<string, Map<string, OutingRecord>> = {}
  const statuses: Record<string, DayStatus> = {}
  for (const date of state.restDates ?? []) statuses[date] = 'rest'
  for (const record of state.records) {
    const date = new Date(record.createdAt)
    if (!Number.isFinite(date.getTime())) continue
    const key = todayString(date)
    days[key] ??= new Map()
    // 같은 미션을 같은 날 이어 수행한 경우 가장 최근 수행 상태로 판정한다.
    const runId = record.runId ?? record.id
    const previous = days[key].get(runId)
    if (!previous || previous.createdAt <= record.createdAt) days[key].set(runId, record)
  }
  for (const [day, missions] of Object.entries(days)) {
    statuses[day] = [...missions.values()].every((record) => record.completed)
      ? 'complete'
      : 'partial'
  }
  return statuses
}
export function reconcileCollectionDays(state: MockState, removedDates: string[] = []) {
  const statuses = dailyStatuses(state)
  const collection = useCollectionStore.getState()
  useCollectionStore.setState({
    completedDates: [
      ...new Set([
        ...collection.completedDates.filter(
          (date) => !(date in statuses) && !removedDates.includes(date),
        ),
        ...Object.keys(statuses).filter((date) => statuses[date] === 'complete'),
      ]),
    ].sort(),
  })
}
export function resumableMissions(state: MockState, now = Date.now()): SavedMission[] {
  return state.savedMissions.filter((saved) => {
    const started = new Date(saved.startedAt).getTime()
    return Number.isFinite(started) && now - started < 7 * 24 * 60 * 60 * 1000
  })
}
export function successCounts(records: OutingRecord[]) {
  const counts = [0, 0, 0, 0, 0]
  const seen = new Set<string>()
  for (const record of records) {
    const key = record.runId ?? record.id
    if (record.completed && !seen.has(key)) {
      counts[recordMission(record).level] += 1
      seen.add(key)
    }
  }
  return counts
}
