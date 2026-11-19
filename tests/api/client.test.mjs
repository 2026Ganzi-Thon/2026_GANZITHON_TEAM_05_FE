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

let server, endpoints, session, client, presentation
const nativeFetch = globalThis.fetch
before(async () => {
  process.env.VITE_API_BASE_URL = 'http://contract.local/api/v1/'
  server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' })
  endpoints = await server.ssrLoadModule('/src/api/endpoints.ts')
  session = await server.ssrLoadModule('/src/api/session.ts')
  client = await server.ssrLoadModule('/src/api/client.ts')
  presentation = await server.ssrLoadModule('/src/api/presentation.ts')
})
after(async () => {
  globalThis.fetch = nativeFetch
  delete process.env.VITE_API_BASE_URL
  await server?.close()
})
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
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
      { situation: '눈/비가 와요' },
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
  assert.equal(presentation.searchRadius({ ...conditions, energyLevel: 1 }), 50)
  assert.equal(presentation.searchRadius(conditions), 100)
  assert.equal(presentation.searchRadius({ ...conditions, energyLevel: 3 }), 500)
  assert.equal(
    presentation.searchRadius({ ...conditions, energyLevel: 4, distanceLimit: 'any' }),
    20000,
  )
  assert.equal(presentation.toPlace(place).walk, '약 2분 (추정)')
  assert.equal(presentation.sortedSteps([...recommendation().steps].reverse())[0].order, 1)
})
