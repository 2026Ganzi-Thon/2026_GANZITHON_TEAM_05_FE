import type { Place } from '@/features/outings/types'

export type Coordinates = { lat: number; lng: number }
export type NaverMaps = typeof naver.maps
export const NAVER_MAP_ERROR_EVENT = 'letit:naver-map-error'
export const naverMapClientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID?.trim() ?? ''

let pendingSdk: Promise<NaverMaps> | null = null
let authenticationFailed = false

/** StrictMode와 여러 지도 인스턴스에서도 SDK 스크립트는 한 번만 요청한다. */
export function loadNaverMaps(clientId = naverMapClientId): Promise<NaverMaps> {
  if (!clientId) return Promise.reject(new Error('네이버 지도 Client ID가 필요합니다.'))
  if (pendingSdk) return pendingSdk
  if (!authenticationFailed && window.naver?.maps?.Map && window.naver.maps.Service) {
    return Promise.resolve(window.naver.maps)
  }

  pendingSdk = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'letit-naver-maps-sdk'
    script.async = true
    const url = new URL('https://oapi.map.naver.com/openapi/v3/maps.js')
    url.searchParams.set('ncpKeyId', clientId)
    url.searchParams.set('submodules', 'geocoder')
    url.searchParams.set('callback', '__letitNaverMapsReady')
    script.src = url.toString()
    let settled = false
    const timer = window.setTimeout(() => fail(), 15000)

    function fail() {
      window.clearTimeout(timer)
      script.remove()
      pendingSdk = null
      delete window.__letitNaverMapsReady
      if (!settled) {
        settled = true
        reject(new Error('지도를 불러오지 못했습니다. 키와 등록된 웹 서비스 URL을 확인하세요.'))
      }
      window.dispatchEvent(new Event(NAVER_MAP_ERROR_EVENT))
    }
    window.__letitNaverMapsReady = () => {
      const maps = window.naver?.maps
      if (!maps?.Map || !maps.Service) return fail()
      window.clearTimeout(timer)
      delete window.__letitNaverMapsReady
      authenticationFailed = false
      settled = true
      resolve(maps)
    }
    window.navermap_authFailure = () => {
      authenticationFailed = true
      fail()
    }
    script.onerror = fail
    document.head.append(script)
  })
  return pendingSdk
}

const addressRequests = new Map<string, Promise<Coordinates>>()

function validCoordinates(value: Coordinates) {
  return (
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lat) <= 90 &&
    Math.abs(value.lng) <= 180
  )
}

/** 장소 API가 좌표를 주면 그대로 쓰고, 기존 주소 데이터는 Geocoding으로 변환한다. */
export function resolvePlaceCoordinates(place: Place, maps: NaverMaps): Promise<Coordinates> {
  if (place.coordinates && validCoordinates(place.coordinates)) {
    return Promise.resolve(place.coordinates)
  }
  const cached = addressRequests.get(place.address)
  if (cached) return cached
  const request = new Promise<Coordinates>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error('장소 위치 확인 시간이 초과됐습니다.')),
      10000,
    )
    maps.Service.geocode({ query: place.address }, (status, response) => {
      window.clearTimeout(timer)
      const address = response?.v2?.addresses?.[0]
      const coordinates = { lat: Number(address?.y), lng: Number(address?.x) }
      if (status !== maps.Service.Status.OK || !address || !validCoordinates(coordinates)) {
        reject(new Error('장소의 위치를 확인하지 못했습니다.'))
        return
      }
      resolve(coordinates)
    })
  }).catch((error: unknown) => {
    addressRequests.delete(place.address)
    throw error
  })
  addressRequests.set(place.address, request)
  return request
}
