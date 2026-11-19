export interface Coordinates {
  lat: number
  lng: number
}
export interface KakaoLatLng {
  getLat: () => number
  getLng: () => number
}
export interface KakaoMap {
  setBounds: (bounds: unknown, top?: number, right?: number, bottom?: number, left?: number) => void
  panTo: (point: KakaoLatLng) => void
  relayout: () => void
}
export interface KakaoOverlay {
  setMap: (map: KakaoMap | null) => void
}
export interface KakaoMaps {
  load: (callback: () => void) => void
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  LatLngBounds: new () => { extend: (point: KakaoLatLng) => void }
  CustomOverlay: new (options: {
    position: KakaoLatLng
    content: HTMLElement
    map: KakaoMap
    yAnchor?: number
    zIndex?: number
  }) => KakaoOverlay
}
declare global {
  interface Window {
    kakao?: { maps: KakaoMaps }
  }
}
export const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim() ?? ''
let pending: Promise<KakaoMaps> | null = null
export function loadKakaoMaps(): Promise<KakaoMaps> {
  if (window.kakao?.maps.Map) return Promise.resolve(window.kakao.maps)
  if (pending) return pending
  pending = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => {
      clearTimeout(timer)
      script.remove()
      reject(new Error('지도를 불러오지 못했어요.'))
    }
    const timer = window.setTimeout(fail, 15000)
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoMapAppKey)}&autoload=false`
    script.async = true
    script.onerror = fail
    script.onload = () => {
      if (!window.kakao?.maps) {
        fail()
        return
      }
      window.kakao.maps.load(() => {
        clearTimeout(timer)
        if (window.kakao?.maps.Map) resolve(window.kakao.maps)
        else fail()
      })
    }
    document.head.append(script)
  }).catch((error) => {
    pending = null
    throw error
  })
  return pending
}
export function requestCurrentPosition(): Promise<Coordinates> {
  if (!navigator.geolocation)
    return Promise.reject(
      new Error('이 기기에서는 위치를 확인할 수 없어요. 장소가 없는 미션을 선택해 주세요.'),
    )
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === 1
              ? '위치 사용이 허용되지 않았어요. 장소가 없는 미션을 선택할 수 있어요.'
              : '현재 위치를 확인하지 못했어요. 다시 시도해 주세요.',
          ),
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    ),
  )
}
