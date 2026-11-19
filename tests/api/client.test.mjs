import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'
import {
  uuid,
  conditions,
  recommendation,
  mission,
  progress,
  place,
  collection,
} from './fixtures.mjs'

let server, endpoints, session, client, presentation, dashboard, dates
const nativeFetch = globalThis.fetch
before(async () => {
  process.env.VITE_API_BASE_URL = 'http://contract.local/api/v1/'
  server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' })
  endpoints = await server.ssrLoadModule('/src/api/endpoints.ts')
  session = await server.ssrLoadModule('/src/api/session.ts')
  client = await server.ssrLoadModule('/src/api/client.ts')
  presentation = await server.ssrLoadModule('/src/api/presentation.ts')
  dashboard = await server.ssrLoadModule('/src/api/dashboard.ts')
  dates = await server.ssrLoadModule('/src/api/dates.ts')
})
after(async () => {
  globalThis.fetch = nativeFetch
  delete process.env.VITE_API_BASE_URL
  await server?.close()
})

test('위치를 새로 요청하고 정확도와 고정밀·캐시 금지 옵션을 전달한다', async () => {
  const { requestCurrentPosition } = await server.ssrLoadModule('/src/lib/kakaoMaps.ts')
  const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
  let calls = 0
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition(success, _error, options) {
        assert.equal(options.maximumAge, 0)
        assert.equal(options.enableHighAccuracy, true)
        calls++
        success({ coords: { latitude: 37 + calls / 100, longitude: 127, accuracy: 80 } })
      },
    },
  })
  try {
    const first = await requestCurrentPosition()
    const second = await requestCurrentPosition()
    assert.equal(calls, 2)
    assert.notEqual(first.lat, second.lat)
    assert.equal(second.accuracy, 80)
  } finally {
    if (original) Object.defineProperty(navigator, 'geolocation', original)
    else delete navigator.geolocation
  }
})

test('위치 권한 거부 시 이전 좌표로 성공 처리하지 않는다', async () => {
  const { requestCurrentPosition } = await server.ssrLoadModule('/src/lib/kakaoMaps.ts')
  const original = Object.getOwnPropertyDescriptor(navigator, 'geolocation')
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition(_success, reject) {
        reject({ code: 1 })
      },
    },
  })
  try {
    await assert.rejects(requestCurrentPosition(), /위치 사용이 허용되지 않았어요/)
  } finally {
    if (original) Object.defineProperty(navigator, 'geolocation', original)
    else delete navigator.geolocation
  }
})
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })

test('기존 위치 허용은 안내를 생략하고 권한 철회·미결정은 다시 확인한다', async () => {
  const { canSkipLocationConsent } = await server.ssrLoadModule('/src/lib/kakaoMaps.ts')
  const original = Object.getOwnPropertyDescriptor(navigator, 'permissions')
  let permission = 'granted'
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: {
      async query(options) {
        assert.equal(options.name, 'geolocation')
        return { state: permission }
      },
    },
  })
  try {
    assert.equal(await canSkipLocationConsent(false), true)
    for (permission of ['prompt', 'denied']) {
      assert.equal(await canSkipLocationConsent(true), false)
    }
    Object.defineProperty(navigator, 'permissions', { configurable: true, value: undefined })
    assert.equal(await canSkipLocationConsent(true), true)
    assert.equal(await canSkipLocationConsent(false), false)
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query() {
          throw new Error('unsupported')
        },
      },
    })
    assert.equal(await canSkipLocationConsent(true), true)
    assert.equal(await canSkipLocationConsent(false), false)
  } finally {
    if (original) Object.defineProperty(navigator, 'permissions', original)
    else delete navigator.permissions
  }
})

test('새 미션은 세션 동의를 유지하고 계정 초기화는 동의를 지운다', async () => {
  const { useApiMissionStore: store } = await server.ssrLoadModule('/src/stores/apiMissionStore.ts')
  store.setState({ locationConsent: true, selectedRecommendation: recommendation(102, true) })
  store.getState().reset({ preserveLocationConsent: true })
  assert.equal(store.getState().locationConsent, true)
  assert.equal(store.getState().selectedRecommendation, null)
  store.getState().reset()
  assert.equal(store.getState().locationConsent, false)
})
test('26개 API의 메서드·경로·인증·요청 필드가 명세와 일치한다', async () => {
  session.setAccessToken('synthetic-token')
  const detail = mission(),
    mid = detail.missionId,
    review = { moodAfter: null, oneLine: '시연', retryActivity: null, goodPoint: null }
  const recs = { recommendations: [recommendation(), recommendation(102, true)] }
  const auth = {
    accessToken: 'synthetic-token',
    tokenType: 'bearer',
    user: { userId: uuid(900), username: 'demo' },
  }
  const summary = {
    month: '2026-11',
    counts: { completed: 0, partial: 0, notCompleted: 0 },
    firstMission: null,
    latestMission: null,
  }
  const cases = [
    [
      'POST',
      '/auth/signup',
      { username: 'demo', password: 'synthetic-password', passwordConfirm: 'synthetic-password' },
      auth,
      () => endpoints.authApi.signup('demo', 'synthetic-password', 'synthetic-password'),
      false,
    ],
    [
      'POST',
      '/auth/login',
      { username: 'demo', password: 'synthetic-password' },
      auth,
      () => endpoints.authApi.login('demo', 'synthetic-password'),
      false,
    ],
    [
      'GET',
      '/users/me/defaults',
      undefined,
      { ...conditions, onboardingCompleted: true },
      () => endpoints.defaultsApi.get(),
    ],
    [
      'PUT',
      '/users/me/defaults',
      conditions,
      { ...conditions, onboardingCompleted: true },
      () => endpoints.defaultsApi.save(conditions),
    ],
    [
      'POST',
      '/missions/recommendations',
      { conditions, excludeRecommendationIds: [uuid(99)] },
      recs,
      () => endpoints.missionsApi.recommendations(conditions, [uuid(99)]),
    ],
    [
      'POST',
      '/missions',
      { recommendationId: uuid(101), placeId: null },
      { missionId: mid },
      () => endpoints.missionsApi.create(uuid(101), null),
    ],
    ['GET', `/missions/${mid}`, undefined, detail, () => endpoints.missionsApi.detail(mid)],
    [
      'PATCH',
      `/missions/${mid}/steps`,
      { completedStepIds: [] },
      progress(detail),
      () => endpoints.missionsApi.updateSteps(mid, []),
    ],
    [
      'POST',
      `/missions/${mid}/save-progress`,
      { completedStepIds: [] },
      progress(detail),
      () => endpoints.missionsApi.saveProgress(mid, []),
    ],
    [
      'POST',
      `/missions/${mid}/complete`,
      undefined,
      progress(detail),
      () => endpoints.missionsApi.complete(mid),
    ],
    [
      'GET',
      '/missions/resumable',
      undefined,
      { items: [] },
      () => endpoints.missionsApi.resumable(),
    ],
    [
      'POST',
      `/missions/${mid}/resume`,
      undefined,
      progress(detail),
      () => endpoints.missionsApi.resume(mid),
    ],
    [
      'POST',
      `/missions/${mid}/abandon`,
      undefined,
      { missionId: mid, status: 'abandoned' },
      () => endpoints.missionsApi.abandon(mid),
    ],
    [
      'POST',
      `/missions/${mid}/alternatives`,
      { situation: 'weather' },
      recs,
      () => endpoints.missionsApi.alternatives(mid, '눈/비가 와요'),
    ],
    [
      'POST',
      `/missions/${mid}/replace`,
      { recommendationId: uuid(102), placeId: '12345' },
      { oldMissionId: mid, newMissionId: uuid(2) },
      () => endpoints.missionsApi.replace(mid, uuid(102), '12345'),
    ],
    [
      'GET',
      '/places/nearby?latitude=37.5&longitude=127&radiusMeters=100&category=park',
      undefined,
      { items: [place], searchRadiusMeters: 100 },
      () => endpoints.placesApi.nearby(37.5, 127, 100, 'park'),
    ],
    [
      'PUT',
      '/days/2026-11-19/rest',
      undefined,
      { date: '2026-11-19', status: 'rest' },
      () => endpoints.reflectionApi.rest('2026-11-19'),
    ],
    [
      'PUT',
      `/missions/${mid}/review`,
      review,
      { missionId: mid, review, savedAt: new Date().toISOString() },
      () => endpoints.missionsApi.review(mid, review),
    ],
    [
      'GET',
      '/reflection/summary?month=2026-11',
      undefined,
      summary,
      () => endpoints.reflectionApi.summary('2026-11'),
    ],
    [
      'GET',
      '/reflection/calendar?month=2026-11',
      undefined,
      { month: '2026-11', days: [] },
      () => endpoints.reflectionApi.calendar('2026-11'),
    ],
    [
      'GET',
      '/archive?page=2&pageSize=10',
      undefined,
      { items: [], page: 2, pageSize: 10, total: 0, hasNext: false },
      () => endpoints.archiveApi.list(2, 10),
    ],
    ['GET', `/archive/${mid}`, undefined, detail, () => endpoints.archiveApi.detail(mid)],
    [
      'DELETE',
      `/archive/${mid}`,
      undefined,
      { success: true, missionId: mid, archivedHidden: true },
      () => endpoints.archiveApi.hide(mid),
    ],
    [
      'GET',
      '/reflection/progress?from=2026-11-01&to=2026-11-19',
      undefined,
      { firstMission: null, latestMission: null, completedByEnergy: [], distanceChanges: [] },
      () => endpoints.reflectionApi.progress('2026-11-01', '2026-11-19'),
    ],
    [
      'GET',
      '/collection/flowers',
      undefined,
      collection(),
      () => endpoints.collectionApi.flowers(),
    ],
    [
      'POST',
      '/collection/flowers/claim',
      undefined,
      { claimedFlowers: [], pendingClaimCount: 0 },
      () => endpoints.collectionApi.claim(),
    ],
  ]
  for (const [method, path, body, response, call, authenticated = true] of cases) {
    let count = 0
    globalThis.fetch = async (url, options) => {
      count++
      assert.equal(url, `http://contract.local/api/v1${path}`)
      assert.equal(options.method, method)
      assert.equal(
        options.headers.Authorization,
        authenticated ? 'Bearer synthetic-token' : undefined,
      )
      assert.deepEqual(options.body === undefined ? undefined : JSON.parse(options.body), body)
      return json(response)
    }
    await call()
    assert.equal(count, 1, `${method} ${path}`)
  }
})
test('연속 단계 PATCH와 완료 요청을 순서대로 보내 마지막 체크 상태를 유지한다', async () => {
  session.setAccessToken('synthetic-token')
  const detail = mission(),
    calls = [],
    releases = []
  globalThis.fetch = async (url, options) => {
    calls.push(url.split('/').at(-1))
    await new Promise((resolve) => releases.push(resolve))
    const ids = options.body ? JSON.parse(options.body).completedStepIds : []
    return json({
      ...progress(detail),
      completedStepIds: ids,
      completedCount: ids.length,
      remainingCount: 5 - ids.length,
    })
  }
  const first = endpoints.missionsApi.updateSteps(detail.missionId, [uuid(201)])
  const second = endpoints.missionsApi.updateSteps(detail.missionId, [uuid(201), uuid(202)])
  const complete = endpoints.missionsApi.complete(detail.missionId)
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(calls, ['steps'])
  releases.shift()()
  await first
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(calls, ['steps', 'steps'])
  releases.shift()()
  assert.equal((await second).completedCount, 2)
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.deepEqual(calls, ['steps', 'steps', 'complete'])
  releases.shift()()
  await complete
})
test('잘못된 로그인 401은 기존 세션을 만료시키지 않고, 인증 API 401은 만료시킨다', async () => {
  session.setAccessToken('synthetic-token')
  let expired = 0
  const unsubscribe = session.onSessionExpired(() => expired++)
  globalThis.fetch = async () =>
    json({ detail: '다시 로그인해 주세요.', code: 'UNAUTHORIZED' }, 401)
  await assert.rejects(endpoints.authApi.login('demo', 'bad'))
  assert.equal(expired, 0)
  await assert.rejects(endpoints.defaultsApi.get())
  assert.equal(expired, 1)
  assert.equal(session.getAccessToken(), null)
  unsubscribe()
})
test('POST 오류를 자동 재전송하지 않고 FastAPI 검증 오류를 표시한다', async () => {
  session.setAccessToken('synthetic-token')
  let count = 0
  globalThis.fetch = async () => {
    count++
    return json({ detail: [{ msg: '필수 값입니다.' }] }, 422)
  }
  await assert.rejects(
    endpoints.missionsApi.create(uuid(101), null),
    (error) => error.status === 422 && error.message === '필수 값입니다.',
  )
  assert.equal(count, 1)
})
test('손상된 UUID·단계·도감 응답은 렌더 전에 거절한다', async () => {
  session.setAccessToken('synthetic-token')
  globalThis.fetch = async () =>
    json({ recommendations: [{ ...recommendation(), steps: [] }, recommendation(102)] })
  await assert.rejects(endpoints.missionsApi.recommendations(conditions))
  globalThis.fetch = async () => json({ flowers: null, pendingClaimCount: 0 })
  await assert.rejects(endpoints.collectionApi.flowers())
})
test('타임아웃과 취소를 구분한다', async () => {
  session.setAccessToken('synthetic-token')
  globalThis.fetch = async (_url, { signal }) =>
    new Promise((_, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
        once: true,
      }),
    )
  await assert.rejects(
    client.apiRequest('/slow', { timeoutMs: 5 }),
    (error) => error.code === 'TIMEOUT',
  )
  const controller = new AbortController()
  const request = client.apiRequest('/cancel', { signal: controller.signal })
  controller.abort()
  await assert.rejects(request, (error) => error.name === 'AbortError')
})
test('조건 변환·5단계 순서·검색 반경·추정 도보 시간을 계약 단위로 변환한다', () => {
  assert.deepEqual(presentation.toApiDefaults(presentation.fromApiDefaults(conditions)), conditions)
  assert.equal(presentation.searchRadius({ ...conditions, energyLevel: 0 }), 0)
  assert.equal(presentation.searchRadius({ ...conditions, energyLevel: 1 }), 200)
  assert.equal(presentation.searchRadius(conditions), 800)
  assert.equal(presentation.searchRadius({ ...conditions, energyLevel: 3 }), 2000)
  assert.equal(
    presentation.searchRadius({ ...conditions, energyLevel: 4, distanceLimit: 'any' }),
    5000,
  )
  assert.equal(presentation.toPlace(place).walk, '약 2분 (추정)')
  assert.equal(presentation.sortedSteps([...recommendation().steps].reverse())[0].order, 1)
})
test('실제 서버의 간소한 단계 응답을 UUID 목록 기준으로 표시한다', async () => {
  session.setAccessToken('synthetic-token')
  globalThis.fetch = async () =>
    json({ missionId: uuid(1), status: 'in_progress', completedStepIds: [uuid(201), uuid(202)] })
  const value = await endpoints.missionsApi.updateSteps(uuid(1), [uuid(201), uuid(202)])
  assert.equal(value.completedCount, 2)
  assert.equal(value.remainingCount, 3)
})
test('이어하기 목록에 빠진 시작일과 완료 개수는 미션 상세에서 조회한다', async () => {
  session.setAccessToken('synthetic-token')
  const detail = mission()
  detail.steps[0].completed = true
  const calls = []
  globalThis.fetch = async (url) => {
    calls.push(new URL(url).pathname)
    return url.endsWith('/resumable')
      ? json({
          items: [
            {
              missionId: detail.missionId,
              title: detail.title,
              energyLevel: 2,
              completedStepIds: [detail.steps[0].stepId],
            },
          ],
        })
      : json(detail)
  }
  const value = await endpoints.missionsApi.resumable()
  assert.deepEqual(calls, ['/api/v1/missions/resumable', `/api/v1/missions/${detail.missionId}`])
  assert.equal(value.items[0].startedAt, detail.startedAt)
  assert.equal(value.items[0].completedCount, 1)
  assert.equal(value.items[0].remainingCount, 4)
})
test('실제 서버의 fallbackUsed와 제외 목록 최대 50개를 반영한다', async () => {
  session.setAccessToken('synthetic-token')
  let sent
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body)
    return json({ fallbackUsed: true, recommendations: [recommendation(), recommendation(102)] })
  }
  const exclusions = Array.from({ length: 60 }, (_, index) => uuid(index + 1000))
  const value = await endpoints.missionsApi.recommendations(conditions, exclusions)
  assert.equal(value.fallback, true)
  assert.deepEqual(sent.excludeRecommendationIds, exclusions.slice(-50))
})
test('상황 선택값은 서버 enum으로 보내고, 장소 상세 누락 시 임의 좌표를 만들지 않는다', () => {
  const labels = [
    '눈/비가 와요',
    '장소가 문을 닫았어요',
    '사람이 많아요',
    '외출할 에너지가 부족해요',
    '비용이 부담스러워요',
    '기타',
  ]
  assert.deepEqual(labels.map(presentation.toApiSituation), [
    'weather',
    'closed',
    'crowded',
    'low_energy',
    'cost',
    'other',
  ])
  const value = presentation.toPlace({
    placeId: '12345',
    name: null,
    address: null,
    latitude: null,
    longitude: null,
    distanceMeters: null,
    walkingMinutes: null,
  })
  assert.equal(value.coordinates, undefined)
  assert.equal(value.distance, '거리 정보 없음')
  assert.equal(value.name, '장소 정보 없음')
  assert.doesNotThrow(() =>
    presentation.toMission({
      ...mission(1, recommendation(102, true)),
      place: { placeId: '12345', distanceMeters: null },
    }),
  )
})
test('PR #2의 null 종료일과 시간대 없는 기록을 날짜 왜곡 없이 처리한다', async () => {
  session.setAccessToken('synthetic-token')
  globalThis.fetch = async () =>
    json({
      items: [
        {
          missionId: uuid(1),
          title: '저장한 미션',
          energyLevel: 2,
          startedAt: '2026-11-18T23:30:00',
          endedAt: null,
          completedCount: 2,
          remainingCount: 3,
          status: 'paused',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      hasNext: false,
    })
  const archive = await endpoints.archiveApi.list()
  assert.equal(archive.items[0].endedAt, null)
  assert.equal(archive.items[0].startedAt, '2026-11-18T23:30:00Z')
  globalThis.fetch = async () =>
    json({ ...mission(), startedAt: '2026-11-18T23:30:00', completedAt: null })
  assert.equal((await endpoints.archiveApi.detail(uuid(1))).startedAt, '2026-11-18T23:30:00Z')
  assert.equal(dates.apiTimestamp('2026-11-19'), '2026-11-19')
  assert.equal(dates.apiTimestamp('2026-11-19T08:30:00+09:00'), '2026-11-19T08:30:00+09:00')
})
test('성찰의 일수는 미션 건수와 구분해 서버 달력의 날짜별 상태로 표시한다', () => {
  assert.deepEqual(
    dashboard.calendarDayCounts({
      month: '2026-11',
      days: [
        { date: '2026-11-17', status: 'completed' },
        { date: '2026-11-18', status: 'partial' },
        { date: '2026-11-19', status: 'rest' },
        { date: '2026-11-20', status: 'undecided' },
        { date: '2026-11-17', status: 'completed' },
      ],
    }),
    { completed: 1, partial: 1, notCompleted: 1 },
  )
})
test('PR #2 꽃 확인의 부분 응답을 받고 새 꽃 지급 요청은 추가하지 않는다', async () => {
  session.setAccessToken('synthetic-token')
  const requests = []
  globalThis.fetch = async (url, options) => {
    requests.push({ url, method: options.method })
    return json({
      claimedFlowers: [{ flowerNumber: 1, name: '칼라', acquiredAt: '2026-11-19T00:00:00' }],
      pendingClaimCount: 0,
    })
  }
  const result = await endpoints.collectionApi.claim()
  assert.equal(result.claimedFlowers[0].flowerNumber, 1)
  assert.deepEqual(requests, [
    { url: 'http://contract.local/api/v1/collection/flowers/claim', method: 'POST' },
  ])
})
