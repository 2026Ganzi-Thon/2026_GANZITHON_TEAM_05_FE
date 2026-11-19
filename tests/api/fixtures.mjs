export const uuid = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`
export const conditions = {
  mood: 'refresh',
  energyLevel: 2,
  barriers: ['crowded'],
  distanceLimit: '10min',
  timeLimit: '30min',
  budgetLimit: 5000,
}
export const steps = Array.from({ length: 5 }, (_, index) => ({
  stepId: uuid(201 + index),
  order: index + 1,
  text: ['신발 신기', '문 열기', '동네 걷기', '주변 둘러보기', '귀가하기'][index],
}))
export const recommendation = (number = 101, place = false) => ({
  recommendationId: uuid(number),
  title: place ? '가까운 공원 둘러보기' : '동네 한 바퀴 걷기',
  description: '가볍게 걸어요.',
  energyLevel: 2,
  missionType: place ? 'place' : 'non_place',
  placeCategory: place ? 'park' : null,
  steps: structuredClone(steps),
  estimatedDurationMinutes: 15,
  estimatedCost: 0,
})
export const place = {
  placeId: '12345',
  name: '시연 공원',
  address: '시연용 주소',
  latitude: 37.5665,
  longitude: 126.978,
  distanceMeters: 90,
  walkingMinutes: null,
}
export const mission = (number = 1, rec = recommendation()) => {
  const { recommendationId: _, ...rest } = rec
  return {
    ...rest,
    missionId: uuid(number),
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    completedAt: null,
    resumableUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    steps: rest.steps.map((step) => ({ ...step, completed: false })),
    place: rec.missionType === 'place' ? structuredClone(place) : null,
    review: null,
  }
}
export const progress = (detail) => ({
  missionId: detail.missionId,
  status: detail.status,
  completedStepIds: detail.steps.filter((step) => step.completed).map((step) => step.stepId),
  completedCount: detail.steps.filter((step) => step.completed).length,
  remainingCount: detail.steps.filter((step) => !step.completed).length,
  resumableUntil: detail.resumableUntil,
})
export const flowers = Array.from({ length: 18 }, (_, index) => ({
  flowerNumber: index + 1,
  name: index === 0 ? '칼라' : `꽃 ${index + 1}`,
  description: '작은 성공이 모여 피어난 꽃이에요.',
  owned: false,
  acquiredAt: null,
}))
export const collection = () => ({
  cumulativeCompletedDays: 0,
  flowers: structuredClone(flowers),
  pendingClaimCount: 0,
})
