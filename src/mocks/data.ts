import { DEFAULT_CONDITIONS } from '@/constants/options'
import type { FlowerId } from '@/constants/flowers'
import { cafes, emptyConditions, missionById, parks, store } from '@/features/outings/mockData'
import type { MockState, OutingRecord, Place } from '@/features/outings/types'
import { todayString } from '@/utils/date'

/** 페이지를 다시 불러오면 항상 이 예시 데이터에서 시작한다. */
export const MOCK_USER_DEFAULTS = structuredClone(DEFAULT_CONDITIONS)
const mockToday = new Date()

function mockTime(daysAgo: number, hour = 9) {
  return new Date(
    mockToday.getFullYear(),
    mockToday.getMonth(),
    mockToday.getDate() - daysAgo,
    hour,
  ).toISOString()
}
function makeRecord(
  runId: string,
  missionId: string,
  startedAt: string,
  checked: number[],
): OutingRecord {
  const mission = missionById(missionId)
  const place: Place | undefined =
    mission.placeType === 'store'
      ? store
      : mission.placeType === 'park'
        ? parks[0]
        : mission.placeType === 'cafe'
          ? cafes[0]
          : undefined
  const steps = mission.steps.map((step, index) =>
    place && index === 2
      ? `${place.name} 도착하기`
      : place && mission.placeType === 'store' && index === 3
        ? `${place.name}에서 물건 구매하기`
        : step,
  )
  const completed = checked.length === 5
  return {
    id: `${runId}-record`,
    runId,
    missionId,
    title: mission.title,
    checked,
    completed,
    startedAt,
    createdAt: startedAt,
    mission: { ...mission, steps, distance: place?.walk ?? mission.distance },
    place: place ? structuredClone(place) : undefined,
    mood: completed ? '조금 나아졌어요' : null,
    note: completed ? '바깥 공기를 느낄 수 있었어요.' : '',
    retry: '',
    good: completed ? '집 근처가 생각보다 조용했어요.' : '',
  }
}

export function createMockOutingState(): MockState {
  const checkedAll = [0, 1, 2, 3, 4]
  const older = new Date(mockToday.getFullYear(), mockToday.getMonth() - 1, 1, 9).toISOString()
  const completeIds = [
    'window',
    'door',
    'building',
    'entrance',
    'walk',
    'store',
    'park',
    'door-inside',
  ]
  const completed = completeIds.map((id, index) =>
    makeRecord(`mock-full-${index}`, id, mockTime(index + 2), [...checkedAll]),
  )
  const partialIds = ['store', 'park', 'window', 'door', 'walk', 'photo', 'cafe']
  const partialDays = [1, 0, 10, 11, 12, 13, 14]
  const partial = partialIds.map((id, index) =>
    makeRecord(
      index < 2 ? `mock-saved-${id}` : `mock-partial-${index}`,
      id,
      mockTime(partialDays[index]),
      [0, 1, 2, 3].slice(0, index === 1 ? 1 : 2),
    ),
  )
  return {
    conditions: structuredClone(emptyConditions),
    savedMissions: partial.slice(0, 2).map((record) => ({
      id: record.runId!,
      missionId: record.missionId,
      checked: [...record.checked],
      date: `${new Date(record.startedAt!).getMonth() + 1}월 ${new Date(record.startedAt!).getDate()}일`,
      startedAt: record.startedAt!,
      placeId: record.place!.id,
    })),
    records: [makeRecord('mock-older', 'long-walk', older, checkedAll), ...completed, ...partial],
    resting: false,
    restDates: [todayString(new Date(mockTime(15)))],
  }
}

export function createMockCollectionState() {
  const completedDates = [
    ...new Set(
      createMockOutingState()
        .records.filter((record) => record.completed)
        .map((record) => todayString(new Date(record.createdAt))),
    ),
  ].sort()
  return {
    completedDates,
    owned: ([1, 2, 3] as FlowerId[]).map((id, index) => ({
      id,
      acquiredAt: completedDates[(index + 1) * 3 - 1],
    })),
    pendingRewards: [] as FlowerId[],
  }
}
