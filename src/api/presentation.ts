import {
  BARRIER_OPTIONS,
  BUDGET_OPTIONS,
  DISTANCE_OPTIONS,
  DURATION_OPTIONS,
  MOOD_OPTIONS,
  DEFAULT_CONDITIONS,
} from '@/constants/options'
import type { Barrier, Budget, Distance, Duration, Mood, OutingConditions } from '@/types/condition'
import type { Conditions, Place, OutingRecord, Mission } from '@/features/outings/types'
import type {
  ApiBarrier,
  ApiConditions,
  ApiMood,
  ApiPlace,
  ApiStep,
  MissionPlace,
  MissionDetail,
  Recommendation,
} from './contracts'

const moodMap: Record<Mood, ApiMood> = {
  LETHARGIC: 'lethargic',
  DEPRESSED: 'depressed',
  ANXIOUS: 'anxious',
  NEED_REFRESH: 'refresh',
  UNSURE: 'unsure',
}
const barrierMap: Record<Barrier, ApiBarrier> = {
  TIRED: 'tired',
  BOTHERSOME_PREP: 'preparation',
  CROWD: 'crowded',
  AWKWARD_ALONE: 'alone',
  COST: 'cost',
  NO_REASON: 'no_reason',
}
const distanceMap: Record<Distance, ApiConditions['distanceLimit']> = {
  WITHIN_5: '5min',
  WITHIN_10: '10min',
  WITHIN_20: '20min',
  ANY: 'any',
}
const timeMap: Record<Duration, ApiConditions['timeLimit']> = {
  MIN_10: '10min',
  MIN_30: '30min',
  HOUR_1: '60min',
  ANY: 'any',
}
const budgetMap: Record<Budget, ApiConditions['budgetLimit']> = {
  FREE: 0,
  UNDER_10000: 10000,
  UNDER_50000: 50000,
  ANY: null,
}
function reverse<K extends string, V>(map: Record<K, V>, value: V, fallback: K): K {
  return (Object.keys(map) as K[]).find((key) => map[key] === value) ?? fallback
}
export function toApiDefaults(value: OutingConditions): ApiConditions {
  return {
    mood: value.mood ? moodMap[value.mood] : null,
    energyLevel: value.energy,
    barriers: value.barriers.map((barrier) => barrierMap[barrier]),
    distanceLimit: distanceMap[value.distance],
    timeLimit: timeMap[value.duration],
    budgetLimit: budgetMap[value.budget],
  }
}
export function fromApiDefaults(value: ApiConditions): OutingConditions {
  return {
    mood: value.mood ? reverse(moodMap, value.mood, 'UNSURE') : null,
    energy: value.energyLevel,
    barriers: value.barriers.map((barrier) => reverse(barrierMap, barrier, 'NO_REASON')),
    distance: reverse(distanceMap, value.distanceLimit, 'WITHIN_10'),
    duration: reverse(timeMap, value.timeLimit, 'MIN_30'),
    // 예전 선택지(5,000원 이하)로 저장된 값은 새 기본값인 10,000원 이하로 읽는다.
    budget: reverse(budgetMap, value.budgetLimit, 'UNDER_10000'),
  }
}
export function toApiConditions(
  value: Conditions,
  defaults: OutingConditions = DEFAULT_CONDITIONS,
): ApiConditions {
  return toApiDefaults({
    mood: MOOD_OPTIONS.find((option) => option.label === value.mood)?.value ?? defaults.mood,
    energy: value.energy ?? defaults.energy,
    barriers: value.barriers.flatMap((label) => {
      const option = BARRIER_OPTIONS.find((option) => option.label === label)
      return option ? [option.value] : []
    }),
    distance:
      DISTANCE_OPTIONS.find((option) => option.label === value.distance)?.value ??
      defaults.distance,
    duration:
      DURATION_OPTIONS.find((option) => option.label === value.time)?.value ?? defaults.duration,
    budget:
      BUDGET_OPTIONS.find((option) => option.label === value.budget)?.value ?? defaults.budget,
  })
}
export const sortedSteps = (steps: ApiStep[]) => [...steps].sort((a, b) => a.order - b.order)
export function toPlace(value: ApiPlace | MissionPlace): Place {
  const distance =
    typeof value.distanceMeters === 'number' && Number.isFinite(value.distanceMeters)
      ? value.distanceMeters
      : null
  const minutes =
    value.walkingMinutes ?? (distance === null ? null : Math.max(1, Math.ceil(distance / 67)))
  const coordinates =
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude)
      ? { lat: value.latitude, lng: value.longitude }
      : undefined
  return {
    id: value.placeId,
    name: value.name ?? '장소 정보 없음',
    address: value.address ?? '주소 정보 없음',
    coordinates,
    distance: distance === null ? '거리 정보 없음' : `${distance.toLocaleString('ko-KR')}m`,
    walk: minutes === null ? '이동 시간 정보 없음' : `약 ${minutes}분 (추정)`,
  }
}
export function toApiSituation(value: string) {
  const values: Record<string, string> = {
    '눈/비가 와요': 'weather',
    '장소가 문을 닫았어요': 'closed',
    '사람이 많아요': 'crowded',
    '외출할 에너지가 부족해요': 'low_energy',
    '비용이 부담스러워요': 'cost',
    기타: 'other',
  }
  return values[value] ?? (Object.values(values).includes(value) ? value : 'other')
}
export function toMission(value: Recommendation | MissionDetail): Mission {
  return {
    id: 'missionId' in value ? value.missionId : value.recommendationId,
    title: value.title,
    description: value.description,
    level: value.energyLevel,
    steps: sortedSteps(value.steps).map((step) => step.text),
    distance:
      'missionId' in value && value.place
        ? toPlace(value.place).distance
        : value.missionType === 'non_place'
          ? value.energyLevel === 0
            ? '집 안'
            : '지정 장소 없음'
          : '장소 선택 후 확인',
    time: `${value.estimatedDurationMinutes}분`,
    budget: `${value.estimatedCost.toLocaleString('ko-KR')}원`,
    placeType:
      value.missionType === 'place'
        ? value.placeCategory === 'convenience_store'
          ? 'store'
          : value.placeCategory === 'cafe'
            ? 'cafe'
            : 'park'
        : undefined,
  }
}
export function toRecord(value: MissionDetail): OutingRecord {
  const steps = sortedSteps(value.steps)
  return {
    id: value.missionId,
    runId: value.missionId,
    missionId: value.missionId,
    title: value.title,
    checked: steps.flatMap((step, index) => (step.completed ? [index] : [])),
    completed: value.status === 'completed',
    startedAt: value.startedAt,
    createdAt: value.completedAt ?? value.startedAt,
    mission: toMission(value),
    place: value.place ? toPlace(value.place) : undefined,
    mood: value.review?.moodAfter ?? null,
    note: value.review?.oneLine ?? '',
    retry: value.review?.retryActivity ?? '',
    good: value.review?.goodPoint ?? '',
  }
}
/** 에너지 단계별 장소 검색 반경(m). 0단계는 장소 검색 없음, 1단계 도보 5분·2단계 도보 15분 정도. */
const ENERGY_SEARCH_RADIUS = [0, 200, 800, 2000, 5000]
export function searchRadius(conditions: ApiConditions): number {
  return ENERGY_SEARCH_RADIUS[conditions.energyLevel] ?? 0
}
