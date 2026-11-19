import { apiRequest } from './client'
import {
  checkedResponse,
  validateMission,
  validateMissionId,
  validateProgress,
  validateRecommendations,
} from './validation'
import { getAccessToken } from './session'
import { ApiError } from './client'
import { toApiSituation } from './presentation'
import { apiTimestamp } from './dates'
import type {
  ApiConditions,
  ApiDefaults,
  ApiPlace,
  ApiReview,
  ArchiveResponse,
  AuthResponse,
  CalendarResponse,
  ClaimResponse,
  CollectionResponse,
  MissionDetail,
  MissionProgress,
  RecommendationsResponse,
  ResumableMissionResponse,
  StepProgress,
  ReflectionProgress,
  ReflectionSummary,
  ResumableMission,
} from './contracts'

const id = (value: string) => encodeURIComponent(value)
const validateDefaults = (value: ApiDefaults) =>
  checkedResponse(
    value,
    Array.isArray(value.barriers) &&
      typeof value.onboardingCompleted === 'boolean' &&
      Number.isInteger(value.energyLevel) &&
      value.energyLevel >= 0 &&
      value.energyLevel <= 4,
  )
export const authApi = {
  signup: (username: string, password: string, passwordConfirm: string) =>
    apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: { username, password, passwordConfirm },
      authenticated: false,
    }),
  login: (username: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
      authenticated: false,
    }),
}
export const defaultsApi = {
  get: (signal?: AbortSignal) =>
    apiRequest<ApiDefaults>('/users/me/defaults', { signal }).then(validateDefaults),
  save: (conditions: ApiConditions) =>
    apiRequest<ApiDefaults>('/users/me/defaults', { method: 'PUT', body: conditions }).then(
      validateDefaults,
    ),
}
const pendingSteps = new Map<string, Promise<MissionProgress>>()
export const missionsApi = {
  recommendations: (
    conditions: ApiConditions,
    excludeRecommendationIds: string[] = [],
    signal?: AbortSignal,
  ) =>
    apiRequest<RecommendationsResponse>('/missions/recommendations', {
      method: 'POST',
      body: { conditions, excludeRecommendationIds: excludeRecommendationIds.slice(-50) },
      signal,
      timeoutMs: 90000,
    }).then(validateRecommendations),
  create: (recommendationId: string, placeId: string | null) =>
    apiRequest<{ missionId: string }>('/missions', {
      method: 'POST',
      body: { recommendationId, placeId },
    }).then(validateMissionId),
  detail: (missionId: string, signal?: AbortSignal) =>
    apiRequest<MissionDetail>(`/missions/${id(missionId)}`, { signal }).then(validateMission),
  updateSteps: (missionId: string, completedStepIds: string[]) => {
    const previous = pendingSteps.get(missionId)
    const token = getAccessToken()
    const request = (previous ? previous.catch(() => undefined) : Promise.resolve()).then(() => {
      if (getAccessToken() !== token) throw new ApiError('로그인이 필요해요.', 401, 'UNAUTHORIZED')
      return apiRequest<StepProgress>(`/missions/${id(missionId)}/steps`, {
        method: 'PATCH',
        body: { completedStepIds },
      }).then(validateProgress)
    })
    pendingSteps.set(missionId, request)
    void request
      .finally(() => {
        if (pendingSteps.get(missionId) === request) pendingSteps.delete(missionId)
      })
      .catch(() => undefined)
    return request
  },
  waitForSteps: async (missionId: string) => {
    await pendingSteps.get(missionId)
  },
  saveProgress: async (missionId: string, completedStepIds: string[]) => {
    await pendingSteps.get(missionId)
    return apiRequest<MissionProgress>(`/missions/${id(missionId)}/save-progress`, {
      method: 'POST',
      body: { completedStepIds },
    })
  },
  complete: async (missionId: string) => {
    await pendingSteps.get(missionId)
    return apiRequest<
      Pick<MissionDetail, 'missionId' | 'status' | 'completedAt'> & { completedCount: number }
    >(`/missions/${id(missionId)}/complete`, { method: 'POST' })
  },
  resumable: async (signal?: AbortSignal): Promise<{ items: ResumableMission[] }> => {
    const response = await apiRequest<{ items: ResumableMissionResponse[] }>(
      '/missions/resumable',
      { signal },
    )
    checkedResponse(response, Array.isArray(response.items))
    const items = await Promise.all(
      response.items.map(async (item) => {
        if (
          item.startedAt &&
          Number.isInteger(item.completedCount) &&
          Number.isInteger(item.remainingCount)
        )
          return { ...item, startedAt: apiTimestamp(item.startedAt) } as ResumableMission
        const detail = await apiRequest<MissionDetail>(`/missions/${id(item.missionId)}`, {
          signal,
        }).then(validateMission)
        const completedCount = detail.steps.filter((step) => step.completed).length
        return {
          ...item,
          startedAt: detail.startedAt,
          completedCount,
          remainingCount: detail.steps.length - completedCount,
        }
      }),
    )
    return { items }
  },
  resume: (missionId: string) =>
    apiRequest<StepProgress>(`/missions/${id(missionId)}/resume`, { method: 'POST' }),
  abandon: async (missionId: string) => {
    await pendingSteps.get(missionId)
    return apiRequest<{ missionId: string; status: string; removedFromResumable?: boolean }>(
      `/missions/${id(missionId)}/abandon`,
      { method: 'POST' },
    )
  },
  alternatives: (missionId: string, situation: string, signal?: AbortSignal) =>
    apiRequest<RecommendationsResponse>(`/missions/${id(missionId)}/alternatives`, {
      method: 'POST',
      body: { situation: toApiSituation(situation) },
      signal,
      timeoutMs: 90000,
    }).then(validateRecommendations),
  replace: async (missionId: string, recommendationId: string, placeId: string | null) => {
    await pendingSteps.get(missionId)
    return apiRequest<{ oldMissionId: string; newMissionId: string }>(
      `/missions/${id(missionId)}/replace`,
      { method: 'POST', body: { recommendationId, placeId } },
    )
  },
  review: (missionId: string, review: ApiReview) =>
    apiRequest<{ missionId: string; review: ApiReview; savedAt: string }>(
      `/missions/${id(missionId)}/review`,
      { method: 'PUT', body: review },
    ),
}
export const placesApi = {
  nearby: (
    latitude: number,
    longitude: number,
    radiusMeters: number,
    category: string,
    signal?: AbortSignal,
  ) =>
    apiRequest<{ items: ApiPlace[]; searchRadiusMeters: number }>('/places/nearby', {
      query: { latitude, longitude, radiusMeters, category },
      signal,
    }).then((value) =>
      checkedResponse(
        value,
        Array.isArray(value.items) &&
          value.items.every(
            (place) =>
              Number.isFinite(place.latitude) &&
              Number.isFinite(place.longitude) &&
              Number.isFinite(place.distanceMeters),
          ),
      ),
    ),
}
export const reflectionApi = {
  rest: (date: string) =>
    apiRequest<{ date: string; status: string }>(`/days/${id(date)}/rest`, { method: 'PUT' }),
  summary: (month: string, signal?: AbortSignal) =>
    apiRequest<ReflectionSummary>('/reflection/summary', { query: { month }, signal }).then(
      (value) =>
        checkedResponse(
          value,
          !!value.counts &&
            [value.counts.completed, value.counts.partial, value.counts.notCompleted].every(
              Number.isFinite,
            ),
        ),
    ),
  calendar: (month: string, signal?: AbortSignal) =>
    apiRequest<CalendarResponse>('/reflection/calendar', { query: { month }, signal }).then(
      (value) => checkedResponse(value, Array.isArray(value.days)),
    ),
  progress: (from: string, to: string, signal?: AbortSignal) =>
    apiRequest<ReflectionProgress>('/reflection/progress', { query: { from, to }, signal }).then(
      (value) => checkedResponse(value, Array.isArray(value.completedByEnergy)),
    ),
}
export const archiveApi = {
  list: (page = 1, pageSize = 10, signal?: AbortSignal) =>
    apiRequest<ArchiveResponse>('/archive', { query: { page, pageSize }, signal }).then((value) => {
      checkedResponse(
        value,
        Array.isArray(value.items) &&
          Number.isInteger(value.page) &&
          typeof value.hasNext === 'boolean',
      )
      return {
        ...value,
        items: value.items.map((item) => ({
          ...item,
          startedAt: apiTimestamp(item.startedAt),
          endedAt: item.endedAt ? apiTimestamp(item.endedAt) : null,
        })),
      }
    }),
  detail: (missionId: string, signal?: AbortSignal) =>
    apiRequest<MissionDetail>(`/archive/${id(missionId)}`, { signal }).then(validateMission),
  hide: (missionId: string) =>
    apiRequest<{ success: boolean; missionId: string; archivedHidden: boolean }>(
      `/archive/${id(missionId)}`,
      { method: 'DELETE' },
    ),
}
export const collectionApi = {
  flowers: (signal?: AbortSignal) =>
    apiRequest<CollectionResponse>('/collection/flowers', { signal }).then((value) =>
      checkedResponse(
        value,
        Array.isArray(value.flowers) &&
          value.flowers.every(
            (flower) =>
              Number.isInteger(flower.flowerNumber) &&
              flower.flowerNumber >= 1 &&
              flower.flowerNumber <= 18,
          ) &&
          Number.isInteger(value.pendingClaimCount),
      ),
    ),
  claim: () => apiRequest<ClaimResponse>('/collection/flowers/claim', { method: 'POST' }),
}
