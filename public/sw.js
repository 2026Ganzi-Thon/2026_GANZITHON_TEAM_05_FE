// Letit 서비스 워커 — 앱 설치(PWA)와 오프라인 안내 화면만 담당한다.
// JS·CSS·API 응답은 캐시하지 않는다. 배포하면 바로 새 버전이 보이고 예전 화면이 남지 않는다.
const CACHE = 'letit-offline-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

// 화면 이동 요청만 가로챈다. 네트워크가 끊겼을 때만 오프라인 안내 화면을 보여 준다.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(OFFLINE_URL).then((response) => response ?? Response.error()),
    ),
  )
})
